import {
	SqlDialect as SqlDialectEnum,
	StorageBackend as StorageBackendEnum,
} from "@/lib/constants/storage.constants";
import { SnippetState as SnippetStateEnum } from "@/lib/constants/core";

declare global {
	type StorageBackendType = StorageBackendEnum;

	type SqlDialectType = SqlDialectEnum;

	// One connection-form field, rendered by the Database settings section.
	type StorageFieldConfig = {
		key: keyof StorageConnection;
		label: string;
		maxLength?: number;
		placeholder: string;
		type: "number" | "password" | "text";
	};

	// User-supplied connection details. Persisted encrypted, server-side only.
	// Every field is optional because each backend uses a different subset.
	interface StorageConnection {
		authToken?: string;
		connectionString?: string;
		database?: string;
		filePath?: string;
		host?: string;
		password?: string;
		port?: number;
		url?: string;
		user?: string;
	}

	// The active backend plus its connection. Secrets live only in `connection`
	// and are never sent to the client.
	interface StorageConfig {
		backend: StorageBackendType;
		connection: StorageConnection;
	}

	// Every snippet persistence operation the app performs. App code calls this
	// interface only — never a driver directly. Auth/identity is NOT here; it
	// stays on Supabase. `userId` is resolved from the Supabase session and
	// passed in so adapters stay free of auth concerns.
	interface SnippetStorage {
		emptyTrash(userId: UUID): Promise<void>;
		getPublicBySlug(slug: string): Promise<Snippet | null>;
		getVersion(versionId: UUID): Promise<SnippetVersion | null>;
		getVersions(snippetId: UUID): Promise<SnippetVersion[]>;
		list(userId: UUID): Promise<Snippet[]>;
		listByFolder(userId: UUID, folder: string): Promise<Snippet[]>;
		listByState(userId: UUID, state: SnippetStateEnum): Promise<Snippet[]>;
		listByTag(userId: UUID, tag: string): Promise<Snippet[]>;
		listUncategorized(userId: UUID): Promise<Snippet[]>;
		save(userId: UUID, snapshot: CurrentSnippet): Promise<void>;
		saveVersion(
			userId: UUID,
			snippetId: UUID,
			snapshot: CurrentSnippet
		): Promise<void>;
		search(userId: UUID, query: string): Promise<Snippet[]>;
		setState(
			userId: UUID,
			snippetId: UUID,
			state: SnippetStateEnum
		): Promise<void>;
		togglePublic(
			userId: UUID,
			snippetId: UUID,
			isPublic: boolean,
			existingSlug: string | null
		): Promise<string | null>;
	}

	// Result of an admin "Test connection" attempt.
	type StorageTestResult = {
		error: string | null;
		ok: boolean;
	};

	// One column in the canonical snippet schema, rendered per dialect.
	type SchemaColumnType = "boolean" | "id" | "integer" | "text";

	type SchemaColumn = {
		name: string;
		notNull?: boolean;
		primaryKey?: boolean;
		type: SchemaColumnType;
	};

	// Minimal driver contract shared by every server-side SQL backend. Each
	// concrete driver (pg, mysql2, libSQL) adapts its client to this; the SQL
	// snippet adapter is written once against it. `params` use `?` placeholders;
	// drivers translate placeholders/param types as their dialect requires.
	type SqlQueryResult = {
		rows: Record<string, unknown>[];
		rowsAffected: number;
	};

	interface SqlDriver {
		close(): Promise<void>;
		dialect: SqlDialectType;
		exec(sql: string): Promise<void>;
		query(sql: string, params: unknown[]): Promise<SqlQueryResult>;
	}

	// Shape of the runtime-loaded sqlite-wasm ESM module (served from /public, so
	// it isn't in the bundle graph and the bundled types don't apply).
	type SqliteWasmModule = {
		default: () => Promise<{
			installOpfsSAHPoolVfs: (options: object) => Promise<{
				OpfsSAHPoolDb: new (path: string) => SqliteOo1Db;
			}>;
		}>;
	};

	// Minimal slice of the sqlite-wasm oo1 DB API the browser adapter uses; the
	// bundled types don't cover the OPFS SAH-pool DB.
	type SqliteOo1Db = {
		changes(): number;
		close(): void;
		exec(
			input:
				| string
				| {
						bind?: unknown[];
						returnValue?: string;
						rowMode?: string;
						sql: string;
				  }
		): unknown;
	};
}

export {};
