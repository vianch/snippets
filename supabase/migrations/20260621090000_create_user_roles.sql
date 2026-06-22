-- Migration: Role-Based Access Control (RBAC) foundation
-- Creates the `app_role` enum, the `user_roles` table, supporting helpers,
-- Row Level Security, a signup trigger, backfill, and the initial admin seed.
--
-- This migration is IDEMPOTENT: every statement guards against re-running so it
-- can be applied safely against a database that already has part of it.

-- ───────────────────────────── 1. app_role enum ─────────────────────────────
-- Two-role model. New roles can be appended later with `alter type ... add value`.
do $$
begin
	if not exists (select 1 from pg_type where typname = 'app_role') then
		create type public.app_role as enum ('admin', 'user');
	end if;
end
$$;

-- ──────────────────────────── 2. user_roles table ───────────────────────────
-- One row per user, keyed to auth.users. Deleting a user cascades the role away.
create table if not exists public.user_roles (
	user_id uuid primary key references auth.users (id) on delete cascade,
	role public.app_role not null default 'user',
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

comment on table public.user_roles is
	'Application authorization role for each auth user. One row per user; defaults to ''user''.';

-- Keep updated_at fresh on every change.
create or replace function public.set_user_roles_updated_at()
returns trigger
language plpgsql
as $$
begin
	new.updated_at = now();

	return new;
end;
$$;

drop trigger if exists trg_user_roles_updated_at on public.user_roles;
create trigger trg_user_roles_updated_at
	before update on public.user_roles
	for each row execute function public.set_user_roles_updated_at();

-- ───────────────────────────── 3. is_admin() helper ─────────────────────────
-- SECURITY DEFINER so it can read user_roles without tripping the table's own
-- RLS (which itself calls is_admin()), avoiding infinite recursion. search_path
-- is pinned to '' to prevent search-path hijacking.
create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
	select exists (
		select 1
		from public.user_roles
		where user_id = check_user_id
			and role = 'admin'
	);
$$;

-- ──────────────────────────────── 4. RLS ────────────────────────────────────
alter table public.user_roles enable row level security;

-- A user may read their own role; an admin may read every role.
drop policy if exists "Read own role or admin reads all" on public.user_roles;
create policy "Read own role or admin reads all"
	on public.user_roles
	for select
	to authenticated
	using (user_id = auth.uid() or public.is_admin());

-- Only admins may write roles. This is the privilege-escalation guard: a normal
-- client can never insert/update/delete a row to promote itself.
drop policy if exists "Admins manage roles" on public.user_roles;
create policy "Admins manage roles"
	on public.user_roles
	for all
	to authenticated
	using (public.is_admin())
	with check (public.is_admin());

-- ─────────────────────── 5. auto-assign role on signup ──────────────────────
-- Every new auth user gets a 'user' row automatically.
create or replace function public.handle_new_user_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	insert into public.user_roles (user_id, role)
	values (new.id, 'user')
	on conflict (user_id) do nothing;

	return new;
end;
$$;

drop trigger if exists on_auth_user_created_assign_role on auth.users;
create trigger on_auth_user_created_assign_role
	after insert on auth.users
	for each row execute function public.handle_new_user_role();

-- ─────────────────────────── 6. backfill existing ───────────────────────────
-- Give every pre-existing user a default role so nobody is left without one.
insert into public.user_roles (user_id, role)
select id, 'user'
from auth.users
on conflict (user_id) do nothing;

-- ───────────────────────────── 7. seed the admin ────────────────────────────
-- Promote the designated administrator. Runs whether or not the account exists
-- yet (no-op if it doesn't); re-running keeps the role at 'admin'.
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'user@domain.com'
on conflict (user_id) do update set role = 'admin', updated_at = now();

-- ──────────────────────────────── 8. grants ─────────────────────────────────
grant select on public.user_roles to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
