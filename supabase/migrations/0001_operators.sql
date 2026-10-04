-- Operators are the branding specialists who use the platform.
-- One row per operator, keyed to Supabase's built-in auth user.
--
-- This is the first migration. Its real job is to prove the sync loop works:
--   write .sql  ->  supabase db push  ->  supabase gen types  ->  types/database.ts
-- Phase 1 builds `clients` and everything else on top of it.

create table operators (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  created_at  timestamptz not null default now()
);

-- RLS is enabled in the SAME migration that creates the table. Build this habit:
-- a table created without RLS is readable by anyone holding the anon key.
alter table operators enable row level security;

create policy "operators read own row"
  on operators for select
  using ( auth.uid() = id );

create policy "operators update own row"
  on operators for update
  using ( auth.uid() = id );
