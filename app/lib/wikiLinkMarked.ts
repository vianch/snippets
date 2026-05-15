import type { MarkedExtension, Tokens } from "marked";

type WikiLinkToken = Tokens.Generic & {
	type: "wikiLink";
	raw: string;
	target: string;
};

const escapeHtml = (text: string): string =>
	text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

const wikiLinkMarked: MarkedExtension = {
	extensions: [
		{
			name: "wikiLink",
			level: "inline",
			start(src: string): number | undefined {
				const index = src.indexOf("[[");

				return index === -1 ? undefined : index;
			},
			tokenizer(src: string): WikiLinkToken | undefined {
				const match = /^\[\[([^[\]\n]+)\]\]/.exec(src);

				if (match) {
					return {
						type: "wikiLink",
						raw: match[0],
						target: match[1].trim(),
					};
				}

				return undefined;
			},
			renderer(token: Tokens.Generic): string {
				const target = (token as WikiLinkToken).target;
				const escaped = escapeHtml(target);

				return `<button type="button" class="wiki-link" data-wiki-target="${escaped}">${escaped}</button>`;
			},
		},
	],
};

export default wikiLinkMarked;
