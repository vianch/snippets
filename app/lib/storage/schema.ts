import {
	SnippetTableName,
	SnippetVersionTableName,
	SqlDialect,
} from "@/lib/constants/storage.constants";

// ─── Canonical snippet schema ───
// One source of truth for both tables. Each column declares a portable type;
// `renderColumn` maps it to the right dialect. `snippet_id` is an app-generated
// UUID (see lib/models/Snippet.ts) and timestamps are ISO strings, so we never
// need identity columns or native timestamp/uuid types — that sidesteps the
// SERIAL vs AUTO_INCREMENT vs AUTOINCREMENT divergence entirely.

const snippetColumns: SchemaColumn[] = [
	{ name: "snippet_id", primaryKey: true, type: "id" },
	{ name: "user_id", notNull: true, type: "id" },
	{ name: "name", type: "text" },
	{ name: "url", type: "text" },
	{ name: "notes", type: "text" },
	{ name: "snippet", type: "text" },
	{ name: "language", type: "text" },
	{ name: "state", type: "text" },
	{ name: "tags", type: "text" },
	{ name: "is_public", type: "boolean" },
	{ name: "public_slug", type: "text" },
	{ name: "folder", type: "text" },
	{ name: "created_at", type: "text" },
	{ name: "updated_at", type: "text" },
];

const versionColumns: SchemaColumn[] = [
	{ name: "version_id", primaryKey: true, type: "id" },
	{ name: "snippet_id", notNull: true, type: "id" },
	{ name: "user_id", type: "id" },
	{ name: "content", type: "text" },
	{ name: "language", type: "text" },
	{ name: "name", type: "text" },
	{ name: "tags", type: "text" },
	{ name: "version_number", type: "integer" },
	{ name: "created_at", type: "text" },
];

// `id` columns are short key strings that get indexed/used as PKs, so MySQL
// needs an explicit length; TEXT cannot be a MySQL primary key.
const dialectTypes: Record<SqlDialect, Record<SchemaColumnType, string>> = {
	[SqlDialect.Mysql]: {
		boolean: "TINYINT(1)",
		id: "VARCHAR(36)",
		integer: "INT",
		text: "TEXT",
	},
	[SqlDialect.Postgres]: {
		boolean: "BOOLEAN",
		id: "VARCHAR(36)",
		integer: "INTEGER",
		text: "TEXT",
	},
	[SqlDialect.Sqlite]: {
		boolean: "INTEGER",
		id: "TEXT",
		integer: "INTEGER",
		text: "TEXT",
	},
};

const renderColumn = (column: SchemaColumn, dialect: SqlDialect): string => {
	const parts = [column.name, dialectTypes[dialect][column.type]];

	if (column.primaryKey) {
		parts.push("PRIMARY KEY");
	}

	if (column.notNull && !column.primaryKey) {
		parts.push("NOT NULL");
	}

	return parts.join(" ");
};

const renderCreateTable = (
	tableName: string,
	columns: SchemaColumn[],
	dialect: SqlDialect
): string => {
	const body = columns
		.map((column) => `  ${renderColumn(column, dialect)}`)
		.join(",\n");

	return `CREATE TABLE IF NOT EXISTS ${tableName} (\n${body}\n)`;
};

// Returns the idempotent DDL (tables + indexes) for a dialect. Run on connect /
// before save so a target that lacks the schema gets it created automatically.
export const createSchemaSql = (dialect: SqlDialect): string[] => [
	renderCreateTable(SnippetTableName, snippetColumns, dialect),
	renderCreateTable(SnippetVersionTableName, versionColumns, dialect),
	`CREATE INDEX IF NOT EXISTS idx_snippet_user ON ${SnippetTableName} (user_id)`,
	`CREATE INDEX IF NOT EXISTS idx_snippet_slug ON ${SnippetTableName} (public_slug)`,
	`CREATE INDEX IF NOT EXISTS idx_version_snippet ON ${SnippetVersionTableName} (snippet_id)`,
];

export const snippetColumnNames = (): string[] =>
	snippetColumns.map((column) => column.name);

export const snippetBooleanColumns = (): string[] =>
	snippetColumns
		.filter((column) => column.type === "boolean")
		.map((column) => column.name);

export { snippetColumns, versionColumns };
