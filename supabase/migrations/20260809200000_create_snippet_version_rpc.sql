-- Make snippet version creation atomic.
--
-- The client used to do: verify parent snippet -> select max(version_number) ->
-- insert max+1. Three round trips, and two concurrent saves could both read the
-- same max and collide on idx_snippet_version_unique. This does it in one
-- statement inside the database.

-- Already created by migration 001; restated so this file is self-sufficient
-- when applied to a fresh database. It is the final guard against a duplicate
-- version_number even with the function in place.
create unique index if not exists idx_snippet_version_unique
on public.snippet_version (snippet_id, version_number);

create or replace function public.create_snippet_version(
	p_snippet_id uuid,
	p_content text,
	p_language varchar,
	p_name varchar,
	p_tags text
)
returns public.snippet_version
language plpgsql
security invoker
set search_path = public
as $$
declare
	caller_id uuid := auth.uid();
	created_version public.snippet_version;
begin
	if caller_id is null then
		raise exception 'Not authenticated';
	end if;

	-- The foreign key only proves the snippet exists, not that the caller owns
	-- it. Keep the ownership check the client used to make.
	if not exists (
		select 1
		from public.snippet
		where snippet_id = p_snippet_id
			and user_id = caller_id
	) then
		raise exception 'Snippet not found';
	end if;

	insert into public.snippet_version (
		snippet_id,
		user_id,
		content,
		language,
		name,
		tags,
		version_number
	)
	select
		p_snippet_id,
		caller_id,
		p_content,
		p_language,
		p_name,
		p_tags,
		coalesce(max(version_number), 0) + 1
	from public.snippet_version
	where snippet_id = p_snippet_id
	returning * into created_version;

	return created_version;
end;
$$;

grant execute on function public.create_snippet_version(
	uuid, text, varchar, varchar, text
) to authenticated;
