import { SnippetTableName } from "@/lib/constants/storage.constants";
import {
	emptyTrash,
	getAllSnippets,
	getSnippetVersion,
	getSnippetVersions,
	getSnippetsByFolder,
	getSnippetsByState,
	getSnippetsByTag,
	getUncategorizedSnippets,
	saveSnippet,
	saveSnippetVersion,
	searchSnippets,
	setSnippetState,
	toggleSnippetPublic,
} from "@/lib/supabase/queries";
import supabase from "@/lib/supabase/client";

// The default backend. Delegates to the existing Supabase queries so behavior
// is byte-for-byte identical to before the abstraction. `userId` is ignored
// here because those queries derive it from the session themselves (RLS).
export const supabaseAdapter: SnippetStorage = {
	emptyTrash: () => emptyTrash(),
	getPublicBySlug: async (slug) => {
		const { data } = await supabase
			.from(SnippetTableName)
			.select()
			.match({ is_public: true, public_slug: slug })
			.maybeSingle();

		return (data as Snippet | null) ?? null;
	},
	getVersion: (versionId) => getSnippetVersion(versionId),
	getVersions: (snippetId) => getSnippetVersions(snippetId),
	list: () => getAllSnippets(),
	listByFolder: (_userId, folder) => getSnippetsByFolder(folder),
	listByState: (_userId, state) => getSnippetsByState(state),
	listByTag: (_userId, tag) => getSnippetsByTag(tag),
	listUncategorized: () => getUncategorizedSnippets(),
	save: (_userId, snapshot) => saveSnippet(snapshot),
	saveVersion: (_userId, snippetId, snapshot) =>
		saveSnippetVersion(snippetId, snapshot),
	search: (_userId, query) => searchSnippets(query),
	setState: (_userId, snippetId, state) => setSnippetState(snippetId, state),
	togglePublic: (_userId, snippetId, isPublic, existingSlug) =>
		toggleSnippetPublic(snippetId, isPublic, existingSlug),
};
