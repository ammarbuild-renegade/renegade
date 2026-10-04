import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { ZodType } from 'zod'

export type Provider = 'claude' | 'openai'

/**
 * Reasoning effort. Both providers now expose this concept, so we take one
 * value and map it to each provider's own parameter.
 *   Claude  -> output_config.effort
 *   OpenAI  -> reasoning.effort
 */
export type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

/**
 * Clients are built on first use, not at import time.
 *
 * If both were constructed when this module loads, a single missing key would
 * break every call — including calls to the provider whose key IS set. Building
 * them lazily means you can work with one provider configured while the other
 * is still waiting on billing.
 */
let _anthropic: Anthropic | undefined
let _openai: OpenAI | undefined

function requireKey(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env.local, then re-run. ` +
        `Nothing else in the app needs changing.`
    )
  }
  return value
}

function anthropicClient(): Anthropic {
  _anthropic ??= new Anthropic({ apiKey: requireKey('ANTHROPIC_API_KEY') })
  return _anthropic
}

function openaiClient(): OpenAI {
  _openai ??= new OpenAI({ apiKey: requireKey('OPENAI_API_KEY') })
  return _openai
}

/** True when this provider has a key configured. Lets callers skip it cleanly. */
export function isConfigured(provider: Provider): boolean {
  return Boolean(process.env[provider === 'claude' ? 'ANTHROPIC_API_KEY' : 'OPENAI_API_KEY'])
}

const MODELS: Record<Provider, string> = {
  claude: process.env.CLAUDE_MODEL ?? 'claude-sonnet-5',
  openai: process.env.OPENAI_MODEL ?? 'gpt-5.6-sol',
}

const DEFAULT_EFFORT: Record<Provider, Effort | undefined> = {
  // Unset leaves Claude on its API default (high).
  claude: process.env.CLAUDE_EFFORT as Effort | undefined,
  openai: (process.env.OPENAI_EFFORT as Effort | undefined) ?? 'medium',
}

export interface GenerateOptions {
  system: string
  prompt: string
  maxTokens?: number
  effort?: Effort
}

export interface GenerateResult {
  text: string
  provider: Provider
  model: string
  inputTokens: number
  outputTokens: number
}

/**
 * Plain text generation.
 * Everything in the app calls this. Nothing else imports an AI SDK directly —
 * that rule is what lets us swap models without touching the application.
 *
 * Note there is no `temperature`. Both current model families are reasoning
 * models and reject it: Claude Sonnet 5 returns a 400, and OpenAI's reasoning
 * models do not support it. Use `effort` to trade depth against cost instead.
 */
export async function generate(provider: Provider, opts: GenerateOptions): Promise<GenerateResult> {
  const model = MODELS[provider]
  const maxTokens = opts.maxTokens ?? 2048
  const effort = opts.effort ?? DEFAULT_EFFORT[provider]

  if (provider === 'claude') {
    const r = await anthropicClient().messages.create({
      model,
      max_tokens: maxTokens,
      thinking: { type: 'adaptive' },
      ...(effort ? { output_config: { effort } } : {}),
      system: opts.system,
      messages: [{ role: 'user', content: opts.prompt }],
    })

    const text = r.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
      .join('')

    return {
      text,
      provider,
      model,
      inputTokens: r.usage.input_tokens,
      outputTokens: r.usage.output_tokens,
    }
  }

  // OpenAI reasoning models use the Responses API, not Chat Completions.
  const r = await openaiClient().responses.create({
    model,
    instructions: opts.system,
    input: opts.prompt,
    max_output_tokens: maxTokens,
    ...(effort ? { reasoning: { effort } } : {}),
  })

  return {
    text: r.output_text ?? '',
    provider,
    model,
    inputTokens: r.usage?.input_tokens ?? 0,
    outputTokens: r.usage?.output_tokens ?? 0,
  }
}

/**
 * Generate JSON and validate it against a Zod schema.
 * Throws if the model returns a shape we did not ask for, so nothing
 * malformed can ever reach the database.
 */
export async function generateStructured<T>(
  provider: Provider,
  opts: GenerateOptions,
  schema: ZodType<T>
): Promise<{ data: T; meta: GenerateResult }> {
  const meta = await generate(provider, {
    ...opts,
    system: opts.system + '\n\nRespond with valid JSON only. No markdown code fences.',
  })

  let parsed: unknown
  try {
    parsed = JSON.parse(meta.text.trim().replace(/^```json\s*|\s*```$/g, ''))
  } catch {
    throw new Error(`${provider} returned invalid JSON: ${meta.text.slice(0, 200)}`)
  }

  return { data: schema.parse(parsed), meta }
}
