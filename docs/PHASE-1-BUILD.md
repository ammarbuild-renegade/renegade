# Renegade — Phase 1 Build Guide

The spine. Operator login, the `clients` table, the workspace switcher, and the security
rules that keep one operator's data away from another's.

Everything in FYP-1 is built on top of this. Get it right and the remaining twelve features
are filling in; get it wrong and every one of them inherits the problem.

**Read `docs/PHASE-0-SETUP.md` first if your machine is not set up yet.** This guide assumes
you can already clone the repo, run `npm run dev`, and see the app on localhost:3000.

| Part             | What it is                                             | Where it lives         |
| ---------------- | ------------------------------------------------------ | ---------------------- |
| Supabase clients | Three small files — browser, server, proxy             | `lib/supabase/`        |
| `proxy.ts`       | Refreshes the session and blocks unauthenticated pages | project root           |
| Migration `0002` | `clients`, `client_users`, security rules              | `supabase/migrations/` |
| Auth pages       | Login and signup                                       | `app/(auth)/`          |
| Workspace        | Sidebar, client switcher, client screens               | `app/(app)/`           |
| Tests            | Four security tests                                    | `tests/`               |

---

## 0. Three decisions already taken

These were settled before this guide was written. They are recorded here so nobody
re-litigates them mid-build.

### The active client lives in the URL

```
/c/<clientId>/posts        not   /posts  with the client in a cookie
```

**Why:** an operator working on two clients in two browser tabs is a real workflow. With the
client id in a cookie, the two tabs fight — switch client in tab 2, refresh tab 1, and tab 1
silently shows the other client's data. With it in the URL, each tab is independent, links
can be shared, and the back button works.

It also means a Server Component reads the client id straight from its route params instead
of looking up a session on every render.

### The signup page exists, but is not advertised

There is a `/signup` page. There is **no link to it** from anywhere in the app.

**Why it has to exist:** the mandatory security test needs **two** operator accounts. You
cannot test "operator A cannot see operator B's data" with one account.

**Why it is not advertised:** the project's story is one operator with many clients. Signup
is simply how an operator account comes into being — it is part of feature 1 (operator
login), not a separate multi-operator feature. Do not put it in the proposal.

### Tests run on Vitest

`CLAUDE.md` requires a test that tries to read another operator's data and fails. That needs
a test runner. Vitest needs almost no configuration with TypeScript, where Jest needs a lot.

---

## 0.1 Who builds what

**Sections 1–6 and 9 are already built, verified and merged.** Read them for context — they
explain why the pieces you import are shaped the way they are — but do not rebuild them.

| Who       | Sections | Folder they work in           | Status                           |
| --------- | -------- | ----------------------------- | -------------------------------- |
| **Lead**  | 1–6, 9   | `lib/` `supabase/` `proxy.ts` | **done** — auth, policies, tests |
| **Dev C** | 7        | `components/workspace/`       | **start now**, against real data |
| **Dev B** | 8        | `app/(app)/`                  | **start now**, against real data |
| **Dev D** | 10       | `tests/` `scripts/`           | unblocked                        |

Before you start, `git pull` on `main` so you have `lib/supabase/` and `proxy.ts`. Then branch:

```bash
git checkout main && git pull && git checkout -b feature/your-bit
```

**You no longer need mock data.** The original plan had Dev B and Dev C building against a
hardcoded array because they were to work in parallel with auth. Auth finished first, so query
the database directly — see 7.1.

What is already working, so you can trust it:

- Signing in and out, and a signed-out visitor being redirected to `/login`
- `clients` and `client_users` exist, with row-level security proven by four passing tests
- Two sample clients are seeded against the test operator account
- An operator cannot see or modify another operator's clients — tested, not assumed

Working in different folders is what keeps merge conflicts near zero. The one file you share
is `app/(app)/layout.tsx`, created in 7.3: **Dev C should land that first**, and Dev B should
pull before touching the `(app)` tree.

---

## 1. Install what Phase 1 needs

**Lead.**

```bash
npm install @supabase/ssr
```

```bash
npm install -D vitest dotenv
```

| Package         | Why                                                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `@supabase/ssr` | Supabase auth that works with server rendering. `@supabase/supabase-js` alone cannot read or write the cookies that hold a session. |
| `vitest`        | Test runner for the four security tests.                                                                                            |
| `dotenv`        | Lets the tests read `.env.local`. Vitest does not load it on its own.                                                               |

### Verify

```bash
npm ls @supabase/ssr vitest
```

Both should print a version, not `(empty)`.

---

## 2. The three Supabase clients

**Lead.**

**Why three:** the same database needs three different ways in, because each runs somewhere
different and has a different way of reaching the browser's cookies.

| File                     | Runs in                        | Used by                                           |
| ------------------------ | ------------------------------ | ------------------------------------------------- |
| `lib/supabase/client.ts` | the browser                    | Client Components (`'use client'`)                |
| `lib/supabase/server.ts` | the server                     | Server Components, Server Actions, Route Handlers |
| `lib/supabase/proxy.ts`  | the edge, before every request | `proxy.ts` at the project root                    |

> **These files are small and they look repetitive. They are not interchangeable.** Using the
> browser client in a Server Component gives you a user that is always `null`. Using the
> server client in a Client Component crashes, because `next/headers` does not exist there.

### 2.1 Browser client

Create `lib/supabase/client.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for Client Components.
 *
 * createBrowserClient is already a singleton internally, so calling this on
 * every render is cheap - no need to memoise it.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

### 2.2 Server client

Create `lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Note the await on cookies() - in Next 15 and later it is asynchronous.
 * Because of that this function is async too, so every caller awaits it.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // A Server Component cannot set cookies. This is expected and safe
            // to ignore: proxy.ts refreshes the session before the page runs,
            // so the cookie is already current by the time we get here.
          }
        },
      },
    }
  )
}
```

> **The empty `catch` is deliberate, not laziness.** Server Components are allowed to read
> cookies but not write them. Without the try/catch, every page render throws. The session is
> kept fresh by `proxy.ts` instead — see the next section.

### 2.3 Proxy client

Create `lib/supabase/proxy.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Pages a signed-out visitor is allowed to open. */
const PUBLIC_PATHS = ['/', '/login', '/signup', '/auth']

/**
 * Refreshes the auth session on every request, and sends signed-out visitors
 * to the login page.
 *
 * Two rules here are easy to get wrong and both matter:
 *
 *   1. Use getClaims(), not getSession(). getSession() reads the cookie without
 *      revalidating it, so a tampered cookie would be believed. Never trust it
 *      in server code.
 *
 *   2. Return the exact response object that setAll built. Returning a fresh
 *      NextResponse throws away the refreshed cookies and the user is logged
 *      out on the next request, seemingly at random.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          // Cache-Control, Expires and Pragma - a cached authenticated page
          // served to the next visitor would be a serious leak.
          if (headers) {
            for (const [key, value] of Object.entries(headers)) {
              supabaseResponse.headers.set(key, value as string)
            }
          }
        },
      },
    }
  )

  const { data } = await supabase.auth.getClaims()
  const signedIn = Boolean(data?.claims)

  const path = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'))

  if (!signedIn && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path) // send them back where they were going
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

---

## 3. `proxy.ts` — not `middleware.ts`

**Lead.**

**Why this section exists at all:** in Next.js 16 the `middleware.ts` convention was
**deprecated and renamed to `proxy.ts`**. Every tutorial written before late 2026 — and most
answers an AI assistant gives from memory — will tell you to create `middleware.ts`. That
file is now ignored.

Create `proxy.ts` in the **project root**, beside `app/`:

```typescript
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Every path except static assets and image files. Running the session
     * refresh on image requests would be pure waste.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

> The exported function must be named **`proxy`**, not `middleware`. A file named `proxy.ts`
> exporting `middleware` does nothing at all, silently.

### Verify section 3

```bash
npm run dev
```

Open <http://localhost:3000/c/anything>. You should be **redirected to `/login`** — which
does not exist yet, so you will see a 404. That 404 is the proof: the redirect fired.

If you land on a Next.js 404 for `/c/anything` instead of being redirected, `proxy.ts` is not
running. Check the filename and the export name.

---

## 4. Migration 0002 — clients, client users, and the security rules

**Lead.** This is the most important section in Phase 1.

Create `supabase/migrations/0002_clients_and_access.sql`:

```sql
-- ===========================================================================
-- Phase 1: the clients table, the client login table, and the access rules
-- for BOTH kinds of user.
--
-- The client-facing screens are not built until Phase 5. The policies are
-- written now anyway: adding a second kind of user to policies across fifteen
-- tables later is far harder than designing for it once, here, while there
-- are two.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. clients
-- ---------------------------------------------------------------------------
create table clients (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null references operators(id) on delete cascade,
  name         text not null,
  company      text,
  status       text not null default 'active',
  created_at   timestamptz not null default now()
);

create index clients_operator_id_idx on clients(operator_id);

alter table clients enable row level security;

-- ---------------------------------------------------------------------------
-- 2. client_users - one login per client. Read-only, by design.
-- ---------------------------------------------------------------------------
create table client_users (
  id          uuid primary key references auth.users(id) on delete cascade,
  client_id   uuid not null references clients(id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now()
);

create index client_users_client_id_idx on client_users(client_id);

alter table client_users enable row level security;

-- ---------------------------------------------------------------------------
-- 3. A helper that breaks a circular dependency.
--
-- The policy on `clients` needs to look at `client_users`, and the policy on
-- `client_users` needs to look at `clients`. Written directly, Postgres hits
-- infinite recursion and every query fails with a confusing error.
--
-- SECURITY DEFINER makes this function run as its owner, which means row-level
-- security does NOT apply inside it. That is what breaks the loop.
--
-- `set search_path = public` is not optional. Without it, a caller could point
-- search_path at their own schema and have this function read a table they
-- control instead of ours.
-- ---------------------------------------------------------------------------
create or replace function operator_owns_client(target_client_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from clients
    where id = target_client_id
      and operator_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- 4. Policies on clients
-- ---------------------------------------------------------------------------

-- The operator who owns a client can do anything with it.
create policy "operator manages own clients"
  on clients for all
  using    ( operator_id = auth.uid() )
  with check ( operator_id = auth.uid() );

-- A client's own login can read that one client row, and nothing else.
-- No insert, update or delete policy exists for them, so they cannot write.
create policy "client user reads own client"
  on clients for select
  using (
    exists (
      select 1 from client_users cu
      where cu.client_id = clients.id
        and cu.id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 5. Policies on client_users
-- ---------------------------------------------------------------------------

-- The operator manages the logins belonging to their own clients.
-- Uses the helper, so no recursion.
create policy "operator manages client logins"
  on client_users for all
  using    ( operator_owns_client(client_id) )
  with check ( operator_owns_client(client_id) );

-- A client user can read their own row. Nothing else.
create policy "client user reads own row"
  on client_users for select
  using ( id = auth.uid() );

-- ---------------------------------------------------------------------------
-- 6. Create the operator row automatically on signup.
--
-- Supabase writes to auth.users when someone registers. Without this trigger
-- there would be an auth user with no matching operators row, and every query
-- scoped to operator_id would return nothing - with no error to explain why.
--
-- The role check matters: client logins also land in auth.users, and they must
-- NOT get an operator row. The signup page sets role in user metadata.
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data->>'role' = 'operator' then
    insert into operators (id, email, full_name)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', '')
    );
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- 7. operators needs an insert policy too.
--
-- The trigger above runs as SECURITY DEFINER so it bypasses this, but without
-- an insert policy nothing else could ever create an operator row - including
-- a seed script.
-- ---------------------------------------------------------------------------
create policy "operator inserts own row"
  on operators for insert
  with check ( id = auth.uid() );
```

### Push it

```bash
npx supabase db push
```

```bash
npx supabase gen types typescript --linked > types/database.ts
```

### Verify section 4

```bash
npx supabase db query --linked "select tablename, rowsecurity from pg_tables where schemaname='public' order by tablename;"
```

All three tables — `clients`, `client_users`, `operators` — must show `rowsecurity: true`.

```bash
npx supabase db query --linked "select tablename, policyname, cmd from pg_policies where schemaname='public' order by tablename;"
```

You should see **seven** policies:

| Table          | Policies                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------- |
| `clients`      | `operator manages own clients`, `client user reads own client`                               |
| `client_users` | `operator manages client logins`, `client user reads own row`                                |
| `operators`    | `operators read own row`, `operators update own row` (from 0001), `operator inserts own row` |

Five are new in this migration; the two `operators` select/update policies came from 0001.

If any table has RLS on but **no** policy, every query against it returns an empty list with
no error — the single most confusing failure in this project.

Worth confirming the two helper functions came out right, because they are the actual security
control rather than just supporting code:

```bash
npx supabase db query --linked "select proname, prosecdef, proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname in ('operator_owns_client','handle_new_user');"
```

Both must show `prosecdef: true` **and** `search_path=public` in `proconfig`. A SECURITY
DEFINER function without a pinned `search_path` is a privilege-escalation hole, not a style
problem.

Then open `types/database.ts` and confirm `clients` and `client_users` appear.

---

## 5. Auth pages

**Lead.**

### 5.1 Login

Create `app/(auth)/login/page.tsx`.

> **The form is a separate component wrapped in `<Suspense>`, and that is not optional.**
> `useSearchParams` reads the URL, so the component calling it cannot be prerendered.
> Without a Suspense boundary above it, `npm run dev` works fine and `npm run build`
> fails with `Error occurred prerendering page "/login"` — a message that never
> mentions search params. Verified against the Next 16 docs shipped in
> `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-search-params.md`.

```tsx
'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * The form is split out and wrapped in Suspense below because it calls
 * useSearchParams, which reads the URL. A component that reads the URL cannot
 * be prerendered, and without a Suspense boundary above it the whole route
 * fails the production build - `next build` errors with "Error occurred
 * prerendering page /login", which does not mention search params at all.
 *
 * With the boundary, the heading prerenders as static HTML and only the form
 * is client-rendered.
 */
function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // Deliberately vague: saying "no account with that email" tells an
      // attacker which addresses are registered.
      setError('Email or password is incorrect.')
      setBusy(false)
      return
    }

    router.push(params.get('next') ?? '/clients')
    router.refresh() // re-run Server Components so they see the new session
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button type="submit" disabled={busy}>
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}

/** Same shape as the form, so the layout does not jump when it loads. */
function LoginFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-full" />
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-display mb-1 text-2xl font-semibold">Sign in</h1>
      <p className="text-muted-foreground mb-8 text-sm">Renegade operator access.</p>

      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
```

### 5.2 Signup

Create `app/(auth)/signup/page.tsx`. Same shape as login, with two differences — note them,
they matter:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This is what the database trigger reads. Without role: 'operator'
        // the auth user is created but no operators row is, and every screen
        // comes back empty with no error to explain it.
        data: { role: 'operator', full_name: fullName },
      },
    })

    if (error) {
      setError(error.message)
      setBusy(false)
      return
    }

    router.push('/clients')
    router.refresh()
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="font-display mb-1 text-2xl font-semibold">Create an operator account</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Each operator sees only their own clients.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </Button>
      </form>
    </main>
  )
}
```

> **Do not add a link to `/signup` anywhere.** The page exists for the security tests and for
> the demo. The product story is one operator with many clients.

### 5.3 Email confirmation while developing

**Already done — no action needed.** Checked on the dev project 2026-10-29:
`confirmation_sent_at` is null and new accounts come back confirmed, so **Confirm email is
off**. For reference, the setting lives at Supabase dashboard → **Authentication** →
**Sign In / Providers** → **Email** → **Confirm email**.

Left on, every test account sits unusable until someone clicks a link in an inbox that does
not exist.

> **Turn it back on before the final demo.** Nothing will remind you — the app behaves
> perfectly with it off. Also tracked in the pre-demo checklist.

### Verify section 5

```bash
npm run dev
```

Open <http://localhost:3000/signup> and create an account. You should be redirected to
`/clients`, which 404s until section 8 lands — expected.

> **Use a real email address at a domain that can receive mail.** Supabase validates
> deliverability and rejects anything else with `Email address "..." is invalid`, which reads
> like a bug in the form but is not. Confirmed 2026-10-29: `example.com` is refused because it
> publishes a **null MX** record (RFC 7505 — it declares that it accepts no mail), and a
> domain with no MX record at all is refused too. A `+tag` on a real address works well:
> `you+renegade-test@gmail.com` is filterable and obviously a test account.
>
> Note this applies to the signup **form** only. The admin API used by the section 9 tests
> bypasses the check, which is why those tests can use `@example.com` addresses freely.

Then:

```bash
npx supabase db query --linked "select id, email, full_name from operators;"
```

Your new account must appear. **If `auth.users` has a row but `operators` does not**, the
trigger did not fire — check that the signup page sends `role: 'operator'`.

To check both halves at once:

```bash
npx supabase db query --linked "select email, email_confirmed_at is not null as confirmed, raw_user_meta_data->>'role' as role from auth.users order by created_at desc limit 3;"
```

`role` must read `operator`. If it is null, the signup page is not sending the metadata and no
operator row will ever be created — every screen then comes back empty with no error to
explain it.

---

## 6. Where the pages live

**Lead.** Two route groups. The brackets mean the folder name does **not** appear in the URL —
it only groups files that share a layout.

```
app/
  (auth)/
    login/page.tsx          ->  /login
    signup/page.tsx         ->  /signup
  (app)/
    layout.tsx              <- sidebar, requires a signed-in operator
    clients/page.tsx        ->  /clients          the client list
    c/[clientId]/
      layout.tsx            <- loads the client, 404s if not yours
      page.tsx              ->  /c/<id>           client overview
```

---

## 7. The workspace shell and client switcher

**Dev C.** Query the `clients` table directly — see 7.1 before you start.

### 7.1 Skip the mock data

> **This step is no longer needed. Do not create a mock file.**
>
> It existed because this section was written to run _in parallel_ with the lead's auth work.
> Sections 1–5 are finished and merged, so the real thing is already there: auth works, the
> `clients` table exists with its policies, and two sample clients are seeded against the
> test operator account.
>
> Query `clients` directly. That removes a throwaway file, removes the swap step, and removes
> the risk of mock data reaching a demo.

You need two things from the lead before this section runs:

1. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in your `.env.local`.
   Both are public-safe. You do **not** need the secret key for this section.
2. The test operator credentials. Nothing renders until you are signed in — `proxy.ts`
   redirects a signed-out visitor to `/login`.

Two clients are already in the database, so the switcher has something to switch between
without waiting for Dev B's create form:

```
Sample Founder One — Northside Labs
Sample Founder Two — Harbour & Co
```

**If your list comes back empty, run this before debugging your query:**

```bash
npx tsx scripts/check-client-visibility.ts
```

It signs in as the test operator and prints exactly what the database will return. This
matters because row-level security hiding a row throws **no error and makes no failed
request** — the list is simply empty, so there is nothing in the console or the network tab
to find. The script separates "my query is wrong" from "the rows are hidden from me".

### 7.2 The switcher

Create `components/workspace/client-switcher.tsx`:

```tsx
'use client'

import { useRouter, useParams, usePathname } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ClientOption = { id: string; name: string; company: string | null }

export function ClientSwitcher({ clients }: { clients: ClientOption[] }) {
  const router = useRouter()
  const params = useParams<{ clientId?: string }>()
  const pathname = usePathname()

  function onChange(nextId: string) {
    // Stay on the same screen, just under a different client:
    //   /c/<old>/posts  ->  /c/<new>/posts
    const rest = pathname.split('/').slice(3).join('/')
    router.push(`/c/${nextId}${rest ? '/' + rest : ''}`)
  }

  if (clients.length === 0) {
    return <p className="text-muted-foreground px-2 text-sm">No clients yet</p>
  }

  return (
    <Select value={params.clientId} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Choose a client" />
      </SelectTrigger>
      <SelectContent>
        {clients.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
            {c.company ? ` — ${c.company}` : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
```

> **Why it rebuilds the path instead of always going to the client's home page:** an operator
> comparing the same screen across two clients should land on that screen, not be thrown back
> to the start. `pathname.split('/').slice(3)` drops the empty string, `c`, and the old id,
> leaving whatever came after.

### 7.3 The protected layout

Create `app/(app)/layout.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientSwitcher } from '@/components/workspace/client-switcher'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // getClaims(), not getSession(). getSession() trusts the cookie without
  // revalidating it.
  const { data: claims } = await supabase.auth.getClaims()
  if (!claims?.claims) redirect('/login')

  // No .eq('operator_id', ...) here on purpose. The security rule in the
  // database already restricts this to the signed-in operator's clients.
  // Filtering again in the query would hide a broken policy rather than
  // expose it.
  const { data: clients } = await supabase.from('clients').select('id, name, company').order('name')

  return (
    <div className="flex min-h-screen">
      <aside className="border-border w-64 shrink-0 border-r p-4">
        <div className="font-display mb-6 text-lg font-semibold">Renegade</div>
        <ClientSwitcher clients={clients ?? []} />
      </aside>
      <div className="min-w-0 flex-1 p-8">{children}</div>
    </div>
  )
}
```

---

## 8. Client list and create form

**Dev B.** Query `clients` directly — the mock step in 7.1 is skipped, and the same two
prerequisites apply: the two public env values in `.env.local`, and the test operator
credentials to sign in with. Two sample clients are already seeded, so 8.1 has rows to render
before you build the form in 8.2.

If your list is empty, run `npx tsx scripts/check-client-visibility.ts` before debugging the
query — see the note at the end of 7.1 for why.

### 8.1 The list

Create `app/(app)/clients/page.tsx`:

```tsx
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, name, company, status, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="border-destructive/30 bg-destructive/5 rounded-lg border p-6">
        <h2 className="mb-1 font-semibold">Could not load clients</h2>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
    )
  }

  // Empty state with a next action - never a blank panel. (CLAUDE.md, UI standards)
  if (!clients || clients.length === 0) {
    return (
      <div className="border-border rounded-lg border border-dashed p-12 text-center">
        <h2 className="font-display mb-2 text-xl font-semibold">No clients yet</h2>
        <p className="text-muted-foreground mx-auto mb-6 max-w-sm text-sm">
          A client is a founder whose LinkedIn presence you manage. Everything else in Renegade
          hangs off one.
        </p>
        <Button asChild>
          <Link href="/clients/new">Add your first client</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Clients</h1>
        <Button asChild>
          <Link href="/clients/new">Add client</Link>
        </Button>
      </div>

      <ul className="flex flex-col">
        {clients.map((c) => (
          <li key={c.id} className="border-border border-t">
            <Link href={`/c/${c.id}`} className="hover:bg-muted/50 block px-2 py-4">
              <div className="font-medium">{c.name}</div>
              <div className="text-muted-foreground text-sm">{c.company ?? '—'}</div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
```

### 8.2 Create a client

Create `app/(app)/clients/new/actions.ts`:

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const NewClient = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  company: z.string().trim().max(120).optional(),
})

export async function createClientAction(_prev: unknown, formData: FormData) {
  const parsed = NewClient.safeParse({
    name: formData.get('name'),
    company: formData.get('company') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: claims } = await supabase.auth.getClaims()
  const operatorId = claims?.claims?.sub
  if (!operatorId) return { error: 'You are not signed in.' }

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...parsed.data, operator_id: operatorId })
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/clients')
  redirect(`/c/${data.id}`)
}
```

> **`operator_id` is set from the session, never from the form.** If it came from a hidden
> form field, anyone could post a different operator's id and create rows in their workspace.
> The `with check` clause in the policy would reject it — but relying on that alone means one
> wrong policy edit opens a hole. Set it server-side as well.

Then `app/(app)/clients/new/page.tsx` — a form posting to that action, with `useActionState`
for the error. Same field pattern as the login page.

### 8.3 The client workspace layout

Create `app/(app)/c/[clientId]/layout.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params // params is a Promise in Next 15+
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, company')
    .eq('id', clientId)
    .single()

  // If this id belongs to another operator the security rule returns nothing,
  // so the visitor gets a 404 - the same answer as an id that does not exist.
  // That is deliberate: a 403 would confirm the client is real.
  if (!client) notFound()

  return (
    <>
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold">{client.name}</h1>
        {client.company && <p className="text-muted-foreground text-sm">{client.company}</p>}
      </header>
      {children}
    </>
  )
}
```

---

## 9. The security tests

**Dev D** writes these; **Lead** reviews. `CLAUDE.md` makes the first one mandatory.

### 9.1 Configure Vitest

Create `vitest.config.mts`:

> **The `.mts` extension matters.** With a plain `.ts` the file is loaded as CommonJS while
> containing ESM syntax, and Vite prints a deprecation warning saying this will stop working
> in a future major version. The alternative — adding `"type": "module"` to `package.json` —
> would change module resolution for the whole Next.js app, which is not worth it for one
> config file.

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 20000, // real network calls to Supabase
  },
})
```

Create `tests/setup.ts`:

```typescript
import 'dotenv/config'
import { config } from 'dotenv'

// Vitest does not read .env.local the way Next.js does.
config({ path: '.env.local' })
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

### 9.2 The tests

Create `tests/rls.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const PUBLISHABLE = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const SECRET = process.env.SUPABASE_SECRET_KEY!

/** Admin client - bypasses every security rule. Test setup only. */
const admin = createClient(URL, SECRET, { auth: { persistSession: false } })

const PASSWORD = 'test-password-not-secret'
const emailA = `rls-a-${Date.now()}@example.com`
const emailB = `rls-b-${Date.now()}@example.com`

let userA = ''
let userB = ''
let clientOfA = ''

async function makeOperator(email: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { role: 'operator', full_name: email },
  })
  if (error) throw error
  return data.user.id
}

/** A normal signed-in client, exactly like the app uses. */
async function signedInAs(email: string) {
  const c = createClient(URL, PUBLISHABLE, { auth: { persistSession: false } })
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD })
  if (error) throw error
  return c
}

beforeAll(async () => {
  userA = await makeOperator(emailA)
  userB = await makeOperator(emailB)

  const { data, error } = await admin
    .from('clients')
    .insert({ operator_id: userA, name: 'Operator A client', company: 'A Ltd' })
    .select('id')
    .single()
  if (error) throw error
  clientOfA = data.id
})

afterAll(async () => {
  await admin.from('clients').delete().eq('id', clientOfA)
  await admin.auth.admin.deleteUser(userA)
  await admin.auth.admin.deleteUser(userB)
})

describe('row-level security on clients', () => {
  it('lets an operator read their own client', async () => {
    const a = await signedInAs(emailA)
    const { data } = await a.from('clients').select('id').eq('id', clientOfA)

    // This test is not filler. Without it a policy that blocks EVERYTHING
    // would make the next two tests pass while the app is completely broken.
    expect(data).toHaveLength(1)
  })

  it('does not let another operator read it', async () => {
    const b = await signedInAs(emailB)
    const { data, error } = await b.from('clients').select('id').eq('id', clientOfA)

    // Postgres returns no rows rather than an error - the row is invisible,
    // not forbidden. Both of these assertions matter.
    expect(error).toBeNull()
    expect(data).toHaveLength(0)
  })

  it('does not let another operator write to it', async () => {
    const b = await signedInAs(emailB)
    await b.from('clients').update({ name: 'hijacked' }).eq('id', clientOfA)

    // The update reports no error - it simply matches no rows, because the row
    // is invisible to B. Proving it failed means reading the row back as admin.
    const { data: check } = await admin.from('clients').select('name').eq('id', clientOfA).single()
    expect(check?.name).toBe('Operator A client')
  })

  it('shows nothing at all to a signed-out visitor', async () => {
    const anon = createClient(URL, PUBLISHABLE, { auth: { persistSession: false } })
    const { data } = await anon.from('clients').select('id')
    expect(data).toHaveLength(0)
  })
})
```

### Verify section 9

```bash
npm test
```

**All four must pass.** If the first one fails, your policy is too strict and the app will
show empty screens. If the second or third fails, **stop everything** — that is a real data
leak, not a test problem.

> Each run creates and deletes two accounts in the **dev** project. Never point these tests at
> `renegade-prod`.

> **These tests do not run in CI, and that is deliberate.** They need `SUPABASE_SECRET_KEY`,
> and the CI workflow holds only placeholder values — repository secrets are not available to
> pull requests opened from forks on a public repo, so a workflow depending on them would fail
> for any outside contributor.
>
> The consequence is that **nothing stops someone merging a broken policy.** CI proves the
> code compiles; only `npm test` proves the data is isolated. Run it locally before merging
> anything that touches a migration or a policy. `CLAUDE.md` makes the first of these tests
> mandatory — which means a person has to remember to run it.

---

## 10. End-to-end check

Do this by hand before calling Phase 1 done.

1. `npm run dev`
2. Go to `/signup`, create **operator A**. You land on `/clients`, empty state shows.
3. Add a client. You land on `/c/<id>` and see their name.
4. Add a second client. The switcher shows both and moves between them.
5. **Copy the URL of client 1.**
6. Sign out (or open a private window), go to `/signup`, create **operator B**.
7. **Paste operator A's client URL.** You must get a **404**.
8. Open two tabs, a different client in each, refresh both. Each tab keeps its own client.

Step 7 is the whole point of Phase 1. Step 8 is why the client id is in the URL.

---

## 11. Done when

- [ ] `proxy.ts` exists (not `middleware.ts`) and redirects signed-out visitors
- [ ] Migration 0002 pushed; `types/database.ts` regenerated
- [ ] `clients` and `client_users` both have RLS on **and** policies
- [ ] Signing up creates a row in `operators` automatically
- [ ] An operator sees only their own clients
- [ ] Switcher changes client and keeps you on the same screen
- [ ] Another operator's client URL returns 404
- [ ] `npm test` — four tests, all passing
- [ ] Empty, loading and error states on every screen
- [ ] Mock client data deleted
- [ ] Decisions recorded in `DECISIONS.md`

---

## 12. Troubleshooting

| What you see                                                       | What is wrong                                                                                                                                                                                        |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/c/anything` 404s instead of redirecting to `/login`              | `proxy.ts` is not running. Check the filename and that the export is named `proxy`, not `middleware`.                                                                                                |
| Logged out at random, every few requests                           | `updateSession` returned a new `NextResponse` instead of the `supabaseResponse` that `setAll` built.                                                                                                 |
| `cookies() should be awaited`                                      | Next 15+ made it async. `const cookieStore = await cookies()`.                                                                                                                                       |
| Every query returns `[]`, no error                                 | RLS is on with no matching policy, or you are signed out. The most common Phase 1 confusion — it looks exactly like "the data did not save". Run `npx tsx scripts/check-client-visibility.ts` first. |
| Client list empty but the rows exist in the dashboard              | The dashboard reads as admin and ignores RLS; your app does not. Same script as above.                                                                                                               |
| `Email address "..." is invalid` on signup                         | Supabase validates deliverability. The domain has no usable MX record — `example.com` publishes a null MX. Use a real address with a `+tag`.                                                         |
| `npm run build` fails: `Error occurred prerendering page "/login"` | Something below that route calls `useSearchParams` without a `<Suspense>` boundary above it. `npm run dev` will not show this.                                                                       |
| `infinite recursion detected in policy`                            | A policy on `clients` references `client_users` and vice versa without the `operator_owns_client` helper. The helper must be `security definer`.                                                     |
| Signup works but every screen is empty                             | The `operators` row was not created. Check that signup sends `role: 'operator'` in `options.data`.                                                                                                   |
| `new row violates row-level security policy` on insert             | `operator_id` does not match `auth.uid()`. Set it from the session, not from the form.                                                                                                               |
| Tests: `Invalid API key`                                           | `SUPABASE_SECRET_KEY` missing from `.env.local`, or `tests/setup.ts` is not loading it.                                                                                                              |
| Tests: `User already registered`                                   | A previous run crashed before `afterAll`. Delete the leftover `rls-a-*` / `rls-b-*` users in the Supabase dashboard.                                                                                 |
| `Email not confirmed` on login                                     | **Confirm email** has been switched back on in the dashboard. It is off on the dev project (section 5.3).                                                                                            |
| `params.clientId` is undefined                                     | `params` is a Promise in Next 15+. `const { clientId } = await params`.                                                                                                                              |

---

## 13. What Phase 2 starts with

Phase 2 is intake: the public `/apply` form with the $5,000 filter and AI fit scoring, the
operator's application queue, the acceptance email, and the onboarding form behind a token
link.

Two things from Phase 1 carry straight into it:

- **The `clients` table gains columns** — `status`, `fit_score`, `fit_reasoning`,
  `onboarding_token`. A new migration, not an edit to 0002.
- **Public routes write server-side.** `/apply` and `/onboarding/<token>` have no signed-in
  user, so their database writes run in a route handler using the secret key — never through
  an anonymous insert policy on a public table.
