import OpenAI from 'openai'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * 1536 dimensions, this model's default, and it must match the
 * extensions.vector(1536) column in migration 0003.
 *
 * The dimension is a contract between the model and the column, not a setting
 * on either. Changing the model means changing the column AND re-embedding
 * everything already stored - a mismatch is rejected outright with
 * "expected 1536 dimensions, not N".
 */
const MODEL = 'text-embedding-3-small'
const DIMENSIONS = 1536

let _client: OpenAI | undefined

function client(): OpenAI {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY is not set. Add it to .env.local, then re-run.')
  _client ??= new OpenAI({ apiKey: key })
  return _client
}

/** Turns one piece of text into a vector. */
export async function embed(text: string): Promise<number[]> {
  const res = await client().embeddings.create({ model: MODEL, input: text })
  const vector = res.data[0].embedding

  if (vector.length !== DIMENSIONS) {
    throw new Error(`${MODEL} returned ${vector.length} dimensions, expected ${DIMENSIONS}`)
  }

  return vector
}

/**
 * Embeds one source document and stores the vector against it.
 *
 * Only past posts are embedded in FYP-1. The questionnaire, brand kit and
 * reference posts are always fetched by id, never by similarity - and a
 * reference post must never be retrievable as a style example, or the writing
 * drifts toward the admired creator instead of the client.
 *
 * Nothing reads these vectors until the post writer in Phase 4. They are
 * written now so the data is ready when it arrives.
 */
export async function embedSourceDocument(documentId: string): Promise<void> {
  const supabase = createAdminClient()

  const { data: doc, error } = await supabase
    .from('source_documents')
    .select('id, type, content')
    .eq('id', documentId)
    .single()

  if (error || !doc) throw new Error(`Source document ${documentId} not found`)

  if (doc.type !== 'past_post') {
    throw new Error(`Refusing to embed a ${doc.type}. Only past_post is embedded in FYP-1.`)
  }

  if (!doc.content?.trim()) {
    throw new Error(`Source document ${documentId} has no text to embed`)
  }

  const vector = await embed(doc.content)

  // Written only after a successful, correctly-sized response. Rule 5 in
  // CLAUDE.md - a failed call leaves no partial record.
  const { error: updateError } = await supabase
    .from('source_documents')
    .update({ embedding: JSON.stringify(vector) })
    .eq('id', documentId)

  if (updateError) {
    throw new Error(`Embedded ${documentId} but could not store the vector`)
  }
}
