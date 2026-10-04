/**
 * Phase 0 check: confirm each configured provider answers.
 *
 * Run:  npx tsx --env-file=.env.local scripts/test-provider.ts
 *
 * A provider with no key in .env.local is skipped, not failed — so you can
 * test one while the other is still waiting on billing.
 */
import { generate, isConfigured, type Provider } from '../lib/ai/provider'

const PROVIDERS: Provider[] = ['claude', 'openai']

async function main() {
  let ok = 0
  let failed = 0
  let skipped = 0

  for (const provider of PROVIDERS) {
    if (!isConfigured(provider)) {
      const key = provider === 'claude' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY'
      console.log(`\n--- ${provider}: SKIPPED (${key} not set in .env.local) ---`)
      skipped++
      continue
    }

    const t0 = Date.now()
    try {
      const r = await generate(provider, {
        system: 'You are terse. Answer in one short sentence.',
        prompt: 'What is retrieval-augmented generation?',
        maxTokens: 1024,
      })
      console.log(`\n--- ${provider} (${r.model}) ${Date.now() - t0}ms ---`)
      console.log(r.text.trim() || '(empty response)')
      console.log(`tokens: ${r.inputTokens} in / ${r.outputTokens} out`)
      ok++
    } catch (e) {
      failed++
      const msg = e instanceof Error ? e.message : String(e)
      console.error(`\n--- ${provider}: FAILED ---`)
      console.error(msg)

      if (/credit|billing|quota|insufficient/i.test(msg)) {
        console.error('  -> The key works but the account has no credit. Top it up in the')
        console.error('     provider dashboard; nothing in the code needs changing.')
      } else if (/401|invalid|authentication/i.test(msg)) {
        console.error('  -> Key is wrong or has a stray space. Re-copy it from the dashboard.')
      } else if (/model/i.test(msg)) {
        console.error(
          '  -> Model id may be wrong. Check CLAUDE_MODEL / OPENAI_MODEL in .env.local.'
        )
      }
    }
  }

  console.log(`\n${ok} ok, ${failed} failed, ${skipped} skipped.`)
  if (ok === 0 && failed === 0) {
    console.log('No provider is configured yet. Add at least one key to .env.local.')
  }
  process.exit(failed > 0 ? 1 : 0)
}

main()
