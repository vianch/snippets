import supabase from "@/lib/supabase/client";

export const getAllSnippets = async (): Promise<Snippet[]> => {
	if (supabase) {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (user?.id) {
			const { data } = await supabase
				.from("snippet")
				.select()
				.eq("user_id", user.id);

			return data as Snippet[];
		}
	}

	return [] as Snippet[];
};

export const saveSnippet = async (
	currentSnippet: CurrentSnippet,
	callBack: null | (() => void)
): Promise<void> => {
	if (supabase) {
		const { error } = await supabase
			.from("snippet")
			.update({
				snippet: currentSnippet.snippet,
				language: currentSnippet.language,
				name: currentSnippet?.name,
				updated_at: new Date().toISOString(),
			})
			.eq("snippet_id", currentSnippet?.snippet_id);

		if (!error && callBack) {
			callBack();
		}
	}
};
