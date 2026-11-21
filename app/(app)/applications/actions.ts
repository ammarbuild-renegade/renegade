'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { randomBytes } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { scoreApplication } from '@/lib/scoring/fit'
import { sendAcceptanceEmail } from '@/lib/email/acceptance'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

/** How long an onboarding link stays usable. */
const TOKEN_TTL_DAYS = 14

const ApplicationId = z.string().uuid()

/**
 * Returns a client scoped to the signed-in operator, or null.
 *
 * Checks the operators table rather than only that someone is signed in.
 * Phase 5 gives clients their own logins, and a client user has a `sub` too -
 * so a signed-in check alone would let one through. Row-level security stops
 * them writing, but rescoreApplication reaches the admin client, which
 * bypasses RLS by design. This is the check that actually holds.
 */
async function requireOperator(): Promise<{
  supabase: SupabaseServerClient
  operatorId: string
} | null> {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const operatorId = claims?.claims?.sub

  if (!operatorId) return null

  const { data: operator } = await supabase
    .from('operators')
    .select('id')
    .eq('id', operatorId)
    .maybeSingle()

  if (!operator) return null

  return { supabase, operatorId }
}

export async function rejectApplication(id: string) {
  const parsed = ApplicationId.safeParse(id)

  if (!parsed.success) {
    return
  }

  const session = await requireOperator()

  if (!session) {
    return
  }

  const { supabase } = session

  const { error } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', parsed.data)

  if (error) {
    return
  }

  revalidatePath('/applications')
}

export async function rescoreApplication(id: string) {
  const parsed = ApplicationId.safeParse(id)

  if (!parsed.success) {
    return
  }

  const session = await requireOperator()

  if (!session) {
    return
  }

  await scoreApplication(parsed.data)

  revalidatePath('/applications')
}

export type AcceptResult =
  { ok: true; link: string; emailed: boolean; clientId: string } | { ok: false; error: string }

/**
 * Turns an accepted application into a client, and issues the onboarding link.
 *
 * This is the join between the two halves of the product: before it runs, the
 * onboarding flow exists but is unreachable, because nothing else in the
 * codebase creates a token.
 *
 * The link is returned whether or not the email sends. Resend's test sender
 * only delivers to the account holder's own address until a domain is
 * verified, so during development the email reaches nobody else - and an
 * email that quietly failed would otherwise strand a real client.
 */
export async function acceptApplication(id: string): Promise<AcceptResult> {
  const parsed = ApplicationId.safeParse(id)
  if (!parsed.success) return { ok: false, error: 'That application id is not valid.' }

  const session = await requireOperator()
  if (!session) return { ok: false, error: 'You are not signed in as an operator.' }

  const { supabase, operatorId } = session

  const { data: application } = await supabase
    .from('applications')
    .select('id, full_name, email, company, status')
    .eq('id', parsed.data)
    .single()

  if (!application) return { ok: false, error: 'Application not found.' }

  // Guard against a double click, and against accepting something already
  // rejected. Without this, two clicks create two clients and two tokens.
  if (application.status !== 'new') {
    return { ok: false, error: 'This application has already been handled.' }
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      operator_id: operatorId,
      name: application.full_name,
      company: application.company,
    })
    .select('id')
    .single()

  if (clientError || !client) return { ok: false, error: 'Could not create the client.' }

  // 32 random bytes. This URL is the only thing between a stranger and
  // someone's onboarding form, so it must not be guessable.
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 86_400_000)

  const { error: tokenError } = await supabase
    .from('onboarding_tokens')
    .insert({ token, client_id: client.id, expires_at: expiresAt.toISOString() })

  if (tokenError) {
    // The client was created a moment ago and is useless without a link, so
    // undo it. Rule 5 in CLAUDE.md: a failed call leaves no partial record.
    // Without this, every retry of a failing accept creates another orphaned
    // client, and the operator's list fills with duplicates of one person.
    await supabase.from('clients').delete().eq('id', client.id)
    return { ok: false, error: 'Could not create the onboarding link.' }
  }

  await supabase
    .from('applications')
    .update({ status: 'accepted', converted_client_id: client.id })
    .eq('id', parsed.data)

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const link = `${origin}/onboarding/${token}`

  // Email last, and its failure is not this action's failure.
  let emailed = true
  try {
    await sendAcceptanceEmail({ to: application.email, name: application.full_name, link })
  } catch (e) {
    console.error('[accept] email failed for', application.email, e)
    emailed = false
  }

  // Deliberately NOT revalidating /applications here. Doing so re-runs the
  // queue query, the accepted row drops out of the status = 'new' filter, the
  // row unmounts, and the onboarding link disappears before the operator can
  // copy it - which defeats the reason it is shown on screen at all. The queue
  // refreshes on the next navigation, which is soon enough.
  revalidatePath('/clients')

  return { ok: true, link, emailed, clientId: client.id }
}
