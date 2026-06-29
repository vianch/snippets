import { createConnection, RowDataPacket } from "mysql2/promise";

import {
	DefaultMysqlPort,
	SqlDialect,
} from "@/lib/constants/storage.constants";

// MySQL driver. mysql2 already uses `?` placeholders and coerces JS booleans to
// TINYINT, so the adapter SQL passes through unchanged. `undefined` is not a
// valid bind value, so map it to null.

const normalizeParams = (params: unknown[]): unknown[] =>
	params.map((value) => (value === undefined ? null : value));

export const createMysqlDriver = async (
	connection: StorageConnection
): Promise<SqlDriver> => {
	const client = await createConnection({
		connectTimeout: 5000,
		database: connection.database,
		host: connection.host,
		password: connection.password,
		port: connection.port ?? DefaultMysqlPort,
		user: connection.user,
	});

	return {
		close: async () => {
			await client.end();
		},
		dialect: SqlDialect.Mysql,
		exec: async (sql) => {
			await client.query(sql);
		},
		query: async (sql, params) => {
			const [result] = await client.query(sql, normalizeParams(params));

			if (Array.isArray(result)) {
				return {
					rows: result as RowDataPacket[],
					rowsAffected: result.length,
				};
			}

			return {
				rows: [],
				rowsAffected: (result as { affectedRows?: number }).affectedRows ?? 0,
			};
		},
	};
};
