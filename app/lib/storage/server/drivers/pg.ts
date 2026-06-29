import { Pool } from "pg";

import {
	DefaultPostgresPort,
	SqlDialect,
} from "@/lib/constants/storage.constants";

// PostgreSQL driver for an arbitrary admin-supplied connection. Postgres uses
// `$1` placeholders, so we rewrite the adapter's `?` markers in order. Postgres
// accepts JS booleans for BOOLEAN columns directly.

const toPgPlaceholders = (sql: string): string => {
	let index = 0;

	return sql.replace(/\?/g, () => `$${(index += 1)}`);
};

const normalizeParams = (params: unknown[]): unknown[] =>
	params.map((value) => (value === undefined ? null : value));

const ConnectionTimeoutMs = 5000;

export const createPgDriver = (connection: StorageConnection): SqlDriver => {
	const pool = connection.connectionString
		? new Pool({
				connectionString: connection.connectionString,
				connectionTimeoutMillis: ConnectionTimeoutMs,
			})
		: new Pool({
				connectionTimeoutMillis: ConnectionTimeoutMs,
				database: connection.database,
				host: connection.host,
				password: connection.password,
				port: connection.port ?? DefaultPostgresPort,
				user: connection.user,
			});

	// An unhandled pool 'error' (e.g. dropped connection) would crash the process.
	pool.on("error", () => undefined);

	return {
		close: async () => {
			await pool.end();
		},
		dialect: SqlDialect.Postgres,
		exec: async (sql) => {
			await pool.query(sql);
		},
		query: async (sql, params) => {
			const result = await pool.query(
				toPgPlaceholders(sql),
				normalizeParams(params)
			);

			return {
				rows: result.rows as Record<string, unknown>[],
				rowsAffected: result.rowCount ?? 0,
			};
		},
	};
};
