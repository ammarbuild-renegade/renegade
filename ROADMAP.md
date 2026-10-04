# Renegade — Build Roadmap (FYP-1)

_Canonical build plan. Moves into the repo at Phase 0 and is updated there.
Scope reference: `CLAUDE.md`. Portable brief: `RENEGADE-CONTEXT.md`._

Sixteen weeks, four people, one of whom has built software before. The plan is shaped
around that last fact more than anything else.

---

## Part 1 — The consistency contract

Four people editing one codebase with no shared conventions produces four codebases. These
eight mechanisms are what keep it one. **Set all of them up in Phase 0, before anyone writes
a feature.**

### 1. One repository, protected main

```
main          always deployable, protected, no direct pushes
feat/<slice>  one branch per vertical slice, short-lived
```

Every change arrives through a pull request with one approval. Branches live days, not
weeks — a branch open for three weeks is a merge conflict with a countdown timer.

### 2. Vercel preview deployments

Connect the repo to Vercel on day one. Every PR gets its own live URL automatically.

This matters more than it sounds for this team: reviewing a teammate's work becomes _clicking
a link_, not pulling a branch and running it locally. It is the single highest-leverage setup
step for people who are still learning git.

### 3. The database is the source of truth, and types are generated from it

**This is the answer to "how do we keep SQL, backend and frontend in sync."**

```
supabase/migrations/0007_add_voice_scores.sql     ← you write this
        ↓  npx supabase db push
   the dev database
        ↓  npx supabase gen types typescript
types/database.ts                                  ← generated, never hand-edited
```

Every layer imports its types from that one generated file. Change a column, regenerate, and
TypeScript immediately breaks every place that is now wrong — in the API routes, in the
components, everywhere. Nobody has to remember to update anything.

**Rules, and these are the ones most likely to be broken by accident:**

- **Never change schema in the Supabase dashboard.** Ever. It produces a database that no
  migration file describes, and the next person to run migrations silently loses your change.
- Every schema change is a numbered SQL file, committed.
- After pulling `main`: `db push`, then `gen types`. Make it a habit.
- **One person owns migrations** for the first month. Concurrent schema edits from four
  people who are new to SQL is the fastest way to a broken shared database.

### 4. Zod as the API contract

Every API route validates its input with a Zod schema, and validates the model's output
before writing anything. The schema lives next to the route and is imported by the frontend,
so the form and the endpoint cannot disagree about the shape of the data.

### 5. Prettier + ESLint, enforced on commit

Install both in Phase 0 with a pre-commit hook. This ends every formatting argument before
it starts and keeps diffs readable — a PR full of whitespace changes is a PR nobody reviews
properly.

### 6. shadcn/ui, and nobody hand-rolls a component

If a button, dialog, table or form field is needed, it comes from shadcn. No custom variants
until the thing exists in three places and visibly needs one. This is what stops four people
producing four button styles.

### 7. `CLAUDE.md` lives in the repo

All four of you will use AI assistance. Without a shared context file you get four different
architectural opinions merged into one codebase. With it, everyone's assistant gives the same
answers. Copy the existing `CLAUDE.md` in at Phase 0.

### 8. `.env.example`, committed

Real `.env` is never committed. `.env.example` lists every variable name with a dummy value,
so a teammate cloning the repo knows exactly what they need.

---

## Part 2 — Who does what

Roles, not rigid ownership. Rotate people through areas once they find their footing — but
start here, because unbounded tasks are where inexperienced people stall.

|           | Owns                                                                             | Why                                                                |
| --------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **You**   | Architecture, all prompts, AI integration, RLS policies, migrations, code review | The parts where a wrong decision is expensive to unwind            |
| **Dev B** | Forms and CRUD screens — qualifying form, onboarding, client records             | Bounded, repetitive, genuinely learnable, and there is a lot of it |
| **Dev C** | UI components, layouts, navigation, empty / loading / error states               | Visual work with fast feedback; good first area for a beginner     |
| **Dev D** | Testing, seed data, deployment checks, documentation, the report                 | Underrated — this is where the FYP marks actually come from        |

**The bottleneck is your review time, not their coding time.** Keep PRs small enough to
review in fifteen minutes. A 600-line PR from someone learning will sit unreviewed for days
and block everything behind it.

---

## Part 3 — The phases

### Phase 0 — Foundations · Weeks 1–2

**Nobody builds a feature this phase.** Skipping it feels fast and costs a month later.

**Build:**

- GitHub repo, `main` protected, PR template
- Next.js + TypeScript + Tailwind + shadcn/ui scaffold
- Supabase `dev` and `prod` projects
- Vercel connected, preview deployments confirmed working
- Prettier, ESLint, pre-commit hook
- `CLAUDE.md`, `RENEGADE-CONTEXT.md`, `ROADMAP.md`, `.env.example` committed
- `lib/ai/provider.ts` — the abstraction layer, with both providers behind it
- `/prompts` folder with the nine sheets stubbed

**Two spikes — throwaway code, deleted afterward:**

1. **The generation spike.** A single script: hardcoded voice card, hardcoded gold set,
   hardcoded insight → a generated post. No database, no UI. This proves the core value of
   the entire project in two days. If the output is bad, you find out in week 1 and have
   fifteen weeks to fix the approach — not in week 12.
2. **The Urdu spike.** Ten minutes of real code-switched Urdu/English conversation through
   Whisper. Look at the transcript quality. This decides whether bilingual AI interviews are
   realistic in FYP-2, and you want that answer before the FYP-2 scope is fixed.

**Done when:** every team member can clone, run locally, push a branch, and see their own
preview URL. All four have done it once.

---

### Phase 1 — The spine · Weeks 3–4

Everything hangs off this. Get it right and the rest is filling in.

**Build:**

- Supabase auth for operators
- `operators`, `clients` tables
- The client switcher and workspace shell
- **RLS policies on every table — written for both principals now**

**The one thing not to get wrong:** write the RLS policies for _operator_ **and** _client_
roles in this phase, even though client login UI does not arrive until Phase 5. Retrofitting
a second principal into policies across fifteen tables is genuinely miserable. Designing for
it now costs an extra hour.

**Also write the negative test now:** a test that authenticates as operator A, queries
operator B's client, and asserts it returns nothing. This is required, not optional, and it
is a good answer in the viva.

**Done when:** two operator accounts exist, each sees only their own clients, and the
isolation test passes.

---

### Phase 2 — Intake · Weeks 5–6

First real user-facing work, and the safest place for the inexperienced half of the team.

**Build:**

- `/apply` — public qualifying form, $5k filter
- Fit scoring (first real prompt in production)
- `/applications` — operator queue with accept / reject
- Acceptance email with onboarding token (Resend)
- `/onboarding/<token>` — the four-section questionnaire
- File upload → Supabase storage: past posts, reference posts, brand kit
- Past posts embedded into pgvector on upload

**Two things to be careful about:**

- **Save the application before scoring it.** Insert the row with no AI involved, then score
  it as a separate step. A lead must never be lost to an API timeout.
- **Public routes write server-side.** Both forms have no authenticated user, so their writes
  run in a route handler with the service role key — never an anonymous-insert policy on a
  public table.

**Done when:** someone can apply, be accepted, receive the email, complete onboarding, and
have their files land in storage against the right `client_id`.

---

### Phase 3 — Brand Brain · Weeks 7–9

The first heavy AI phase. Four prompts, one screen each.

**Build, in this order:**

1. Voice Card — sketch, banned structures, gold set selection
2. Personal Brand Blueprint
3. Knowledge Vault (the store; extraction comes next phase)
4. R3 Strategy Engine — pillars with grounding citations
5. Interview prep brief

**Build the operator's edit screen for each one.** These outputs are drafts for a human to
correct, not final answers. A Voice Card you cannot edit is a Voice Card you cannot fix.

**Reference posts stay separate from the gold set.** Different source type, different use.
Mixing them is a silent correctness bug that will not show up until voice scoring in Phase 6,
and by then you will not know why the numbers look wrong.

**Done when:** a real client's onboarding data produces a Voice Card the operator would
actually use, after editing.

---

### Phase 4 — The content engine · Weeks 10–12

The heart of the project, and the phase most likely to overrun. Give it the full three weeks.

**Build:**

1. Transcript file upload — `.vtt`, `.txt`, `.docx`
2. Insight extraction, triggered automatically on upload
3. POV items written to the Knowledge Vault with source traceability
4. **Retrieval** — gold set always, plus 2–3 topic-matched via pgvector
5. Post writer — dual-model, parallel, operator picks
6. Hook generation
7. `post_sources` populated on every generation

**This is where the project's actual claim lives.** Everything before it is plumbing;
everything after is workflow. If the schedule slips, protect this phase and cut elsewhere.

**Log which draft the operator picks.** It costs one column and it is a measured result for
the final report.

**Done when:** a transcript goes in one end and a post the operator would send to a client
comes out the other.

---

### Phase 5 — The review loop · Weeks 13–14

**Build:**

- Four-stage status flow with revision loops
- `/review/<token>` — public, one post, editable hook, feedback box, approve
- Client login and read-only content library
- Client-facing RLS activated (policies already written in Phase 1)
- Export

**No regenerate button for clients.** Cost, and editorial control.

**Done when:** a client can log in, see their library, open a post, edit the hook, approve it,
and never see a draft.

---

### Phase 6 — Voice scoring and evaluation · Week 15

**Build:**

- Deterministic checks: banned-structure violations, length, emoji policy, sentence-length
  distribution vs gold set, characteristic vocabulary
- One cross-model LLM rubric judgment
- Composite score with a visible per-dimension breakdown

**Then run the evaluation study**, which is not code:

- **Blind test** — a panel sees five real posts and five generated; can they beat chance?
- **Operator acceptance rate** — fraction shipped without edits
- **Edit distance** — how much changes before approval

**This is your results chapter.** Budget real time for it. A project with measured results
defends itself; a project with a demo does not.

---

### Phase 7 — Demo and report · Week 16

- Empty states, skeleton loaders, error states on every screen
- Seed a complete demo client with real-looking data, end to end
- Rehearse the demo on the deployed URL, not localhost
- Screenshots and diagrams for the report
- Update `CLAUDE.md`, `ROADMAP.md` and the diagrams to match what was actually built

**Never demo from localhost.** Deploy, then demo the deployment.

---

## Part 4 — Definition of done

A slice is done when **all** of these are true. Not four of five.

- [ ] Migration committed, types regenerated
- [ ] RLS policy written and the negative test passes
- [ ] API route validates input and model output with Zod
- [ ] Screen has empty, loading and error states
- [ ] Works on the Vercel preview URL, not just locally
- [ ] PR reviewed and approved
- [ ] Non-obvious decisions recorded in `DECISIONS.md`

---

## Part 5 — What we are not doing

Reread this when someone suggests a shortcut.

- No schema changes through the Supabase dashboard
- No direct pushes to `main`
- No hand-edited `types/database.ts`
- No prompts inlined in code — they live in `/prompts`, versioned
- No model SDK called directly from a route or component — always through the provider layer
- No FYP-2 features during FYP-1, however tempting
- No demoing from localhost

---

## Part 6 — Risks, and what to do about them

| Risk                                 | Mitigation                                                           |
| ------------------------------------ | -------------------------------------------------------------------- |
| Post writer output is poor           | The Phase 0 spike surfaces this in week 1, not week 12               |
| Schema drift across four people      | One migration owner, generated types, no dashboard edits             |
| Review bottleneck on one person      | Small PRs; preview URLs make review fast                             |
| Inexperienced devs stall silently    | Bounded tasks, daily check-in, pair on the first slice of each phase |
| Phase 4 overruns                     | Protect it; cut from Phase 7 polish instead                          |
| Nothing to show at the FYP-1 defence | Vertical slices mean something is always demoable                    |
