-- ============================================================================
-- profiles: a public-schema mirror of auth.users
-- ============================================================================
-- Supabase keeps `auth.users` in a separate, restricted schema you can't
-- query directly with the anon/authenticated roles or join against freely.
-- The standard pattern is a `public.profiles` table with the same primary
-- key as auth.users, kept in sync via a trigger, that you *can* query,
-- join, and extend with app-specific columns (name, avatar, plan, etc).

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security: off by default is dangerous, especially for a
-- financial app. Enable it immediately, before writing any policies.
alter table public.profiles enable row level security;

-- Users can read their own profile only.
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile only (e.g. changing display name).
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- No insert/delete policies for regular users: rows are created by the
-- trigger below (as the postgres role, which bypasses RLS) and deleted
-- automatically via the `on delete cascade` when the auth.users row goes.

-- ----------------------------------------------------------------------------
-- Trigger: on_auth_user_created
-- ----------------------------------------------------------------------------
-- Fires after a new row lands in auth.users (i.e. right after sign up,
-- including OAuth and magic-link sign ups) and inserts a matching
-- profiles row. `security definer` is required because auth.users lives
-- in a schema the trigger's caller (Supabase Auth) can't normally write
-- into public.profiles under RLS — the function runs with the
-- privileges of its owner instead.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    -- Populated from options.data in supabase.auth.signUp() on the
    -- client, or from the OAuth provider's profile for social logins.
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Keep updated_at current on every profile edit.
-- ----------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_profiles_updated on public.profiles;

create trigger on_profiles_updated
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();
