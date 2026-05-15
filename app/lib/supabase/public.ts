import { createClient } from "@supabase/supabase-js";

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
		.neq("state", "inactive")
		.maybeSingle();

	return data as Snippet | null;
};
