import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { scoreApplication } from '@/lib/scoring/fit'

const Application = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.email().max(200),
  company: z.string().trim().max(120).optional(),
  linkedin_url: z.url().max(300).optional().or(z.literal('')),
  monthly_revenue_usd: z.coerce.number().int().min(0).max(100_000_000),
  answers: z.record(z.string(), z.string().max(2000)).default({}),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = Application.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Step one: save. No AI anywhere near this.
  const { data: application, error } = await supabase
    .from('applications')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Could not save your application.' }, { status: 500 })
  }

  // Step two: score. Deliberately after the insert and deliberately not awaited
  // for the response - if it throws, the application is already safe and the
  // operator sees it unscored.
  scoreApplication(application.id).catch((e) => {
    console.error('[apply] scoring failed for', application.id, e)
  })

  return NextResponse.json({ ok: true })
}
