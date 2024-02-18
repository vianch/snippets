function sortSnippetsByUpdatedAt(snippets: Snippet[]): Snippet[] {
	return snippets.sort((a, b) => {
		// Parse updated_at strings into Date objects for accurate comparison
		const dateA = new Date(a.updated_at);
		const dateB = new Date(b.updated_at);

		// Sort in descending order (most recently updated first)
		return dateB.getTime() - dateA.getTime();
	});
}

export default sortSnippetsByUpdatedAt;
