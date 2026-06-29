// Pluggable snippet-storage backends. Identity/auth always stays on Supabase;
// only snippet *persistence* is selectable here. The active backend is a single
// global row in `storage_config`, set by an admin and applied to every user.

export const enum StorageBackend {
	LocalSqlite = "local-sqlite",
	Mysql = "mysql",
	Postgres = "postgres",
	Supabase = "supabase",
	Turso = "turso",
}

// SQL dialects the schema generator and server adapters target. Browser/local
// SQLite, Turso (libSQL) all share the Sqlite dialect.
export const enum SqlDialect {
	Mysql = "mysql",
	Postgres = "postgres",
	Sqlite = "sqlite",
}

// Which snippet op the storage HTTP endpoint should run. The client backend
// adapter posts one of these; the server dispatches to the active adapter.
export const enum StorageOp {
	EmptyTrash = "empty-trash",
	GetPublicBySlug = "get-public-by-slug",
	GetVersion = "get-version",
	GetVersions = "get-versions",
	List = "list",
	ListByFolder = "list-by-folder",
	ListByState = "list-by-state",
	ListByTag = "list-by-tag",
	ListUncategorized = "list-uncategorized",
	Save = "save",
	SaveVersion = "save-version",
	Search = "search",
	SetState = "set-state",
	TogglePublic = "toggle-public",
}

// Downloadable export formats (Phase 3 "sql plain" = both a binary `.sqlite`
// file and a raw `.sql` dump).
export const enum ExportFormat {
	Sql = "sql",
	Sqlite = "sqlite",
}

export const DefaultStorageBackend = StorageBackend.Supabase;

// Selector order in the Database settings section.
export const StorageBackendValues: StorageBackend[] = [
	StorageBackend.Supabase,
	StorageBackend.Postgres,
	StorageBackend.Mysql,
	StorageBackend.Turso,
	StorageBackend.LocalSqlite,
];

export const SnippetTableName = "snippet";

export const SnippetVersionTableName = "snippet_version";

export const StorageConfigTableName = "storage_config";

// Single global config row id — there is exactly one active backend per deploy.
export const StorageConfigRowId = 1;

export const StorageApiBasePath = "/api/storage";

// Backends whose connections are credentialed/external and therefore must run
// server-side. Supabase runs directly in the client.
export const ServerSideBackends: StorageBackend[] = [
	StorageBackend.LocalSqlite,
	StorageBackend.Mysql,
	StorageBackend.Postgres,
	StorageBackend.Turso,
];

export const DefaultPostgresPort = 5432;

export const DefaultMysqlPort = 3306;

// Form metadata driving the Database settings section. Adding a backend here
// adds its connection form — no component changes required.
export const StorageBackendFields: Record<
	StorageBackend,
	StorageFieldConfig[]
> = {
	[StorageBackend.LocalSqlite]: [
		{
			key: "filePath",
			label: "Database file path",
			placeholder: "./data/snippets.sqlite",
			type: "text",
		},
	],
	[StorageBackend.Mysql]: [
		{ key: "host", label: "Host", placeholder: "localhost", type: "text" },
		{ key: "port", label: "Port", placeholder: "3306", type: "number" },
		{
			key: "database",
			label: "Database",
			placeholder: "snippets",
			type: "text",
		},
		{ key: "user", label: "User", placeholder: "root", type: "text" },
		{ key: "password", label: "Password", placeholder: "", type: "password" },
	],
	[StorageBackend.Postgres]: [
		{
			key: "connectionString",
			label: "Connection string (optional)",
			maxLength: 1000,
			placeholder: "postgresql://user:pass@host:5432/db",
			type: "text",
		},
		{ key: "host", label: "Host", placeholder: "localhost", type: "text" },
		{ key: "port", label: "Port", placeholder: "5432", type: "number" },
		{
			key: "database",
			label: "Database",
			placeholder: "snippets",
			type: "text",
		},
		{ key: "user", label: "User", placeholder: "postgres", type: "text" },
		{ key: "password", label: "Password", placeholder: "", type: "password" },
	],
	[StorageBackend.Supabase]: [],
	[StorageBackend.Turso]: [
		{
			key: "url",
			label: "Database URL",
			placeholder: "libsql://your-db.turso.io",
			type: "text",
		},
		{
			key: "authToken",
			label: "Auth token",
			maxLength: 2000,
			placeholder: "eyJ...",
			type: "password",
		},
	],
};

export const StorageBackendLabels: Record<StorageBackend, string> = {
	[StorageBackend.LocalSqlite]: "Local SQLite file (server)",
	[StorageBackend.Mysql]: "MySQL",
	[StorageBackend.Postgres]: "PostgreSQL",
	[StorageBackend.Supabase]: "Supabase (default)",
	[StorageBackend.Turso]: "Turso / libSQL",
};
