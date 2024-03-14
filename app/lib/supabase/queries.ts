import supabase from "@/lib/supabase/client";
import SnippetValueObject from "@/lib/models/Snippet";

export const getAllSnippets = async (): Promise<Snippet[]> => {
	if (supabase) {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		const userId = session?.user?.id || null;

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
		const {
			data: { session },
		} = await supabase.auth.getSession();
		const userId = session?.user?.id || null;

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

export const setNewSnippet = async (): Promise<Snippet | null> => {
	if (supabase) {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		const userId = session?.user?.id || null;

		if (userId) {
			return new SnippetValueObject(userId as UUID);
		}
	}

	return null;
};

export const getTags = async (): Promise<TagItem[]> => {
	if (supabase) {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		const userId = session?.user?.id || null;

		if (userId) {
			const { data: tags } = await supabase
				.from("tag")
				.select("name, tag_id, total_snippets")
				.order("name", { ascending: true })
				.match({ user_id: userId });

			return tags as TagItem[];
		}
	}

	return [] as TagItem[];
};
