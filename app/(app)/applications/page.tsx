import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { rejectApplication, rescoreApplication } from './actions'

export default async function ApplicationsPage() {
  const supabase = await createClient()

  const { data: applications, error } = await supabase
    .from('applications')
    .select(
      'id, full_name, email, company, monthly_revenue_usd, fit_score, fit_reasoning, scored_at, status, created_at'
    )
    .eq('status', 'new')
    .order('fit_score', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="border-destructive/30 bg-destructive/5 rounded-lg border p-6">
        <h2 className="mb-1 font-semibold">Could not load applications</h2>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
    )
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="border-border rounded-lg border border-dashed p-12 text-center">
        <h2 className="font-display mb-2 text-xl font-semibold">No new applications</h2>

        <p className="text-muted-foreground mx-auto max-w-sm text-sm">
          When a founder applies through the public form, their application lands here, sorted by
          fit score. Reviewing one is the first step of bringing a client on.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Applications</h1>
      </div>

      <ul className="flex flex-col">
        {applications.map((a) => (
          <li key={a.id} className="border-border border-t px-2 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{a.full_name}</div>
                <div className="text-muted-foreground text-sm">
                  {a.company ?? 'No company'} · {a.email}
                </div>
                <div className="text-muted-foreground text-sm">
                  {a.monthly_revenue_usd != null
                    ? `$${a.monthly_revenue_usd.toLocaleString()} / month`
                    : 'Revenue not given'}
                </div>
                {a.monthly_revenue_usd != null && a.monthly_revenue_usd < 5000 ? (
                  <Badge variant="secondary" className="mt-2">
                    Below the $5,000 mark
                  </Badge>
                ) : null}
              </div>

              <div className="shrink-0 text-right">
                {a.fit_score != null ? (
                  <div>
                    <div className="font-display text-2xl font-semibold">{a.fit_score}</div>
                    <div className="text-muted-foreground text-xs">Fit score</div>
                  </div>
                ) : a.scored_at == null ? (
                  <span className="text-muted-foreground text-sm">Not scored yet</span>
                ) : (
                  <span className="text-destructive text-sm font-medium">Scoring failed</span>
                )}
              </div>
            </div>

            {a.fit_score != null && a.fit_reasoning ? (
              <p className="text-muted-foreground mt-2 text-sm">{a.fit_reasoning}</p>
            ) : null}

            <div className="mt-3 flex gap-2">
              {a.fit_score == null && a.scored_at != null ? (
                <form action={rescoreApplication.bind(null, a.id)}>
                  <Button type="submit" variant="outline" size="sm">
                    Retry scoring
                  </Button>
                </form>
              ) : null}

              <form action={rejectApplication.bind(null, a.id)}>
                <Button type="submit" variant="destructive" size="sm">
                  Reject
                </Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
