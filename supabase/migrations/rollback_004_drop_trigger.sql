-- Rollback for 004_snippet_version_cleanup_trigger.sql

DROP TRIGGER IF EXISTS snippet_version_max_versions ON snippet_version;

DROP FUNCTION IF EXISTS enforce_max_snippet_versions();
