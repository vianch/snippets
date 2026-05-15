-- P1 #9 — atomic "keep the last 5 versions per snippet" enforcement.
--
-- The previous JS-side enforcement (in queries.ts saveSnippetVersion) was racy:
-- it fetched all versions, then deleted the older ones in a second round-trip.
-- Two concurrent saves of the same snippet (e.g. autosave + manual save) could
-- interleave and prune the wrong rows.
--
-- This Postgres trigger runs synchronously inside the same transaction as the
-- INSERT, so retention is enforced atomically per snippet.

CREATE OR REPLACE FUNCTION enforce_max_snippet_versions()
RETURNS TRIGGER AS $$
BEGIN
	DELETE FROM snippet_version
	WHERE version_id IN (
		SELECT version_id FROM snippet_version
		WHERE snippet_id = NEW.snippet_id
		ORDER BY version_number DESC
		OFFSET 5
	);

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS snippet_version_max_versions ON snippet_version;

CREATE TRIGGER snippet_version_max_versions
	AFTER INSERT ON snippet_version
	FOR EACH ROW
	EXECUTE FUNCTION enforce_max_snippet_versions();
