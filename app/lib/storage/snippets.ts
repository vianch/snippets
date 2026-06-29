import { SnippetState } from "@/lib/constants/core";
import {
	DefaultStorageBackend,
	ServerSideBackends,
	StorageApiBasePath,
} from "@/lib/constants/storage.constants";
import SnippetValueObject from "@/lib/models/Snippet";
import { backendAdapter } from "@/lib/storage/adapters/backend.adapter";
import { supabaseAdapter } from "@/lib/storage/adapters/supabase.adapter";
import { getUserIdBySession } from "@/lib/supabase/queries";

// Public snippet-persistence facade. App code imports these — the SAME names
// and signatures the Supabase queries had — so call sites only change their
// import path. The active backend (set globally by an admin) decides whether an
// op runs in the client (Supabase) or via the server.

const backendCache: { value: StorageBackendType | null } = { value: null };

const getActiveBackend = async (): Promise<StorageBackendType> => {
	if (backendCache.value) {
		return backendCache.value;
	}

	const response = await fetch(`${StorageApiBasePath}/active`).catch(
		() => null
	);

	if (response?.ok) {
		const data = (await response.json()) as { backend: StorageBackendType };

		backendCache.value = data.backend;
	}

	return backendCache.value ?? DefaultStorageBackend;
};

// Clears the memoized backend so a just-saved config takes effect without a
// reload (other sessions pick it up on their next load).
export const resetActiveBackendCache = (): void => {
	backendCache.value = null;
};

const getStorage = async (): Promise<SnippetStorage> => {
	const backend = await getActiveBackend();

	if (ServerSideBackends.includes(backend)) {
		return backendAdapter;
	}

	return supabaseAdapter;
};

export const getAllSnippets = async (): Promise<Snippet[]> => {
	const userId = await getUserIdBySession();

	if (!userId) {
		return [];
	}

	return (await getStorage()).list(userId as UUID);
};

export const getSnippetsByState = async (
	state: SnippetState
): Promise<Snippet[]> => {
	const userId = await getUserIdBySession();

	if (!userId) {
		return [];
	}

	return (await getStorage()).listByState(userId as UUID, state);
};

export const getUncategorizedSnippets = async (): Promise<Snippet[]> => {
	const userId = await getUserIdBySession();

	if (!userId) {
		return [];
	}

	return (await getStorage()).listUncategorized(userId as UUID);
};

export const getSnippetsByFolder = async (
	folder: string
): Promise<Snippet[]> => {
	const userId = await getUserIdBySession();

	if (!userId) {
		return [];
	}

	return (await getStorage()).listByFolder(userId as UUID, folder);
};

export const getSnippetsByTag = async (tag: string): Promise<Snippet[]> => {
	const userId = await getUserIdBySession();

	if (!userId) {
		return [];
	}

	return (await getStorage()).listByTag(userId as UUID, tag);
};

export const searchSnippets = async (query: string): Promise<Snippet[]> => {
	const userId = await getUserIdBySession();

	if (!userId) {
		return [];
	}

	return (await getStorage()).search(userId as UUID, query);
};

export const saveSnippet = async (
	currentSnippet: CurrentSnippet
): Promise<void> => {
	const userId = await getUserIdBySession();

	if (!userId) {
		return;
	}

	await (await getStorage()).save(userId as UUID, currentSnippet);
};

export const trashRestoreSnippet = async (
	snippetId: UUID,
	state: SnippetState = SnippetState.Inactive
): Promise<void> => {
	const userId = await getUserIdBySession();

	if (!userId) {
		return;
	}

	await (await getStorage()).setState(userId as UUID, snippetId, state);
};

export const setSnippetState = async (
	snippetId: UUID,
	state: SnippetState
): Promise<void> => {
	const userId = await getUserIdBySession();

	if (!userId) {
		return;
	}

	await (await getStorage()).setState(userId as UUID, snippetId, state);
};

export const emptyTrash = async (): Promise<void> => {
	const userId = await getUserIdBySession();

	if (!userId) {
		return;
	}

	await (await getStorage()).emptyTrash(userId as UUID);
};

export const setNewSnippet = async (): Promise<Snippet | null> => {
	const userId = await getUserIdBySession();

	return userId ? new SnippetValueObject(userId as UUID) : null;
};

export const saveSnippetVersion = async (
	snippetId: UUID,
	currentSnippet: CurrentSnippet
): Promise<void> => {
	const userId = await getUserIdBySession();

	if (!userId) {
		return;
	}

	await (
		await getStorage()
	).saveVersion(userId as UUID, snippetId, currentSnippet);
};

export const getSnippetVersions = async (
	snippetId: UUID
): Promise<SnippetVersion[]> => (await getStorage()).getVersions(snippetId);

export const getSnippetVersion = async (
	versionId: UUID
): Promise<SnippetVersion | null> => (await getStorage()).getVersion(versionId);

export const toggleSnippetPublic = async (
	snippetId: UUID,
	isPublic: boolean,
	existingSlug: string | null = null
): Promise<string | null> => {
	const userId = await getUserIdBySession();

	if (!userId) {
		return null;
	}

	return (await getStorage()).togglePublic(
		userId as UUID,
		snippetId,
		isPublic,
		existingSlug
	);
};
