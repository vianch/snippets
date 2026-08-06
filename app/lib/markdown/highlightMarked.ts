import type { MarkedExtension, Tokens } from "marked";

type HighlightToken = Tokens.Generic & {
	type: "highlight";
	raw: string;
	text: string;
};

const escapeHtml = (text: string): string =>
	text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

const highlightMarked: MarkedExtension = {
	extensions: [
		{
			name: "highlight",
			level: "inline",
			start(src: string): number | undefined {
				const index = src.indexOf("==");

				return index === -1 ? undefined : index;
			},
			tokenizer(src: string): HighlightToken | undefined {
				const match = /^==([^=\n]+)==/.exec(src);

				if (match) {
					return {
						type: "highlight",
						raw: match[0],
						text: match[1],
					};
				}

				return undefined;
			},
			renderer(token: Tokens.Generic): string {
				const highlightedText = (token as HighlightToken).text;
				const escaped = escapeHtml(highlightedText);

				return `<mark class="md-highlight">${escaped}</mark>`;
			},
		},
	],
};

export default highlightMarked;
