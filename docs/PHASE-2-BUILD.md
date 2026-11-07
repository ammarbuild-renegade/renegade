# Renegade — Phase 2 Build Guide

Intake. A founder applies, the operator accepts, and the founder completes onboarding — the
questionnaire, their past posts, their brand kit. At the end of this phase the system holds
everything the Brand Brain needs in Phase 3.

This is the first phase with **real users who are not signed in**, the first with **file
uploads**, and the first where **a prompt runs in production**. Each of those brings a failure
mode that did not exist in Phase 1.

**Read `docs/PHASE-1-BUILD.md` first if you have not.** This guide assumes auth, the `clients`
table, row-level security and the three Supabase clients already exist.

| Part                  | What it is                                 | Where it lives             |
| --------------------- | ------------------------------------------ | -------------------------- |
| Migration `0003`      | applications, onboarding tokens, documents | `supabase/migrations/`     |
| `/apply`              | Public qualifying form                     | `app/(public)/apply/`      |
| Fit scoring           | First prompt running in production         | `lib/scoring/`             |
| `/applications`       | Operator queue, accept and reject          | `app/(app)/applications/`  |
| Acceptance email      | Resend, carrying the onboarding link       | `lib/email/`               |
| `/onboarding/<token>` | Four-section questionnaire, public         | `app/(public)/onboarding/` |
| File upload           | Past posts, reference posts, brand kit     | Supabase Storage           |
| Embeddings            | Past posts into pgvector                   | `lib/embeddings/`          |

---

## 0. Six decisions already taken

Settled before this guide. Recorded so nobody relitigates them mid-build.

### Save the application before scoring it

Insert the row with **no AI involved**. Score it afterwards, as a separate step. If the model
call times out, the lead is still in the database — the operator sees it unscored and can score
it again by hand.

A lead lost to an API timeout is a lost customer. This ordering is not an optimisation.

### Public forms write through a route handler with the service role

`/apply` and `/onboarding/<token>` have no signed-in user. There are two ways to let an
anonymous visitor write:

1. An `insert` policy on the table allowing the anon role
2. A route handler that validates input and writes with the service-role key

**We use the second.** Option 1 means anyone holding the publishable key — which ships in the
browser, by design — can insert rows into that table directly, at any rate, with any contents.
The route handler is a door we control: it validates, it rate-limits, and it is the only way in.

### The onboarding link is shown in the UI, not only emailed

When the operator accepts an application they see the onboarding link on screen, with a copy
button. The email is a convenience on top.

Two reasons. Resend's test sender only delivers to your own account address until a domain is
verified (section 7), so during development the email reaches nobody else. And an email that
silently fails to arrive would otherwise strand a real client with no way forward.

**Email is never the only path to a token.**

### The fit score sorts the queue. It never rejects.

`prompts/fit-scoring.md` already says this and it is worth repeating. Self-reported revenue is
unreliable, and a model must not turn away business on it. The $5,000 threshold **flags** an
application; a human decides.

### The scheduling link is a link, not an integration

Onboarding ends with a button to the operator's own scheduling page, and an endpoint that
records that the client booked. No API call, no webhook, no OAuth, no vendor SDK.

**If asked whether this is the FYP-2 meeting integration: it is not.** That means _creating_
the meeting and _pulling the transcript_ programmatically. This is a text column holding a URL
and an anchor tag pointing at it. Section 8.3 has the full reasoning, including why a webhook
would have been the wrong choice.

### `applications` is the one table without `client_id`

Rule 1 in `CLAUDE.md` says every table carries `client_id`. `applications` cannot: it exists
_before_ the client does — that is the entire point of it. On acceptance it gains
`converted_client_id`, pointing at the row that was created from it.

This is a deliberate, documented exception, not an oversight. Record it in `DECISIONS.md`.
Every other table in this migration carries `client_id` as normal.

---

## 0.1 Who builds what

Section 2 unblocks everyone. Build it first, merge it, then the rest runs in parallel.

| Who       | Sections | Folder they work in                             | Depends on |
| --------- | -------- | ----------------------------------------------- | ---------- |
| **Lead**  | 2, 5, 10 | `supabase/` `lib/`                              | nothing    |
| **Dev B** | 4, 6     | `app/(public)/apply/` `app/(app)/applications/` | section 2  |
| **Dev C** | 8, 9     | `app/(public)/onboarding/`                      | section 2  |
| **Dev D** | 7, 11    | `lib/email/` `tests/`                           | section 2  |

Before you start:

```bash
git checkout main && git pull && git checkout -b feature/your-bit
```

**Section 10 (embeddings) is last on purpose.** Nothing reads an embedding until the post
writer in Phase 4, so if Phase 2 runs long this is the piece that can slip into Phase 3
without blocking anybody. Do not let it delay sections 4 to 9.

---

## 1. What Phase 2 needs

**Lead.**

```bash
npm install resend
```

| Package  | Why                                                                      |
| -------- | ------------------------------------------------------------------------ |
| `resend` | Sends the acceptance email. Section 7 covers the account and the domain. |

`zod` and `@supabase/ssr` are already installed from Phase 1.

### Verify

```bash
npm ls resend
```

---

## 2. Migration 0003 — the intake tables

**Lead. Everything else waits on this.**

Create `supabase/migrations/0003_intake.sql`:

```sql
-- ===========================================================================
-- Phase 2: intake.
--
-- An application arrives before a client exists, becomes a client on
-- acceptance, and the onboarding token is what lets an unauthenticated
-- founder fill in their own questionnaire.
-- ===========================================================================

-- pgvector. Needed by source_documents below. Nothing reads these vectors
-- until the post writer in Phase 4, but embedding at upload means the data is
-- ready when that arrives.
create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- 1. applications
--
-- The ONLY table in the project without client_id, because it exists before
-- the client does. See "Five decisions already taken" in the Phase 2 guide.
-- ---------------------------------------------------------------------------
create table applications (
  id                   uuid primary key default gen_random_uuid(),
  full_name            text not null,
  email                text not null,
  company              text,
  linkedin_url         text,
  monthly_revenue_usd  integer,
  answers              jsonb not null default '{}'::jsonb,

  -- Written by the scoring step, which runs after the insert. Null means
  -- "not scored yet", not "scored zero" - the operator UI must tell them apart.
  fit_score            integer,
  fit_reasoning        text,
  scored_at            timestamptz,

  status               text not null default 'new'
                       check (status in ('new', 'accepted', 'rejected')),
  converted_client_id  uuid references clients(id) on delete set null,
  created_at           timestamptz not null default now()
);

create index applications_status_idx on applications(status, created_at desc);

alter table applications enable row level security;

-- Single-operator system, settled in Phase 1: any signed-in operator manages
-- the queue. There is no operator_id to scope by, because an application has
-- not been assigned to anyone yet.
create policy "operators manage applications"
  on applications for all
  using    ( exists (select 1 from operators where id = auth.uid()) )
  with check ( exists (select 1 from operators where id = auth.uid()) );

-- ---------------------------------------------------------------------------
-- 2. onboarding_tokens
--
-- A capability URL: holding the token IS the authorisation, exactly like the
-- post review links in CLAUDE.md. So it must be long, it must expire, and it
-- must be single use.
-- ---------------------------------------------------------------------------
create table onboarding_tokens (
  token       text primary key,
  client_id   uuid not null references clients(id) on delete cascade,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index onboarding_tokens_client_id_idx on onboarding_tokens(client_id);

alter table onboarding_tokens enable row level security;

-- No policy for anonymous visitors on purpose. The onboarding route handler
-- reads this with the service role, which bypasses RLS. An anon-readable
-- token table would let anyone enumerate valid tokens.
create policy "operator reads own client tokens"
  on onboarding_tokens for select
  using ( operator_owns_client(client_id) );

-- ---------------------------------------------------------------------------
-- 3. source_documents
--
-- Everything a client gives us. `type` is what keeps past_post and
-- reference_post apart, and that separation is load-bearing: mixing them makes
-- the voice-match score in Phase 6 measure the wrong target.
-- ---------------------------------------------------------------------------
create table source_documents (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id) on delete cascade,
  type          text not null
                check (type in ('questionnaire', 'past_post', 'reference_post',
                                'transcript', 'brand_kit')),
  content       text,
  storage_path  text,
  embedding     vector(1536),
  created_at    timestamptz not null default now()
);

create index source_documents_client_type_idx on source_documents(client_id, type);

alter table source_documents enable row level security;

create policy "operator manages own client documents"
  on source_documents for all
  using    ( operator_owns_client(client_id) )
  with check ( operator_owns_client(client_id) );

-- The client's own login can read their documents, once Phase 5 gives them one.
create policy "client user reads own documents"
  on source_documents for select
  using (
    exists (
      select 1 from client_users cu
      where cu.client_id = source_documents.client_id
        and cu.id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 4. brand_kits - one per client
-- ---------------------------------------------------------------------------
create table brand_kits (
  client_id      uuid primary key references clients(id) on delete cascade,
  primary_color  text,
  accent_color   text,
  font_name      text,
  logo_path      text,
  notes          text,
  updated_at     timestamptz not null default now()
);

alter table brand_kits enable row level security;

create policy "operator manages own client brand kits"
  on brand_kits for all
  using    ( operator_owns_client(client_id) )
  with check ( operator_owns_client(client_id) );
```

### Storage bucket

Storage buckets are rows in `storage.buckets`, so they belong in the migration too — not
clicked into existence in the dashboard, where nobody can review them and no teammate gets them.

Append to the same file:

```sql
-- ---------------------------------------------------------------------------
-- 5. Storage. Private bucket - uploads are client material, never public.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do nothing;

-- Files are stored at <client_id>/<filename>, so the first path segment is the
-- client id and that is what the policy checks.
create policy "operator manages own client files"
  on storage.objects for all
  using (
    bucket_id = 'client-files'
    and operator_owns_client((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'client-files'
    and operator_owns_client((storage.foldername(name))[1]::uuid)
  );
```

### Push it

```bash
npx supabase db push
```

```bash
npx supabase gen types typescript --linked > types/database.ts
```

### Verify section 2

```bash
npx supabase db query --linked "select tablename, rowsecurity from pg_tables where schemaname='public' order by tablename;"
```

Seven tables, all `rowsecurity: true`.

```bash
npx supabase db query --linked "select count(*) from pg_extension where extname='vector';"
```

Must return 1.

```bash
npx supabase db query --linked "select id, public from storage.buckets where id='client-files';"
```

Must return one row with `public: false`. **If it says true, stop and fix it** — a public
bucket makes every client's uploaded material readable by anyone with the URL.

Then confirm `applications`, `source_documents` and `brand_kits` appear in `types/database.ts`.

---

## 3. The public write pattern

**Read this before building section 4 or section 8.** Both public forms follow it exactly.

Create `lib/supabase/admin.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

/**
 * Service-role client. Bypasses every row-level security policy.
 *
 * ONLY import this from a route handler. Never from a component, never from
 * anything with 'use client' at the top, and never from a server action that
 * a signed-in user can reach - those have a real user and should use the
 * normal server client so the policies still apply.
 *
 * It exists for exactly one case: an anonymous visitor who legitimately needs
 * to write, where the route handler itself is the thing doing the authorising.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must both be set.')
  }

  return createClient(url, key, { auth: { persistSession: false } })
}
```

> **`SUPABASE_SECRET_KEY` must never reach the browser.** It has no `NEXT_PUBLIC_` prefix, so
> Next will not expose it — but importing this file into a Client Component is a build error at
> best and a leaked key at worst. If you are unsure whether your file runs on the server, it
> runs on the client.

Every public write goes:

```
validate with Zod  ->  write with the admin client  ->  return a plain result
```

No AI call inside that sequence. Scoring happens after.

---

## 4. `/apply` — the public form

**Dev B.**

Routes under `app/(public)/` need no auth, so add the group to the public list in
`lib/supabase/proxy.ts`:

```typescript
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/auth',
  '/apply',
  '/onboarding',
  '/api/apply',
  '/api/onboarding',
]
```

> Forget this and the form redirects an applicant to `/login`, which is the opposite of what a
> public form is for.

### 4.1 The route handler

Create `app/api/apply/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { scoreApplication } from '@/lib/scoring/fit'

const Application = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.email().max(200),
  company: z.string().trim().max(120).optional(),
  linkedin_url: z.url().max(300).optional().or(z.literal('')),
  monthly_revenue_usd: z.coerce.number().int().min(0).max(100_000_000),
  answers: z.record(z.string(), z.string().max(2000)).default({}),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = Application.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Step one: save. No AI anywhere near this.
  const { data: application, error } = await supabase
    .from('applications')
    .insert(parsed.data)
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Could not save your application.' }, { status: 500 })
  }

  // Step two: score. Deliberately after the insert and deliberately not awaited
  // for the response - if it throws, the application is already safe and the
  // operator sees it unscored.
  scoreApplication(application.id).catch((e) => {
    console.error('[apply] scoring failed for', application.id, e)
  })

  return NextResponse.json({ ok: true })
}
```

> **Why the scoring call is not awaited.** The applicant should not wait several seconds staring
> at a spinner for a number they will never see. They get an immediate confirmation; the
> operator gets the score when it lands.

### 4.2 The form

Create `app/(public)/apply/page.tsx` — a Client Component posting JSON to `/api/apply`.

Required fields: full name, email, company, LinkedIn URL, monthly revenue, and the free-text
questions. Follow the field pattern from `app/(app)/clients/new/page.tsx`: `Label` + `Input`,
error text in `text-destructive text-sm`, a disabled button while submitting.

On success show a thank-you panel instead of the form. **Do not show the fit score, and do not
say whether they passed the threshold.** The applicant is not the audience for either.

> **The $5,000 question is a number input, not a yes/no.** "Do you earn over $5,000 a month?"
> invites the answer that gets you through the door. Asking for the figure gives the operator
> something to sort by.

---

## 5. Fit scoring

**Lead.** The first prompt running in production.

### 5.1 Finish the prompt

`prompts/fit-scoring.md` is a stub. Fill in the body — the operator's ideal-client criteria,
what a high score looks like, what a low one looks like, and two or three worked examples.

**Examples beat rules.** When the output is wrong, add a better example before adding another
instruction.

Keep the contract at the top exactly as it is: returns `{ score, reasoning }`.

### 5.2 The scoring step

Create `lib/scoring/fit.ts`:

```typescript
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import { generateStructured } from '@/lib/ai/provider'
import { createAdminClient } from '@/lib/supabase/admin'

const FitScore = z.object({
  score: z.number().int().min(0).max(100),
  reasoning: z.string().min(1).max(2000),
})

/** Prompts are files, never inlined. Rule 4 in CLAUDE.md. */
async function loadPrompt(name: string) {
  return readFile(path.join(process.cwd(), 'prompts', `${name}.md`), 'utf8')
}

export async function scoreApplication(applicationId: string) {
  const supabase = createAdminClient()

  const { data: application, error } = await supabase
    .from('applications')
    .select('full_name, company, monthly_revenue_usd, answers')
    .eq('id', applicationId)
    .single()

  if (error || !application) throw new Error(`Application ${applicationId} not found`)

  const system = await loadPrompt('fit-scoring')

  const { data } = await generateStructured(
    'claude',
    {
      system,
      prompt: JSON.stringify(application, null, 2),
      effort: 'low', // a 0-100 score with a sentence of reasoning needs no deep thinking
      maxTokens: 1000,
    },
    FitScore
  )

  // Write only after a validated response. Rule 5 in CLAUDE.md - a failed call
  // must leave no partial record, and generateStructured throws on bad JSON
  // before we reach this line.
  await supabase
    .from('applications')
    .update({
      fit_score: data.score,
      fit_reasoning: data.reasoning,
      scored_at: new Date().toISOString(),
    })
    .eq('id', applicationId)

  return data
}
```

### Verify section 5

```bash
npx tsx -e "import('./lib/scoring/fit').then(m => m.scoreApplication('<an application id>')).then(console.log)"
```

Then check the row has `fit_score` and `scored_at` populated.

---

## 6. `/applications` — the operator queue

**Dev B.**

Create `app/(app)/applications/page.tsx`. A Server Component, same shape as the client list:
error branch, empty state, then the list.

```typescript
const { data: applications } = await supabase
  .from('applications')
  .select(
    'id, full_name, email, company, monthly_revenue_usd, fit_score, fit_reasoning, status, created_at'
  )
  .eq('status', 'new')
  .order('fit_score', { ascending: false, nullsFirst: false })
  .order('created_at', { ascending: false })
```

No `.eq('operator_id', …)` — same reasoning as Phase 1. The policy handles it.

Each row shows the name, company, revenue, and the fit score with its reasoning. Three states
the UI must tell apart:

| `fit_score` | `scored_at` | Show                                 |
| ----------- | ----------- | ------------------------------------ |
| a number    | set         | the score and the reasoning          |
| `null`      | `null`      | **"Not scored yet"** — not "0"       |
| `null`      | set         | "Scoring failed" with a retry action |

> **A null score is not a zero.** Render them the same and the operator will reject a good lead
> because the model timed out.

Flag anything under $5,000 visually — a muted badge, not a hidden row. The operator decides.

Accept and reject are server actions in `app/(app)/applications/actions.ts`. Reject sets
`status = 'rejected'`. Accept is section 7.

---

## 7. Accept → client, token, email

**Dev D.**

### 7.1 Resend setup, and its one trap

Create a free account at [resend.com](https://resend.com), make an API key, and put it in
`.env.local`:

```
RESEND_API_KEY=re_...
```

> **The test sender only reaches your own address.** Using `onboarding@resend.dev` as the
> `from`, Resend will only deliver to the email address on your Resend account. Anyone else gets
> a 403: _"You can only send testing emails to your own email address."_
>
> That is fine for development and fine for the demo, as long as you accept an application whose
> email is your own. To send to anyone else you must add and verify a domain in Resend, and the
> `from` address has to match that domain exactly.
>
> **This is why the onboarding link is shown in the operator UI.** Email is never the only path.

### 7.2 The accept action

In `app/(app)/applications/actions.ts`:

```typescript
'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sendAcceptanceEmail } from '@/lib/email/acceptance'

const TOKEN_TTL_DAYS = 14

export async function acceptApplication(applicationId: string) {
  const supabase = await createClient()

  const { data: application } = await supabase
    .from('applications')
    .select('id, full_name, email, company, status')
    .eq('id', applicationId)
    .single()

  if (!application) return { error: 'Application not found.' }
  if (application.status !== 'new') return { error: 'This application was already handled.' }

  const { data: claims } = await supabase.auth.getClaims()
  const operatorId = claims?.claims?.sub
  if (!operatorId) return { error: 'You are not signed in.' }

  // 1. The client row.
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      operator_id: operatorId,
      name: application.full_name,
      company: application.company,
    })
    .select('id')
    .single()

  if (clientError || !client) return { error: 'Could not create the client.' }

  // 2. The token. 32 random bytes - this URL is the only thing standing between
  //    a stranger and someone's onboarding form, so it must not be guessable.
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 86_400_000)

  const { error: tokenError } = await supabase
    .from('onboarding_tokens')
    .insert({ token, client_id: client.id, expires_at: expiresAt.toISOString() })

  if (tokenError) return { error: 'Could not create the onboarding link.' }

  // 3. Mark the application converted.
  await supabase
    .from('applications')
    .update({ status: 'accepted', converted_client_id: client.id })
    .eq('id', applicationId)

  const link = `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding/${token}`

  // 4. Email last, and its failure is not the action's failure. The link is
  //    returned either way and the UI shows it.
  let emailed = true
  try {
    await sendAcceptanceEmail({ to: application.email, name: application.full_name, link })
  } catch (e) {
    console.error('[accept] email failed', e)
    emailed = false
  }

  revalidatePath('/applications')
  return { ok: true, link, emailed, clientId: client.id }
}
```

Add to `.env.local` and `.env.example`:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

In production this must be the deployed origin, or every onboarding link points at localhost.

### 7.3 The email

Create `lib/email/acceptance.ts`:

```typescript
import { Resend } from 'resend'

export async function sendAcceptanceEmail(opts: { to: string; name: string; link: string }) {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not set')

  const resend = new Resend(key)

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM ?? 'Renegade <onboarding@resend.dev>',
    to: opts.to,
    subject: 'You are in — next step for your LinkedIn presence',
    text: [
      `Hi ${opts.name},`,
      '',
      'Good news — we would like to work with you.',
      '',
      'The next step is a short questionnaire about your audience, your voice and your goals.',
      'It takes about fifteen minutes, and there are no wrong answers:',
      '',
      opts.link,
      '',
      'This link is personal to you and expires in 14 days.',
    ].join('\n'),
  })

  if (error) throw new Error(error.message)
}
```

### 7.4 Show the link in the UI

After a successful accept, render the returned `link` with a copy button, and when `emailed` is
false say so plainly: _"Could not send the email — copy this link and send it yourself."_

---

## 8. `/onboarding/<token>` — the questionnaire

**Dev C.**

### 8.1 Validating the token

Create `lib/onboarding/token.ts`:

```typescript
import { createAdminClient } from '@/lib/supabase/admin'

export type TokenCheck =
  { ok: true; clientId: string } | { ok: false; reason: 'unknown' | 'expired' | 'used' }

export async function checkToken(token: string): Promise<TokenCheck> {
  const supabase = createAdminClient()

  const { data } = await supabase
    .from('onboarding_tokens')
    .select('client_id, expires_at, used_at')
    .eq('token', token)
    .single()

  if (!data) return { ok: false, reason: 'unknown' }
  if (data.used_at) return { ok: false, reason: 'used' }
  if (new Date(data.expires_at) < new Date()) return { ok: false, reason: 'expired' }

  return { ok: true, clientId: data.client_id }
}
```

Each reason gets its own message. "Expired" and "already completed" are different problems with
different next steps, and telling a client "invalid link" when they simply finished it last week
is a support conversation you did not need to have.

### 8.2 The questions

**These are the operator's real questions, from the onboarding document already sent to paying
clients. Use this wording.** It has been used with real founders and it works; invented
phrasing will not be better.

#### Who owns which field

The application already captured name, email, company and LinkedIn URL. **Do not ask again** —
re-asking signals that the first form went nowhere.

| Field                              | Asked by   |
| ---------------------------------- | ---------- |
| Name, email, company, LinkedIn URL | `/apply`   |
| Monthly revenue                    | `/apply`   |
| Website                            | onboarding |
| Everything in sections 1–4 below   | onboarding |

Pre-fill the header block from the application and show it read-only, so the client can see we
already have it.

#### The opening panel

Show this before the first question, near-verbatim:

> **How this works**
>
> This doc helps us understand YOU so we can build your LinkedIn presence the right way. There
> are no wrong answers. Write however you talk. The messier and more honest, the better.
>
> If you get stuck on a question, just skip it. We'll figure it out together on our call.

> **That last line is load-bearing**, not filler. A long form with no escape hatch gets
> abandoned at the first hard question. Telling someone they can skip one keeps them moving, and
> a partly-finished questionnaire is worth far more than none.

#### Section 1 — Logistics

- **What's the best way to reach you?** _Slack, email, text, WhatsApp, etc._

That is the whole section. The operator's existing document also asks where to share drafts for
review — **drop it.** The answer is now "in Renegade", and asking undermines the product.

> **Do not collect LinkedIn credentials.** The operator's current document asks for them, for
> clients who also buy account management. That is a different service and it is out of scope
> here — see `CLAUDE.md`. Publishing in FYP-2 happens through the member's own OAuth grant, so
> we never need, ask for, or store a password.

#### Section 2 — Your audience

_Who are we trying to reach? The more specific, the better your content will land._

- **Who do you MOST want to reach on LinkedIn?** _Think about the person who would DM you and
  say "I need your help."_
- **What's their job title?** _List a few. e.g. Executive Director, Founder, Marketing Manager,
  Ops Director._
- **What industry or space are they in?**
- **How big is their company?** _e.g. 5–50 people, solo founder, 100+ employees._
- **Who do you NOT want to attract?** _Wrong-fit clients, industries, or types of people. Be
  blunt._

#### Section 3 — Your voice and vibe

_This helps us write content that sounds like YOU, not a robot._

- **How would your best friend describe you?** _e.g. "Direct, a little nerdy, makes everything
  sound simple."_
- **Pick 3–5 words for how you want to come across.** _e.g. approachable, expert, bold,
  thoughtful, no-BS, warm, funny, serious._
- **Communication style** — checkboxes, tick all that apply:
  - I swear sometimes and that's fine
  - Casual and conversational
  - Authority-led
  - Funny / witty when possible
  - Storytelling and personal
  - I use emojis
- **Any words or phrases you always use?** _Catchphrases, industry terms you love, words that
  feel like "you."_
- **Any words or phrases you HATE?** _Things that make you cringe. Words that feel fake or
  overused._
- **Name 2–3 LinkedIn creators you like, and why** — **plus a post or two from each.**
- **Anything you absolutely do NOT want to post about?** _Off-limits topics, personal stuff,
  politics, etc._

> **Ask for the creators' actual posts, not just their names.** The operator's document asks
> only for names and profile links. A profile link gives the system nothing it can read — we
> need the text, stored as `reference_post`. This is the one place the platform should ask for
> more than the document does.

#### Section 4 — Goals and success

_What does winning look like for you?_

- **Why are you investing in your LinkedIn personal brand right now?** _What happened or what
  changed that made this a priority?_
- **What's the #1 thing you want LinkedIn to do for you?** _e.g. get leads, build authority,
  grow network, recruit talent, get speaking gigs._
- **How will you know this is working? What does success look like in 90 days?**
- **Are there specific people you want to connect with?** _Names, companies, types of people._
- **Are there LinkedIn groups, events or communities you're part of?**
- **How much time can you realistically spend on LinkedIn each week?** _Be honest. 15 min/day?
  30 min? 1 hour?_

> **The operator's document also asks "any specific metrics you care about?" — leave it out.**
> Post analytics is out of scope, and `r_member_postAnalytics` is partner-gated so it cannot
> come back later. Asking a client which numbers matter to them and then never reporting one is
> a promise the product cannot keep. The 90-day success question already captures the intent.

#### Section 5 — The offer

- **What do you sell, and to whom?**

Not in the operator's current document, and needed: the R3 engine's **Revenue** pillar has
nothing to aim at without it.

#### The uploads

- **Your own past posts — 5 to 10. Required.**
- Posts from the creators you admire — optional, stored separately.

> **This is the most important input in the system and the operator's document does not ask for
> it at all.** The gold set is built only from the client's own posts. Without them the Voice
> Card is guessing, and the voice-match score in Phase 6 has nothing to measure against. Make it
> required, and say why on the form: _"These teach the system how you actually write."_

Save the answers as one `source_documents` row with `type: 'questionnaire'`, the answers as JSON
in `content`. Mark the token used in the same request.

### 8.3 Booking the first interview

After submitting, the client lands on a confirmation screen with a **scheduling link**.

Add to migration 0003:

```sql
alter table operators add column booking_url text;
alter table clients  add column interview_booked_at timestamptz;
```

The operator pastes their scheduling page URL once, in settings. The confirmation screen shows
it as a button: **"Book your first interview"**.

#### How Renegade knows they booked

It doesn't, by itself — the booking happens entirely on the operator's scheduling tool. So
there is one endpoint, `/onboarding/<token>/booked`, that stamps `interview_booked_at`, and
**two ways to reach it**:

1. **The client confirms.** The confirmation screen says _"Once you've booked, click here"_.
   Always works, with any tool, on any plan.
2. **The scheduling tool redirects there.** Most booking tools can send the invitee to a URL
   after booking. If the operator's tool and plan support it, point it at this endpoint and the
   stamp happens automatically.

Same endpoint either way, so path 2 is a free upgrade rather than a dependency. The operator can
also set or clear the status by hand on the client record.

> **Why not a webhook or an API call?** Because then the feature only works on one vendor, on
> one plan tier. Calendly's post-booking redirect, for instance, is documented but reported by
> some sources to need a paid plan — and `CLAUDE.md` is explicit that committing to a vendor
> means a scope change when that vendor's terms move. A link plus a confirm button depends on
> nothing.

> **This is not the FYP-2 meeting integration.** That means _creating_ the meeting and _pulling
> the transcript_ through an API. This is a text column and an anchor tag. Keep the field named
> `booking_url` and describe it as a "scheduling link" in any write-up — never as a vendor name,
> and never as "integration".

`interview_booked_at` also gives the operator a real queue: _onboarded but not yet booked_ is
exactly the list worth chasing.

### 8.4 The submit handler

`app/api/onboarding/[token]/route.ts`, following section 3: validate, check the token, write
with the admin client, set `used_at`.

A second handler, `app/api/onboarding/[token]/booked/route.ts`, stamps `interview_booked_at` on
the client. It must still work when the token is already used — the client books _after_
submitting, so `used_at` will always be set by then. Check only that the token exists and
resolves to a client.

---

## 9. File upload

**Dev C.**

Uploads go to the `client-files` bucket at `<client_id>/<uuid>-<filename>`. The client id as the
first path segment is what the storage policy checks, so the layout is not cosmetic.

For each uploaded file write a `source_documents` row with the `storage_path` and the right
`type` — `past_post`, `reference_post` or `brand_kit`.

> **`past_post` and `reference_post` are not interchangeable.** A past post is one the client
> wrote. A reference post is by a creator they admire. The gold set is built only from past
> posts; if a reference post gets in, the model writes like the admired creator and the
> voice-match score measures the wrong target. Make the distinction obvious in the UI — two
> separate upload areas with their own headings, not one area with a dropdown.

Accept `.txt`, `.md`, `.docx`, `.pdf` and images for the brand kit. Cap at 5 MB per file.

> Uploads from the onboarding form go through the route handler with the admin client, for the
> same reason as every other public write.

---

## 10. Embeddings

**Lead. Last, and droppable.** Nothing reads these until Phase 4.

Create `lib/embeddings/embed.ts`:

```typescript
import OpenAI from 'openai'

const MODEL = 'text-embedding-3-small'

/**
 * 1536 dimensions, which is this model's default and must match the
 * vector(1536) column in migration 0003. Change one and you change both,
 * and everything already stored has to be re-embedded.
 */
export async function embed(text: string): Promise<number[]> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY is not set')

  const openai = new OpenAI({ apiKey: key })
  const res = await openai.embeddings.create({ model: MODEL, input: text })
  return res.data[0].embedding
}
```

Call it when a `past_post` row is created, and store the result in `source_documents.embedding`.

Only past posts need embedding in FYP-1. The questionnaire, brand kit and reference posts are
fetched by id, never by similarity.

---

## 11. Tests

**Dev D.** Add to `tests/`:

1. **An application from the public endpoint is saved even when scoring fails.** Mock
   `scoreApplication` to throw; assert the row still exists with `fit_score` null. This is the
   decision in section 0 made executable.
2. **An expired token is refused.** Insert a token with `expires_at` in the past; assert
   `checkToken` returns `expired`.
3. **A used token is refused.** Set `used_at`; assert `used`.
4. **Operator B cannot read operator A's client documents.** The Phase 1 isolation test,
   extended to `source_documents`.

Test 4 is the mandatory one, same as Phase 1. Run `npm test` locally before merging anything
touching a policy — it still cannot run in CI.

---

## 12. End-to-end check

By hand, before calling Phase 2 done.

1. Open `/apply` **signed out**. Submit a complete application.
2. Confirm the row is in `applications` within a second, before any score appears.
3. Wait, refresh `/applications`. The fit score and reasoning have appeared.
4. Submit a second application with revenue under $5,000. It appears in the queue, **flagged but
   not hidden**.
5. Accept the first. A `clients` row is created, the link is shown on screen, and the email
   arrives **if** the applicant address is your own Resend account address.
6. Open the onboarding link in a **private window**. The questionnaire loads with no login.
7. Complete it, uploading two past posts and one reference post.
8. Check `source_documents`: one `questionnaire`, two `past_post`, one `reference_post`, all on
   the right `client_id`.
9. On the confirmation screen, the **scheduling link** appears. Click _"Once you've booked,
   click here"_ and confirm `clients.interview_booked_at` is now set.
10. **Open the same onboarding link again. It must be refused as already used.**
11. Sign in as a second operator. The new client's workspace URL must 404.

Step 10 is why the token is single use. Step 11 is Phase 1's guarantee still holding.

> Step 9 works with no scheduling account at all — put any URL in `operators.booking_url` to
> test it. The confirm button is the path that always exists; a redirect from the booking tool
> is the optional upgrade.

---

## 13. Done when

- [ ] Migration 0003 pushed, `types/database.ts` regenerated
- [ ] `client-files` bucket exists and is **not public**
- [ ] An application saves with no AI call in the path
- [ ] A scoring failure leaves the application intact and visibly unscored
- [ ] Unscored and zero-scored look different in the queue
- [ ] Under-$5,000 applications are flagged, not auto-rejected
- [ ] Accepting creates the client, the token, and shows the link on screen
- [ ] The onboarding form works with no login, and refuses used or expired tokens
- [ ] The questionnaire uses the operator's own wording, and does not re-ask what `/apply` captured
- [ ] Past posts are **required**; reference posts ask for the posts, not just creator names
- [ ] Past posts and reference posts are stored with different `type` values
- [ ] The confirmation screen shows the scheduling link, and confirming stamps `interview_booked_at`
- [ ] No question asks for LinkedIn credentials, and none promises a metric we do not report
- [ ] Uploads land under `<client_id>/` in a private bucket
- [ ] `npm test` passes, including the isolation test
- [ ] Decisions recorded in `DECISIONS.md`, including the `applications` exception to rule 1

---

## 14. Troubleshooting

| What you see                                        | What is wrong                                                                                      |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/apply` redirects to `/login`                      | `/apply` missing from `PUBLIC_PATHS` in `lib/supabase/proxy.ts`.                                   |
| Application saves, score never appears              | `scoreApplication` threw. Check the server log — it is caught and logged, not surfaced.            |
| `new row violates row-level security policy`        | Writing a public form with the normal server client instead of the admin client (section 3).       |
| Resend 403, "can only send testing emails"          | Sending from `onboarding@resend.dev` to an address that is not your Resend account's. Expected.    |
| Onboarding link points at `localhost` in production | `NEXT_PUBLIC_SITE_URL` not set in the Vercel environment.                                          |
| `type "vector" does not exist`                      | `create extension if not exists vector;` did not run. It must come before the table that uses it.  |
| Uploaded file is readable by a logged-out URL       | The bucket was created public. Check `storage.buckets`, fix it, and re-check every uploaded file.  |
| `expected 1536 dimensions, not N`                   | The embedding model and the column disagree. Both must say 1536.                                   |
| Token works twice                                   | `used_at` is not being set in the submit handler, or is set only on success after a partial write. |

---

## 15. What Phase 3 starts with

Phase 3 is the Brand Brain: the Voice Card, the Personal Brand Blueprint, the Knowledge Vault
and the R3 Strategy Engine — four prompts, each with an operator edit screen.

It reads what Phase 2 collected. A questionnaire with thin answers produces a thin Voice Card,
so the quality of the onboarding form's **wording** matters more to Phase 3 than any code in it.
