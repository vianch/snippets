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
