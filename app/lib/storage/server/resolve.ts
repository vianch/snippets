import { StorageBackend } from "@/lib/constants/storage.constants";
import { createLibsqlDriver } from "@/lib/storage/server/drivers/libsql";
import { createMysqlDriver } from "@/lib/storage/server/drivers/mysql";
import { createPgDriver } from "@/lib/storage/server/drivers/pg";
import { createSqlSnippetStorage } from "@/lib/storage/server/sqlStorage";

// Server-only. Builds the right SQL driver for the active backend.
//
// Snippet *persistence* on Supabase runs in the client over PostgREST and never
// reaches here. The admin database explorer does, because PostgREST cannot run
// raw SQL or read information_schema — so Supabase is opened as what it is,
// plain PostgreSQL, over SUPABASE_DB_URL.

// Guards against silently-empty connections (e.g. a blank Turso config would
// otherwise fall back to a local file and pass a bogus connectivity test).
const assertConnection = (config: StorageConfig): void => {
	const { connection } = config;

	if (
		config.backend === StorageBackend.Supabase &&
		!process.env.SUPABASE_DB_URL?.trim()
	) {
		throw new Error(
			"Reading the Supabase database directly requires SUPABASE_DB_URL"
		);
	}

	if (config.backend === StorageBackend.Turso && !connection.url?.trim()) {
		throw new Error("Turso requires a database URL");
	}

	if (
		config.backend === StorageBackend.Postgres &&
		!connection.connectionString?.trim() &&
		!connection.host?.trim()
	) {
		throw new Error("PostgreSQL requires a host or connection string");
	}

	if (config.backend === StorageBackend.Mysql && !connection.host?.trim()) {
		throw new Error("MySQL requires a host");
	}

	if (
		config.backend === StorageBackend.LocalSqlite &&
		!connection.filePath?.trim()
	) {
		throw new Error("Local SQLite requires a file path");
	}
};

const createDriver = async (config: StorageConfig): Promise<SqlDriver> => {
	assertConnection(config);

	if (config.backend === StorageBackend.Mysql) {
		return createMysqlDriver(config.connection);
	}

	// Supabase is PostgreSQL. Use the *pooler* URL (port 6543) — a direct 5432
	// connection per serverless request exhausts the instance's connection limit.
	if (config.backend === StorageBackend.Supabase) {
		return createPgDriver({
			connectionString: process.env.SUPABASE_DB_URL ?? "",
		});
	}

	if (config.backend === StorageBackend.Postgres) {
		return createPgDriver(config.connection);
	}

	// Turso (remote) and local SQLite both run on libSQL.
	if (
		config.backend === StorageBackend.Turso ||
		config.backend === StorageBackend.LocalSqlite
	) {
		return createLibsqlDriver(config.connection);
	}

	throw new Error(`Backend ${config.backend} does not run server-side`);
};

// Opens a driver, hands the raw driver to the callback, and always closes the
// connection (serverless = one op per request, so no pooling reuse). Used by the
// admin explorer, which needs arbitrary SQL rather than the snippet interface.
export const runWithServerDriver = async <ResultType>(
	config: StorageConfig,
	callback: (driver: SqlDriver) => Promise<ResultType>
): Promise<ResultType> => {
	const driver = await createDriver(config);

	try {
		return await callback(driver);
	} finally {
		await driver.close();
	}
};

// Same lifecycle, but scoped to the SnippetStorage interface app code uses.
export const runWithServerStorage = async <ResultType>(
	config: StorageConfig,
	callback: (storage: SnippetStorage) => Promise<ResultType>
): Promise<ResultType> =>
	runWithServerDriver(config, (driver) =>
		callback(createSqlSnippetStorage(driver))
	);

export const testServerConnection = async (
	config: StorageConfig
): Promise<StorageTestResult> => {
	try {
		const driver = await createDriver(config);

		try {
			await driver.query("SELECT 1", []);
		} finally {
			await driver.close();
		}

		return { error: null, ok: true };
	} catch (cause) {
		return {
			error: cause instanceof Error ? cause.message : "Connection failed",
			ok: false,
		};
	}
};
