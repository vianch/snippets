import { StorageBackend } from "@/lib/constants/storage.constants";
import { createLibsqlDriver } from "@/lib/storage/server/drivers/libsql";
import { createMysqlDriver } from "@/lib/storage/server/drivers/mysql";
import { createPgDriver } from "@/lib/storage/server/drivers/pg";
import { createSqlSnippetStorage } from "@/lib/storage/server/sqlStorage";

// Server-only. Builds the right SQL driver for the active credentialed backend.
// Supabase never reaches here — it runs in the client.

// Guards against silently-empty connections (e.g. a blank Turso config would
// otherwise fall back to a local file and pass a bogus connectivity test).
const assertConnection = (config: StorageConfig): void => {
	const { connection } = config;

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

// Opens a driver, runs the callback against a SnippetStorage, and always closes
// the connection (serverless = one op per request, so no pooling reuse).
export const runWithServerStorage = async <ResultType>(
	config: StorageConfig,
	callback: (storage: SnippetStorage) => Promise<ResultType>
): Promise<ResultType> => {
	const driver = await createDriver(config);

	try {
		return await callback(createSqlSnippetStorage(driver));
	} finally {
		await driver.close();
	}
};

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
