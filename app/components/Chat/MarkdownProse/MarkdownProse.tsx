"use client";

import { ReactElement, useEffect, useState } from "react";

/* Lib */
import { renderMarkdownToHtml } from "@/lib/markdownRenderer";
import useUserStore from "@/lib/store/user.store";

/* Types */
import type { ThemeName } from "@/lib/config/themes";

/* Styles */
import styles from "./markdownProse.module.css";

type MarkdownProseProps = {
	content: string;
};

const MarkdownProse = ({ content }: MarkdownProseProps): ReactElement => {
	// Store theme is a plain string; narrow it to the ThemeName shiki expects.
	const theme = useUserStore((state) => state.theme) as ThemeName;
	const [renderedHtml, setRenderedHtml] = useState<string>("");

	useEffect(() => {
		let cancelled = false;

		renderMarkdownToHtml(content, theme)
			.then((rendered) => {
				if (!cancelled) {
					setRenderedHtml(rendered);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setRenderedHtml("");
				}
			});

		return () => {
			cancelled = true;
		};
	}, [content, theme]);

	return (
		<div
			className={styles.prose}
			dangerouslySetInnerHTML={{ __html: renderedHtml }}
		/>
	);
};

export default MarkdownProse;
