import { createClient } from "@supabase/supabase-js";

import { SnippetState } from "@/lib/constants/core";

const publicClient = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL || "",
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export const getPublicSnippetBySlug = async (
	slug: string
): Promise<Snippet | null> => {
	if (!slug) return null;

	const { data } = await publicClient
		.from("snippet")
		.select()
		.eq("public_slug", slug)
		.eq("is_public", true)
		.neq("state", SnippetState.Inactive)
		.maybeSingle();

	return data as Snippet | null;
};
