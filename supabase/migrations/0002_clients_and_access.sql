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
