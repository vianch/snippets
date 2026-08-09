# Snippets performance recommendations

This document collects the highest-impact improvements for the Snippets app based on the current Supabase schema, the app's query layer, and the database performance signals.

## What I reviewed

- Supabase schema for `public.snippet`, `public.snippet_version`, and `public.user_roles`
- Frontend query layer in `app/lib/supabase/queries.ts`
- Snippet model in `app/lib/models/Snippet.ts`
- Repository conventions in `CLAUDE.md`

## Main findings

The app is already structured sensibly:

- `snippet` stores the current snippet record
- `snippet_version` stores the version history
- `user_roles` stores authorization state
- the browser client uses the public Supabase client and queries are filtered by `user_id`

The biggest performance wins are in query shape, RLS evaluation, and a small number of targeted indexes.

## 1. Add an index for the main snippet list query

### Why

The main list query in `app/lib/supabase/queries.ts` fetches snippets by `user_id`, excludes inactive snippets, and orders by `updated_at desc`.

That means the database should have an index that matches this access pattern.

### Suggested index

```sql
create index concurrently if not exists idx_snippet_user_updated_active
on public.snippet (user_id, updated_at desc)
where state <> 'deleted';
```

### Notes

- If the app uses a different inactive value, adjust the partial predicate to match the real state value.
- If the app always excludes inactive snippets, this index should help both list views and recently edited views.

## 2. Make RLS policies cheaper

### Why

The database advisor flagged the RLS policies on:

- `public.snippet`
- `public.snippet_version`
- `public.user_roles`

The issue is that `auth.uid()` is being evaluated per row instead of once per statement.

### Suggested policy change

Replace:

```sql
auth.uid() = user_id
```

with:

```sql
(select auth.uid()) = user_id
```

### Example

```sql
alter policy "Enable all for users based on user_id"
on public.snippet
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
```

Do the same for the `snippet_version` and `user_roles` policies that rely on `auth.uid()`.

## 3. Keep the query filters in the frontend

### Why

The current query layer already does this well:

```ts
.from("snippet")
.select()
.order("updated_at", { ascending: false })
.match({ user_id: userId })
.neq("state", SnippetState.Inactive)
```

That is good because the application is not depending only on RLS for filtering. The app is helping PostgreSQL build a better plan.

### Recommendation

Keep the explicit filters in the client.

For snippet search and list views, avoid broad unfiltered selects.

## 4. Remove or verify redundant indexes

### Current candidates

- `idx_snippet_version_snippet_id`
- `idx_snippet_fts`
- `idx_snippet_is_public`
- `idx_snippet_version_created_at`

### Why

Some of these have not been used recently.

That does not mean they are useless, but unused indexes:

- add write overhead
- add storage overhead
- increase maintenance cost

### Suggested action

- Keep `idx_snippet_fts` if full-text search is still a core feature.
- Review `idx_snippet_is_public` and `idx_snippet_version_created_at` against actual usage.
- Consider removing `idx_snippet_version_snippet_id` if the unique index on `(snippet_id, version_number)` is sufficient for your version lookup patterns.

## 5. Consider cursor pagination later

### Why

The app currently uses offset pagination in the snippet list query.

That is fine at small scale, but offset gets slower as the user has more snippets.

### Future-friendly pattern

Use keyset pagination with:

- `updated_at`
- `snippet_id`

### Example shape

```sql
where
  user_id = $1
  and state <> 'deleted'
  and (
    updated_at < $2
    or (updated_at = $2 and snippet_id < $3)
  )
order by updated_at desc, snippet_id desc
limit 50
```

This is not urgent for the current dataset, but it is the better long-term shape.

## 6. Keep the current core schema

### Recommended to keep

- `snippet` as the current-state table
- `snippet_version` as the version-history table
- `user_roles` as a compact role table
- generated `fts` column for search
- `public_slug` for public sharing

### Why

The current schema is already a good fit for the product. The best improvements are incremental, not a redesign.

## 7. Client-side improvements worth doing

### In `app/lib/models/Snippet.ts`

The new snippet model initializes a full snippet object locally.

That is fine, but be careful not to create unnecessary writes for untouched fields.

### In `app/lib/supabase/queries.ts`

The version save flow fetches the latest version number before inserting the next one.

That works, but under higher write concurrency it would be safer to derive the next version number in a single database transaction or server-side function.

## Suggested database changes in priority order

1. Add the main snippet list index on `(user_id, updated_at desc)` with a partial predicate for active rows.
2. Rewrite RLS policies to use `(select auth.uid())`.
3. Verify whether `idx_snippet_version_snippet_id` is redundant.
4. Review unused indexes and keep only the ones that match real app behavior.
5. Move snippet list pagination from offset to cursor pagination when the table grows.

## Suggested code changes in priority order

1. Keep filtering by `user_id` and `state` in the query layer.
2. Add a dedicated helper for snippet-list queries so all list views use the same shape.
3. Consider a server-side version insert path to avoid a race on `version_number`.
4. Avoid broad `select()` calls where the UI only needs a small subset of fields.

## Example query helper direction

A shared list helper could look like this:

```ts
export const getUserSnippets = async () => {
	const userId = await getUserIdBySession();

	if (!userId) {
		return [];
	}

	const { data } = await supabase
		.from("snippet")
		.select(
			"snippet_id, name, updated_at, state, tags, folder, is_public, public_slug, language"
		)
		.eq("user_id", userId)
		.neq("state", SnippetState.Inactive)
		.order("updated_at", { ascending: false });

	return data ?? [];
};
```

That reduces payload size for list views and keeps the query shape consistent.

## Supabase settings to apply

If you want to tune the project itself, the main settings to review are:

- Performance Advisor findings
- Security Advisor findings
- RLS policies
- indexes
- query plans for the list and version queries
- logs for slow or repeated operations

The most useful immediate change is the RLS init-plan fix, because it is low risk and has direct performance value.

## Final recommendation

Do not redesign the app. The current architecture is already decent.

The best speed gains will come from:

- one better index on `snippet`
- cheaper RLS evaluation
- removing any redundant indexes
- narrowing list-view selects
- switching to cursor pagination later if the dataset grows
