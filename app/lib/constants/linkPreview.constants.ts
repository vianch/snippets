export const LinkPreviewAllowedProtocol = "https:";

export const LinkPreviewMaxRedirects = 3;

export const LinkPreviewFetchTimeoutMs = 3_000;

// Enough to cover a realistic <head> (og tags, title, description) without
// ever buffering an attacker-controlled arbitrary-size body.
export const LinkPreviewMaxBodyBytes = 512 * 1024;

export const LinkPreviewCacheTtlMs = 10 * 60 * 1000;

// Oldest-eviction bound on the in-memory cache so a flood of distinct URLs
// cannot grow the Map without limit.
export const LinkPreviewCacheMaxEntries = 500;

export const LinkPreviewAllowedContentTypePattern = /^text\/html\b/i;

// `[vianch](www.vianch.com)` has no scheme; assume https rather than
// discarding the link, since https is the only scheme previews allow.
export const LinkPreviewSchemePattern = /^[a-z][a-z\d+\-.]*:/i;

export const LinkPreviewHostnameSeparator = ".";

// GFM autolinks a bare URL into the same `link` token an explicit
// `[label](url)` produces; only the token's raw text tells them apart.
export const LinkPreviewMarkdownLinkPrefix = "[";

export const LinkPreviewImageExtensionPattern =
	/\.(?:apng|avif|bmp|gif|jpe?g|png|svg|webp)$/i;

export const LinkPreviewOgImagePattern =
	/<meta[^>]+(?:property|name)=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i;

export const LinkPreviewOgTitlePattern =
	/<meta[^>]+(?:property|name)=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i;

export const LinkPreviewOgDescriptionPattern =
	/<meta[^>]+(?:property|name)=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i;

export const LinkPreviewOgSiteNamePattern =
	/<meta[^>]+(?:property|name)=["']og:site_name["'][^>]*content=["']([^"']+)["'][^>]*>/i;

export const LinkPreviewTitleTagPattern = /<title[^>]*>([^<]*)<\/title>/i;

export const LinkPreviewMetaDescriptionPattern =
	/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i;

export const LinkPreviewHeadClosingPattern = /<\/head>/i;

// IPv4-mapped IPv6 forms (::ffff:10.0.0.1, ::ffff:a00:1) resolve to private
// space but do not match the plain IPv6 patterns in network.ts; catch them
// separately before falling back to the shared IPv4/IPv6 checks.
export const LinkPreviewIpv4MappedPattern = /^::ffff:/i;
