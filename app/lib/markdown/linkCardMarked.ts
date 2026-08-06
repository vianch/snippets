import type { MarkedExtension, Tokens } from "marked";

/* Lib */
import { LinkPreviewMarkdownLinkPrefix } from "@/lib/constants/linkPreview.constants";

/* Utils */
import {
	hasImageExtension,
	normalizeLinkPreviewUrl,
} from "@/utils/linkPreview.utils";

const escapeHtml = (text: string): string =>
	text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");

// Turns a paragraph whose entire content is one markdown link —
// `[label](url)` — into an inline image (when the target is an image file) or
// a hydration placeholder for a link-preview card.
//
// This hooks the paragraph renderer rather than tokenizing raw text, because
// by this point marked has already decided that `[a](b)` is a link and
// `![a](b)` is an image: a text-level tokenizer cannot tell them apart, since
// marked re-scans for block starts from one character in and the leading `!`
// is no longer visible.
//
// Anything else — a bare URL, an inline link inside prose, a non-https
// target, `![alt](url)` images, raw <img> elements — returns false and falls
// through to marked's default rendering.
const linkCardMarked: MarkedExtension = {
	renderer: {
		paragraph(token: Tokens.Paragraph): string | false {
			const [child] = token.tokens ?? [];

			if (token.tokens?.length !== 1 || child?.type !== "link") {
				return false;
			}

			// Narrowed by the type check above.
			const link = child as Tokens.Link;

			// A bare URL is autolinked into the same token shape; only an
			// explicit `[label](url)` gets a card.
			if (!link.raw.startsWith(LinkPreviewMarkdownLinkPrefix)) {
				return false;
			}

			const url = normalizeLinkPreviewUrl(link.href);

			if (!url) {
				return false;
			}

			const escapedUrl = escapeHtml(url);
			const linkText = escapeHtml(link.text || url);

			if (hasImageExtension(url)) {
				return `<img src="${escapedUrl}" alt="${linkText}" loading="lazy" referrerpolicy="no-referrer" />`;
			}

			return (
				`<div class="link-card" data-link-card-url="${escapedUrl}">` +
				`<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>` +
				"</div>"
			);
		},
	},
};

export default linkCardMarked;
