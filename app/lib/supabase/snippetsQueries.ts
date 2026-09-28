import supabase from "@/lib/supabase/client";
import { logger } from "@/lib/logger/logger";
import SnippetValueObject from "@/lib/models/Snippet";
import {
	getUserDataFromSession,
	getUserIdBySession,
} from "@/lib/supabase/userQueries";
import { SnippetState } from "@/lib/constants/core";
import {
	CreateSnippetVersionFunction,
	SnippetColumns,
	SnippetVersionSummaryColumns,
} from "@/lib/constants/storage.constants";

// Logs the failure to Sentry, then throws so callers and the UI still react.
// `cause` carries the underlying Supabase error when one is available; without
// it the message itself is captured.
const failQuery = (message: string, cause?: unknown): never => {
	logger.error(cause ?? message, { query: message });

	throw new Error(message);
};

export const getAllSnippets = async (): Promise<Snippet[]> => {
	if (supabase) {
		const userId = await getUserIdBySession();

		if (userId) {
			const { data } = await supabase
				.from("snippet")
				.select(SnippetColumns)
				.order("updated_at", { ascending: false })
				.match({ user_id: userId })
				.neq("state", SnippetState.Inactive);

			return data as Snippet[];
		}
	}

	return [] as Snippet[];
};

export const getSnippetsByState = async (
	state: SnippetState
): Promise<Snippet[]> => {
	if (supabase && state) {
		const userId = await getUserIdBySession();

		if (userId) {
			const { data } = await supabase
				.from("snippet")
				.select(SnippetColumns)
				.order("updated_at", { ascending: false })
				.match({ user_id: userId, state });

			return data as Snippet[];
		}
	}

	return [] as Snippet[];
};

export const getUncategorizedSnippets = async (): Promise<Snippet[]> => {
	if (supabase) {
		const userId = await getUserIdBySession();

		if (userId) {
			const { data } = await supabase
				.from("snippet")
				.select(SnippetColumns)
				.order("updated_at", { ascending: false })
				.match({ user_id: userId })
				.neq("state", SnippetState.Inactive)
				.or("tags.is.null,tags.eq.");

			return data as Snippet[];
		}
	}

	return [] as Snippet[];
};

export const getSnippetsByFolder = async (
	folder: string
): Promise<Snippet[]> => {
	if (supabase && folder) {
		const userId = await getUserIdBySession();

		if (userId) {
			const { data } = await supabase
				.from("snippet")
				.select(SnippetColumns)
				.order("updated_at", { ascending: false })
				.match({ user_id: userId, folder })
				.neq("state", SnippetState.Inactive);

			return (data ?? []) as Snippet[];
		}
	}

	return [] as Snippet[];
};

export const getSnippetsByTag = async (tag: string): Promise<Snippet[]> => {
	if (supabase && tag) {
		const userId = await getUserIdBySession();

		if (userId) {
			const { data } = await supabase
				.from("snippet")
				.select(SnippetColumns)
				.order("updated_at", { ascending: false })
				.match({ user_id: userId })
				.neq("state", SnippetState.Inactive)
				.like("tags", `%${tag}%`);

			return data as Snippet[];
		}
	}

	return [] as Snippet[];
};

export const searchSnippets = async (query: string): Promise<Snippet[]> => {
	if (supabase && query) {
		const userId = await getUserIdBySession();

		if (userId) {
			const tsQuery = query
				.trim()
				.split(/\s+/)
				.map((term) => term.replace(/[^a-zA-Z0-9]/g, ""))
				.filter(Boolean)
				.map((term) => `${term}:*`)
				.join(" & ");

			const { data } = await supabase
				.from("snippet")
				.select(SnippetColumns)
				.order("updated_at", { ascending: false })
				.match({ user_id: userId })
				.neq("state", SnippetState.Inactive)
				.textSearch("fts", tsQuery);

			return (data ?? []) as Snippet[];
		}
	}

	return [] as Snippet[];
};

export const saveSnippet = async (
	currentSnippet: CurrentSnippet
): Promise<void> => {
	if (!supabase) return;

	const userId = await getUserIdBySession();

	if (!userId) {
		failQuery("Not authenticated");
	}

	const payload = {
		snippet_id: currentSnippet.snippet_id,
		snippet: currentSnippet.snippet,
		language: currentSnippet.language,
		name: currentSnippet?.name,
		updated_at: currentSnippet?.updated_at,
		state: currentSnippet?.state,
		tags: currentSnippet?.tags ?? null,
		url: currentSnippet?.url ?? null,
		notes: currentSnippet?.notes ?? null,
		folder: currentSnippet?.folder ?? null,
	};

	const { data: updated, error: updateError } = await supabase
		.from("snippet")
		.update(payload)
		.match({ snippet_id: currentSnippet.snippet_id, user_id: userId })
		.select("snippet_id");

	if (updateError) {
		failQuery("Error saving snippet", updateError);
	}

	if (updated && updated.length > 0) {
		return;
	}

	const { error: insertError } = await supabase
		.from("snippet")
		.insert({ ...payload, user_id: userId });

	if (insertError) {
		failQuery("Error saving snippet", insertError);
	}
};

export const trashRestoreSnippet = async (
	snippetId: UUID,
	state: SnippetState = SnippetState.Inactive
): Promise<void> => {
	if (!supabase) return;

	const userId = await getUserIdBySession();

	if (!userId) {
		failQuery("Not authenticated");
	}

	const { error } = await supabase
		.from("snippet")
		.update({ state })
		.match({ snippet_id: snippetId, user_id: userId });

	if (error) {
		failQuery("Error trashing snippet", error);
	}
};

export const setSnippetState = async (
	snippetId: UUID,
	state: SnippetState
): Promise<void> => {
	if (!supabase) return;

	const userId = await getUserIdBySession();

	if (!userId) {
		failQuery("Not authenticated");
	}

	const { error } = await supabase
		.from("snippet")
		.update({ state })
		.match({ snippet_id: snippetId, user_id: userId });

	if (error) {
		failQuery("Error updating snippet state", error);
	}
};

export const emptyTrash = async (): Promise<void> => {
	if (supabase) {
		const userId = await getUserIdBySession();

		if (userId) {
			const { error } = await supabase
				.from("snippet")
				.delete()
				.match({ user_id: userId, state: SnippetState.Inactive });

			if (error) {
				failQuery("Error emptying trash", error);
			}
		}
	}
};

export const setNewSnippet = async (): Promise<Snippet | null> => {
	if (supabase) {
		const userId = await getUserIdBySession();

		if (userId) {
			return new SnippetValueObject(userId as UUID);
		}
	}

	return null;
};

/* ─── Snippet Versioning ─── */

// One statement: the database picks the next version_number, checks ownership of
// the parent snippet, and inserts. Replaces a parent lookup, a max() lookup and
// an insert — and closes the race where two saves read the same max.
export const saveSnippetVersion = async (
	snippetId: UUID,
	currentSnippet: CurrentSnippet
): Promise<void> => {
	if (supabase) {
		const { error } = await supabase.rpc(CreateSnippetVersionFunction, {
			p_content: currentSnippet.snippet,
			p_language: currentSnippet.language,
			p_name: currentSnippet.name,
			p_snippet_id: snippetId,
			p_tags: currentSnippet.tags ?? null,
		});

		if (error) {
			failQuery("Error saving snippet version", error);
		}
	}
};

export const getSnippetVersions = async (
	snippetId: UUID
): Promise<SnippetVersionSummary[]> => {
	if (supabase) {
		const { data } = await supabase
			.from("snippet_version")
			.select(SnippetVersionSummaryColumns)
			.eq("snippet_id", snippetId)
			.order("version_number", { ascending: false })
			.limit(5);

		return (data ?? []) as SnippetVersionSummary[];
	}

	return [];
};

export const getSnippetVersion = async (
	versionId: UUID
): Promise<SnippetVersion | null> => {
	if (supabase) {
		const { data } = await supabase
			.from("snippet_version")
			.select(`${SnippetVersionSummaryColumns}, content`)
			.eq("version_id", versionId)
			.single();

		return data as SnippetVersion | null;
	}

	return null;
};

/* ─── Public Snippets ─── */

const generateSlug = (): string => {
	return crypto.randomUUID().replace(/-/g, "").slice(0, 22);
};

export const toggleSnippetPublic = async (
	snippetId: UUID,
	isPublic: boolean,
	existingSlug: string | null = null
): Promise<string | null> => {
	if (!supabase) return null;

	const userId = await getUserIdBySession();

	if (!userId) {
		failQuery("Not authenticated");
	}

	const slug = isPublic ? (existingSlug ?? generateSlug()) : existingSlug;

	const { error } = await supabase
		.from("snippet")
		.update({ is_public: isPublic, public_slug: slug })
		.match({ snippet_id: snippetId, user_id: userId });

	if (error) {
		failQuery("Error toggling snippet visibility", error);
	}

	return slug;
};

export const getSmartGroups = async (): Promise<SmartGroup[]> => {
	const session = await getUserDataFromSession();
	const stored = session?.user?.user_metadata?.smart_groups;

	if (!Array.isArray(stored)) {
		return [];
	}

	return stored.filter(
		(item): item is SmartGroup =>
			Boolean(item) &&
			typeof item === "object" &&
			typeof (item as SmartGroup).name === "string" &&
			typeof (item as SmartGroup).query === "string"
	);
};

export const saveSmartGroups = async (groups: SmartGroup[]): Promise<void> => {
	if (!supabase) return;

	const { error } = await supabase.auth.updateUser({
		data: { smart_groups: groups },
	});

	if (error) {
		failQuery("Error saving smart groups", error);
	}
};
