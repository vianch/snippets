-- Migration: force sign-out (disconnect) support
-- Lets an admin revoke a user's active auth sessions, forcing them to log in
-- again with their email + password. Exposed as an RPC callable by the
-- service-role client only (the admin API route).
--
-- Deleting the user's rows from auth.sessions invalidates their sessions:
-- supabase.auth.getUser() (called by the proxy on every protected request)
-- then fails server-side and the user is redirected to /login. Linked
-- refresh tokens cascade from the sessions table.
--
-- IDEMPOTENT.

create or replace function public.admin_revoke_user_sessions(target_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
	delete from auth.sessions where user_id = target_user;
end;
$$;

revoke execute on function public.admin_revoke_user_sessions(uuid)
	from authenticated, anon, public;
grant execute on function public.admin_revoke_user_sessions(uuid) to service_role;

-- Refresh PostgREST's schema cache so the RPC is callable immediately (otherwise
-- the API returns "Could not find the function ... in the schema cache").
notify pgrst, 'reload schema';
