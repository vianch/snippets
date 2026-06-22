-- Migration: Custom Access Token (JWT) Hook
-- Injects the user's application role as a `user_role` claim into every issued
-- access token. This lets Next.js middleware authorize requests by reading the
-- JWT claim with NO database round-trip.
--
-- IMPORTANT — the hook function alone does nothing until it is REGISTERED:
--   • Hosted project: Dashboard → Authentication → Hooks →
--     "Customize Access Token (JWT) Claims" → select
--     `public.custom_access_token_hook`, then Save. New claims appear on the
--     next token issue/refresh.
--   • Local dev (supabase start): add to supabase/config.toml:
--         [auth.hook.custom_access_token]
--         enabled = true
--         uri = "pg-functions://postgres/public/custom_access_token_hook"
--
-- The application reads the claim with a database fallback, so it behaves
-- correctly whether or not the hook is registered (the fallback just costs one
-- extra query until registration is done).
--
-- This migration is IDEMPOTENT.

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
	claims jsonb;
	resolved_role public.app_role;
begin
	select role
	into resolved_role
	from public.user_roles
	where user_id = (event->>'user_id')::uuid;

	claims := coalesce(event->'claims', '{}'::jsonb);

	if resolved_role is not null then
		claims := jsonb_set(claims, '{user_role}', to_jsonb(resolved_role));
	else
		-- Anyone without an explicit row is treated as a plain user.
		claims := jsonb_set(claims, '{user_role}', to_jsonb('user'::text));
	end if;

	event := jsonb_set(event, '{claims}', claims);

	return event;
end;
$$;

-- ─────────────────────────── permissions for the hook ───────────────────────
-- The GoTrue auth server runs the hook as `supabase_auth_admin`; it needs to
-- execute the function and read the roles table. Everyone else is locked out of
-- executing the hook directly.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;

grant select on table public.user_roles to supabase_auth_admin;

-- Allow the auth admin to read roles from inside the hook (RLS bypass for this
-- specific principal only).
drop policy if exists "Auth admin reads roles for token hook" on public.user_roles;
create policy "Auth admin reads roles for token hook"
	on public.user_roles
	as permissive
	for select
	to supabase_auth_admin
	using (true);
