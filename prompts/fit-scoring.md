# Fit scoring

**Inputs:** {{APPLICATION_ANSWERS}}
**Returns:** `{ score: number (0-100), reasoning: string }`
**Model:** claude
**Used by:** Feature 3 - qualification form
**Phase:** Phase 2

---

<!-- STUB. Written in Phase 2. Do not inline this anywhere in code -
     load it from this file so prompt changes stay reviewable in git. -->

Scores an applicant against the operator's ideal-client criteria.

The score **sorts the operator's queue**. It never accepts or rejects on its own -
self-reported revenue is unreliable and a model must not turn away business on it.
