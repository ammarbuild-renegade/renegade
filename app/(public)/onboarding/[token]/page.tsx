import { createAdminClient } from '@/lib/supabase/admin'
import { checkToken } from '@/lib/onboarding/token'
import { OnboardingForm } from './OnboardingForm'

function MessagePanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-border mx-auto max-w-md rounded-lg border border-dashed p-12 text-center">
      <h1 className="font-display mb-2 text-xl font-semibold">{title}</h1>
      <p className="text-muted-foreground text-sm">{body}</p>
    </div>
  )
}

export default async function OnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const check = await checkToken(token)

  if (!check.ok) {
    if (check.reason === 'expired') {
      return (
        <MessagePanel
          title="This link has expired"
          body="Onboarding links do not last forever. Please ask your operator for a fresh one."
        />
      )
    }

    if (check.reason === 'used') {
      return (
        <MessagePanel
          title="You have already completed this"
          body="We already have your answers — there is nothing more to fill in. If you still need to book your first interview, your operator can help."
        />
      )
    }

    return (
      <MessagePanel
        title="This link is not valid"
        body="We could not find this onboarding link. Please check the link, or ask your operator for a new one."
      />
    )
  }

  const supabase = createAdminClient()

  const { data: application } = await supabase
    .from('applications')
    .select('full_name, email, company, linkedin_url')
    .eq('converted_client_id', check.clientId)
    .maybeSingle()

  const { data: client } = await supabase
    .from('clients')
    .select('name, company, operator_id')
    .eq('id', check.clientId)
    .single()

  const { data: operator } = client
    ? await supabase.from('operators').select('booking_url').eq('id', client.operator_id).single()
    : { data: null }

  const { data: saved } = await supabase
    .from('source_documents')
    .select('content')
    .eq('client_id', check.clientId)
    .eq('type', 'questionnaire')
    .maybeSingle()

  let initialAnswers: Record<string, string> = {}

  if (saved?.content) {
    try {
      initialAnswers = JSON.parse(saved.content) as Record<string, string>
    } catch {
      initialAnswers = {}
    }
  }

  const header = [
    { label: 'Name', value: application?.full_name ?? client?.name ?? '—' },
    { label: 'Email', value: application?.email ?? '—' },
    { label: 'Company', value: application?.company ?? client?.company ?? '—' },
    { label: 'LinkedIn', value: application?.linkedin_url ?? '—' },
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="border-border mb-8 rounded-lg border p-6">
        <h1 className="font-display mb-4 text-2xl font-semibold">Welcome to Renegade</h1>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {header.map((row) => (
            <div key={row.label}>
              <dt className="text-muted-foreground text-xs tracking-wide uppercase">{row.label}</dt>
              <dd className="text-sm font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>

        <p className="text-muted-foreground mt-4 text-sm">
          We already have these from your application — no need to give them again.
        </p>
      </div>

      <OnboardingForm
        token={token}
        initialAnswers={initialAnswers}
        bookingUrl={operator?.booking_url ?? null}
      />
    </div>
  )
}
