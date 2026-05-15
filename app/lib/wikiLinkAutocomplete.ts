import {
	autocompletion,
	CompletionContext,
	CompletionResult,
	Completion,
} from "@codemirror/autocomplete";
import { Extension } from "@codemirror/state";

const maxSuggestions = 20;

const wikiLinkAutocomplete = (snippets: Snippet[]): Extension => {
	const source = (context: CompletionContext): CompletionResult | null => {
		const match = context.matchBefore(/\[\[([^[\]\n]*)/);

		if (!match) return null;

		const query = match.text.slice(2).toLowerCase();
		const options: Completion[] = snippets
			.filter(
				(snippet) => snippet.name && snippet.name.toLowerCase().includes(query)
			)
			.slice(0, maxSuggestions)
			.map((snippet) => ({
				label: snippet.name,
				type: "text",
				apply: `[[${snippet.name}]]`,
			}));

		return {
			from: match.from,
			options,
			validFor: /^\[\[[^[\]\n]*$/,
		};
	};

	return autocompletion({ override: [source] });
};

export default wikiLinkAutocomplete;
