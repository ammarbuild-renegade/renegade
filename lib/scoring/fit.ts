import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import { generateStructured } from '@/lib/ai/provider'
import { createAdminClient } from '@/lib/supabase/admin'

const FitScore = z.object({
  score: z.number().int().min(0).max(100),
  reasoning: z.string().min(1).max(2000),
})

export type FitScore = z.infer<typeof FitScore>

/** Prompts are files, never inlined. Rule 4 in CLAUDE.md. */
async function loadPrompt(name: string) {
  return readFile(path.join(process.cwd(), 'prompts', `${name}.md`), 'utf8')
}

/**
 * Scores one application and writes the result back.
 *
 * Called from the public /apply route handler without being awaited: the
 * applicant should not wait on a model call for a number they never see, and
 * if this throws the application row is already saved. It is also called from
 * the operator's rescore action when a previous attempt failed.
 *
 * Uses the admin client because the first caller is an anonymous visitor who
 * has no session at all. The second caller must check the user is an operator
 * before invoking this - row-level security cannot do it here, since the admin
 * client bypasses it by design.
 */
export async function scoreApplication(applicationId: string): Promise<FitScore> {
  const supabase = createAdminClient()

  const { data: application, error } = await supabase
    .from('applications')
    .select('full_name, company, monthly_revenue_usd, answers')
    .eq('id', applicationId)
    .single()

  if (error || !application) {
    throw new Error(`Application ${applicationId} not found`)
  }

  const system = await loadPrompt('fit-scoring')

  const { data } = await generateStructured(
    'claude',
    {
      system,
      prompt: JSON.stringify(application, null, 2),
      // A 0-100 score with two sentences of reasoning does not need deep
      // thinking, and this runs on every application that arrives.
      effort: 'low',
      maxTokens: 1000,
    },
    FitScore
  )

  // Written only after a validated response. Rule 5 in CLAUDE.md: a failed
  // call leaves no partial record. generateStructured throws on malformed
  // JSON or a response that fails the schema, both before this line.
  //
  // scored_at is set even on success so the operator UI can tell three states
  // apart: never attempted (both null), failed (scored_at set, score null),
  // and scored.
  const { error: updateError } = await supabase
    .from('applications')
    .update({
      fit_score: data.score,
      fit_reasoning: data.reasoning,
      scored_at: new Date().toISOString(),
    })
    .eq('id', applicationId)

  if (updateError) {
    throw new Error(`Scored application ${applicationId} but could not save it`)
  }

  return data
}

/**
 * Records that scoring was attempted and failed, so the queue can offer a
 * retry instead of showing the application as merely unscored.
 *
 * Deliberately separate from scoreApplication: that function must not swallow
 * its own failures, or a scoring bug would look like a scoring result.
 */
export async function markScoringFailed(applicationId: string): Promise<void> {
  const supabase = createAdminClient()
  await supabase
    .from('applications')
    .update({ scored_at: new Date().toISOString(), fit_score: null, fit_reasoning: null })
    .eq('id', applicationId)
}
