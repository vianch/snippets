import { ReactElement } from "react";
import { Metadata } from "next";

import { getPublicSnippetBySlug } from "@/lib/supabase/public";
import PublicSnippetView from "./PublicSnippetView";

type PageProps = {
	params: Promise<{ slug: string }>;
};

const buildDescription = (snippet: Snippet): string => {
	if (snippet.notes && snippet.notes.trim().length > 0) {
		return snippet.notes.slice(0, 160);
	}

	const firstLine = snippet.snippet.split("\n").find((line) => line.trim());

	return firstLine
		? firstLine.slice(0, 160)
		: `A ${snippet.language} snippet shared via Snippets`;
};

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const snippet = await getPublicSnippetBySlug(slug);

	if (!snippet) {
		return {
			title: "Snippet not found",
			robots: { index: false, follow: false },
		};
	}

	const description = buildDescription(snippet);

	return {
		title: `${snippet.name} — Snippets`,
		description,
		openGraph: {
			title: snippet.name,
			description,
			type: "article",
		},
		twitter: {
			card: "summary_large_image",
			title: snippet.name,
			description,
		},
	};
}

export default async function PublicSnippetPage({
	params,
}: PageProps): Promise<ReactElement> {
	const { slug } = await params;
	const snippet = await getPublicSnippetBySlug(slug);

	return <PublicSnippetView snippet={snippet} />;
}
