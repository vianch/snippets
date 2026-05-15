-- Add folder column to snippet table for single-level folder organization.
-- Folders are scoped per user (combined with the existing user_id RLS gate).

ALTER TABLE snippet
	ADD COLUMN IF NOT EXISTS folder TEXT;

-- Composite partial index supports the per-user "snippets in folder X" query.
CREATE INDEX IF NOT EXISTS snippet_user_folder_idx
	ON snippet (user_id, folder)
	WHERE folder IS NOT NULL;
