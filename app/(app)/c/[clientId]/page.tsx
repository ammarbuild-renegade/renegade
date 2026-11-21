import { createClient } from '@/lib/supabase/server'
import { CopyLink } from '@/components/copy-link'

/**
 * The client overview.
 *
 * Its job right now is to make the onboarding link permanently retrievable.
 * The link is a capability URL that is emailed once, and Resend's test sender
 * only reaches the operator's own address until a domain is verified - so
 * without somewhere to read it back, a link that failed to arrive would be
 * lost and the client could never be onboarded.
 */
export default async function ClientOverviewPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: token }, { data: documents }] = await Promise.all([
    supabase.from('clients').select('interview_booked_at').eq('id', clientId).single(),
    supabase
      .from('onboarding_tokens')
      .select('token, expires_at, used_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('source_documents').select('type').eq('client_id', clientId),
  ])

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const expired = token ? new Date(token.expires_at) < new Date() : false
  const counts = (documents ?? []).reduce<Record<string, number>>((acc, d) => {
    acc[d.type] = (acc[d.type] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-2xl">
      <section className="border-border rounded-lg border p-5">
        <h2 className="font-display mb-1 text-lg font-semibold">Onboarding</h2>

        {!token ? (
          <p className="text-muted-foreground text-sm">
            No onboarding link has been issued for this client yet.
          </p>
        ) : token.used_at ? (
          <p className="text-muted-foreground text-sm">
            Completed on {new Date(token.used_at).toLocaleDateString()}. The link has been used and
            will not open again.
          </p>
        ) : expired ? (
          <p className="text-destructive text-sm">
            This link expired on {new Date(token.expires_at).toLocaleDateString()}. Issue a new one
            before asking the client to continue.
          </p>
        ) : (
          <>
            <p className="text-muted-foreground mb-3 text-sm">
              Not started yet. Send this to the client — it works once and expires on{' '}
              {new Date(token.expires_at).toLocaleDateString()}.
            </p>
            <CopyLink value={`${origin}/onboarding/${token.token}`} />
          </>
        )}
      </section>

      <section className="border-border mt-4 rounded-lg border p-5">
        <h2 className="font-display mb-1 text-lg font-semibold">First interview</h2>
        <p className="text-muted-foreground text-sm">
          {client?.interview_booked_at
            ? `Booked on ${new Date(client.interview_booked_at).toLocaleDateString()}.`
            : 'Not booked yet. The client books it from the end of the onboarding form.'}
        </p>
      </section>

      <section className="border-border mt-4 rounded-lg border p-5">
        <h2 className="font-display mb-2 text-lg font-semibold">Material collected</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-4">
          {[
            ['Questionnaire', counts.questionnaire ?? 0],
            ['Past posts', counts.past_post ?? 0],
            ['Reference posts', counts.reference_post ?? 0],
            ['Brand kit', counts.brand_kit ?? 0],
          ].map(([label, n]) => (
            <div key={label}>
              <dt className="text-muted-foreground font-mono text-[10px] tracking-[0.15em] uppercase">
                {label}
              </dt>
              <dd className="mt-0.5 text-base">{n}</dd>
            </div>
          ))}
        </dl>
        {(counts.past_post ?? 0) < 5 && (
          <p className="text-muted-foreground mt-3 text-xs">
            Fewer than five past posts means no usable gold set — the Voice Card will be doing voice
            direction rather than voice matching.
          </p>
        )}
      </section>
    </div>
  )
}
