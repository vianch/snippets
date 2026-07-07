"use client";

import { ReactElement, useMemo } from "react";

/* Lib */
import { buildHtmlPreviewDocument } from "@/lib/htmlPreviewRenderer";

/* Styles */
import styles from "./htmlPreview.module.css";

type HtmlPreviewProps = {
	content: string;
	height: string;
};

const HtmlPreview = ({ content, height }: HtmlPreviewProps): ReactElement => {
	const previewDocument = useMemo(
		() => buildHtmlPreviewDocument(content),
		[content]
	);

	return (
		<div className={styles.previewContainer} style={{ height }}>
			<div className={styles.previewHeader}>
				<span className={styles.previewTitle}>Preview</span>
			</div>
			{/* sandbox="" grants nothing: opaque origin, no scripts, no forms,
			    no popups — the rendered document cannot touch the parent app */}
			<iframe
				className={styles.previewFrame}
				referrerPolicy="no-referrer"
				sandbox=""
				srcDoc={previewDocument}
				title="HTML preview"
			/>
		</div>
	);
};

export default HtmlPreview;
