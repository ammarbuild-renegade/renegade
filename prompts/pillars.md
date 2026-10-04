# R3 Strategy Engine

**Inputs:** {{BLUEPRINT}}, {{POV_ITEMS}}, {{QUESTIONNAIRE}}
**Returns:** `{ pillars: [{ name, description, r3_objective, evidence }] }`
**Model:** claude
**Used by:** Feature 9 - R3 Strategy Engine
**Phase:** Phase 3

---

<!-- STUB. Written in Phase 3. Do not inline this anywhere in code -
     load it from this file so prompt changes stay reviewable in git. -->

3-5 pillars. `r3_objective` is **Reach | Resonance | Revenue** and repeats across pillars.

**The hard rule:** every pillar must quote a line from the questionnaire or transcript
that justifies it. A pillar that cannot be grounded is not a pillar - it is the generic
slop a model produces when it has nothing specific to hold onto.

Do **not** add example pillars from other clients. This is a grounding task, so it wants
a constraint, not examples - examples make the model drift toward their domain.
