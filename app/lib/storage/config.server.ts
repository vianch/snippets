import {
	DefaultStorageBackend,
	StorageConfigRowId,
	StorageConfigTableName,
} from "@/lib/constants/storage.constants";
import { logger } from "@/lib/logger/logger";
import createSupabaseAdminClient from "@/lib/supabase/admin";
import { decryptSecret, encryptSecret } from "@/lib/storage/crypto.server";

// Server-only. The active storage backend is a single global row in the
// `storage_config` Supabase table. The connection (which holds DB passwords /
// tokens) is stored as one AES-GCM encrypted blob, decrypted only here.
//
// Table DDL (run once in Supabase):
//   create table storage_config (
//     id          integer primary key,
//     backend     text not null,
//     secret      text not null,        -- encrypted StorageConnection JSON
//     updated_at  timestamptz default now()
//   );

const defaultConfig = (): StorageConfig => ({
	backend: DefaultStorageBackend,
	connection: {},
});

export const loadActiveConfig = async (): Promise<StorageConfig> => {
	const supabase = createSupabaseAdminClient();
	const { data, error } = await supabase
		.from(StorageConfigTableName)
		.select("backend, secret")
		.eq("id", StorageConfigRowId)
		.maybeSingle();

	if (error || !data) {
		return defaultConfig();
	}

	try {
		const connection = JSON.parse(
			decryptSecret(data.secret as string)
		) as StorageConnection;

		return { backend: data.backend as StorageBackendType, connection };
	} catch (cause) {
		logger.error(cause, { query: "decrypt storage config" });

		return defaultConfig();
	}
};

export const saveActiveConfig = async (
	config: StorageConfig
): Promise<void> => {
	const supabase = createSupabaseAdminClient();
	const secret = encryptSecret(JSON.stringify(config.connection));

	const { error } = await supabase.from(StorageConfigTableName).upsert({
		backend: config.backend,
		id: StorageConfigRowId,
		secret,
		updated_at: new Date().toISOString(),
	});

	if (error) {
		// PostgrestError fields vary by failure; surface whatever is present so
		// the real cause (missing table, RLS, missing service-role key) is visible.
		const detail =
			error.message ||
			[error.code, error.details, error.hint].filter(Boolean).join(" — ") ||
			JSON.stringify(error);

		throw new Error(`Failed to persist storage config: ${detail}`);
	}
};
