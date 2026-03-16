import supabase from "@/lib/supabase/client";
import SnippetValueObject from "@/lib/models/Snippet";
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
				.neq("state", "inactive");

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
				.neq("state", "inactive")
				.or("tags.is.null,tags.eq.");

			return data as Snippet[];
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
				.neq("state", "inactive")
				.like("tags", `%${tag}%`);

			return data as Snippet[];
		}
	}

	return [] as Snippet[];
};

export const saveSnippet = async (
	currentSnippet: CurrentSnippet
): Promise<void> => {
	if (supabase) {
		const { error } = await supabase.from("snippet").upsert({
			snippet_id: currentSnippet.snippet_id,
			snippet: currentSnippet.snippet,
			language: currentSnippet.language,
			name: currentSnippet?.name,
			updated_at: currentSnippet?.updated_at,
			state: currentSnippet?.state,
			tags: currentSnippet?.tags ?? null,
			url: currentSnippet?.url ?? null,
			notes: currentSnippet?.notes ?? null,
		});

		if (error) {
			throw new Error("Error saving snippet");
		}
	}
};

export const trashRestoreSnippet = async (
	snippetId: UUID,
	state: SnippetState = "inactive"
): Promise<void> => {
	if (supabase) {
		const { error } = await supabase
			.from("snippet")
			.update({ state })
			.match({ snippet_id: snippetId });

		if (error) {
			throw new Error("Error trashing snippet");
		}
	}
};

export const emptyTrash = async (): Promise<void> => {
	if (supabase) {
		const userId = await getUserIdBySession();

		if (userId) {
			const { error } = await supabase
				.from("snippet")
				.delete()
				.match({ user_id: userId, state: "inactive" });

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

		const { data: allVersions } = await supabase
			.from("snippet_version")
			.select("version_id")
			.eq("snippet_id", snippetId)
			.order("version_number", { ascending: false });

		if (allVersions && allVersions.length > 5) {
			const excessIds = allVersions.slice(5).map((v) => v.version_id);

			await supabase
				.from("snippet_version")
				.delete()
				.in("version_id", excessIds);
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
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	let slug = "";

	for (let i = 0; i < 10; i++) {
		slug += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return slug;
};

export const toggleSnippetPublic = async (
	snippetId: UUID,
	isPublic: boolean,
	existingSlug: string | null = null
): Promise<string | null> => {
	if (supabase) {
		const slug = isPublic ? (existingSlug ?? generateSlug()) : existingSlug;

		const { error } = await supabase
			.from("snippet")
			.update({ is_public: isPublic, public_slug: slug })
			.match({ snippet_id: snippetId });

		if (error) {
			throw new Error("Error toggling snippet visibility");
		}

		return slug;
	}

	return null;
};

export const getPublicSnippet = async (
	slug: string
): Promise<Snippet | null> => {
	if (supabase && slug) {
		const { data } = await supabase
			.from("snippet")
			.select()
			.eq("public_slug", slug)
			.eq("is_public", true)
			.neq("state", "inactive")
			.single();

		return data as Snippet | null;
	}

	return null;
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
