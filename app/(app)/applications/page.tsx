import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { rejectApplication, rescoreApplication } from './actions'
import { AcceptButton } from './accept-button'

/**
 * The questions as the applicant saw them, so the operator reads them the same
 * way. Anything not listed falls back to a tidied-up version of its key, so a
 * new question added to the form still shows rather than silently vanishing.
 */
const ANSWER_LABELS: Record<string, string> = {
  goal: 'What is the #1 thing you want LinkedIn to do for you?',
  about: 'Tell us about your work — who do you help, and how?',
  website: 'Company website',
}

/** `answers` is jsonb, so it arrives loosely typed. Keep only usable strings. */
function answerEntries(answers: unknown): [string, string][] {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return []
  return Object.entries(answers as Record<string, unknown>).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim() !== ''
  )
}

function labelFor(key: string) {
  return ANSWER_LABELS[key] ?? key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
}

export default async function ApplicationsPage() {
  const supabase = await createClient()

  const { data: applications, error } = await supabase
    .from('applications')
    .select(
      'id, full_name, email, company, linkedin_url, monthly_revenue_usd, answers, fit_score, fit_reasoning, scored_at, status, created_at'
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
                {a.linkedin_url ? (
                  <a
                    href={a.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand text-sm hover:underline"
                  >
                    View their LinkedIn profile
                  </a>
                ) : null}
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
              <p className="border-border text-muted-foreground mt-3 border-l-2 pl-3 text-sm">
                {a.fit_reasoning}
              </p>
            ) : null}

            {/* What the applicant actually wrote. Without this the operator is
                deciding on a revenue figure alone, which is the one number on
                the form nobody can verify. */}
            {answerEntries(a.answers).length > 0 ? (
              <dl className="mt-4 flex flex-col gap-3">
                {answerEntries(a.answers).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-muted-foreground font-mono text-[10px] tracking-[0.12em] uppercase">
                      {labelFor(key)}
                    </dt>
                    <dd className="mt-1 text-sm whitespace-pre-wrap">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-muted-foreground mt-4 text-sm italic">
                This applicant left the written questions blank.
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <AcceptButton id={a.id} name={a.full_name} />

              {/* Offered whenever there is no score, not only after a failure.
                  An application that was never attempted - one submitted while
                  scoring was broken, say - would otherwise sit on "Not scored
                  yet" forever with no way to trigger it. */}
              {a.fit_score == null ? (
                <form action={rescoreApplication.bind(null, a.id)}>
                  <Button type="submit" variant="outline" size="sm">
                    {a.scored_at == null ? 'Score now' : 'Retry scoring'}
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
