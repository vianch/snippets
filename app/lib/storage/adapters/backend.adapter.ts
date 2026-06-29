import {
	StorageApiBasePath,
	StorageOp,
} from "@/lib/constants/storage.constants";

// Client adapter for every credentialed/server-side backend (PostgreSQL, MySQL,
// Turso, local SQLite). The browser can't open raw TCP, so it posts the op to
// the storage endpoint, which injects the authenticated userId server-side.

const callStorage = async <ResultType>(
	op: StorageOp,
	args: unknown[]
): Promise<ResultType> => {
	const response = await fetch(`${StorageApiBasePath}/snippets`, {
		body: JSON.stringify({ args, op }),
		headers: { "Content-Type": "application/json" },
		method: "POST",
	});
	const payload = (await response.json().catch(() => ({}))) as {
		error?: string;
		result?: ResultType;
	};

	if (!response.ok) {
		throw new Error(payload.error ?? "Storage request failed");
	}

	return payload.result as ResultType;
};

// CurrentSnippet carries a non-serializable CodeMirror `extension`; send only
// the persisted scalar fields.
const serializeSnapshot = (snapshot: CurrentSnippet): Snippet => ({
	created_at: snapshot.created_at,
	folder: snapshot.folder ?? null,
	is_public: snapshot.is_public,
	language: snapshot.language,
	name: snapshot.name,
	notes: snapshot.notes,
	public_slug: snapshot.public_slug,
	snippet: snapshot.snippet,
	snippet_id: snapshot.snippet_id,
	state: snapshot.state,
	tags: snapshot.tags ?? null,
	updated_at: snapshot.updated_at,
	url: snapshot.url,
	user_id: snapshot.user_id,
});

export const backendAdapter: SnippetStorage = {
	emptyTrash: () => callStorage(StorageOp.EmptyTrash, []),
	getPublicBySlug: (slug) => callStorage(StorageOp.GetPublicBySlug, [slug]),
	getVersion: (versionId) => callStorage(StorageOp.GetVersion, [versionId]),
	getVersions: (snippetId) => callStorage(StorageOp.GetVersions, [snippetId]),
	list: () => callStorage(StorageOp.List, []),
	listByFolder: (_userId, folder) =>
		callStorage(StorageOp.ListByFolder, [folder]),
	listByState: (_userId, state) => callStorage(StorageOp.ListByState, [state]),
	listByTag: (_userId, tag) => callStorage(StorageOp.ListByTag, [tag]),
	listUncategorized: () => callStorage(StorageOp.ListUncategorized, []),
	save: (_userId, snapshot) =>
		callStorage(StorageOp.Save, [serializeSnapshot(snapshot)]),
	saveVersion: (_userId, snippetId, snapshot) =>
		callStorage(StorageOp.SaveVersion, [
			snippetId,
			serializeSnapshot(snapshot),
		]),
	search: (_userId, query) => callStorage(StorageOp.Search, [query]),
	setState: (_userId, snippetId, state) =>
		callStorage(StorageOp.SetState, [snippetId, state]),
	togglePublic: (_userId, snippetId, isPublic, existingSlug) =>
		callStorage(StorageOp.TogglePublic, [snippetId, isPublic, existingSlug]),
};
