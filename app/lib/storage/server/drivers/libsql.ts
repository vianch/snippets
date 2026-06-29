import { Client, createClient, InValue } from "@libsql/client";

import { SqlDialect } from "@/lib/constants/storage.constants";

// libSQL driver — serves Turso (remote `url` + `authToken`) AND a local SQLite
// file (`filePath` → `file:` URL). SQLite has no boolean type, so booleans are
// bound as 1/0; `undefined` becomes null.

const toInValue = (value: unknown): InValue => {
	if (value === undefined || value === null) {
		return null;
	}

	if (typeof value === "boolean") {
		return value ? 1 : 0;
	}

	if (typeof value === "number" || typeof value === "bigint") {
		return value;
	}

	return String(value);
};

const buildClient = (connection: StorageConnection): Client => {
	if (connection.url) {
		return createClient({
			authToken: connection.authToken,
			url: connection.url,
		});
	}

	return createClient({
		url: `file:${connection.filePath ?? "snippets.sqlite"}`,
	});
};

export const createLibsqlDriver = (
	connection: StorageConnection
): SqlDriver => {
	const client = buildClient(connection);

	return {
		close: async () => {
			client.close();
		},
		dialect: SqlDialect.Sqlite,
		exec: async (sql) => {
			await client.execute(sql);
		},
		query: async (sql, params) => {
			const result = await client.execute({
				args: params.map(toInValue),
				sql,
			});

			return {
				rows: result.rows as unknown as Record<string, unknown>[],
				rowsAffected: result.rowsAffected,
			};
		},
	};
};
