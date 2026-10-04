# Post writer

**Inputs:** {{VOICE_CARD}}, {{GOLD_SET}}, {{SIMILAR_POSTS}}, {{POV_ITEMS}}, {{PILLAR}}
**Returns:** `{ content: string }`
**Model:** claude and openai, in parallel
**Used by:** Feature 11 - post writer
**Phase:** Phase 4

---

<!-- STUB. Written in Phase 4. Do not inline this anywhere in code -
     load it from this file so prompt changes stay reviewable in git. -->

The one place RAG is used in FYP-1.

Style comes from `{{GOLD_SET}}` (always) plus `{{SIMILAR_POSTS}}` (2-3, retrieved by
pgvector similarity). Substance comes from `{{POV_ITEMS}}`. **Never mix the two.**

Both models run in parallel and the operator picks. Log which one they pick - that is
a measured result for the final report.
