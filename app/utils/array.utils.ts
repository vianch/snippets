import { SnippetState } from "@/lib/constants/core";

function sortSnippetsByUpdatedAt(snippets: Snippet[]): Snippet[] {
	return snippets.sort((a, b) => {
		// Parse updated_at strings into Date objects for accurate comparison
		const dateA = new Date(a.updated_at);
		const dateB = new Date(b.updated_at);

		// Sort in descending order (most recently updated first)
		return dateB.getTime() - dateA.getTime();
	});
}

export function pinFavoritesFirst(snippets: Snippet[]): Snippet[] {
	return [...snippets].sort((firstSnippet, secondSnippet) => {
		const firstWeight = firstSnippet.state === SnippetState.Favorite ? 0 : 1;
		const secondWeight = secondSnippet.state === SnippetState.Favorite ? 0 : 1;

		return firstWeight - secondWeight;
	});
}

export default sortSnippetsByUpdatedAt;
