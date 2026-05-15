"use client";

import { ReactElement, useEffect, useMemo, useRef } from "react";
import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import DOMPurify from "isomorphic-dompurify";

import "katex/dist/katex.min.css";

/* Styles */
import styles from "./markdownPreview.module.css";

marked.use(markedKatex({ throwOnError: false, nonStandard: true }));

const lightThemes = new Set(["catppuccin-latte", "ayu-light", "github-light"]);

type MarkdownPreviewProps = {
	content: string;
	height: string;
};

const MarkdownPreview = ({
	content,
	height,
}: MarkdownPreviewProps): ReactElement => {
	const containerRef = useRef<HTMLDivElement | null>(null);

	const htmlContent = useMemo(() => {
		if (!content) return "";

		const rawHtml = marked.parse(content, { async: false }) as string;

		return DOMPurify.sanitize(rawHtml);
	}, [content]);

	useEffect(() => {
		if (!containerRef.current) return;

		if (!content.includes("```mermaid")) return;

		let cancelled = false;
		const renderId = `mermaid-${Date.now()}`;

		(async () => {
			const mermaid = (await import("mermaid")).default;
			const activeTheme = document.documentElement.dataset.theme ?? "dracula";
			const isDark = !lightThemes.has(activeTheme);

			mermaid.initialize({
				startOnLoad: false,
				theme: isDark ? "dark" : "default",
				securityLevel: "strict",
			});

			const codeBlocks = containerRef.current?.querySelectorAll<HTMLElement>(
				"pre code.language-mermaid"
			);

			if (!codeBlocks || codeBlocks.length === 0) return;

			for (let index = 0; index < codeBlocks.length; index += 1) {
				if (cancelled) return;

				const codeElement = codeBlocks[index];
				const source = codeElement.textContent ?? "";
				const id = `${renderId}-${index}`;

				try {
					const { svg } = await mermaid.render(id, source);

					if (cancelled) return;

					const sanitized = DOMPurify.sanitize(svg, {
						USE_PROFILES: { svg: true, svgFilters: true },
					});

					const wrapper = document.createElement("div");

					wrapper.className = styles.mermaid;
					wrapper.innerHTML = sanitized;
					codeElement.parentElement?.replaceWith(wrapper);
				} catch {
					// Invalid mermaid syntax — leave the code block as-is for the user to fix
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [htmlContent, content]);

	return (
		<div className={styles.previewContainer} style={{ height }}>
			<div className={styles.previewHeader}>
				<span className={styles.previewTitle}>Preview</span>
			</div>
			<div
				ref={containerRef}
				className={styles.previewContent}
				dangerouslySetInnerHTML={{ __html: htmlContent }}
			/>
		</div>
	);
};

export default MarkdownPreview;
