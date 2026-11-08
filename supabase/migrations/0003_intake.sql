-- ===========================================================================
-- Phase 2: intake.
--
-- An application arrives before a client exists, becomes a client on
-- acceptance, and the onboarding token is what lets an unauthenticated
-- founder fill in their own questionnaire.
-- ===========================================================================

-- pgvector, in the `extensions` schema to match pgcrypto and uuid-ossp.
-- Nothing reads these vectors until the post writer in Phase 4, but embedding
-- at upload means the data is ready when that arrives.
create extension if not exists vector with schema extensions;

-- ---------------------------------------------------------------------------
-- 1. applications
--
-- The ONLY table in the project without client_id, because it exists before
-- the client does. Documented exception to rule 1 in CLAUDE.md.
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
  -- "not scored yet", not "scored zero" - the operator UI must tell them
  -- apart, or a good lead gets rejected because the model timed out.
  fit_score            integer check (fit_score between 0 and 100),
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
--
-- The type is written extensions.vector rather than bare vector because the
-- extension lives in the extensions schema, which is on the postgres role's
-- search_path but not on authenticated's.
-- ---------------------------------------------------------------------------
create table source_documents (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id) on delete cascade,
  type          text not null
                check (type in ('questionnaire', 'past_post', 'reference_post',
                                'transcript', 'brand_kit')),
  content       text,
  storage_path  text,
  embedding     extensions.vector(1536),
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

-- ---------------------------------------------------------------------------
-- 5. Booking the first interview.
--
-- A URL the operator pastes once, and a timestamp saying the client booked.
-- This is NOT the FYP-2 meeting integration, which creates the meeting and
-- pulls the transcript through an API. This is a text column and a date.
-- ---------------------------------------------------------------------------
alter table operators add column booking_url text;
alter table clients   add column interview_booked_at timestamptz;

-- ---------------------------------------------------------------------------
-- 6. Storage. Private bucket - uploads are client material, never public.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do nothing;

-- Files live at <client_id>/<filename>, so the first path segment is the
-- client id and that is what the policy checks.
--
-- The uuid regex guard is not decoration: ::uuid raises on a malformed string,
-- and an error inside a policy fails the whole query rather than hiding one
-- row. Only our own code writes to this bucket, but a policy should not be one
-- bad path away from breaking every listing.
create policy "operator manages own client files"
  on storage.objects for all
  using (
    bucket_id = 'client-files'
    and (storage.foldername(name))[1] ~
        '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    and operator_owns_client((storage.foldername(name))[1]::uuid)
  )
  with check (
    bucket_id = 'client-files'
    and (storage.foldername(name))[1] ~
        '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
    and operator_owns_client((storage.foldername(name))[1]::uuid)
  );
