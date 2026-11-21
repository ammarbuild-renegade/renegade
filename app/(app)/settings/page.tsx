import { createClient } from '@/lib/supabase/server'
import { BookingUrlForm } from './booking-url-form'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const operatorId = claims?.claims?.sub

  const { data: operator } = await supabase
    .from('operators')
    .select('full_name, email, booking_url')
    .eq('id', operatorId ?? '')
    .maybeSingle()

  return (
    <div className="max-w-xl">
      <h1 className="font-display mb-1 text-2xl font-semibold">Settings</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        {operator?.full_name ? `${operator.full_name} · ` : ''}
        {operator?.email}
      </p>

      <section className="border-border rounded-lg border p-5">
        <h2 className="font-display mb-1 text-lg font-semibold">First interview booking</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          When a client finishes onboarding, the last screen offers them a button to book their
          first interview. Without a link here, that screen just tells them to wait for you.
        </p>

        <BookingUrlForm current={operator?.booking_url ?? ''} />
      </section>
    </div>
  )
}
