import supabase from "@/lib/supabase/client";
import SnippetValueObject from "@/lib/models/Snippet";
import { SnippetState } from "@/lib/constants/core";
import { AuthError, UserAttributes, UserResponse } from "@supabase/supabase-js";

export const getUserDataFromServer = async (): Promise<User> => {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return user as User;
};

export const getUserDataFromSession = async (): Promise<Session> => {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return session as Session;
};

export const getUserIdBySession = async (): Promise<string | null> => {
	const session = await getUserDataFromSession();

	if (session) {
		return session?.user?.id;
	}

	const userFromServer = await getUserDataFromServer();

	return userFromServer?.id ?? null;
};

export const getUserEmailBySession = async (): Promise<
	string | undefined | null
> => {
	const session = await getUserDataFromSession();

	if (session) {
		return session?.user?.email;
	}

	const userFromServer = await getUserDataFromServer();

	return userFromServer?.email ?? null;
};

export const getAllSnippets = async (): Promise<Snippet[]> => {
	if (supabase) {
		const userId = await getUserIdBySession();

		if (userId) {
			const { data } = await supabase
				.from("snippet")
				.select()
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
				.select()
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
				.select()
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
				.select()
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
				.select()
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
				.select()
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
		throw new Error("Not authenticated");
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
		throw new Error("Error saving snippet");
	}

	if (updated && updated.length > 0) {
		return;
	}

	const { error: insertError } = await supabase
		.from("snippet")
		.insert({ ...payload, user_id: userId });

	if (insertError) {
		throw new Error("Error saving snippet");
	}
};

export const trashRestoreSnippet = async (
	snippetId: UUID,
	state: SnippetState = SnippetState.Inactive
): Promise<void> => {
	if (!supabase) return;

	const userId = await getUserIdBySession();

	if (!userId) {
		throw new Error("Not authenticated");
	}

	const { error } = await supabase
		.from("snippet")
		.update({ state })
		.match({ snippet_id: snippetId, user_id: userId });

	if (error) {
		throw new Error("Error trashing snippet");
	}
};

export const setSnippetState = async (
	snippetId: UUID,
	state: SnippetState
): Promise<void> => {
	if (!supabase) return;

	const userId = await getUserIdBySession();

	if (!userId) {
		throw new Error("Not authenticated");
	}

	const { error } = await supabase
		.from("snippet")
		.update({ state })
		.match({ snippet_id: snippetId, user_id: userId });

	if (error) {
		throw new Error("Error updating snippet state");
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
				throw new Error("Error emptying trash");
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

export const saveSnippetVersion = async (
	snippetId: UUID,
	currentSnippet: CurrentSnippet
): Promise<void> => {
	if (supabase) {
		const userId = await getUserIdBySession();

		if (!userId) {
			throw new Error("Not authenticated");
		}

		const { data: parent } = await supabase
			.from("snippet")
			.select("snippet_id")
			.match({ snippet_id: snippetId, user_id: userId })
			.maybeSingle();

		if (!parent) {
			throw new Error("Snippet not found");
		}

		const { data: latestVersion } = await supabase
			.from("snippet_version")
			.select("version_number")
			.eq("snippet_id", snippetId)
			.order("version_number", { ascending: false })
			.limit(1)
			.single();

		const nextVersion = (latestVersion?.version_number ?? 0) + 1;

		const { error } = await supabase.from("snippet_version").insert({
			snippet_id: snippetId,
			content: currentSnippet.snippet,
			language: currentSnippet.language,
			name: currentSnippet.name,
			tags: currentSnippet.tags ?? null,
			version_number: nextVersion,
		});

		if (error) {
			throw new Error("Error saving snippet version");
		}
	}
};

export const getSnippetVersions = async (
	snippetId: UUID
): Promise<SnippetVersion[]> => {
	if (supabase) {
		const { data } = await supabase
			.from("snippet_version")
			.select()
			.eq("snippet_id", snippetId)
			.order("version_number", { ascending: false })
			.limit(5);

		return (data ?? []) as SnippetVersion[];
	}

	return [];
};

export const getSnippetVersion = async (
	versionId: UUID
): Promise<SnippetVersion | null> => {
	if (supabase) {
		const { data } = await supabase
			.from("snippet_version")
			.select()
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
		throw new Error("Not authenticated");
	}

	const slug = isPublic ? (existingSlug ?? generateSlug()) : existingSlug;

	const { error } = await supabase
		.from("snippet")
		.update({ is_public: isPublic, public_slug: slug })
		.match({ snippet_id: snippetId, user_id: userId });

	if (error) {
		throw new Error("Error toggling snippet visibility");
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
		throw new Error("Error saving smart groups");
	}
};

export const updateUser = async (
	attributes: UserAttributes
): Promise<UserResponse> => {
	if (supabase) {
		return supabase.auth.updateUser(attributes);
	}

	return {
		error: new AuthError("Supabase client not initialized", 503, undefined),
		data: { user: null },
	};
};
