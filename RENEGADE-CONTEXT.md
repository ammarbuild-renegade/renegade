# Renegade — Project Context Brief

_Self-contained briefing document. Written to be handed to any AI assistant so it
understands the platform without prior conversation. Scope as of 2026-09-22._

---

## 1. What Renegade is

An **operator-led platform for building founder personal brands on LinkedIn.**

A branding specialist (the "operator") manages several client workspaces. The operator
**personally interviews** each client. The system turns those interview transcripts into
LinkedIn posts written in the client's own voice.

It is a final year project (FYP) at a university, built across two semesters — FYP-1 then
FYP-2 — and defended before a jury. **There is a formal academic penalty for changing
approved scope**, which is why scope discipline matters more here than in a normal product.

### The core claim

> **The AI amplifies a human conversation. It never replaces it.**

Every post is built from material the client actually said out loud, and passes two human
checkpoints before publishing. This is the project's differentiator, and it should stay
visible in the product, not just in the documentation.

---

## 2. How it works, end to end

```
1.  Founder applies through a public qualifying form ($5k/mo revenue filter)
2.  AI scores fit; the operator accepts or rejects (human decision, AI only sorts)
3.  Accepted → emailed a private onboarding link (no account needed yet)
4.  Client completes onboarding: questionnaire, their own past posts,
    posts by creators they admire, brand kit
5.  System generates an interview prep brief for the operator
6.  OPERATOR INTERVIEWS THE CLIENT — a human conversation, on Zoom or Google Meet
7.  Transcript text file is uploaded; insight extraction runs automatically
8.  Extracted insights populate the Knowledge Vault
9.  System builds the Voice Card, Brand Blueprint and R3 content pillars
10. Operator picks a pillar; the post writer generates two drafts (two models)
11. Operator picks the better draft and edits
12. Client reviews via link or their own login: edits the hook, leaves feedback, approves
13. Approved → exported or scheduled (direct publishing is FYP-2)
```

---

## 3. Scope

### FYP-1 — 14 features (committed)

| #   | Feature                                                                   |
| --- | ------------------------------------------------------------------------- |
| 1   | Operator auth + multi-client workspace + client switcher                  |
| 2   | Client login + content library                                            |
| 3   | Qualification form ($5k/mo revenue filter + AI fit score)                 |
| 4   | Onboarding intake (questionnaire, past posts, reference posts, brand kit) |
| 5   | Interview prep brief                                                      |
| 6   | Voice Card                                                                |
| 7   | Personal Brand Blueprint                                                  |
| 8   | Knowledge Vault                                                           |
| 9   | R3 Strategy Engine (content pillars)                                      |
| 10  | Insight extraction (transcript → nuggets)                                 |
| 11  | Post writer + hook generation                                             |
| 12  | Approval workflow (token link + in-app)                                   |
| 13  | Voice-match scoring + evaluation method                                   |
| 14  | Transcript text-file upload + automatic processing                        |

### FYP-2 — in build order

1. Zoom integration (create meeting, pull transcript)
2. Assisted QA checks (repetition, unsupported claims, confidential information)
3. Trend radar + idea bank
4. Scheduling + direct publishing to LinkedIn
5. Branded visual generator
6. AI-conducted interviews — **jury-requested flagship**, bilingual status unresolved (§7)
7. Lead magnet generator — _build last, only if time allows; agreed first thing to drop_

### Out of scope — do not propose these

| Cut                                          | Why                                                                                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Post analytics / metrics                     | LinkedIn gates member post analytics behind the Community Management API partner program (see §6)                                                             |
| LinkedIn Profile Optimizer                   | Required manual entry of profile sections; the jury objected to manual data entry, and LinkedIn exposes no self-serve scope for About/Featured/banner content |
| Audio transcription                          | Zoom and Google Meet already produce transcripts; we ingest the text file                                                                                     |
| AI-conducted interviews in FYP-1             | Contradicts the USP unless framed as a second tier (§7)                                                                                                       |
| DM automation                                | Out of scope permanently                                                                                                                                      |
| Storing third-party contact data             | Privacy; we never store the clients' audiences                                                                                                                |
| Model fine-tuning                            | See §5                                                                                                                                                        |
| Repurposing engine                           | Cut for scope                                                                                                                                                 |
| Automated voice-match scoring _(reinstated)_ | Was cut, brought back 2026-09-22 at the jury's request                                                                                                        |

### Drop order if FYP-2 runs short

1. Lead magnet generator
2. The live Zoom video embed — transcripts arrive as files either way, so embedding is convenience, not capability
3. The Urdu half of AI interviews — English-only still demonstrates the flagship

---

## 4. Key design decisions, and why

These are the decisions most likely to be second-guessed. The reasoning matters more than
the decision.

### The Voice Card is prose, not structured fields

Three parts:

1. **Voice sketch** — 200–300 words of prose describing the _person_, not their settings.
   Written to give the model a persona to inhabit.
   _Reference tone: "Writes like a salesperson who happens to run an agency, not a marketing
   thought-leader. Direct. Confident. Self-deprecates before he authority-flexes, because
   he's earned the right to do both."_
2. **Banned structures** — a hard list covering **sentence shapes and formats, not just
   vocabulary**, because a model can route around a banned word but not a banned structure.
   Example: no "Not X, but Y" construction in any form; no "N lessons I learned" listicles.
3. **Gold set** — 5–8 of the client's own raw past posts, no commentary, always included.

**Do not replace this with a list of structured attributes.** Long attribute lists make the
model satisfy rules instead of writing well. This design comes from the operator's proven
manual practice.

Only two mechanical fields are stored separately, because the system validates against them:
post length preference and emoji policy.

### The transcript rule

> **Transcript = substance. Past posts = style. Never mix them.**

Transcripts are mined for _ideas_ — stories, numbers, opinions. They are **never** used as
writing-style examples. Spoken language rambles; a model told to imitate it produces
rambling output.

### Gold set vs reference posts — keep them separate

Clients supply two kinds of material:

- **`past_post`** — written by the client. Teaches _how this person actually writes_.
- **`reference_post`** — by creators the client admires. Describes _where they want to get to_.

Mixing them makes the model write like the admired creator, and the voice-match score then
measures the wrong target. Reference posts inform the voice sketch's direction only; they are
never retrieved as style examples at generation time and never reproduced in output.

**Cold-start case:** a client with fewer than five of their own posts has no usable gold set.
Reference posts then carry the style signal, and the system is doing voice _direction_, not
voice _matching_ — the UI says so, and the score is treated as not yet meaningful. As the
operator approves posts, approved posts become gold set material and the client's real voice
takes over. The system bootstraps.

### RAG is used in exactly one place

**The post writer. Nothing else.** Everything else in the system fetches records directly by
ID. There is no similarity search anywhere else.

The retrieval recipe:

- Past posts are embedded at onboarding and stored in pgvector
- At generation: the **gold set** (always) **plus** 2–3 topic-matched by similarity
- Gold set gives the voice baseline; retrieved posts give topic-specific proof

### Why not fine-tuning

1. **Data.** Fine-tuning needs thousands of examples. One client has 20–30 posts.
2. **Per-client cost.** One model per client; 20 clients means 20 models to maintain.
   Retrieval just adds rows to a database.
3. **Freshness.** New interview material is available to retrieval immediately. A fine-tuned
   model would need retraining.

### Clients get a read-only login, and token links stay

Clients see only their own workspace, and only posts that have reached `review` or later.
Token review links remain — approving one post must never require logging in.

### No regenerate button for clients

Two reasons, both valid:

1. **Cost.** Unlimited client-triggered regeneration is unbounded API spend.
2. **Editorial control.** The operator is the editor. If the client can regenerate freely,
   the operator stops being the gatekeeper and the voice drifts — which is the whole thing
   the platform exists to protect.

The **hook is editable** by the client because it is the highest-leverage, most subjective
line in the post, and letting them adjust wording costs nothing. Everything else returns to
the operator as feedback.

### Provider abstraction

One internal interface, swappable backends. Model choice is configuration, not code.

- Structured extraction (Voice Card, insights, Blueprint, pillars) → Claude
- Post drafting → **both models in parallel**; the operator picks the better draft
- Which draft the operator picks is **logged — that data is a result for the final report**
- Voice scoring is **cross-model**: if Claude wrote it, OpenAI scores it. A model grading its
  own output is a weak check.

### R3 Strategy Engine

`r3_objective` is a **column on the pillars table, not the table itself.** A client has 3–5
pillars — client-specific topics — each tagged Reach, Resonance or Revenue. Tags repeat.

**The pillar is chosen before the post is written, never detected afterward.**
`posts.pillar_id` is an _input_ to the post writer, not the output of a classifier. There is
no post-hoc classification step.

The prompt's key constraint: _every pillar must quote a line from the questionnaire or
transcript that justifies it._ Without that rule you get generic output — "Leadership",
"Lessons Learned" — which is what a model produces when it has nothing specific to hold onto.

### Voice-match scoring — the rubric, not one number

The jury asked how voice match is _evaluated_. The answer has two halves.

**The product feature** — a rubric where five of six components are deterministic:

- Banned-structure violations — _counted_, not judged
- Length and emoji policy — stored fields, checked mechanically
- Sentence-length distribution vs the gold set — statistical
- Characteristic vocabulary presence — measurable
- One LLM rubric judgment, cross-model

**The evaluation study** — this belongs in the results chapter:

- **Blind test.** A panel sees five real client posts and five generated. If they can't beat
  chance, the voice matches.
- **Operator acceptance rate** — fraction of drafts shipped without edits
- **Edit distance** — how much changes before approval

Never ship a single opaque 0–100 number with no breakdown.

---

## 5. Hard rules

Breaking any of these is a bug, not a preference.

1. **Every table carries `client_id`.** No query runs without client scoping.
2. **RLS enabled on every table.** Application-level filtering alone is not sufficient — the
   database must enforce isolation independently. A test that tries to read another
   operator's data and fails is required, not optional.
3. **All model calls go through the provider layer.** Never call the Anthropic or OpenAI SDK
   directly from a route handler or component.
4. **Prompts live in `/prompts` as versioned files.** Never inline a prompt in code.
5. **Write to the database only after a validated successful response.** A failed AI call
   must leave no partial records. _Exception: the qualifying form saves the application
   first, with no AI involved, then scores it separately — a lead must never be lost to an
   API timeout._
6. **Publishing happens only through the member's own OAuth grant**, and only in FYP-2.
   Never ask for, store or use a LinkedIn password.
7. **Never store personal data of third parties** (the clients' audiences).
8. **Secrets live in environment variables.** Never in code, never committed.
9. **Clients see only `review`-or-later posts.** Never drafts.
10. **Public routes write server-side.** The qualifying form and onboarding form have no
    authenticated user, so their database writes run in a server route handler with the
    service role key — never an anonymous-insert policy on a public table.

---

## 6. The LinkedIn API constraint

This is the most misunderstood part of the project. **Publishing and analytics are different
access tiers.** Verified 2026-09-22.

**Publishing is self-serve.** Adding the _Share on LinkedIn_ product in the LinkedIn
Developer Portal grants `w_member_social` with no LinkedIn review. The client authorises
through normal OAuth; we never see a password. Endpoint is `POST /v2/ugcPosts`. Rate limit
is 150 requests per member per day — far more than needed.

**Analytics is partner-gated.** `r_member_postAnalytics` sits inside the Community Management
API program and requires LinkedIn's approval. As of mid-2026 the approved list is about
eleven established commercial platforms (Hootsuite, Buffer, Sprinklr, Later and similar). A
student project will not be added to it.

**`r_member_social` is also restricted** — which is why clients supply their past posts as a
document rather than the system fetching them. There is no self-serve path to read a member's
own posts.

> Do **not** claim that publishing requires a legally registered business. It does not.

**Unverified, test before relying on it:** creating a Developer Portal app requires
associating it with a LinkedIn Page and verifying admin rights. Token lifetime and whether
refresh tokens are issued on the self-serve tier are also unconfirmed.

---

## 7. Open question — the bilingual AI interview

The jury asked for AI-conducted interviews in **Urdu and English**. Two problems:

**It collides with the USP.** If the AI conducts interviews, "the AI amplifies a human
conversation, it never replaces it" stops being true.

_Resolution:_ frame it as a **tier, not a replacement.** The human interview builds the brand
— it produces the Voice Card, Blueprint and pillars. The AI interview runs **top-up sessions
in between**, once the foundation exists, for clients who can't book operator time monthly.
It uses the interview prep brief as its question guide, so it automates an existing artifact
rather than adding a subsystem.

> The human interview builds the brand. The AI interview keeps it fed.

**Urdu serves no user here.** Clients are English-speaking professionals in one region, and
LinkedIn content ships in English. An Urdu-speaking voice agent costs roughly 8 extra days
for Urdu TTS and speech recognition, and the hardest case — Urdu/English code-switching,
which is how people actually talk — is where accuracy is worst.

_Fallback position being negotiated with the supervisor:_ accept **Urdu and code-switched
transcripts as input**, with all output in English. That is a prompt change, not a feature,
and it captures the linguistic point without an Urdu voice agent.

**Status: still in scope, pending that conversation.** Do not remove it unilaterally.

---

## 8. Stack

| Layer                     | Choice                                                              |
| ------------------------- | ------------------------------------------------------------------- |
| App                       | Next.js (App Router), TypeScript                                    |
| Styling                   | Tailwind CSS + shadcn/ui                                            |
| Database / auth / storage | Supabase (PostgreSQL)                                               |
| Vector search             | pgvector                                                            |
| Text generation           | Anthropic Claude API + OpenAI API, both behind an abstraction layer |
| Embeddings                | OpenAI embeddings                                                   |
| Hosting                   | Vercel                                                              |
| FYP-2 only                | n8n on Railway, Satori for image and PDF rendering                  |

Two Supabase projects, `dev` and `prod`. Never test against production data.

**Note on scheduling:** Vercel is serverless — there is no always-on process. Anything
needing a scheduler (reminders, trend radar) must use Vercel Cron, `pg_cron`, or the n8n
instance already in the FYP-2 stack.

---

## 9. Data model

```
operators                     (not client-scoped)
clients                       operator_id, status, fit_score, onboarding_token
client_users                  client_id   read-only auth user, one per client
brand_kits                    client_id   1:1
voice_cards                   client_id   1:1   sketch, banned_structures, gold_set_ids
blueprints                    client_id   1:1
source_documents              client_id   type: questionnaire | past_post |
                                          reference_post | transcript
transcripts                   client_id   source file, extracted text, processed_at
pov_items                     client_id, source_id   the Knowledge Vault
pillars                       client_id   r3_objective: Reach | Resonance | Revenue
posts                         client_id, pillar_id   content, hook, format, status,
                                          review_token
post_sources                  post_id, pov_id   link table — traceability
voice_scores                  post_id     per-dimension scores, composite, scoring model
feedback                      post_id
embeddings                    client_id
```

**`post_sources` is many-to-many** and is what makes every post traceable back to the
interview. Do not simplify it to a single foreign key — it is also the ground-truth set the
assisted QA "unsupported claims" check verifies against.

**Post status flow:**
`draft → qa → review → approved → scheduled → published`
with revision loops back from `qa` and `review`.

**Client status flow:**
`applied → accepted → onboarding → active`, or `rejected`.

---

## 10. Prompts

Instruction sheets in `/prompts`, one file each, versioned in git:

`fit-scoring` · `voice-card` · `blueprint` · `interview-prep` · `pillars` ·
`insight-extraction` · `post-writer` · `hooks` · `voice-score`

Rules:

- Placeholders use `{{DOUBLE_BRACES}}`
- Every prompt returns structured output; use the API's structured-output support rather
  than parsing free text
- Validate the response shape before saving anything
- Prompt changes are commits — they are the project's intellectual property

**Examples beat rules** for _style_ tasks like the post writer. But **grounding tasks want
constraints, not examples** — for pillar generation, adding sample pillars from other clients
makes output worse, because the model anchors on them and drifts toward the wrong domain.

---

## 11. Team and working constraints

Four people. Only one has industry experience; the other three do not, so effort estimates
should assume one person builds most of it.

- Build **vertical slices** (database → API → screen, working end to end), not horizontal
  layers. Nothing should be un-demoable for more than a few days.
- The project owner must be able to **explain any code in a viva.** Prefer clear over clever.
- Record non-obvious decisions with the reasoning — needed for the final report.
- Anything jury-facing uses **plain language, not jargon.**
- The proposal is a formal document and never mentions that a team member runs this service
  commercially.
