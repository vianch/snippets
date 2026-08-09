-- Optimize the primary snippet list query and avoid per-row auth.uid() evaluation.

create index if not exists idx_snippet_user_updated_active
on public.snippet (user_id, updated_at desc)
where state <> 'inactive';

alter policy "Users can manage their own snippet versions"
on public.snippet_version
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- Replace overlapping SELECT policies with one policy covering both
-- authenticated owners and intentionally public snippets.
drop policy if exists "Enable all for users based on user_id" on public.snippet;
drop policy if exists "Anyone can read public snippets" on public.snippet;

create policy "Users can read own or public snippets"
on public.snippet
for select
to public
using (
	((select auth.uid()) = user_id)
	or (
		is_public = true
		and state in ('active', 'favorite')
	)
);

create policy "Users can insert own snippets"
on public.snippet
for insert
to public
with check ((select auth.uid()) = user_id);

create policy "Users can update own snippets"
on public.snippet
for update
to public
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own snippets"
on public.snippet
for delete
to public
using ((select auth.uid()) = user_id);

-- Keep role reads efficient while preserving admin access.
drop policy if exists "Admins manage roles" on public.user_roles;
drop policy if exists "Read own role or admin reads all" on public.user_roles;

create policy "Read own role or admin reads all"
on public.user_roles
for select
to authenticated
using (
	(user_id = (select auth.uid()))
	or (select public.is_admin((select auth.uid())))
);

create policy "Admins insert roles"
on public.user_roles
for insert
to authenticated
with check ((select public.is_admin((select auth.uid()))));

create policy "Admins update roles"
on public.user_roles
for update
to authenticated
using ((select public.is_admin((select auth.uid()))))
with check ((select public.is_admin((select auth.uid()))));

create policy "Admins delete roles"
on public.user_roles
for delete
to authenticated
using ((select public.is_admin((select auth.uid()))));
