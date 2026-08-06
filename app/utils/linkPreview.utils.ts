import {
	LinkPreviewAllowedProtocol,
	LinkPreviewHeadClosingPattern,
	LinkPreviewHostnameSeparator,
	LinkPreviewImageExtensionPattern,
	LinkPreviewIpv4MappedPattern,
	LinkPreviewMetaDescriptionPattern,
	LinkPreviewOgDescriptionPattern,
	LinkPreviewOgImagePattern,
	LinkPreviewOgSiteNamePattern,
	LinkPreviewOgTitlePattern,
	LinkPreviewSchemePattern,
	LinkPreviewTitleTagPattern,
} from "@/lib/constants/linkPreview.constants";
import {
	BlockedHostnames,
	BlockedHostnameSuffixes,
	PrivateIpv4Pattern,
	PrivateIpv6Pattern,
} from "@/lib/constants/network";

import { escapeHtml } from "@/utils/string.utils";

// Normalizes the href of a markdown link into the https URL a preview can be
// fetched for, or null when it is not previewable. A missing scheme is
// assumed to be https (`[vianch](www.vianch.com)`); any other scheme, or an
// href without a real hostname (`/page`, `#anchor`, `mailto:…`), is rejected
// so it keeps rendering as an ordinary link.
const normalizeLinkPreviewUrl = (href: string): string | null => {
	const trimmed = href.trim();

	if (!trimmed) {
		return null;
	}

	const candidate = LinkPreviewSchemePattern.test(trimmed)
		? trimmed
		: `${LinkPreviewAllowedProtocol}//${trimmed}`;

	try {
		const parsed = new URL(candidate);

		if (parsed.protocol !== LinkPreviewAllowedProtocol) {
			return null;
		}

		if (!parsed.hostname.includes(LinkPreviewHostnameSeparator)) {
			return null;
		}

		return parsed.toString();
	} catch {
		return null;
	}
};

const hasImageExtension = (url: string): boolean => {
	try {
		const parsed = new URL(url);

		return LinkPreviewImageExtensionPattern.test(parsed.pathname);
	} catch {
		return false;
	}
};

const decodeHtmlEntities = (text: string): string =>
	text
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">");

// Resolves a possibly-relative image URL against the page's final (post
// redirect) URL and rejects anything that does not resolve to https.
const resolveHttpsImageUrl = (
	candidate: string,
	baseUrl: string
): string | null => {
	try {
		const resolved = new URL(candidate, baseUrl);

		if (resolved.protocol !== LinkPreviewAllowedProtocol) {
			return null;
		}

		return resolved.toString();
	} catch {
		return null;
	}
};

// Textual private/loopback/link-local checks. Callers resolving a hostname
// via DNS must run this against every resolved address, not the hostname.
const isPrivateIpAddress = (address: string): boolean => {
	const normalized = address.toLowerCase();
	const mappedMatch = LinkPreviewIpv4MappedPattern.exec(normalized);

	if (mappedMatch) {
		const mappedSuffix = normalized.slice(mappedMatch[0].length);

		// Only the dotted-decimal mapped form can be checked against the IPv4
		// pattern; an unrecognised (e.g. hex) suffix is blocked conservatively.
		return (
			PrivateIpv4Pattern.test(`${mappedSuffix}.`) || !/^\d/.test(mappedSuffix)
		);
	}

	return (
		PrivateIpv4Pattern.test(`${normalized}.`) ||
		PrivateIpv6Pattern.test(normalized)
	);
};

const isBlockedHostname = (hostname: string): boolean => {
	const normalized = hostname.toLowerCase();

	if (BlockedHostnames.includes(normalized)) {
		return true;
	}

	return BlockedHostnameSuffixes.some((suffix) => normalized.endsWith(suffix));
};

const extractHeadHtml = (html: string): string => {
	const closingMatch = LinkPreviewHeadClosingPattern.exec(html);

	return closingMatch ? html.slice(0, closingMatch.index) : html;
};

const extractLinkPreviewFromHead = (
	html: string,
	finalUrl: string
): LinkPreviewData => {
	const headHtml = extractHeadHtml(html);
	const ogImage = LinkPreviewOgImagePattern.exec(headHtml)?.[1] ?? null;
	const ogTitle = LinkPreviewOgTitlePattern.exec(headHtml)?.[1] ?? null;
	const ogDescription =
		LinkPreviewOgDescriptionPattern.exec(headHtml)?.[1] ?? null;
	const ogSiteName = LinkPreviewOgSiteNamePattern.exec(headHtml)?.[1] ?? null;
	const titleTag = LinkPreviewTitleTagPattern.exec(headHtml)?.[1] ?? null;
	const metaDescription =
		LinkPreviewMetaDescriptionPattern.exec(headHtml)?.[1] ?? null;
	const image = ogImage ? resolveHttpsImageUrl(ogImage, finalUrl) : null;

	return {
		description: ogDescription
			? decodeHtmlEntities(ogDescription)
			: metaDescription
				? decodeHtmlEntities(metaDescription)
				: null,
		image,
		siteName: ogSiteName ? decodeHtmlEntities(ogSiteName) : null,
		title: ogTitle
			? decodeHtmlEntities(ogTitle)
			: titleTag
				? decodeHtmlEntities(titleTag)
				: null,
		url: finalUrl,
	};
};

// escapeHtml only neutralizes &, <, > — safe for text content but not for
// unquoted-breakout inside a double-quoted attribute value.
const escapeAttribute = (value: string): string =>
	escapeHtml(value).replace(/"/g, "&quot;");

const getUrlHostname = (url: string): string => {
	try {
		return new URL(url).hostname;
	} catch {
		return url;
	}
};

// Builds the sanitized hydration markup for one `.link-card` placeholder.
// Every dynamic field is attacker-influenced (it comes from the remote
// page's <head>) and must be escaped before interpolation — this never
// passes through the DOMPurify pipeline since it replaces DOM content
// directly.
const buildLinkCardMarkup = (preview: LinkPreviewData): string => {
	const escapedUrl = escapeAttribute(preview.url);
	const displayTitle = preview.title || preview.url;
	const displaySite = preview.siteName || getUrlHostname(preview.url);
	const imageMarkup = preview.image
		? `<img class="link-card-image" src="${escapeAttribute(preview.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" />`
		: "";
	const descriptionMarkup = preview.description
		? `<span class="link-card-description">${escapeHtml(preview.description)}</span>`
		: "";

	return (
		`<a class="link-card-link" href="${escapedUrl}" target="_blank" rel="noopener noreferrer">` +
		imageMarkup +
		'<span class="link-card-body">' +
		`<span class="link-card-title">${escapeHtml(displayTitle)}</span>` +
		descriptionMarkup +
		`<span class="link-card-site">${escapeHtml(displaySite)}</span>` +
		"</span>" +
		"</a>"
	);
};

export {
	buildLinkCardMarkup,
	extractLinkPreviewFromHead,
	hasImageExtension,
	isBlockedHostname,
	isPrivateIpAddress,
	normalizeLinkPreviewUrl,
};
