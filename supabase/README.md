# Supabase schema and migrations

`migrations/` contains the database changes used by Snippets. Apply migrations to a development Supabase project in timestamp/number order, and review each policy change alongside the application query that depends on it.

Migration topics include snippet version history, public sharing, folders, soft-delete policy fixes, role claims, MFA/admin session revocation, storage backend configuration, query/index optimization, and version RPC/cleanup behavior. Files prefixed with `rollback_` reverse the corresponding earlier change where provided.

Browser and server access code lives in `app/lib/supabase/`; application-managed SQL storage is under `app/lib/storage/`. Supabase is the default auth provider and the default snippet storage backend, but configured accounts can use supported external SQL databases.

Keep service credentials and connection strings in environment variables or encrypted server-side configuration. Never commit them or include them in screenshots. Row-level security and server-side role checks are part of the data boundary; a hidden UI control is not authorization.
