declare global {
	// One column as reported by the active backend's own catalog. `dataType` is
	// the backend's native type name, not a normalized one — the explorer shows
	// the database as it actually is.
	type DbColumn = {
		dataType: string;
		isPrimaryKey: boolean;
		name: string;
		notNull: boolean;
	};

	// One single-column foreign key edge. Composite keys arrive as one entry per
	// column, which is enough to draw the relation.
	type DbForeignKey = {
		column: string;
		targetColumn: string;
		targetTable: string;
	};

	type DbTable = {
		columns: DbColumn[];
		foreignKeys: DbForeignKey[];
		name: string;
	};

	// Live schema of whichever backend `storage_config` currently points at. The
	// client never picks the source, so `backend`/`dialect` are reported, not sent.
	type DatabaseSchema = {
		backend: StorageBackendType;
		dialect: SqlDialectType;
		tables: DbTable[];
	};

	// One page of rows. Values are pre-stringified server-side (read-only view),
	// so bigint/Buffer/Date all survive JSON transport. `null` stays null so the
	// grid can tell an empty string from a NULL.
	type DatabaseRowsPage = {
		page: number;
		pageSize: number;
		rows: Record<string, string | null>[];
		total: number;
	};
}

export {};
