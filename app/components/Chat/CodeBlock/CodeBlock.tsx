"use client";

import { ReactElement, useEffect, useState } from "react";

/* Lib */
import { CodeCopyResetMs } from "@/lib/constants/ai";
import { getHighlightedFenceCode } from "@/lib/config/shiki";
import useUserStore from "@/lib/store/user.store";

/* Components */
import Check from "@/components/ui/icons/Check";
import Copy from "@/components/ui/icons/Copy";

/* Utils */
import { escapeHtml } from "@/utils/string.utils";

/* Types */
import type { ThemeName } from "@/lib/config/themes";

/* Styles */
import styles from "./codeBlock.module.css";

type CodeBlockProps = {
	body: string;
	language: string;
	onApply?: (body: string) => void;
};

const CodeBlock = ({
	body,
	language,
	onApply,
}: CodeBlockProps): ReactElement => {
	// Store theme is a plain string; narrow it to the ThemeName shiki expects.
	const theme = useUserStore((state) => state.theme) as ThemeName;
	const [highlightedHtml, setHighlightedHtml] = useState<string>("");
	const [copied, setCopied] = useState<boolean>(false);

	useEffect(() => {
		let cancelled = false;

		getHighlightedFenceCode(body, language, theme)
			.then((html) => {
				if (!cancelled) {
					setHighlightedHtml(
						html ?? `<pre><code>${escapeHtml(body)}</code></pre>`
					);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setHighlightedHtml(`<pre><code>${escapeHtml(body)}</code></pre>`);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [body, language, theme]);

	useEffect(() => {
		if (!copied) {
			return;
		}

		const timer = window.setTimeout(() => setCopied(false), CodeCopyResetMs);

		return () => window.clearTimeout(timer);
	}, [copied]);

	const handleCopy = (): void => {
		void navigator.clipboard.writeText(body).then(() => setCopied(true));
	};

	return (
		<div className={styles.codeBlock}>
			<div className={styles.header}>
				<span className={styles.language}>{language || "code"}</span>
				<div className={styles.actions}>
					<button
						type="button"
						className={styles.action}
						onClick={handleCopy}
						aria-label="Copy code"
					>
						{copied ? (
							<Check width={13} height={13} />
						) : (
							<Copy width={13} height={13} />
						)}
						<span>{copied ? "Copied" : "Copy"}</span>
					</button>
					{onApply && (
						<button
							type="button"
							className={styles.action}
							onClick={() => onApply(body)}
							aria-label="Apply this code to the editor"
						>
							<span>Apply</span>
						</button>
					)}
				</div>
			</div>
			<div
				className={styles.body}
				dangerouslySetInnerHTML={{ __html: highlightedHtml }}
			/>
		</div>
	);
};

export default CodeBlock;
