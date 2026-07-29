import {
	DatabaseRowsPageSize,
	IdentifierPattern,
	PostgresSchemaName,
} from "@/lib/constants/database.constants";
import { SqlDialect } from "@/lib/constants/storage.constants";

// Server-only. Generic schema introspection and paginated row reads for the
// admin database explorer. Written once against `SqlDriver`, so PostgreSQL /
// Supabase, MySQL, Turso and local SQLite are all covered by one code path.
//
// Every catalog query aliases its output to the same lowercase column names
// (`table_name`, `name`, `data_type`, `not_null`, `primary_key`) because
// information_schema reports them in different cases per engine, and normalizes
// the two flag columns to 1/0 in SQL so one reader handles all three dialects.

const text = (value: unknown): string =>
	value === null || value === undefined ? "" : String(value);

const truthy = (value: unknown): boolean =>
	value === true || value === 1 || value === 1n || value === "1";

const toColumn = (row: Record<string, unknown>): DbColumn => ({
	dataType: text(row.data_type),
	isPrimaryKey: truthy(row.primary_key),
	name: text(row.name),
	notNull: truthy(row.not_null),
});

const toForeignKey = (row: Record<string, unknown>): DbForeignKey => ({
	column: text(row.column_name),
	targetColumn: text(row.target_column),
	targetTable: text(row.target_table),
});

// Groups the three flat catalog result sets into one table per row of `tableRows`.
const assemble = (
	tableRows: Record<string, unknown>[],
	columnRows: Record<string, unknown>[],
	foreignKeyRows: Record<string, unknown>[]
): DbTable[] =>
	tableRows.map((tableRow) => {
		const name = text(tableRow.name);

		return {
			columns: columnRows
				.filter((columnRow) => text(columnRow.table_name) === name)
				.map(toColumn),
			foreignKeys: foreignKeyRows
				.filter((keyRow) => text(keyRow.table_name) === name)
				.map(toForeignKey),
			name,
		};
	});

// PostgreSQL keeps primary and foreign keys in the constraint views rather than
// on the column itself, so both need a join back through key_column_usage.
const introspectPostgres = async (driver: SqlDriver): Promise<DbTable[]> => {
	const tables = await driver.query(
		`SELECT table_name AS name
		 FROM information_schema.tables
		 WHERE table_schema = ? AND table_type = 'BASE TABLE'
		 ORDER BY table_name`,
		[PostgresSchemaName]
	);
	const columns = await driver.query(
		`SELECT column_info.table_name AS table_name,
		        column_info.column_name AS name,
		        column_info.data_type AS data_type,
		        CASE WHEN column_info.is_nullable = 'NO' THEN 1 ELSE 0 END AS not_null,
		        CASE WHEN primary_keys.column_name IS NULL THEN 0 ELSE 1 END AS primary_key
		 FROM information_schema.columns AS column_info
		 LEFT JOIN (
		   SELECT key_usage.table_name AS table_name,
		          key_usage.column_name AS column_name
		   FROM information_schema.table_constraints AS constraint_info
		   JOIN information_schema.key_column_usage AS key_usage
		     ON key_usage.constraint_name = constraint_info.constraint_name
		    AND key_usage.table_schema = constraint_info.table_schema
		   WHERE constraint_info.table_schema = ?
		     AND constraint_info.constraint_type = 'PRIMARY KEY'
		 ) AS primary_keys
		   ON primary_keys.table_name = column_info.table_name
		  AND primary_keys.column_name = column_info.column_name
		 WHERE column_info.table_schema = ?
		 ORDER BY column_info.table_name, column_info.ordinal_position`,
		[PostgresSchemaName, PostgresSchemaName]
	);
	const foreignKeys = await driver.query(
		`SELECT constraint_info.table_name AS table_name,
		        key_usage.column_name AS column_name,
		        target_usage.table_name AS target_table,
		        target_usage.column_name AS target_column
		 FROM information_schema.table_constraints AS constraint_info
		 JOIN information_schema.key_column_usage AS key_usage
		   ON key_usage.constraint_name = constraint_info.constraint_name
		  AND key_usage.table_schema = constraint_info.table_schema
		 JOIN information_schema.constraint_column_usage AS target_usage
		   ON target_usage.constraint_name = constraint_info.constraint_name
		  AND target_usage.table_schema = constraint_info.table_schema
		 WHERE constraint_info.table_schema = ?
		   AND constraint_info.constraint_type = 'FOREIGN KEY'`,
		[PostgresSchemaName]
	);

	return assemble(tables.rows, columns.rows, foreignKeys.rows);
};

// MySQL is friendlier here: `column_key` already flags primary keys and
// key_column_usage carries the referenced table/column inline. `column_type` is
// used over `data_type` because it keeps the length (`varchar(36)`).
const introspectMysql = async (driver: SqlDriver): Promise<DbTable[]> => {
	const tables = await driver.query(
		`SELECT table_name AS name
		 FROM information_schema.tables
		 WHERE table_schema = database() AND table_type = 'BASE TABLE'
		 ORDER BY table_name`,
		[]
	);
	const columns = await driver.query(
		`SELECT table_name AS table_name,
		        column_name AS name,
		        column_type AS data_type,
		        CASE WHEN is_nullable = 'NO' THEN 1 ELSE 0 END AS not_null,
		        CASE WHEN column_key = 'PRI' THEN 1 ELSE 0 END AS primary_key
		 FROM information_schema.columns
		 WHERE table_schema = database()
		 ORDER BY table_name, ordinal_position`,
		[]
	);
	const foreignKeys = await driver.query(
		`SELECT table_name AS table_name,
		        column_name AS column_name,
		        referenced_table_name AS target_table,
		        referenced_column_name AS target_column
		 FROM information_schema.key_column_usage
		 WHERE table_schema = database() AND referenced_table_name IS NOT NULL`,
		[]
	);

	return assemble(tables.rows, columns.rows, foreignKeys.rows);
};

// SQLite has no information_schema, but every PRAGMA has an eponymous
// table-valued function — so the table name binds as a parameter instead of
// being interpolated. `notnull`, `from`, `to` and `table` are quoted as they are
// keywords or ambiguous bare words.
const introspectSqlite = async (driver: SqlDriver): Promise<DbTable[]> => {
	const tables = await driver.query(
		`SELECT name AS name
		 FROM sqlite_master
		 WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
		 ORDER BY name`,
		[]
	);
	const collected: DbTable[] = [];

	// ponytail: one PRAGMA pair per table (N+1). Fine at POC table counts; batch
	// into a single UNION ALL over pragma_table_info if a target grows to hundreds.
	for (const tableRow of tables.rows) {
		const name = text(tableRow.name);
		const columns = await driver.query(
			`SELECT name AS name,
			        type AS data_type,
			        "notnull" AS not_null,
			        CASE WHEN pk > 0 THEN 1 ELSE 0 END AS primary_key
			 FROM pragma_table_info(?)`,
			[name]
		);
		const foreignKeys = await driver.query(
			`SELECT "from" AS column_name,
			        "table" AS target_table,
			        "to" AS target_column
			 FROM pragma_foreign_key_list(?)`,
			[name]
		);

		collected.push({
			columns: columns.rows.map(toColumn),
			foreignKeys: foreignKeys.rows.map(toForeignKey),
			name,
		});
	}

	return collected;
};

export const introspectSchema = async (
	driver: SqlDriver
): Promise<DbTable[]> => {
	if (driver.dialect === SqlDialect.Postgres) {
		return introspectPostgres(driver);
	}

	if (driver.dialect === SqlDialect.Mysql) {
		return introspectMysql(driver);
	}

	return introspectSqlite(driver);
};

// Identifiers cannot be bound, so they are validated against
// `IdentifierPattern` first and only then quoted for the dialect. Rejecting
// early means a name carrying a quote or semicolon never reaches the SQL string.
const quoteIdentifier = (name: string, dialect: SqlDialectType): string => {
	if (!IdentifierPattern.test(name)) {
		throw new Error(`Invalid identifier: ${name}`);
	}

	if (dialect === SqlDialect.Mysql) {
		return `\`${name}\``;
	}

	return `"${name}"`;
};

// Qualifying PostgreSQL with `public` keeps reads inside the same scope the
// introspection listed, regardless of the connection's search_path.
const qualifiedTable = (table: string, dialect: SqlDialectType): string => {
	const quoted = quoteIdentifier(table, dialect);

	if (dialect === SqlDialect.Postgres) {
		return `"${PostgresSchemaName}".${quoted}`;
	}

	return quoted;
};

// Every cell is stringified here because this view is read-only, which also
// sidesteps bigint (libSQL/mysql2), Buffer and Date not surviving JSON.
// Revisit when the grid becomes editable and needs real types round-tripped.
const toCell = (value: unknown): string | null => {
	if (value === null || value === undefined) {
		return null;
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	if (value instanceof Uint8Array) {
		return `\\x${Buffer.from(value).toString("hex")}`;
	}

	if (typeof value === "bigint") {
		return value.toString();
	}

	if (typeof value === "object") {
		return JSON.stringify(value);
	}

	return String(value);
};

export const selectTablePage = async (
	driver: SqlDriver,
	table: string,
	orderBy: string | null,
	page: number
): Promise<DatabaseRowsPage> => {
	const target = qualifiedTable(table, driver.dialect);
	// Without a primary key there is no stable sort, so rows are left in whatever
	// order the engine returns rather than inventing one.
	const order = orderBy
		? ` ORDER BY ${quoteIdentifier(orderBy, driver.dialect)}`
		: "";
	// ponytail: COUNT(*) scans on every page. Swap for a catalog estimate if a
	// target table ever gets big enough for the scan to show.
	const counted = await driver.query(
		`SELECT COUNT(*) AS total FROM ${target}`,
		[]
	);
	const selected = await driver.query(
		`SELECT * FROM ${target}${order} LIMIT ? OFFSET ?`,
		[DatabaseRowsPageSize, page * DatabaseRowsPageSize]
	);

	return {
		page,
		pageSize: DatabaseRowsPageSize,
		rows: selected.rows.map((row) =>
			Object.fromEntries(
				Object.entries(row).map(([column, value]) => [column, toCell(value)])
			)
		),
		total: Number(counted.rows[0]?.total ?? 0),
	};
};
