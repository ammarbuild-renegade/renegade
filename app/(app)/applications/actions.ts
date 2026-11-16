'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { scoreApplication } from '@/lib/scoring/fit'

const ApplicationId = z.string().uuid()

async function requireOperator() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()

  if (!claims?.claims?.sub) {
    return null
  }

  return supabase
}

export async function rejectApplication(id: string) {
  const parsed = ApplicationId.safeParse(id)

  if (!parsed.success) {
    return
  }

  const supabase = await requireOperator()

  if (!supabase) {
    return
  }

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

  const supabase = await requireOperator()

  if (!supabase) {
    return
  }

  await scoreApplication(parsed.data)

  revalidatePath('/applications')
}

;('use server')

import { randomBytes } from 'node:crypto'
import { sendAcceptanceEmail } from '@/lib/email/acceptance'

const TOKEN_TTL_DAYS = 14

export async function acceptApplication(applicationId: string) {
  const supabase = await createClient()

  const { data: application } = await supabase
    .from('applications')
    .select('id, full_name, email, company, status')
    .eq('id', applicationId)
    .single()

  if (!application) return { error: 'Application not found.' }
  if (application.status !== 'new') return { error: 'This application was already handled.' }

  const { data: claims } = await supabase.auth.getClaims()
  const operatorId = claims?.claims?.sub
  if (!operatorId) return { error: 'You are not signed in.' }

  // 1. The client row.
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      operator_id: operatorId,
      name: application.full_name,
      company: application.company,
    })
    .select('id')
    .single()

  if (clientError || !client) return { error: 'Could not create the client.' }

  // 2. The token. 32 random bytes - this URL is the only thing standing between
  //    a stranger and someone's onboarding form, so it must not be guessable.
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 86_400_000)

  const { error: tokenError } = await supabase
    .from('onboarding_tokens')
    .insert({ token, client_id: client.id, expires_at: expiresAt.toISOString() })

  if (tokenError) return { error: 'Could not create the onboarding link.' }

  // 3. Mark the application converted.
  await supabase
    .from('applications')
    .update({ status: 'accepted', converted_client_id: client.id })
    .eq('id', applicationId)

  const link = `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding/${token}`

  // 4. Email last, and its failure is not the action's failure. The link is
  //    returned either way and the UI shows it.
  let emailed = true
  try {
    await sendAcceptanceEmail({ to: application.email, name: application.full_name, link })
  } catch (e) {
    console.error('[accept] email failed', e)
    emailed = false
  }

  revalidatePath('/applications')
  return { ok: true, link, emailed, clientId: client.id }
}
