"use client";

import { MouseEvent, ReactElement, useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/* Lib */
import wikiLinkMarked from "@/lib/wikiLinkMarked";

/* Styles */
import styles from "./markdownPreview.module.css";

marked.use(wikiLinkMarked);

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
	const htmlContent = useMemo(() => {
		if (!content) return "";

		const rawHtml = marked.parse(content, { async: false }) as string;

		return DOMPurify.sanitize(rawHtml, {
			ADD_ATTR: ["data-wiki-target"],
		});
	}, [content]);

	const handleClick = (event: MouseEvent<HTMLDivElement>): void => {
		if (!onWikiNavigate) return;

		const target = event.target as HTMLElement;
		const link = target.closest<HTMLElement>(".wiki-link");

		if (!link) return;

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
