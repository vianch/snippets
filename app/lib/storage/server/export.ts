import { randomUUID } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
	SnippetTableName,
	SqlDialect,
} from "@/lib/constants/storage.constants";
import { createLibsqlDriver } from "@/lib/storage/server/drivers/libsql";
import { createSchemaSql, snippetColumnNames } from "@/lib/storage/schema";

// Builds downloadable backups of a user's snippets as a portable SQLite target:
// either a binary `.sqlite` file or a raw `.sql` text dump. Both use the SQLite
// dialect schema so the output opens anywhere.

const columnValue = (snippet: Snippet, column: string): unknown =>
	(snippet as unknown as Record<string, unknown>)[column];

const sqlLiteral = (value: unknown): string => {
	if (value === null || value === undefined) {
		return "NULL";
	}

	if (typeof value === "number") {
		return String(value);
	}

	if (typeof value === "boolean") {
		return value ? "1" : "0";
	}

	return `'${String(value).replace(/'/g, "''")}'`;
};

export const buildSqlDump = (snippets: Snippet[]): string => {
	const columns = snippetColumnNames();
	const statements = createSchemaSql(SqlDialect.Sqlite).map(
		(statement) => `${statement};`
	);

	for (const snippet of snippets) {
		const values = columns
			.map((column) => sqlLiteral(columnValue(snippet, column)))
			.join(", ");

		statements.push(
			`INSERT INTO ${SnippetTableName} (${columns.join(", ")}) VALUES (${values});`
		);
	}

	return statements.join("\n");
};

export const buildSqliteFile = async (snippets: Snippet[]): Promise<Buffer> => {
	const columns = snippetColumnNames();
	const filePath = join(tmpdir(), `snippets-export-${randomUUID()}.sqlite`);
	const driver = createLibsqlDriver({ filePath });

	try {
		// Mark the DB header as WAL so libSQL/tursodb open it without converting.
		await driver.exec("PRAGMA journal_mode = WAL");

		for (const statement of createSchemaSql(SqlDialect.Sqlite)) {
			await driver.exec(statement);
		}

		const placeholders = columns.map(() => "?").join(", ");

		for (const snippet of snippets) {
			await driver.query(
				`INSERT INTO ${SnippetTableName} (${columns.join(", ")}) VALUES (${placeholders})`,
				columns.map((column) => columnValue(snippet, column))
			);
		}

		// Flush the WAL into the main file and drop the -wal so the single
		// exported file is self-contained yet still flagged WAL.
		await driver.exec("PRAGMA wal_checkpoint(TRUNCATE)");
	} finally {
		await driver.close();
	}

	const bytes = await readFile(filePath);

	await Promise.all([
		rm(filePath, { force: true }),
		rm(`${filePath}-wal`, { force: true }),
		rm(`${filePath}-shm`, { force: true }),
	]);

	return bytes;
};
