# Insight extraction

**Inputs:** {{TRANSCRIPT}}
**Returns:** `{ items: [{ text, type, quote, speaker }] }`
**Model:** claude
**Used by:** Feature 10 - insight extraction
**Phase:** Phase 4

---

<!-- STUB. Written in Phase 4. Do not inline this anywhere in code -
     load it from this file so prompt changes stay reviewable in git. -->

Mines the transcript for **substance only** - stories, numbers, opinions, beliefs.

Each item keeps the original `quote` so every post stays traceable to what was said.

The transcript is **never** used as a writing-style example. Spoken language rambles.
