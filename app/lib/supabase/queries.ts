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
				.eq("user_id", userId);

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
		});

		if (error) {
			throw new Error("Error saving snippet");
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
