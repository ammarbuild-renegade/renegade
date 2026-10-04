# Renegade — Phase 0 Setup Guide

How to get the foundation running from nothing, on a fresh Windows machine. Do the sections in
order: each one depends on the one before it.

| Part            | What it is                                             | Where it lives              |
| --------------- | ------------------------------------------------------ | --------------------------- |
| GitHub          | the repository — the single source of truth for code   | `github.com/<org>/renegade` |
| Next.js app     | the whole product — screens and API in one project     | `localhost:3000`            |
| Supabase        | database, login system, file storage, vector search    | `supabase.com/dashboard`    |
| Vercel          | hosting, and a live preview URL for every pull request | `vercel.com/dashboard`      |
| Claude + OpenAI | the two AI providers, behind one abstraction layer     | API only                    |

**Sections 1, 2, 12 and 13 cannot be scripted** — they are account settings and per-machine
installs you do by hand, once.

**Nobody builds a feature until section 15 passes.** That is the whole point of Phase 0.

---

## 0. Before you start

Decide two things now, because changing them later is painful:

1. **Who is the "lead"** — one person who owns accounts, migrations and code review. Most
   sections below are done by that person alone.
2. **The repo name.** This guide assumes `renegade`. If you pick something else, substitute it
   everywhere.

You need roughly **$25** to start: $20 of Anthropic credit and $5 of OpenAI. Everything else is
on free tiers that are genuinely sufficient for FYP-1.

---

## 1. Create the accounts

**Why:** every later section needs a key from one of these. Getting them all now means you never
stop halfway through a setup step to go and sign up for something.

Use **one email address** for all six, so ownership stays in one place and nobody is locked out
when a teammate goes on holiday.

### 1.1 GitHub

1. Sign up at <https://github.com> if you do not have an account.
2. Click **+** (top right) → **New repository**.
3. Name: `renegade`. Visibility: **Private**.
4. **Do not** tick "Add a README", "Add .gitignore" or "Choose a license" — we push an existing
   project into it in section 4, and those files would cause a conflict.
5. Click **Create repository**. Leave the page open; you need the URL in section 4.
6. **Settings** (repo tab, not your profile) → **Collaborators** → **Add people** → add your three
   teammates. They each get an email invite they must accept.

### 1.2 Supabase

1. Sign up at <https://supabase.com> with GitHub (simplest — it links the accounts).
2. Create **two** projects, not one:
   - `renegade-dev` — everyone points at this while building
   - `renegade-prod` — untouched until the final demo
3. For each, set a database password. **Write both down.** Supabase shows the password once and
   you cannot recover it, only reset it.
4. Choose the region closest to you (Singapore or Mumbai from Pakistan).
5. Wait for provisioning — about two minutes per project.

> Two projects exist so a broken migration during development can never touch the database you
> demo from. It costs nothing on the free tier.

**Find your project ref** — you need it in section 8. Look at the dashboard URL:

```
https://supabase.com/dashboard/project/abcdefghijklmnop
                                       ^^^^^^^^^^^^^^^^ this is the project ref
```

**Find your keys:** with `renegade-dev` open, go to **Project Settings** (gear icon, bottom of
the left sidebar) → **API**. You need three values:

| Label on the page       | Goes into                       |
| ----------------------- | ------------------------------- |
| Project URL             | `NEXT_PUBLIC_SUPABASE_URL`      |
| `anon` `public`         | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY`     |

_(Supabase occasionally renames this page — if you do not see "API", look for **API Keys** or
**Data API** in the same settings menu. The three values are always together.)_

> **The `service_role` key bypasses every security rule in the database.** It is not a
> "more powerful login" — it is a master key. It only ever appears in server-side code. If it
> ever reaches a browser, anyone can read every client's data.

### 1.3 Vercel

1. Sign up at <https://vercel.com> **with GitHub**. This matters — it is what lets Vercel see
   your repository later without extra configuration.
2. Do not import a project yet. We do that in section 12, after there is something to import.

### 1.4 Anthropic

1. Sign up at <https://console.anthropic.com>.
2. **Settings → Billing** → add $20 of credit. Without credit, every API call fails with a
   confusing error about your account rather than a clear "no money" message.
3. **Settings → API Keys** → **Create Key**. Name it `renegade-dev`.
4. Copy it **now** — the key is shown once and never again.

### 1.5 OpenAI

1. Sign up at <https://platform.openai.com>.
2. **Settings → Billing** → add $5.
3. **API keys** (left sidebar) → **Create new secret key**. Name it `renegade-dev`.
4. Copy it now. Same rule — shown once.

> We need OpenAI even though Claude is the main model, because **embeddings** come from OpenAI
> and embeddings are what make the retrieval step work.

### 1.6 Resend

1. Sign up at <https://resend.com>.
2. **API Keys** → **Create API Key**. Permission: **Sending access** is enough.
3. Copy it.

> Not needed until Phase 2, but collect it now while you are in account-creation mode. The free
> tier sends 100 emails a day, which is far more than an FYP needs.

### Verify section 1

You should now have six things written down somewhere private:

- [ ] GitHub repo URL
- [ ] Supabase dev project ref + three keys
- [ ] Supabase database passwords (both projects)
- [ ] Anthropic API key
- [ ] OpenAI API key
- [ ] Resend API key

**Keep them in a password manager or a private note.** Not in WhatsApp, not in a shared Google
Doc, never in the repository. A key committed to git is public permanently — deleting it in a
later commit does not remove it from history. If that happens, revoke the key immediately in the
provider's dashboard and issue a new one.

---

## 2. Install the local tools

**Why:** all four of you need identical versions. Different Node versions produce bugs that appear
on exactly one person's laptop and take a day to diagnose.

**Everyone does this section, on their own machine.**

### 2.1 Node.js 24 LTS

1. Go to <https://nodejs.org> and download the **LTS** installer — it should say 24.x.
2. Run it, accept every default, including "Automatically install the necessary tools" if offered.
3. **Close every open terminal window and open a new one.** The installer changes your PATH, and
   existing terminals keep the old one.

```bash
node --version    # must print v24.x.x
npm --version     # v11.x, ships with Node 24
```

> **Why 24 and not something older:** Node 20 reached end of life on 24 April 2026 — it no
> longer gets security patches. Node 24 is the current Active LTS, supported until April 2028.
> Node 22 still gets security fixes until April 2027 and will work, but put everyone on 24 so
> there is one version to reason about.
>
> If `node --version` prints v18 or v20, upgrade. Installing Node 24 over an older version
> replaces it — you do not need to uninstall first.

### 2.2 Git

1. Download from <https://git-scm.com/download/win> and install with the defaults.
2. Set your identity — these appear on every commit you make:

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

3. Use the same email as your GitHub account, otherwise your commits will not be linked to your
   profile — which matters when the jury asks who wrote what.

```bash
git --version     # any 2.4x is fine
```

### 2.3 VS Code

1. Install from <https://code.visualstudio.com>.
2. Install these three extensions (Ctrl+Shift+X, search by name):
   - **Prettier - Code formatter**
   - **ESLint**
   - **Tailwind CSS IntelliSense**
3. Turn on format-on-save: Ctrl+Shift+P → type `Preferences: Open User Settings (JSON)` → add:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### Verify section 2

All four people run `node --version` and read the result out loud. Same major version, or fix it
now.

---

## 3. Create the project

**Why:** this generates the Next.js skeleton — folder structure, TypeScript config, Tailwind, and
a working dev server. Doing it by hand takes an hour and gets it subtly wrong.

**Lead only.** Everyone else clones in section 14.

Open a terminal in the folder where you keep projects, then:

```bash
npx create-next-app@latest renegade --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

It will ask one or two questions interactively depending on version. Answer:

| Question                                        | Answer                                  |
| ----------------------------------------------- | --------------------------------------- |
| Would you like to use Turbopack for `next dev`? | **Yes**                                 |
| Would you like to customize the import alias?   | **No** (we already passed it as a flag) |

```bash
cd renegade
npm run dev
```

Open <http://localhost:3000>. You should see the Next.js welcome page. Press **Ctrl+C** in the
terminal to stop it.

> **Why `--no-src-dir`:** our conventions in `CLAUDE.md` put `app/`, `components/`, `lib/` and
> `prompts/` at the top level. Adding a `src/` wrapper would make every path in our documentation
> wrong. This is the one flag most likely to be mis-clicked.

> To avoid the interactive prompt entirely, add `--turbopack` to the command above. The answer is
> yes either way.

### What it actually installs — verified 2026-10-04

```
next       16.3.8      React 19.2.8, Tailwind 4, ESLint 9
```

**This is Next.js 16, not 15.** Three consequences, and all three catch people out:

**1. `create-next-app` now writes its own `CLAUDE.md` and `AGENTS.md`.** The generated
`CLAUDE.md` is a single line, `@AGENTS.md`, which imports the other file. `AGENTS.md` carries a
warning worth reading:

> _"This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and
> file structure may all differ from your training data. Read the relevant guide in
> `node_modules/next/dist/docs/` before writing any code."_

Take that literally. Any Next.js pattern an AI assistant produces from memory may be a Next 15
pattern. From Phase 1 onward, check `node_modules/next/dist/docs/` before trusting a generated
route handler, layout or data-fetching call. See section 11 for how our `CLAUDE.md` and this one
coexist.

**2. `AGENTS.md` regenerates on every `next dev`.** Deleting it only brings it back as an
uncommitted change. Commit it and leave it alone.

**3. Git is already initialised.** `create-next-app` runs `git init` and makes a commit called
_"Initial commit from Create Next App"_. Section 4 accounts for this — do not run `git init` again.

### The npm audit warnings are expected

The install reports **5 high severity vulnerabilities**. Before anyone panics or runs the
suggested fix:

```
braces → micromatch → fast-glob → @next/eslint-plugin-next → eslint-config-next
```

Every one of them is in the **ESLint dev-dependency chain**. It is a denial-of-service bug in
glob pattern matching, reachable only while linting. None of it ships to users.

> **Do not run `npm audit fix --force`.** It would downgrade `eslint-config-next` to 14.2.35,
> which is incompatible with Next 16 and would break linting entirely. Leave it, and record the
> reasoning in `DECISIONS.md` so nobody re-opens the question in month three.

### 3.1 Pin the Node version

So nobody drifts onto a different version later.

Create a file named `.nvmrc` in the project root containing exactly one line:

```
24
```

Then open `package.json` and add an `engines` block after the `private` line:

```json
"engines": {
  "node": ">=24 <25"
}
```

While you are in there, bump the Node type definitions to match the runtime you just pinned —
`create-next-app` still ships `^20`:

```json
"@types/node": "^24"
```

Then `npm install` once to pick it up.

### Verify section 3

```bash
npm run dev
```

Welcome page loads at localhost:3000, no errors in the terminal.

---

## 4. Push it to GitHub

**Why:** until this exists on GitHub, nobody else can work and nothing can deploy.

`create-next-app` has already run `git init` and made the first commit, so **do not run
`git init`** — it is not harmful, but it is not what you want either. Commit your section 3
changes, then push:

```bash
git add .
git commit -m "pin node 24, bump node types"
git branch -M main
git remote add origin https://github.com/<your-org>/renegade.git
git push -u origin main
```

Replace `<your-org>` with your GitHub username or organisation name — the URL from section 1.1.

**If it asks for a password:** GitHub stopped accepting passwords over HTTPS. Either install
[GitHub CLI](https://cli.github.com) and run `gh auth login`, or create a Personal Access Token
(GitHub → your profile → **Settings** → **Developer settings** → **Personal access tokens** →
**Tokens (classic)** → **Generate new token**, tick `repo`) and paste that as the password.

### Verify section 4

Refresh the GitHub repo page. You should see `app/`, `package.json`, `next.config.ts`. Ask a
teammate to open the URL and confirm they can see it too.

---

## 5. Formatting and linting

**Why:** with four people and no formatter, every pull request is half real changes and half
whitespace, and reviews stop being useful. Setting this up **before** anyone writes code matters —
adding a formatter later reformats every file at once, producing one enormous unreviewable commit.

```bash
npm install -D prettier prettier-plugin-tailwindcss husky lint-staged
```

### 5.1 Prettier config

Create `.prettierrc` in the project root:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

Create `.prettierignore`:

```
.next
node_modules
types/database.ts
package-lock.json
```

> `types/database.ts` is ignored because it is machine-generated — reformatting it would create a
> diff every time anyone regenerates it.

### 5.2 Run it on the existing code

```bash
npx prettier --write .
```

This reformats the scaffold. Do it now, as its own commit, so it never mixes with real work.

### 5.3 Format on commit

```bash
npx husky init
```

That creates `.husky/pre-commit` containing `npm test`. Replace its contents with exactly:

```
npx lint-staged
```

Then add to `package.json`, at the top level next to `"scripts"`:

```json
"lint-staged": {
  "*.{ts,tsx,css,md,json}": "prettier --write",
  "*.{ts,tsx}": "eslint --fix"
}
```

### Verify section 5

Deliberately break formatting in a file — add random spaces, change quotes to double — then:

```bash
git add .
git commit -m "test formatting hook"
```

Open the file again. The formatting should be **fixed automatically**. If nothing happened, check
that `.husky/pre-commit` contains `npx lint-staged` and nothing else.

---

## 6. Install the UI components

**Why:** shadcn/ui gives us accessible, consistent components we own the code for. It is the
mechanism that stops four people writing four different button styles.

```bash
npx shadcn@latest init
```

Answer:

| Question                                         | Answer       |
| ------------------------------------------------ | ------------ |
| Which style would you like to use?               | **New York** |
| Which color would you like to use as base color? | **Slate**    |
| Would you like to use CSS variables for colors?  | **Yes**      |

Then install the components we already know we need:

```bash
npx shadcn@latest add button input textarea label card dialog select table badge sonner skeleton
```

### Verify section 6

```bash
ls components/ui
```

You should see `button.tsx`, `card.tsx`, `dialog.tsx` and the rest.

---

## 7. Environment variables

**Why:** keys must never be in code. Next.js reads them from `.env.local`, which git ignores.
`.env.example` is the committed template that tells a teammate what they need.

### 7.1 The committed template

Create `.env.example` in the project root:

```bash
# ---- Supabase (Project Settings -> API) ----
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ---- AI providers ----
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# ---- Model ids. Change here, never in code ----
CLAUDE_MODEL=claude-sonnet-5
OPENAI_MODEL=gpt-4o

# ---- Email (needed from Phase 2) ----
RESEND_API_KEY=
```

### 7.2 Your real values

```bash
cp .env.example .env.local
```

Open `.env.local` and paste the real values from section 1. No quotes, no spaces around the `=`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxx
```

### 7.3 Confirm git is ignoring it

```bash
git status
```

**`.env.local` must not appear in the list.** If it does, open `.gitignore` and confirm it
contains `.env*.local`. Do not continue until `git status` ignores it.

> **Verify the OpenAI model id** against <https://platform.openai.com/docs/models> before you rely
> on it. Model names change, and a wrong one fails only at runtime with an unhelpful error. Both
> ids sit in environment variables precisely so this is a one-line fix and not a code change.

> **Anything named `NEXT_PUBLIC_*` is sent to the browser.** That is correct for the Supabase URL
> and anon key — they are designed to be public, and row-level security is what protects the data.
> It is catastrophic for `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`.
> Never add the prefix to those three.

---

## 8. Supabase: connect and run the first migration

**Why:** this is the most important section in Phase 0. You are setting up the loop that keeps
SQL, backend and frontend in sync for the rest of the project. Run it once here and it works every
time after.

```bash
npm install @supabase/supabase-js
npm install -D supabase
```

### 8.1 Link the CLI to your dev project

```bash
npx supabase init
```

Answer **No** to "Generate VS Code settings for Deno?" — we are not using Deno edge functions.

```bash
npx supabase login
```

This opens a browser to authorise. Come back to the terminal when it says success.

```bash
npx supabase link --project-ref <your-dev-project-ref>
```

Use the ref from the dashboard URL (section 1.2). It will ask for the **database password** —
that is the one you wrote down when creating the project, not your Supabase account password.

### 8.2 Write the first migration

Create `supabase/migrations/0001_operators.sql`:

```sql
-- Operators are the branding specialists who use the platform.
-- One row per operator, keyed to Supabase's built-in auth user.

create table operators (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  created_at  timestamptz not null default now()
);

alter table operators enable row level security;

create policy "operators read own row"
  on operators for select
  using ( auth.uid() = id );

create policy "operators update own row"
  on operators for update
  using ( auth.uid() = id );
```

> This one table exists to prove the pipeline works. Phase 1 builds `clients` and everything else
> on top of it. **Note that RLS is enabled in the same migration that creates the table** — that
> is the habit to build. A table created without RLS is readable by anyone with the anon key.

### 8.3 Push it and generate types

```bash
npx supabase db push
```

It shows you the migration and asks for confirmation. Type `Y`.

```bash
npx supabase gen types typescript --linked > types/database.ts
```

### Verify section 8

**In the Supabase dashboard:** open `renegade-dev` → **Table Editor**. You should see `operators`.
Click it, then look for the **RLS enabled** badge — if it says "RLS disabled" something went
wrong, re-run the migration.

**In your editor:** open `types/database.ts` and search for `operators`. You should find a
generated type with `id`, `email`, `full_name`, `created_at`.

**Then read this:**

> You have just run the loop that keeps everything in sync:
>
> ```
> write a .sql file  →  supabase db push  →  supabase gen types  →  types/database.ts
> ```
>
> Every part of the app imports its types from that generated file. Change a column, regenerate,
> and TypeScript immediately flags every place that is now wrong — before anyone runs the app.
>
> **Never edit `types/database.ts` by hand.** If it looks wrong, fix the database and regenerate.
>
> **Never change the schema in the Supabase dashboard.** A change made there exists in no
> migration file, so it is invisible to your teammates, and the next `db push` can silently wipe
> it. Every schema change is a numbered `.sql` file, committed to git. No exceptions.

---

## 9. The AI provider layer

**Why:** every model call in the project goes through this one file, so switching models later is
a configuration change instead of a rewrite. It also gives us cross-model scoring — one model
writes, the other grades — which is a much stronger check than a model marking its own homework.

```bash
npm install @anthropic-ai/sdk openai zod
npm install -D tsx
```

### 9.1 The file

Create `lib/ai/provider.ts`:

````typescript
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import type { ZodSchema } from 'zod'

export type Provider = 'claude' | 'openai'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const MODELS: Record<Provider, string> = {
  claude: process.env.CLAUDE_MODEL ?? 'claude-sonnet-5',
  openai: process.env.OPENAI_MODEL ?? 'gpt-4o',
}

export interface GenerateOptions {
  system: string
  prompt: string
  maxTokens?: number
  temperature?: number
}

export interface GenerateResult {
  text: string
  provider: Provider
  model: string
  inputTokens: number
  outputTokens: number
}

/** Plain text generation. Everything in the app calls this, never an SDK directly. */
export async function generate(provider: Provider, opts: GenerateOptions): Promise<GenerateResult> {
  const model = MODELS[provider]
  const maxTokens = opts.maxTokens ?? 2048
  const temperature = opts.temperature ?? 1

  if (provider === 'claude') {
    const r = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: opts.system,
      messages: [{ role: 'user', content: opts.prompt }],
    })

    const text = r.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { text: string }).text)
      .join('')

    return {
      text,
      provider,
      model,
      inputTokens: r.usage.input_tokens,
      outputTokens: r.usage.output_tokens,
    }
  }

  const r = await openai.chat.completions.create({
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [
      { role: 'system', content: opts.system },
      { role: 'user', content: opts.prompt },
    ],
  })

  return {
    text: r.choices[0]?.message?.content ?? '',
    provider,
    model,
    inputTokens: r.usage?.prompt_tokens ?? 0,
    outputTokens: r.usage?.completion_tokens ?? 0,
  }
}

/**
 * Generate JSON and validate it against a Zod schema.
 * Throws if the model returns a shape we did not ask for, so nothing
 * malformed can ever reach the database.
 */
export async function generateStructured<T>(
  provider: Provider,
  opts: GenerateOptions,
  schema: ZodSchema<T>
): Promise<{ data: T; meta: GenerateResult }> {
  const meta = await generate(provider, {
    ...opts,
    system: opts.system + '\n\nRespond with valid JSON only. No markdown code fences.',
  })

  let parsed: unknown
  try {
    parsed = JSON.parse(meta.text.trim().replace(/^```json\s*|\s*```$/g, ''))
  } catch {
    throw new Error(`${provider} returned invalid JSON: ${meta.text.slice(0, 200)}`)
  }

  return { data: schema.parse(parsed), meta }
}
````

> **Why token counts come back on every call:** logging them gives you real cost figures for the
> final report, and tells you which prompt is expensive when the bill looks wrong. It costs one
> extra column in the database and answers a question you will definitely be asked.

### 9.2 Test it

Create `scripts/test-provider.ts`:

```typescript
import { generate } from '../lib/ai/provider'

async function main() {
  for (const provider of ['claude', 'openai'] as const) {
    const t0 = Date.now()
    try {
      const r = await generate(provider, {
        system: 'You are terse. Answer in one short sentence.',
        prompt: 'What is retrieval-augmented generation?',
        maxTokens: 100,
      })
      console.log(`\n--- ${provider} (${r.model}) ${Date.now() - t0}ms ---`)
      console.log(r.text.trim())
      console.log(`tokens: ${r.inputTokens} in / ${r.outputTokens} out`)
    } catch (e) {
      console.error(`\n--- ${provider} FAILED ---`)
      console.error(e instanceof Error ? e.message : e)
    }
  }
}

main()
```

Run it:

```bash
npx tsx --env-file=.env.local scripts/test-provider.ts
```

### Verify section 9

You should get **two** answers, one per provider, each with a token count. Both must work — if
only one does, fix the other now. Finding a bad key here is far easier than finding it inside a
half-built feature.

| Error                                     | Meaning                                                               |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `401` / `invalid x-api-key`               | Wrong or mistyped key in `.env.local`                                 |
| `credit balance is too low`               | Add credit in the provider's billing page                             |
| `model: ... does not exist`               | Wrong model id — check the provider's model list and fix `.env.local` |
| `Cannot find module '../lib/ai/provider'` | You are not running from the project root                             |

---

## 10. The prompts folder

**Why:** prompts are the actual intellectual property of this project. They belong in version
control where changes are tracked and reviewable — not buried inside a TypeScript file where
nobody can find them.

```bash
mkdir prompts
```

Create nine files in it. They stay mostly empty until their phase:

```
fit-scoring.md        voice-card.md         blueprint.md
interview-prep.md     pillars.md            insight-extraction.md
post-writer.md        hooks.md              voice-score.md
```

Give every one this header, so the format is consistent from the start:

```markdown
# <prompt name>

**Inputs:** {{PLACEHOLDER_ONE}}, {{PLACEHOLDER_TWO}}
**Returns:** <the JSON shape this must produce>
**Model:** claude | openai
**Used by:** <which feature calls this>

---

<the instruction text goes here>
```

Placeholders always use `{{DOUBLE_BRACES}}` so they are easy to find and replace.

---

## 11. Project documents

**Why:** all four of you will use AI assistance while building. Without a shared context file in
the repo, you get four different architectural opinions merged into one codebase.

**First, deal with the `CLAUDE.md` collision.** `create-next-app` already put a one-line
`CLAUDE.md` in the repo root containing `@AGENTS.md`. Do not simply overwrite it — that import
is what loads Next.js 16's breaking-changes warning. Put our content **after** that line:

```markdown
@AGENTS.md

# Renegade

...the rest of our CLAUDE.md...
```

Both then load: Next's version warning, and our scope and rules.

Then copy these into the repo root from `renegade-setup/`:

| File                    | What it does                                                            |
| ----------------------- | ----------------------------------------------------------------------- |
| `CLAUDE.md`             | Scope, hard rules, design decisions. Read automatically by Claude Code. |
| `RENEGADE-CONTEXT.md`   | Self-contained brief, portable to ChatGPT or any other tool             |
| `ROADMAP.md`            | The sixteen-week plan                                                   |
| `docs/PHASE-0-SETUP.md` | This guide                                                              |

Create one more, empty, in the root — `DECISIONS.md`:

```markdown
# Decisions

Every non-obvious choice, with the reasoning and the date.

## 2026-09-22 — Retrieval instead of fine-tuning

Fine-tuning needs thousands of examples per client; we have 20-30 posts.
Retrieval updates instantly when new interview material arrives.
```

> `DECISIONS.md` feels pointless in week 2 and is invaluable in week 16, when you are writing the
> report and cannot remember why you chose something back in March.

Commit everything:

```bash
git add .
git commit -m "phase 0: config, provider layer, prompts, docs"
git push
```

---

## 12. Deploy to Vercel

**Why:** this gives every pull request its own live URL. For a team where three people are new to
git, reviewing a teammate's work becomes clicking a link instead of pulling a branch and running
it locally. It is the highest-leverage thing in this whole guide.

1. Go to <https://vercel.com/new>.
2. Find `renegade` in the list and click **Import**. _(If the repo is not listed, click
   **Adjust GitHub App Permissions** and grant Vercel access to it.)_
3. **Framework Preset** should auto-detect as **Next.js**. Leave the build settings alone.
4. Expand **Environment Variables** and add every variable from `.env.local`, one at a time. This
   is tedious and there is no bulk paste in some versions — do it carefully.
5. For each one, make sure **all three** environments are ticked: **Production**, **Preview**,
   **Development**.
6. Click **Deploy** and wait two to three minutes.

### Verify section 12

Open the deployment URL Vercel gives you. You should see the same Next.js welcome page you saw on
localhost.

> **A missing environment variable is the most common cause of "it works locally but the
> deployment is broken."** If a build fails, open the deployment → **Building** logs and read the
> actual error before changing anything.

---

## 13. Protect `main`

**Why:** `main` must always be deployable. If someone pushes broken code directly to it, everyone
is blocked and the preview deployments stop being trustworthy.

1. GitHub repo → **Settings** → **Branches** (left sidebar).
2. Click **Add branch protection rule**. _(Newer GitHub accounts show **Rules → Rulesets →
   New ruleset** instead. The options below have the same names in both.)_
3. **Branch name pattern:** `main`
4. Tick:
   - **Require a pull request before merging**
   - **Require approvals** → set to **1**
   - **Do not allow bypassing the above settings**
5. **Create** / **Save changes**.

### 13.1 Pull request template

Create `.github/pull_request_template.md`:

```markdown
## What this changes

## How to test it

## Checklist

- [ ] Migration committed, types regenerated
- [ ] RLS policy written, negative test passes
- [ ] Input and model output validated with Zod
- [ ] Empty, loading and error states present
- [ ] Works on the preview URL
```

This appears automatically in every new PR, so the checklist is never forgotten.

### Verify section 13

Create a throwaway branch, push it, open a PR:

```bash
git checkout -b test/protection
echo "test" >> README.md
git add . && git commit -m "test branch protection"
git push -u origin test/protection
```

On the PR page, confirm **both**:

- A **Vercel preview URL** appears as a comment or check — open it and confirm it loads
- The **Merge** button is disabled, saying a review is required

Then close the PR and delete the branch. Protection works.

---

## 14. Everyone clones and ships one change

**Why:** this catches "works on my machine" while it still costs an hour. It also means all four
people have done the full loop once before any real work depends on them knowing it.

**All four people, on their own machine.**

```bash
git clone https://github.com/<org>/renegade.git
cd renegade
npm install
cp .env.example .env.local
```

Open `.env.local` and paste the real values — the lead shares them privately, not in a group chat.

```bash
npm run dev
```

Confirm localhost:3000 loads. Then each person, individually:

```bash
git checkout -b feat/<yourname>-hello
```

Make a small visible change to `app/page.tsx` — add your name somewhere on the page.

```bash
git add .
git commit -m "hello from <yourname>"
git push -u origin feat/<yourname>-hello
```

Open a pull request on GitHub. Wait for the preview URL, open it, and confirm **your change is
visible on that URL**. Get a teammate to approve, merge, then:

```bash
git checkout main
git pull
git branch -d feat/<yourname>-hello
```

### Verify section 14

**Four merged pull requests.** Four people who have each seen: branch → commit → push → PR →
preview URL → review → merge → clean up.

**Phase 0 is not complete until this is true for all four people.**

---

## 15. The two spikes

**Why:** these answer two questions while there is still time to act on the answers. Both are
throwaway code — write them, learn from them, delete them.

### 15.1 Spike A — does the generation approach actually work?

Create `scripts/spike-generate.ts`. Hardcode everything; no database, no UI:

- A **voice sketch**: 200–300 words describing how a specific real person writes. Pick someone
  whose writing you know well.
- **Three banned structures**, e.g. no "Not X, but Y" construction; no "N lessons I learned"
  listicles; no rhetorical question as an opening line.
- **Three real posts** by that person, pasted raw with no commentary.
- **Two insights**, written as if pulled from an interview transcript.

Assemble them into one prompt and call `generate()` with both providers. Print both drafts.

```bash
npx tsx --env-file=.env.local scripts/spike-generate.ts
```

> **The success criterion is not "it produced text."**
>
> It is: **would the operator actually send this to a client?**
>
> Answer honestly, and write the answer in `DECISIONS.md` with the date. If it is no, you have
> fifteen weeks to change the approach — which is exactly why this runs in week 1 and not week 12.
>
> If the output is weak, the fix is almost always **the voice sketch or the gold set**, not the
> model. Write a sharper, more specific sketch and try again before reaching for a bigger model.

### 15.2 Spike B — is Urdu transcription good enough?

1. Record **ten minutes** of genuine code-switched Urdu/English business conversation — two people
   talking normally, not reading Urdu aloud. Code-switching is the realistic case and the hard one.
2. Run it through Whisper (OpenAI's API, or a local install).
3. Read the transcript and judge one thing: **are the facts recoverable?** Names, numbers, the
   point being made.

You do not need a perfect transcript — insight extraction only needs substance, not grammar. But
if names and figures come out wrong, bilingual AI interviews are not realistic, and you want that
settled **before FYP-2 scope is fixed** rather than after.

Write the verdict in `DECISIONS.md`.

---

## 16. Phase 0 is complete when

- [ ] All six accounts exist, keys stored privately
- [ ] All four people run Node 24 and have cloned the repo
- [ ] `npm run dev` works on all four machines
- [ ] Prettier reformats automatically on commit
- [ ] A migration has been written, pushed, and types regenerated from it
- [ ] `operators` table exists in Supabase with RLS enabled
- [ ] `scripts/test-provider.ts` returns answers from **both** providers
- [ ] The deployment loads on its Vercel URL
- [ ] `main` is protected; a PR cannot merge without approval
- [ ] Four merged PRs, one per person
- [ ] Both spikes run and both verdicts written in `DECISIONS.md`

Then, and only then, start Phase 1.

---

## 17. Troubleshooting

| Symptom                                                  | Fix                                                                                                                                                                   |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node` or `npm` not recognised after installing          | You did not reopen the terminal. Close every window and open a new one.                                                                                               |
| `npx create-next-app` hangs at "Installing dependencies" | Slow connection — give it ten minutes. If it fails, delete the folder and retry.                                                                                      |
| `git push` asks for a password and rejects it            | GitHub no longer accepts passwords. Use `gh auth login` or a Personal Access Token (section 4).                                                                       |
| `supabase link` fails with "invalid password"            | That prompt wants the **database** password from project creation, not your Supabase account password. Reset it in Project Settings → Database.                       |
| `supabase db push` says "no migrations found"            | You are not in the project root, or the file is not under `supabase/migrations/`.                                                                                     |
| `gen types` produces an empty or tiny file               | The CLI is not linked. Re-run `npx supabase link --project-ref <ref>`.                                                                                                |
| Table exists but says "RLS disabled"                     | The `alter table ... enable row level security` line did not run. Add it as a new migration and push.                                                                 |
| Provider test: `401` or `invalid x-api-key`              | Key is wrong or has a stray space. Re-copy it from the provider dashboard.                                                                                            |
| Provider test: `credit balance is too low`               | Add credit in the provider's billing page.                                                                                                                            |
| Provider test: `model does not exist`                    | Wrong model id. Check the provider's model list, fix `CLAUDE_MODEL` or `OPENAI_MODEL` in `.env.local`.                                                                |
| `--env-file` flag not recognised                         | Your Node is older than 20.6 — you are not on 24. Check `node --version`. As a fallback, `npm i -D dotenv` and add `import 'dotenv/config'` at the top of the script. |
| Vercel build fails but local build works                 | A missing environment variable. Open the deployment → Building logs and read the real error.                                                                          |
| Deployment loads but everything is broken                | Environment variables were added to Production only. Re-add them with all three environments ticked.                                                                  |
| Formatting hook does nothing on commit                   | `.husky/pre-commit` must contain exactly `npx lint-staged`, and `lint-staged` must be in `package.json`.                                                              |
| Teammate: "it works for you but not me"                  | They skipped `npm install` after pulling, or their `.env.local` is missing a key. Check both before anything else.                                                    |
| `.env.local` appears in `git status`                     | `.gitignore` is missing `.env*.local`. Add it immediately, before any commit.                                                                                         |

---

## What Phase 1 starts with

Once this guide is fully green, Phase 1 begins: operator login, the `clients` table, the client
switcher, and row-level security written for **both** principals — operator and client — even
though client login UI does not arrive until Phase 5.

That last point is the one thing in Phase 1 worth reading twice. Retrofitting a second principal
into policies across fifteen tables is genuinely miserable; designing for it upfront costs an
extra hour.
