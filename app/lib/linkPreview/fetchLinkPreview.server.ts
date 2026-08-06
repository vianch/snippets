import { lookup } from "node:dns/promises";

import {
	LinkPreviewAllowedContentTypePattern,
	LinkPreviewAllowedProtocol,
	LinkPreviewCacheMaxEntries,
	LinkPreviewCacheTtlMs,
	LinkPreviewFetchTimeoutMs,
	LinkPreviewMaxBodyBytes,
	LinkPreviewMaxRedirects,
} from "@/lib/constants/linkPreview.constants";
import { HttpStatusCode } from "@/lib/constants/ui.constants";
import {
	extractLinkPreviewFromHead,
	isBlockedHostname,
	isPrivateIpAddress,
} from "@/utils/linkPreview.utils";

// Bounded, oldest-eviction cache — insertion order is Map's natural order, so
// evicting `.keys().next().value` always removes the longest-lived entry.
const previewCache = new Map<string, LinkPreviewCacheEntry>();

const readCache = (url: string): LinkPreviewData | null => {
	const entry = previewCache.get(url);

	if (!entry) {
		return null;
	}

	if (entry.expiresAt < Date.now()) {
		previewCache.delete(url);

		return null;
	}

	return entry.preview;
};

const writeCache = (url: string, preview: LinkPreviewData): void => {
	if (previewCache.size >= LinkPreviewCacheMaxEntries) {
		const oldestKey = previewCache.keys().next().value;

		if (oldestKey !== undefined) {
			previewCache.delete(oldestKey);
		}
	}

	previewCache.set(url, {
		expiresAt: Date.now() + LinkPreviewCacheTtlMs,
		preview,
	});
};

// Every hop (the initial URL and every redirect target) must independently
// pass scheme + hostname + resolved-IP checks — a redirect is exactly how an
// attacker turns an allowed public URL into a request against an internal
// service.
const assertSafeDestination = async (candidateUrl: URL): Promise<void> => {
	if (candidateUrl.protocol !== LinkPreviewAllowedProtocol) {
		throw new Error("Blocked destination: disallowed protocol");
	}

	const hostname = candidateUrl.hostname.toLowerCase();

	if (isBlockedHostname(hostname)) {
		throw new Error("Blocked destination: disallowed hostname");
	}

	const resolvedAddresses = await lookup(hostname, { all: true }).catch(
		() => []
	);

	if (resolvedAddresses.length === 0) {
		throw new Error("Blocked destination: hostname did not resolve");
	}

	const hasPrivateAddress = resolvedAddresses.some((resolved) =>
		isPrivateIpAddress(resolved.address)
	);

	if (hasPrivateAddress) {
		throw new Error("Blocked destination: resolved address is private");
	}
};

// Reads the response body up to the byte cap and aborts (rather than
// buffering an unbounded upstream response) past it.
const readBodyWithCap = async (response: Response): Promise<string> => {
	const reader = response.body?.getReader();

	if (!reader) {
		return "";
	}

	const decoder = new TextDecoder();
	const chunks: string[] = [];
	let totalBytes = 0;
	let isFinished = false;

	try {
		while (!isFinished) {
			const { done, value } = await reader.read();

			if (done) {
				isFinished = true;

				continue;
			}

			totalBytes += value.byteLength;

			if (totalBytes > LinkPreviewMaxBodyBytes) {
				chunks.push(decoder.decode(value.slice(0, LinkPreviewMaxBodyBytes)));
				isFinished = true;

				continue;
			}

			chunks.push(decoder.decode(value, { stream: true }));
		}
	} finally {
		await reader.cancel().catch(() => undefined);
	}

	return chunks.join("");
};

const fetchWithManualRedirects = async (
	initialUrl: URL,
	abortSignal: AbortSignal
): Promise<{ finalUrl: URL; html: string } | null> => {
	let currentUrl = initialUrl;

	for (let hop = 0; hop <= LinkPreviewMaxRedirects; hop += 1) {
		await assertSafeDestination(currentUrl);

		const response = await fetch(currentUrl, {
			headers: { Accept: "text/html" },
			redirect: "manual",
			signal: abortSignal,
		});

		const isRedirect =
			response.status >= HttpStatusCode.MultipleChoices &&
			response.status < HttpStatusCode.BadRequest;
		const location = response.headers.get("location");

		if (isRedirect && location) {
			currentUrl = new URL(location, currentUrl);

			continue;
		}

		const contentType = response.headers.get("content-type") ?? "";

		if (!LinkPreviewAllowedContentTypePattern.test(contentType)) {
			return null;
		}

		const html = await readBodyWithCap(response);

		return { finalUrl: currentUrl, html };
	}

	return null;
};

// Server-side entry point for the API route: resolves + validates the
// destination on every hop, fetches under a hard timeout and body cap, and
// caches the parsed result. Returns null on any rejection or upstream
// failure — the route turns that into a generic error, never the upstream
// error text.
const fetchLinkPreview = async (
	rawUrl: string
): Promise<LinkPreviewData | null> => {
	const cached = readCache(rawUrl);

	if (cached) {
		return cached;
	}

	let initialUrl: URL;

	try {
		initialUrl = new URL(rawUrl);
	} catch {
		return null;
	}

	const abortController = new AbortController();
	const timeoutHandle = setTimeout(
		() => abortController.abort(),
		LinkPreviewFetchTimeoutMs
	);

	try {
		const result = await fetchWithManualRedirects(
			initialUrl,
			abortController.signal
		);

		if (!result) {
			return null;
		}

		const preview = extractLinkPreviewFromHead(
			result.html,
			result.finalUrl.toString()
		);

		writeCache(rawUrl, preview);

		return preview;
	} catch {
		return null;
	} finally {
		clearTimeout(timeoutHandle);
	}
};

export default fetchLinkPreview;
