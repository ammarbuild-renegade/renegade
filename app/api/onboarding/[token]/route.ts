import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkToken } from '@/lib/onboarding/token'

const Body = z.object({
  answers: z.record(z.string(), z.string().max(4000)).default({}),
  final: z.boolean().default(false),
})

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const check = await checkToken(token)

  if (!check.ok) {
    return NextResponse.json(
      { error: 'This link is not valid.', reason: check.reason },
      { status: check.reason === 'unknown' ? 404 : 410 }
    )
  }

  const parsed = Body.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid answers.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const content = JSON.stringify(parsed.data.answers)

  const { data: existing } = await supabase
    .from('source_documents')
    .select('id')
    .eq('client_id', check.clientId)
    .eq('type', 'questionnaire')
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('source_documents')
      .update({ content })
      .eq('id', existing.id)

    if (error) {
      return NextResponse.json({ error: 'Could not save your answers.' }, { status: 500 })
    }
  } else {
    const { error } = await supabase
      .from('source_documents')
      .insert({ client_id: check.clientId, type: 'questionnaire', content })

    if (error) {
      return NextResponse.json({ error: 'Could not save your answers.' }, { status: 500 })
    }
  }

  if (parsed.data.final) {
    const { error } = await supabase
      .from('onboarding_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    if (error) {
      return NextResponse.json({ error: 'Could not finish onboarding.' }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
