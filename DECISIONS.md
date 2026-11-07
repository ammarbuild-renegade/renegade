# Decisions

Every non-obvious choice, with the reasoning and the date. Needed for the final report —
in month six nobody remembers why something was decided in month one.

---

## 2026-11-07 — `applications` has no `client_id`. Deliberate exception to rule 1.

Rule 1 in `CLAUDE.md` says every table carries `client_id` and no query runs without client
scoping. **`applications` does not, and cannot.**

An application arrives from a stranger through a public form. There is no client at that point
— creating one is what _accepting_ the application does. A `client_id` column would have to be
null for every row that matters, which is worse than not having it: a null foreign key invites
code that forgets to check.

Instead the row gains `converted_client_id` on acceptance, pointing at the client created from
it. Before acceptance the application belongs to nobody; after, the link is explicit.

**How it is scoped instead.** The policy checks that the caller is _an operator at all_, rather
than which clients they own:

```sql
using ( exists (select 1 from operators where id = auth.uid()) )
```

That is weaker than every other policy in the project, and it is only acceptable because this
is a single-operator system — settled in Phase 1, where multi-operator support was explicitly
dropped. **If a second operator is ever added, this policy is the first thing that breaks**:
every operator would see every application. The fix at that point is an `assigned_operator_id`
column, not a patch to the policy.

Every other table in migration 0003 — `onboarding_tokens`, `source_documents`, `brand_kits` —
carries `client_id` and scopes through `operator_owns_client()` as normal.

**Why this is written down.** A table missing `client_id` looks exactly like someone forgetting
rule 1. Without this entry the right reaction to finding it is "that's a bug", and the wrong
fix — adding a nullable `client_id` — would be easy to make.

---

## 2026-11-07 — Phase 2 schema: three choices that are not obvious from the SQL

**pgvector lives in the `extensions` schema, and the column type is fully qualified.**
`pgcrypto`, `uuid-ossp` and `pg_stat_statements` were already installed there, so a bare
`create extension vector;` would have put it in `public` and broken the convention. The column
is declared `extensions.vector(1536)` rather than `vector(1536)` because the `postgres` role
has `extensions` on its `search_path` but `authenticated` does not — the unqualified form
resolves during the migration and is fragile afterwards.

**1536 dimensions, matching `text-embedding-3-small`'s default.** Verified against the live
column rather than taken on trust: a 1536-element vector inserts, a 10-element one is rejected
with `expected 1536 dimensions, not 10`. Changing the embedding model means changing this
column **and re-embedding everything already stored** — the dimension is a contract between the
two, not a setting on either.

**The storage policy guards its uuid cast with a regex.** Files are stored at
`<client_id>/<filename>`, so the policy casts the first path segment to `uuid`. That cast
_raises_ on a malformed string, and an error inside a policy fails the entire query rather than
hiding a single row — so one badly-named object would break every file listing for everyone.
Only our own code writes to this bucket, but a security policy should not quietly depend on
that being true forever.

---

## 2026-11-07 — Phase 1 complete. The security decisions behind it.

The end-to-end check in `docs/PHASE-1-BUILD.md` section 10 passed in full, including the two
steps that matter: a second operator gets a **404** on the first operator's client URL, and two
tabs each keep their own client across a refresh.

Six choices worth recording, because each one looks like a style preference and is not.

**1. `operator_owns_client` is `SECURITY DEFINER` with `search_path` pinned.**
The policy on `clients` has to consult `client_users`, and the policy on `client_users` has to
consult `clients`. Written directly that recurses infinitely and every query fails. A
`SECURITY DEFINER` function does not have row-level security applied inside it, which breaks
the loop. The pinned `search_path` is not decoration: without it a caller can point
`search_path` at a schema they control and have the function read their table instead of ours.

**2. Queries do not filter by `operator_id`, deliberately.**
The database policy already restricts rows to the signed-in operator. Adding `.eq('operator_id',
…)` in the query as well would mean a broken policy still produced a correct-looking screen —
the bug would be hidden rather than exposed. The tests are what prove the policy works, so the
application code must not quietly compensate for it.

**3. `operator_id` on insert comes from the session, never the form.**
A hidden form field would let anyone post another operator's id. The policy's `with check`
clause would reject it, but relying on that alone means one careless policy edit opens a hole.
Two independent controls, not one.

**4. An inaccessible client returns 404, not 403.**
A client belonging to another operator is invisible under row-level security, so the query
returns nothing and the route calls `notFound()`. A 403 would confirm that the id is real,
which is itself a disclosure. "Not found" and "not yours" must be indistinguishable.

**5. The auth check lives in the layout, not only in `proxy.ts`.**
`proxy.ts` does redirect signed-out visitors, so the layout check looks redundant. Next's own
documentation describes Proxy as an _optimistic_ check and explicitly not an authorisation
layer. The layout is where the guard belongs; the proxy is a fast path in front of it.

**6. The active client is a URL segment, not session state.**
`/c/<clientId>` means two tabs can hold two different clients at once, links are shareable, and
there is no server-side "current client" to fall out of sync. Verified: two tabs, two clients,
both survive a refresh.

**Known gap:** the four row-level-security tests cannot run in CI. They need
`SUPABASE_SECRET_KEY`, and repository secrets are not available to pull requests from forks on
a public repo. CI proves the code compiles; only `npm test`, run locally, proves the data is
isolated. Anything touching a migration or a policy must be tested by hand before merging.

---

## 2026-10-05 — Generation spike: PASSED. The approach works.

Ran the Phase 0 generation spike against a real client profile, held locally and deliberately
never committed (see the note at the end of this entry).
**Operator verdict: satisfactory.** The approach is sound; FYP-1 proceeds as scoped.

Three findings worth keeping:

**1. No fabrication.** The proof bank holds no real figures yet, so any number in the output
would have been invented. The model produced none. This was the most dangerous failure mode —
an invented "47% uplift for &lt;named brand&gt;" is a client reputation problem, not a bug — and the
explicit "invent nothing" rule in the prompt held.

**2. The cold-start path works, and is now tested.** The spike ran with an **empty gold set**:
voice sketch only, no past posts at all. The voice still came through. `CLAUDE.md` commits to
this path for clients who have barely posted, and until now it was an untested assumption. It
is no longer. This is also a good answer to the likely jury question about founders who have
never posted.

**3. Guardrails are enforceable through the prompt.** Every banned structure from the brand
profile held, and the CTA came back in the specified style ("happy to point you at where to
look") rather than drifting to "BOOK A CALL". Banned _structures_ — not just banned words —
are doing real work.

Two things to watch as volume grows, neither blocking:

- **Swearing never appeared.** The profile says "swears sometimes, naturally". One post proves
  nothing, but across ten the absence would mean the voice is landing too clean.
- **One strained metaphor** ("the links are just pointing down someone else's [road]"). A
  gold set would likely damp this — worth re-testing once real past posts exist.

**The spike is not committed.** It carries a real client's brand profile, and anything committed
stays in git history permanently even after the file is deleted. It lives locally and is
gitignored (`scripts/spike-*.ts`). Re-run it from the local copy when a gold set becomes
available.

---

## 2026-10-05 — Branch protection configured but not yet enforced

GitHub rulesets are free on **public** repositories only. On a **private** repository they need
GitHub Pro (personal account) or Team (organization). Ours is private on the Free plan, so the
ruleset saves but GitHub does not enforce it.

**Not making the repo public.** That would enforce protection for free, but it would also expose
`/prompts` — which `CLAUDE.md` names as the project's intellectual property, and which is the
part of this project that actually matters. Plagiarism by other students is a real risk too.

**Applied for the GitHub Student Developer Pack** (`education.github.com/pack`), which gives
students GitHub Pro free. The existing ruleset starts enforcing automatically once Pro is
active — it does not need to be recreated.

Until then, protection is a convention rather than a mechanism: the PR template and the team
guide both state that `main` is never pushed to directly, but GitHub will not block it.
**This must be enforced before teammates start pushing**, which is when it stops being
theoretical.

Ruleset as configured (waiting to activate): bypass list empty, pull request required,
required approvals 0 (raise to 1 when the team joins), dismiss stale approvals, require
conversation resolution, block force pushes.

---

## 2026-10-04 — Auto-enable RLS turned on, but migrations still declare it

Turned on **Authentication -> Auto-enable RLS for new tables** on `renegade-dev`. It installs
an event trigger (`ensure_rls`) that switches RLS on for every new table in the `public`
schema. It writes no policy, so a new table starts default-deny — it fails closed, which is
the failure mode we want.

**It does not replace writing `alter table ... enable row level security` in every migration.**
This is a _project setting_, not schema, so it does not travel with our migrations. If
`renegade-prod` is created without the same toggle, the identical migration would produce
tables with no RLS there — dev protected, prod wide open, and nothing to notice it. The line
in the migration is what guarantees both databases match.

**Action when `renegade-prod` is created: turn this setting on there too.**

Known confusion to expect: RLS on with no policy returns `[]`, not an error. The answer is
always "you forgot to write the policy."

---

## 2026-10-04 — Models pinned, and `temperature` removed from the provider layer

**Claude: `claude-sonnet-5`.** There is no "Sonnet 5.5" — the Sonnet line runs
Sonnet 4.6 -> Sonnet 5, and Sonnet 5 is current. Left as-is.

**OpenAI: `gpt-5.6-sol`** at `reasoning.effort: medium` (which is also that model's own
default). Called through the **Responses API**, not Chat Completions — that is the documented
path for reasoning models and the one that carries `reasoning.effort`.

**`temperature` deleted from the provider layer.** This was a latent bug, not a preference:
both current families are reasoning models and reject it. Claude Sonnet 5 returns a **400** if
`temperature` is sent, and OpenAI's reasoning models do not support it. Our first
`provider.ts` passed `temperature: opts.temperature ?? 1` on every call, so the very first real
API call would have failed. Caught before any key existed to fail against.

**Replaced it with `effort`**, since that is the knob both providers actually expose now:

|           | Claude                            | OpenAI                                   |
| --------- | --------------------------------- | ---------------------------------------- |
| Parameter | `output_config.effort`            | `reasoning.effort`                       |
| Values    | low / medium / high / xhigh / max | none / low / medium / high / xhigh / max |
| Default   | high                              | medium                                   |

One `effort` field in `GenerateOptions` maps to both. Per-provider defaults live in
`CLAUDE_EFFORT` / `OPENAI_EFFORT` so tuning cost against quality never touches code.

Claude also now sends `thinking: {type: 'adaptive'}`. `budget_tokens` is removed on Sonnet 5
and would 400 the same way `temperature` did.

---

## 2026-10-04 — Supabase new API keys, not the legacy ones

Supabase has replaced the JWT-based `anon` / `service_role` keys with opaque
`sb_publishable_…` / `sb_secret_…` keys. The dashboard shows both: a current tab and a
**Legacy** tab.

**Chose the new keys.** Supabase is deprecating the legacy pair at the **end of 2026**, which
falls in the middle of FYP-2. Starting on the new system costs nothing today; starting on legacy
would mean a forced migration mid-project, during the semester we can least afford it.

Mapping is one to one: `anon` → publishable, `service_role` → secret.

Our variable names follow the new reality rather than the old habit:

```
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY   (was NEXT_PUBLIC_SUPABASE_ANON_KEY)
SUPABASE_SECRET_KEY                    (was SUPABASE_SERVICE_ROLE_KEY)
```

Renamed now because no Supabase client code exists yet. Later it would be a refactor.

Note for Phase 1: the **Project URL moved** out of the API Keys page into the **Connect**
dialog. Also, secret keys now return 401 if used from a browser — Supabase matches on
`User-Agent`. A useful backstop, not a substitute for keeping them server-side.

---

## 2026-10-04 — shadcn/ui on Radix primitives, Nova preset

The shadcn CLI now asks which primitive library to build on: **radix**, **base** (Base UI) or
**aria** (React Aria). `--defaults` would have picked Base UI.

**Chose radix.** Almost every shadcn tutorial, Stack Overflow answer and community component
written to date assumes Radix. With three developers who will be searching for help, matching
what they find matters more than being on the newest foundation.

Preset **Nova** (Lucide icons, Geist font), base colour neutral, CSS variables on. Recorded in
`components.json` as `style: radix-nova`.

---

## 2026-10-04 — .gitignore exception for .env.example

Next 16 ships `.env*` in `.gitignore`, which also ignores `.env.example`. That file **must** be
committed — it is how a teammate cloning the repo learns which variables they need.

Added `!.env.example` directly beneath it. Verified both ways: `.env.example` is tracked,
`.env.local` is still ignored.

---

## 2026-10-04 — Next.js 16, and what that means for AI assistance

`create-next-app` installed **Next 16.3.8** (React 19.2.8, Tailwind 4, ESLint 9), not Next 15.

Next 16 is a major release with breaking changes to APIs, conventions and file structure. The
generated `AGENTS.md` warns that these "may all differ from your training data" and points to
`node_modules/next/dist/docs/` as the authority.

**Consequence for how we work:** any Next.js pattern produced from memory by an AI assistant —
route handlers, layouts, data fetching, caching — may be a Next 15 pattern that no longer works.
Check `node_modules/next/dist/docs/` before trusting generated Next.js code.

`AGENTS.md` is regenerated by `next dev` on every run, so it is committed rather than deleted.
Our own `CLAUDE.md` keeps `@AGENTS.md` as its first line so both load together.

---

## 2026-10-04 — npm audit warnings left unfixed

`npm install` reports 5 high severity vulnerabilities:

```
braces → micromatch → fast-glob → @next/eslint-plugin-next → eslint-config-next
```

All five are the same advisory — a denial-of-service in `braces` glob matching — reached only
through the **ESLint dev-dependency chain**. Nothing in that chain ships to users; it runs only
while linting, on our own source files.

`npm audit fix --force` would downgrade `eslint-config-next` to 14.2.35, which is incompatible
with Next 16 and would break linting entirely.

**Decision:** leave the advisories. Revisit if `eslint-config-next` publishes a release with a
patched `fast-glob`, or if the vulnerability ever becomes reachable from runtime code.

---

## 2026-10-04 — Node 24, pinned

Node 20 reached end of life on 24 April 2026 and no longer receives security patches. Node 24 is
the current Active LTS, supported until April 2028.

Pinned in two places so nobody drifts: `.nvmrc` (`24`) and `package.json` → `engines`
(`>=24 <25`). `@types/node` bumped from `^20` to `^24` so the type definitions match the runtime.

---

## 2026-09-22 — Retrieval instead of fine-tuning

Fine-tuning needs thousands of examples per client; we have 20–30 posts. It would also mean one
model per client to train and maintain.

Retrieval gives the same voice matching, costs nothing per client, and makes new interview
material available immediately instead of requiring a retrain.
