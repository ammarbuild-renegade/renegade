# Voice-match scoring

**Inputs:** {{POST_CONTENT}}, {{VOICE_CARD}}, {{GOLD_SET}}
**Returns:** `{ dimensions: [{ name, score, evidence }], composite: number }`
**Model:** cross-model - whichever model did NOT write the post
**Used by:** Feature 13 - voice-match scoring
**Phase:** Phase 6

---

<!-- STUB. Written in Phase 6. Do not inline this anywhere in code -
     load it from this file so prompt changes stay reviewable in git. -->

**Only the rubric judgment belongs in this prompt.** Five of the six dimensions are
computed in code, not by a model:

- banned-structure violations - counted
- length and emoji policy - checked against stored fields
- sentence-length distribution vs the gold set - statistical
- characteristic vocabulary presence - measured

A model grading its own output is a weak check, so the scoring model must always be the
one that did not write the draft.

**Cold start:** a client with fewer than five of their own posts has no usable gold set.
The score is not meaningful yet and the UI must say so.
