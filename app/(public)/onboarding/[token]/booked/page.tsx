import { createAdminClient } from '@/lib/supabase/admin'

export default async function BookedPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = createAdminClient()

  const { data: tokenRow } = await supabase
    .from('onboarding_tokens')
    .select('client_id')
    .eq('token', token)
    .single()

  if (!tokenRow) {
    return (
      <div className="border-border mx-auto max-w-md rounded-lg border border-dashed p-12 text-center">
        <h1 className="font-display mb-2 text-xl font-semibold">This link is not valid</h1>
        <p className="text-muted-foreground text-sm">
          We could not find this onboarding link. Please ask your operator for a new one.
        </p>
      </div>
    )
  }

  await supabase
    .from('clients')
    .update({ interview_booked_at: new Date().toISOString() })
    .eq('id', tokenRow.client_id)
    .is('interview_booked_at', null)

  return (
    <div className="border-border mx-auto max-w-md rounded-lg border border-dashed p-12 text-center">
      <h1 className="font-display mb-2 text-xl font-semibold">You are booked in</h1>
      <p className="text-muted-foreground text-sm">
        Thanks — your first interview is on the calendar. We will see you there.
      </p>
    </div>
  )
}
