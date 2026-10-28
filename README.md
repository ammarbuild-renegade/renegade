# Renegade

An operator-led platform for building founder personal brands on LinkedIn.

A branding specialist (the **operator**) manages several client workspaces, interviews each
client personally, and the system turns those interviews into voice-matched LinkedIn posts.

**The core claim: the AI amplifies a human conversation, it never replaces it.** Every post is
built from material the client actually said, and passes two human checkpoints before
publishing.

> Final year project, BS Computer Science. Built across two semesters (FYP-1 and FYP-2).

---

## How it works

```
Qualification → Onboarding → Interview → Insight extraction → Post writing → Approval
```

1. **Qualification** — a revenue and fit filter, so the operator only onboards clients the
   service can actually serve.
2. **Onboarding** — a questionnaire, 5–10 of the client's own past posts, and a brand kit.
3. **Voice Card** — a 200–300 word prose voice sketch, a list of banned sentence _structures_
   (not just banned words), and a gold set of the client's real posts.
4. **Interview** — the operator interviews the client. The transcript is uploaded as a text
   file and processed automatically.
5. **Knowledge Vault** — insights extracted from the transcript, each one traceable.
6. **R3 Strategy Engine** — content pillars, each with a Reach, Resonance or Revenue
   objective. The pillar is chosen _before_ writing, never classified after.
7. **Post writer** — retrieval-augmented: the gold set is always included, plus 2–3
   topic-matched past posts found by vector similarity.
8. **Approval** — the client can edit the hook, leave feedback, and approve.

### Two rules that shape the whole design

**Transcript = substance. Past posts = style. Never mixed.** Transcripts are mined for what
the client thinks; they are never used as writing-style examples, because spoken language
produces rambling output.

**Reference posts never enter the gold set.** Clients also supply posts by creators they
admire. Those describe where the client wants to get to; the gold set describes how the client
actually writes. Mixing them makes the model write like the admired creator — and the
voice-match score then measures the wrong target.

---

## Stack

| Layer                     | Choice                                                        |
| ------------------------- | ------------------------------------------------------------- |
| App                       | Next.js 16 (App Router), TypeScript                           |
| Styling                   | Tailwind CSS + shadcn/ui                                      |
| Database / auth / storage | Supabase (PostgreSQL)                                         |
| Vector search             | pgvector                                                      |
| Text generation           | Anthropic Claude + OpenAI, both behind one provider interface |
| Embeddings                | OpenAI embeddings                                             |
| Hosting                   | Vercel                                                        |

Model choice is configuration, not code — see `lib/ai/provider.ts` and `.env.example`.

---

## Status

FYP-1 is in progress. What exists in this repository today:

- [x] Provider abstraction over Claude and OpenAI, with reasoning-effort control
- [x] Nine versioned prompt files in `prompts/`
- [x] First migration — operators table with row-level security
- [x] Generation spike (`scripts/spike-generate.ts`) proving the end-to-end writing path
- [x] Phase 0 and Phase 1 build guides in `docs/`
- [ ] Multi-client workspace and client switcher
- [ ] Onboarding, Voice Card, Knowledge Vault
- [ ] Post writer with retrieval
- [ ] Approval workflow
- [ ] Voice-match scoring

Publishing to LinkedIn, meeting integration, scheduling and the visual generator are FYP-2.

---

## Running it locally

Requires Node 24 or newer.

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

`.env.example` lists every variable and where to find it. Supabase gives you the project URL
and both keys; the AI keys come from the Anthropic and OpenAI consoles. **Never commit
`.env.local`** — it is ignored, and secret-scanning push protection is enabled on this
repository as a second line of defence.

Full setup, including the Supabase project and database migrations, is in
[`docs/PHASE-0-SETUP.md`](docs/PHASE-0-SETUP.md).

```bash
npm run dev      # development server
npm run build    # production build — run before opening a pull request
npm run lint
```

---

## Repository layout

```
app/           routes (App Router)
components/    UI components
lib/           logic — lib/ai/provider.ts is the only place models are called
prompts/       instruction sheets, one file each, versioned
supabase/      migrations as numbered SQL files
scripts/       spikes and manual test scripts
docs/          build guides
```

Architectural decisions and their reasoning are recorded in
[`DECISIONS.md`](DECISIONS.md) — kept as we go, because the final report needs them.

## Contributing

Team members: branch off `main`, open a pull request, and run `npm run build` before you do.
`main` is protected — no direct pushes.

Four rules that are not preferences:

1. Every table carries `client_id`. No query runs without client scoping.
2. Row-level security is enabled on every table. Application-level filtering is not enough on
   its own — the database must enforce isolation independently.
3. All model calls go through `lib/ai/provider.ts`. Never import the Anthropic or OpenAI SDK
   into a route handler or component.
4. Prompts live in `prompts/` as files. Never inline a prompt in code.

---

## Licence

No open-source licence is granted. This is academic coursework submitted for assessment, and
all rights are reserved by the authors. The repository is public so that deployment previews
and continuous integration work on free tooling — it is not an invitation to reuse the code.
