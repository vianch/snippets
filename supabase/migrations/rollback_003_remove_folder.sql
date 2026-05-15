-- Rollback for 003_add_folder_to_snippet.sql

DROP INDEX IF EXISTS snippet_user_folder_idx;

ALTER TABLE snippet
	DROP COLUMN IF EXISTS folder;
