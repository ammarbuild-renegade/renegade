@AGENTS.md

<!-- The line above is written by create-next-app and imports Next.js 16's
     breaking-changes warning. Keep it first. Our own rules follow. -->

# Renegade

An operator-led platform for building founder personal brands on LinkedIn. A branding
specialist (the "operator") manages several client workspaces, interviews each client
personally, and the system turns those interviews into voice-matched LinkedIn posts.

**The core claim: the AI amplifies a human conversation, it never replaces it.**
Every post is built from material the client actually said, and passes two human
checkpoints before publishing. Keep this visible in the product, not just the docs.

---

## Current phase: FYP-1

Scope revised **2026-09-22** after jury feedback. Changes from the previous revision are
marked. Do not start FYP-2 work unless explicitly asked.

**Build only these 14 features.**

1. Operator auth + multi-client workspace + client switcher
2. Client login + content library — **NEW**, reverses the old no-client-login rule
3. Qualification form (**$5k**/mo revenue filter + fit score) — threshold lowered from $10k
4. Onboarding intake (questionnaire, past posts, brand kit)
5. Interview prep brief
6. Voice Card
7. Personal Brand Blueprint
8. Knowledge Vault
9. R3 Strategy Engine (content pillars)
10. Insight extraction (transcript → nuggets)
11. Post writer + hook generation
12. Approval workflow — token link **and** in-app for logged-in clients. The client can
    edit the hook, leave feedback, and approve. **No regenerate button for clients** — see
    the approval rules below.
13. Voice-match scoring + evaluation method — **BACK IN**, the jury asked how voice match
    is evaluated. Must be a rubric with deterministic components, not one opaque number.
14. Transcript **text file** upload + automatic processing — **NEW**. Zoom and Google Meet
    already produce the transcript; we ingest the file (`.vtt`, `.txt`, `.docx`) and trigger
    insight extraction on upload. **We never transcribe audio ourselves.**

**FYP-2, in build order:** meeting integration (create the meeting, pull the transcript) ·
assisted QA checks · trend radar + idea bank · scheduling + **direct publishing to LinkedIn** ·
branded visual generator · AI-conducted interviews (**jury-requested**, see below).

**Stretch, explicitly not committed:** live meeting video embedded in-page.

**Name no meeting vendor in the proposal.** Say "meeting integration". Zoom, Google Meet and
Teams all expose the same two things we need — create a meeting, fetch its transcript — and
each has its own plan requirements that may change. Committing to one vendor in writing means
a scope change if that vendor's terms move; committing to the capability does not.

**Interviews — two paths, both in scope.** The human interview is the primary one and the
product's differentiator: it produces the Voice Card, the Blueprint and the pillars. The
AI-conducted interview is a **second path** for top-up sessions, once that foundation already
exists — for clients who cannot book operator time every month.

> The human interview builds the brand. The AI interview keeps it fed.

The operator is making the case to the supervisor that the AI path serves no real user here.
**Until that conversation concludes, both stay in scope and the proposal describes both.** If
the supervisor agrees, the AI path is removed; if not, it is built as described.

**Bilingual is a separate question.** Clients are English-speaking professionals in one region
and LinkedIn content ships in English, so an Urdu-speaking voice agent serves no user. The
position to negotiate: accept **Urdu and code-switched transcripts as input** while all output
stays English — a prompt change, not a feature. Do not build Urdu speech until this is settled.

**Cut entirely — lead magnet generator.** Removed from scope 2026-10-11. FYP-2 already
carries Zoom, assisted QA, trend radar, publishing, the visual generator and AI interviews.
A feature written into a proposal as "only if time allows" has one predictable outcome: the
jury asks whether it was built and the answer is no. Better to not promise it.

**Cut entirely — LinkedIn Profile Optimizer.** It required the operator to type the
client's profile sections in by hand, and the jury objected to manual data entry. LinkedIn
does not expose About, Featured or banner content through any self-serve scope, so there is
no automated path. Do not reintroduce it.

**Out of scope:** post analytics and metrics, DM automation, lead capture / storing
third-party contacts, model fine-tuning, repurposing engine.

**Why analytics is out but publishing is in** — these are different LinkedIn access tiers,
verified 2026-09-22:

- **Publishing is self-serve.** Adding the _Share on LinkedIn_ product in the Developer
  Portal grants `w_member_social` with no LinkedIn review. The client authorises through
  normal OAuth; we never see a password. Limit is 150 posts per member per day, which is
  far more than anyone needs.
- **Analytics is partner-gated.** `r_member_postAnalytics` sits inside the Community
  Management API program and needs LinkedIn's approval. As of mid-2026 the approved list
  is about eleven established commercial platforms (Hootsuite, Buffer, Sprinklr, Later
  and similar). A student project will not be added to it.

Say exactly this if the jury asks. Do not say publishing needs a registered business — it
does not.

---

## Non-negotiable rules

These are not preferences. Breaking any of them is a bug.

1. **Every table carries `client_id`.** No query runs without client scoping.
2. **RLS is enabled on every table.** Application-level filtering is not sufficient on
   its own — the database must enforce isolation independently.
3. **All model calls go through the provider layer** (`lib/ai/provider.ts`). Never call
   the Anthropic or OpenAI SDK directly from a route handler or component.
4. **Prompts live in `/prompts` as versioned files.** Never inline a prompt in code.
5. **Write to the database only after a validated successful response.** A failed AI
   call must leave no partial records.
6. **Publishing happens only through the member's own OAuth grant**, and only in FYP-2.
   Until then, export and reminder only. Never ask for, store or use a LinkedIn password —
   OAuth exists precisely so we never handle credentials.
7. **Never store personal data of third parties** (the clients' audiences).
8. **Secrets live in environment variables.** Never in code, never committed.
9. **Clients get a read-only account.** A client sees only their own workspace, and only
   posts that have reached `review` or later. Token review links stay — approving one post
   must never require logging in.

---

## Stack

| Layer                     | Choice                                                       |
| ------------------------- | ------------------------------------------------------------ |
| App                       | Next.js (App Router), TypeScript                             |
| Styling                   | Tailwind CSS + shadcn/ui                                     |
| Database / auth / storage | Supabase (PostgreSQL)                                        |
| Vector search             | pgvector                                                     |
| Text generation           | Anthropic Claude API + OpenAI API (both, behind abstraction) |
| Embeddings                | OpenAI embeddings                                            |
| Hosting                   | Vercel                                                       |
| FYP-2 only                | n8n on Railway, Satori for image and PDF rendering           |

Two Supabase projects: `dev` and `prod`. Never test against production data.

---

## The Voice Card — prose, not fields

This design comes from the operator's proven practice. **Do not replace it with a
list of structured attributes** — long attribute lists make the model satisfy rules
instead of writing well.

Three parts:

**1. Voice sketch** — 200–300 words of prose describing the person, not their
settings. Written to give the model a persona to inhabit. Generated from the
questionnaire and past posts, then edited by the operator.

_Reference tone:_ "Writes like a salesperson who happens to run an agency, not a
marketing thought-leader. Direct. Confident. Self-deprecates before he
authority-flexes, because he's earned the right to do both."

**2. Banned structures** — a hard list. Critically, this covers **sentence shapes and
formats, not just vocabulary**, because a model can route around a banned word but
not a banned structure. Examples of the kind of rule that belongs here:

- No "Not X, but Y" construction in any form
- No stacked repetitive negatives or affirmatives
- No named hook clichés ("here's what no one tells you", "let me be honest with you")
- Format bans (e.g. no "N lessons I learned" listicles)
- Then the banned word list

**3. Gold set** — 5–8 raw past posts **written by the client**, no commentary. Always
included in generation.

**Never put reference posts in the gold set.** Clients also supply posts by creators they
admire (`type: reference_post`). Those describe where the client wants to _get to_; the gold
set describes how the client _actually writes_. Mixing them makes the model write like the
admired creator, and the voice-match score then measures the wrong target.

Reference posts inform the voice sketch's direction only. They are never retrieved as style
examples at generation time, and never reproduced in output.

**The cold-start case.** A client with fewer than five of their own posts has no usable gold
set. Then reference posts carry the style signal, and the system is doing voice _direction_,
not voice _matching_ — say so in the UI, and treat the voice-match score as not yet
meaningful. As the operator approves posts, those approved posts become gold set material
and the client's real voice takes over. The system bootstraps.

Only two mechanical fields are stored separately, because the system validates against
them: post length preference and emoji policy.

---

## Architecture

### Client scoping

The operator owns many clients. Every piece of data belongs to exactly one client.
The active client is held in session; all screens read from it.

### Row-level security

Every table has RLS enabled with a policy restricting rows to clients owned by the
authenticated operator. A test that attempts to read another operator's data and
fails is a required test, not optional.

### Provider abstraction

One internal interface, swappable backends. Model choice is configuration, not code.

- Structured extraction (Voice Card, insights, Blueprint, pillars) → Claude
- Post drafting → both models in parallel; operator picks the better draft
- Log which draft the operator selects — that data is a result for the report

### Retrieval (RAG)

Used in exactly one place in FYP-1: **the post writer.**

- Past posts are embedded at onboarding and stored in pgvector
- At generation, include the **gold set** (always) **plus** 2–3 topic-matched by
  similarity
- Everything else in the system uses direct lookup by ID, not similarity search

### The transcript rule

**Transcript = substance. Past posts = style. Never mix them.**
Transcripts are mined for insights. They are never used as writing-style examples —
spoken language produces rambling output.

---

## Data model

Core tables (all client-scoped unless noted):

```
operators                     (not client-scoped)
clients                       operator_id
brand_kits                    client_id   1:1
voice_cards                   client_id   1:1   sketch, banned_structures, gold_set_ids
blueprints                    client_id   1:1
source_documents              client_id   type: questionnaire | past_post |
                                          reference_post | transcript
pov_items                     client_id, source_id   the Knowledge Vault
pillars                       client_id   r3_objective: Reach | Resonance | Revenue
posts                         client_id, pillar_id   content, hook, format, status, review_token
post_sources                  post_id, pov_id   link table — traceability
feedback                      post_id
embeddings                    client_id
client_users                  client_id   read-only auth user, one per client
transcripts                   client_id   source file, extracted text, processed_at
voice_scores                  post_id     per-dimension scores, composite, scoring model
```

`post_sources` is many-to-many and is what makes every post traceable back to the
interview. Do not simplify it to a single foreign key.

Post status flow:
`draft → qa → review → approved → scheduled → published`
with revision loops back from `qa` and `review`.

---

## Approval rules

The client sees a finished post and can do exactly three things: **edit the hook**, **leave
feedback**, and **approve**.

**There is no regenerate button for clients.** Two reasons, and give both if asked:

1. **Cost.** Unlimited client-triggered regeneration is unbounded API spend on an account
   we control but do not meter per client.
2. **Editorial control.** The operator is the editor. If the client can regenerate freely,
   the operator stops being the gatekeeper and the voice drifts — which is the whole thing
   the platform exists to protect.

The hook is editable because it is the highest-leverage, most subjective line in the post,
and letting the client adjust wording costs nothing. Everything else comes back to the
operator as feedback, and the operator decides whether to regenerate.

---

## Onboarding questionnaire

Based on the operator's existing client questionnaire. Four sections:

1. **Audience** — dream client, job titles, industry, company size, **who they do NOT
   want to attract**
2. **Voice & vibe** — how a close friend would describe them, 3–5 words for how they
   want to come across, communication-style checkboxes (swearing, casual, authority-led,
   funny, storytelling, emoji), words they always use, words they hate, creators they
   admire, topics that are off limits
3. **Goals** — why now, the one thing LinkedIn should do for them, what success looks
   like in 90 days, dream connections, time available per week
4. **The offer** — what they sell and to whom

Plus a required **past-posts upload** (5–10 posts).

Do **not** collect LinkedIn credentials. That belongs to a separate account-management
service and is out of scope here.

Keep the questionnaire's tone informal — "there are no wrong answers, write however you
talk." Messy honest answers produce a better voice sketch than polished ones.

---

## Prompts

Nine instruction sheets in `/prompts`, one file each, versioned in git:

`fit-scoring` · `voice-card` · `blueprint` · `interview-prep` · `pillars` ·
`insight-extraction` · `post-writer` · `hooks` · `voice-score`

Rules:

- Placeholders use `{{DOUBLE_BRACES}}`
- Every prompt returns structured output; use the API's structured-output support
  rather than parsing free text
- Validate the response shape before saving anything
- Prompt changes are commits — they are the project's intellectual property

**Examples beat rules.** When output is wrong, prefer adding a better example over
adding another instruction.

---

## Conventions

- `app/` routes, `components/` UI, `lib/` logic, `prompts/` instruction sheets
- Server-side for anything touching keys or the database
- Zod for validating both API input and model output
- Migrations as versioned SQL files in git — never schema changes via the dashboard
- Small, focused commits

Build **vertical slices** (database → API → screen, working end to end) rather than
horizontal layers. Nothing should be un-demoable for more than a few days.

---

## UI standards

The published prototype is the visual specification: sidebar with client switcher,
status pills, review page, empty states.

Required on every screen:

- **Empty states** with a next action, never a blank panel
- **Skeleton loaders** during AI generation, not spinners
- **Error states** that say what failed and what to do
- Consistent spacing, one type scale, shadcn/ui components throughout

---

## Commands

```bash
npm run dev
npm run build
npm run lint
npx supabase db push
```

---

## Working notes

- Ask before introducing a new dependency.
- Record non-obvious decisions in `DECISIONS.md` with the reasoning — needed for the
  final report.
- The project owner must be able to explain any code in a viva. Prefer clear over
  clever, and explain anything non-obvious when writing it.
