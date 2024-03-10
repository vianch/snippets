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

export const getTags = async (): Promise<Item[]> => {
	const tagData = [] as Item[];

	if (supabase) {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		const userId = session?.user?.id || null;

		if (userId) {
			const { data: tags } = await supabase
				.from("tag")
				.select("name, tag_id")
				.order("name", { ascending: true })
				.match({ user_id: userId });

			if (tags && tags.length > 0) {
				const tagPromises = tags.map(
					async (tag: Partial<Item>): Promise<Item | null> => {
						const { count } = await supabase
							.from("snippet_tag")
							.select("*", { count: "exact", head: true })
							.match({ user_id: userId, tag_id: tag?.tag_id ?? "" });

						return count && count > 0
							? ({ ...tag, numberOfItems: count } as Item)
							: null;
					}
				);

				const resolvedTags = await Promise.all(tagPromises);

				tagData.push(...(resolvedTags.filter((tag) => tag !== null) as Item[]));
			}
		}
	}

	return tagData;
};
