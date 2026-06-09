export const computeFolders = (snippets: Snippet[]): TagItem[] => {
	const folderCounts: Record<string, number> = {};

	snippets.forEach((snippet) => {
		const folderName = snippet?.folder?.trim();

		if (folderName) {
			folderCounts[folderName] = (folderCounts[folderName] ?? 0) + 1;
		}
	});

	return Object.keys(folderCounts)
		.sort()
		.map((folder) => ({ name: folder, total: folderCounts[folder] ?? 0 }));
};

export const computeTags = (snippets: Snippet[]): TagItem[] => {
	const tagCounts: Record<string, number> = {};

	snippets.forEach((snippet) => {
		const snippetTags =
			snippet?.tags && snippet.tags.length > 0 ? snippet.tags.split(",") : [];

		snippetTags.forEach((snippetTag: string) => {
			const tagName = snippetTag.trim();

			tagCounts[tagName] = (tagCounts[tagName] ?? 0) + 1;
		});
	});

	return Object.keys(tagCounts)
		.sort()
		.map((tag) => ({ name: tag, total: tagCounts[tag] ?? 0 }));
};
