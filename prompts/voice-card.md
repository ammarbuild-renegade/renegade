# Voice Card

**Inputs:** {{QUESTIONNAIRE}}, {{PAST_POSTS}}
**Returns:** `{ sketch: string, banned_structures: string[], gold_set_ids: string[] }`
**Model:** claude
**Used by:** Feature 6 - Voice Card
**Phase:** Phase 3

---

<!-- STUB. Written in Phase 3. Do not inline this anywhere in code -
     load it from this file so prompt changes stay reviewable in git. -->

Produces a 200-300 word **prose sketch of the person**, not a list of attributes.

Banned structures must cover **sentence shapes and formats**, not only vocabulary -
a model routes around a banned word but not a banned structure.

Gold set is drawn only from `past_post` sources. **Never `reference_post`.**
