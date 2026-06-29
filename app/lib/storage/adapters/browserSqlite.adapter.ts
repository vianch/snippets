import { SqlDialect } from "@/lib/constants/storage.constants";
import { createSqlSnippetStorage } from "@/lib/storage/server/sqlStorage";

// Browser-only SQLite, persisted to OPFS via the SAH-pool VFS (works on the
// main thread without COOP/COEP headers). Scope is per-browser, per-origin and
// never synced — see the POC notes. Reuses the shared SQL adapter since the
// SQLite dialect is identical to the server libSQL path.
//
// The sqlite-wasm ESM is served from /public/sqlite-wasm (copied from the npm
// package) and loaded at runtime with `turbopackIgnore`, so its internal
// `new Worker(new URL(...))` never enters — and breaks — the Turbopack build.
// The SAH-pool VFS runs on the main thread and never reaches that worker path.

const DatabaseFileName = "/snippets.sqlite";

const WasmEntryUrl = "/sqlite-wasm/index.mjs";

const coerce = (value: unknown): unknown => {
	if (value === undefined) {
		return null;
	}

	if (typeof value === "boolean") {
		return value ? 1 : 0;
	}

	return value;
};

const cache: { storage: SnippetStorage | null } = { storage: null };

const initDriver = async (): Promise<SqlDriver> => {
	// Runtime import via a variable + turbopackIgnore keeps Turbopack from
	// resolving the module (and its dynamic worker URL) at build time.
	const sqliteModule = (await import(
		/* turbopackIgnore: true */ WasmEntryUrl
	)) as SqliteWasmModule;
	const sqlite3 = await sqliteModule.default();
	const poolUtil = await sqlite3.installOpfsSAHPoolVfs({});
	const database = new poolUtil.OpfsSAHPoolDb(DatabaseFileName);

	return {
		close: async () => {
			database.close();
		},
		dialect: SqlDialect.Sqlite,
		exec: async (sql) => {
			database.exec(sql);
		},
		query: async (sql, params) => {
			const rows = database.exec({
				bind: params.map(coerce),
				returnValue: "resultRows",
				rowMode: "object",
				sql,
			}) as Record<string, unknown>[];

			return { rows, rowsAffected: database.changes() };
		},
	};
};

const getStorage = async (): Promise<SnippetStorage> => {
	if (!cache.storage) {
		cache.storage = createSqlSnippetStorage(await initDriver());
	}

	return cache.storage;
};

export const browserAdapter: SnippetStorage = {
	emptyTrash: async (userId) => (await getStorage()).emptyTrash(userId),
	getPublicBySlug: async (slug) => (await getStorage()).getPublicBySlug(slug),
	getVersion: async (versionId) => (await getStorage()).getVersion(versionId),
	getVersions: async (snippetId) => (await getStorage()).getVersions(snippetId),
	list: async (userId) => (await getStorage()).list(userId),
	listByFolder: async (userId, folder) =>
		(await getStorage()).listByFolder(userId, folder),
	listByState: async (userId, state) =>
		(await getStorage()).listByState(userId, state),
	listByTag: async (userId, tag) => (await getStorage()).listByTag(userId, tag),
	listUncategorized: async (userId) =>
		(await getStorage()).listUncategorized(userId),
	save: async (userId, snapshot) => (await getStorage()).save(userId, snapshot),
	saveVersion: async (userId, snippetId, snapshot) =>
		(await getStorage()).saveVersion(userId, snippetId, snapshot),
	search: async (userId, query) => (await getStorage()).search(userId, query),
	setState: async (userId, snippetId, state) =>
		(await getStorage()).setState(userId, snippetId, state),
	togglePublic: async (userId, snippetId, isPublic, existingSlug) =>
		(await getStorage()).togglePublic(
			userId,
			snippetId,
			isPublic,
			existingSlug
		),
};
