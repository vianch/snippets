// Admin database explorer. Read-only introspection of the active storage
// backend, so the constants here are about *reading* a schema safely: page size,
// identifier validation, and the schema scope each dialect is limited to.

export const DatabaseRowsPageSize = 50;

// Table and column names are interpolated into SQL because neither `FROM` nor a
// PRAGMA argument can be parameterized. Nothing matching this pattern can carry
// a quote, space, semicolon, or comment marker, so interpolation is safe — this
// is the injection boundary, not the quoting below it.
export const IdentifierPattern = /^[A-Za-z_][A-Za-z0-9_]{0,62}$/;

// The explorer stays inside one schema: `public` on PostgreSQL/Supabase, the
// connection's own database on MySQL, the single file on SQLite/Turso.
export const PostgresSchemaName = "public";

export const NullDisplayValue = "NULL";
