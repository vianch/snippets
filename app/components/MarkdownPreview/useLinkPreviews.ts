"use client";

import { RefObject, useEffect } from "react";

/* Utils */
import { buildLinkCardMarkup } from "@/utils/linkPreview.utils";

// Hydrates `.link-card` placeholders left by the markdown renderer: fetches
// a preview for each unique URL and swaps the plain-link fallback for the
// rendered card in place. Runs after every content/theme re-render (the
// `htmlContent` dependency), dedupes fetches per URL, and silently leaves
// the fallback link untouched on any failure.
const useLinkPreviews = (
	containerRef: RefObject<HTMLDivElement | null>,
	htmlContent: string
): void => {
	useEffect(() => {
		const container = containerRef.current;

		if (!container) {
			return;
		}

		const cardElements = Array.from(
			container.querySelectorAll<HTMLElement>(".link-card")
		);

		if (cardElements.length === 0) {
			return;
		}

		const elementsByUrl = new Map<string, HTMLElement[]>();

		cardElements.forEach((element) => {
			const url = element.getAttribute("data-link-card-url");

			if (!url) {
				return;
			}

			const existingElements = elementsByUrl.get(url) ?? [];

			existingElements.push(element);
			elementsByUrl.set(url, existingElements);
		});

		const abortController = new AbortController();

		Array.from(elementsByUrl.entries()).forEach(([url, elements]) => {
			fetch(`/api/link-preview?url=${encodeURIComponent(url)}`, {
				signal: abortController.signal,
			})
				.then((response) => {
					if (!response.ok) {
						return null;
					}

					return response.json() as Promise<LinkPreviewData>;
				})
				.then((preview) => {
					if (!preview) {
						return;
					}

					const markup = buildLinkCardMarkup(preview);

					elements.forEach((element) => {
						element.innerHTML = markup;
					});
				})
				.catch(() => undefined);
		});

		return () => {
			abortController.abort();
		};
	}, [containerRef, htmlContent]);
};

export default useLinkPreviews;
