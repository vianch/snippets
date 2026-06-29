import { SnippetState } from "@/lib/constants/core";
import {
	SnippetTableName,
	SqlDialect,
} from "@/lib/constants/storage.constants";
import { SnippetVersionTableName } from "@/lib/constants/storage.constants";
import { createSchemaSql } from "@/lib/storage/schema";

// One SnippetStorage implementation shared by every server-side SQL backend
// (PostgreSQL, MySQL, Turso/libSQL, local SQLite). Only the thin `SqlDriver`
// differs per backend — the SQL is written once here. Placeholders are `?`;
// each driver rewrites them for its dialect.

const InactiveState = SnippetState.Inactive;

const generateSlug = (): string =>
	crypto.randomUUID().replace(/-/g, "").slice(0, 22);

const toBool = (value: unknown): boolean =>
	value === true || value === 1 || value === 1n || value === "1";

const rowToSnippet = (row: Record<string, unknown>): Snippet =>
	({
		created_at: String(row.created_at ?? ""),
		folder: (row.folder as string | null) ?? null,
		is_public: toBool(row.is_public),
		language: row.language as Snippet["language"],
		name: String(row.name ?? ""),
		notes: (row.notes as string | null) ?? null,
		public_slug: (row.public_slug as string | null) ?? null,
		snippet: String(row.snippet ?? ""),
		snippet_id: row.snippet_id as UUID,
		state: row.state as SnippetState,
		tags: (row.tags as string | null) ?? null,
		updated_at: String(row.updated_at ?? ""),
		url: (row.url as string | null) ?? null,
		user_id: row.user_id as UUID,
	}) satisfies Snippet;

const rowToVersion = (row: Record<string, unknown>): SnippetVersion =>
	({
		content: String(row.content ?? ""),
		created_at: String(row.created_at ?? ""),
		language: String(row.language ?? ""),
		name: String(row.name ?? ""),
		snippet_id: row.snippet_id as UUID,
		tags: (row.tags as string | null) ?? null,
		user_id: (row.user_id as UUID) ?? null,
		version_id: row.version_id as UUID,
		version_number: Number(row.version_number ?? 0),
	}) satisfies SnippetVersion;

export const createSqlSnippetStorage = (driver: SqlDriver): SnippetStorage => {
	let schemaReady: Promise<void> | null = null;

	// ponytail: ensure schema once per driver instance (one op per serverless
	// request). CREATE ... IF NOT EXISTS makes repeats a no-op.
	const ensureSchema = (): Promise<void> => {
		if (!schemaReady) {
			schemaReady = (async () => {
				for (const statement of createSchemaSql(driver.dialect)) {
					await driver.exec(statement);
				}
			})();
		}

		return schemaReady;
	};

	const likeKeyword = driver.dialect === SqlDialect.Postgres ? "ILIKE" : "LIKE";

	const selectActive = async (
		where: string,
		params: unknown[]
	): Promise<Snippet[]> => {
		await ensureSchema();

		const { rows } = await driver.query(
			`SELECT * FROM ${SnippetTableName} WHERE ${where} ORDER BY updated_at DESC`,
			params
		);

		return rows.map(rowToSnippet);
	};

	return {
		emptyTrash: async (userId) => {
			await ensureSchema();
			await driver.query(
				`DELETE FROM ${SnippetTableName} WHERE user_id = ? AND state = ?`,
				[userId, InactiveState]
			);
		},

		getPublicBySlug: async (slug) => {
			await ensureSchema();

			const { rows } = await driver.query(
				`SELECT * FROM ${SnippetTableName} WHERE public_slug = ? AND is_public = ? LIMIT 1`,
				[slug, true]
			);

			return rows[0] ? rowToSnippet(rows[0]) : null;
		},

		getVersion: async (versionId) => {
			await ensureSchema();

			const { rows } = await driver.query(
				`SELECT * FROM ${SnippetVersionTableName} WHERE version_id = ?`,
				[versionId]
			);

			return rows[0] ? rowToVersion(rows[0]) : null;
		},

		getVersions: async (snippetId) => {
			await ensureSchema();

			const { rows } = await driver.query(
				`SELECT * FROM ${SnippetVersionTableName} WHERE snippet_id = ? ORDER BY version_number DESC LIMIT 5`,
				[snippetId]
			);

			return rows.map(rowToVersion);
		},

		list: (userId) =>
			selectActive("user_id = ? AND state <> ?", [userId, InactiveState]),

		listByFolder: (userId, folder) =>
			selectActive("user_id = ? AND folder = ? AND state <> ?", [
				userId,
				folder,
				InactiveState,
			]),

		listByState: (userId, state) =>
			selectActive("user_id = ? AND state = ?", [userId, state]),

		listByTag: (userId, tag) =>
			selectActive(`user_id = ? AND state <> ? AND tags ${likeKeyword} ?`, [
				userId,
				InactiveState,
				`%${tag}%`,
			]),

		listUncategorized: (userId) =>
			selectActive(
				"user_id = ? AND state <> ? AND (tags IS NULL OR tags = ?)",
				[userId, InactiveState, ""]
			),

		save: async (userId, snapshot) => {
			await ensureSchema();

			const { rowsAffected } = await driver.query(
				`UPDATE ${SnippetTableName} SET snippet = ?, language = ?, name = ?, updated_at = ?, state = ?, tags = ?, url = ?, notes = ?, folder = ? WHERE snippet_id = ? AND user_id = ?`,
				[
					snapshot.snippet,
					snapshot.language,
					snapshot.name,
					snapshot.updated_at,
					snapshot.state,
					snapshot.tags ?? null,
					snapshot.url ?? null,
					snapshot.notes ?? null,
					snapshot.folder ?? null,
					snapshot.snippet_id,
					userId,
				]
			);

			if (rowsAffected > 0) {
				return;
			}

			await driver.query(
				`INSERT INTO ${SnippetTableName} (snippet_id, user_id, name, url, notes, snippet, language, state, tags, is_public, public_slug, folder, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					snapshot.snippet_id,
					userId,
					snapshot.name,
					snapshot.url ?? null,
					snapshot.notes ?? null,
					snapshot.snippet,
					snapshot.language,
					snapshot.state,
					snapshot.tags ?? null,
					snapshot.is_public ?? false,
					snapshot.public_slug ?? null,
					snapshot.folder ?? null,
					snapshot.created_at ?? new Date().toISOString(),
					snapshot.updated_at,
				]
			);
		},

		saveVersion: async (userId, snippetId, snapshot) => {
			await ensureSchema();

			const { rows } = await driver.query(
				`SELECT version_number FROM ${SnippetVersionTableName} WHERE snippet_id = ? ORDER BY version_number DESC LIMIT 1`,
				[snippetId]
			);
			const nextVersion = Number(rows[0]?.version_number ?? 0) + 1;

			await driver.query(
				`INSERT INTO ${SnippetVersionTableName} (version_id, snippet_id, user_id, content, language, name, tags, version_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					crypto.randomUUID(),
					snippetId,
					userId,
					snapshot.snippet,
					snapshot.language,
					snapshot.name,
					snapshot.tags ?? null,
					nextVersion,
					new Date().toISOString(),
				]
			);
		},

		search: (userId, query) => {
			const term = `%${query.trim()}%`;

			return selectActive(
				`user_id = ? AND state <> ? AND (name ${likeKeyword} ? OR snippet ${likeKeyword} ? OR tags ${likeKeyword} ?)`,
				[userId, InactiveState, term, term, term]
			);
		},

		setState: async (userId, snippetId, state) => {
			await ensureSchema();
			await driver.query(
				`UPDATE ${SnippetTableName} SET state = ? WHERE snippet_id = ? AND user_id = ?`,
				[state, snippetId, userId]
			);
		},

		togglePublic: async (userId, snippetId, isPublic, existingSlug) => {
			await ensureSchema();

			const slug = isPublic ? (existingSlug ?? generateSlug()) : existingSlug;

			await driver.query(
				`UPDATE ${SnippetTableName} SET is_public = ?, public_slug = ? WHERE snippet_id = ? AND user_id = ?`,
				[isPublic, slug, snippetId, userId]
			);

			return slug;
		},
	};
};
