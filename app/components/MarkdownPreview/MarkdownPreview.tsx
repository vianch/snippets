"use client";

import { ReactElement, useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

/* Styles */
import styles from "./markdownPreview.module.css";

type MarkdownPreviewProps = {
	content: string;
	height: string;
};

const MarkdownPreview = ({
	content,
	height,
}: MarkdownPreviewProps): ReactElement => {
	const htmlContent = useMemo(() => {
		if (!content) return "";

		const rawHtml = marked.parse(content, { async: false }) as string;

		return DOMPurify.sanitize(rawHtml);
	}, [content]);

	return (
		<div className={styles.previewContainer} style={{ height }}>
			<div className={styles.previewHeader}>
				<span className={styles.previewTitle}>Preview</span>
			</div>
			<div
				className={styles.previewContent}
				dangerouslySetInnerHTML={{ __html: htmlContent }}
			/>
		</div>
	);
};

export default MarkdownPreview;
