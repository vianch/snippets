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
		.select("name, snippet, language, tags, notes, url")
		.eq("public_slug", slug)
		.eq("is_public", true)
		.neq("state", SnippetState.Inactive)
		.maybeSingle();

	// Project only the fields the public share surface renders. This keeps
	// internal columns (user_id, snippet_id, timestamps, folder) out of the
	// anon-readable response; the cast narrows the row to that public-safe subset.
	return data as Snippet | null;
};
