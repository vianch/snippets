type ResolvedWikiLinks = {
	expandedContext: string;
	unresolved: string[];
};

const wikiLinkPattern = /\[\[([^[\]\n]+)\]\]/g;

const findSnippetByName = (
	snippets: Snippet[],
	name: string
): Snippet | undefined => {
	const target = name.trim().toLowerCase();

	return snippets.find(
		(snippet: Snippet): boolean => (snippet.name ?? "").toLowerCase() === target
	);
};

const extractWikiLinkTargets = (text: string): string[] => {
	const targets: string[] = [];
	const seen = new Set<string>();
	const matches = text.matchAll(wikiLinkPattern);

	for (const match of matches) {
		const target = match[1].trim();
		const key = target.toLowerCase();

		if (target && !seen.has(key)) {
			seen.add(key);
			targets.push(target);
		}
	}

	return targets;
};

const resolveWikiLinks = (
	text: string,
	snippets: Snippet[]
): ResolvedWikiLinks => {
	const targets = extractWikiLinkTargets(text);
	const sections: string[] = [];
	const unresolved: string[] = [];

	targets.forEach((target) => {
		const snippet = findSnippetByName(snippets, target);

		if (!snippet) {
			unresolved.push(target);

			return;
		}

		const language = snippet.language ?? "";
		const body = snippet.snippet ?? "";

		sections.push(
			`### Context: ${snippet.name}\n\`\`\`${language}\n${body}\n\`\`\``
		);
	});

	return {
		expandedContext: sections.join("\n\n"),
		unresolved,
	};
};

export { extractWikiLinkTargets, findSnippetByName, resolveWikiLinks };
