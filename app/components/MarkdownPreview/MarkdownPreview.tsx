"use client";

import { MouseEvent, ReactElement, useEffect, useState } from "react";

/* Lib */
import { renderMarkdownToHtml } from "@/lib/markdownRenderer";
import useUserStore from "@/lib/store/user.store";

/* Types */
import type { ThemeName } from "@/lib/config/themes";

/* Styles */
import styles from "./markdownPreview.module.css";

type MarkdownPreviewProps = {
	content: string;
	height: string;
	onWikiNavigate?: (target: string) => void;
};

const MarkdownPreview = ({
	content,
	height,
	onWikiNavigate,
}: MarkdownPreviewProps): ReactElement => {
	// Store theme is a plain string; narrow it to the ThemeName shiki expects
	const theme = useUserStore((state) => state.theme) as ThemeName;
	const [htmlContent, setHtmlContent] = useState<string>("");

	useEffect(() => {
		if (!content) {
			setHtmlContent("");

			return;
		}

		let cancelled = false;

		renderMarkdownToHtml(content, theme)
			.then((html) => {
				if (!cancelled) {
					setHtmlContent(html);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setHtmlContent("");
				}
			});

		return () => {
			cancelled = true;
		};
	}, [content, theme]);

	const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
		if (!onWikiNavigate) {
			return;
		}

		// event.target is the clicked DOM node within the rendered markdown
		const target = event.target as HTMLElement;
		const link = target.closest<HTMLElement>(".wiki-link");

		if (!link) {
			return;
		}

		const wikiTarget = link.getAttribute("data-wiki-target");

		if (wikiTarget) {
			event.preventDefault();
			onWikiNavigate(wikiTarget);
		}
	};

	return (
		<div className={styles.previewContainer} style={{ height }}>
			<div className={styles.previewHeader}>
				<span className={styles.previewTitle}>Preview</span>
			</div>
			<div
				className={styles.previewContent}
				onClick={handleClick}
				dangerouslySetInnerHTML={{ __html: htmlContent }}
			/>
		</div>
	);
};

export default MarkdownPreview;
