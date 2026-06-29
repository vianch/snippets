-- Pluggable snippet storage (POC).
-- Single global row holding the active backend and its encrypted connection.
-- Only the server (service-role key, in app/api/storage/*) reads or writes this;
-- RLS is enabled with no policies so anon/authenticated clients cannot touch it.
-- The `secret` column is an AES-256-GCM blob (see app/lib/storage/crypto.server.ts)
-- of the StorageConnection JSON, so DB passwords / tokens are never stored plain.

create table if not exists public.storage_config (
	id integer primary key,
	backend text not null,
	secret text not null,
	updated_at timestamptz default now()
);

alter table public.storage_config enable row level security;
-- Intentionally no policies: the service-role key bypasses RLS; everyone else is denied.
