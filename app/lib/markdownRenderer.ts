import DOMPurify from "isomorphic-dompurify";
import { Marked } from "marked";

/* Lib */
import { getHighlightedFenceCode } from "@/lib/config/shiki";
import wikiLinkMarked from "@/lib/wikiLinkMarked";

/* Utils */
import { escapeHtml } from "@/utils/string.utils";

/* Types */
import type { ThemeName } from "@/lib/config/themes";

const normalizeFenceLanguage = (language?: string): string =>
	(language ?? "").trim().split(/\s+/)[0]?.toLowerCase() ?? "";

// A normalized language never contains whitespace, so a single space cannot
// collide as a separator between the language and the (verbatim) code body.
const fenceCacheKey = (language: string, code: string): string =>
	`${language} ${code}`;

export const renderMarkdownToHtml = async (
	content: string,
	theme: ThemeName
): Promise<string> => {
	const highlightedByKey = new Map<string, string>();
	const markedInstance = new Marked();

	markedInstance.use(wikiLinkMarked);

	markedInstance.use({
		async: true,
		walkTokens: async (token) => {
			if (token.type !== "code") {
				return;
			}

			const fenceLanguage = normalizeFenceLanguage(token.lang);
			const highlighted = await getHighlightedFenceCode(
				token.text,
				fenceLanguage,
				theme
			);

			if (highlighted) {
				highlightedByKey.set(
					fenceCacheKey(fenceLanguage, token.text),
					highlighted
				);
			}
		},
		renderer: {
			code(token) {
				const fenceLanguage = normalizeFenceLanguage(token.lang);
				const highlighted = highlightedByKey.get(
					fenceCacheKey(fenceLanguage, token.text)
				);

				if (highlighted) {
					return highlighted;
				}

				const escaped = escapeHtml(token.text);
				const languageClass = fenceLanguage
					? ` class="language-${escapeHtml(fenceLanguage)}"`
					: "";

				return `<pre><code${languageClass}>${escaped}</code></pre>`;
			},
		},
	});

	const rawHtml = await markedInstance.parse(content);

	return DOMPurify.sanitize(rawHtml, {
		ADD_ATTR: ["data-wiki-target"],
	});
};
