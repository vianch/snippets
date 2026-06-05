"use client";

import { ReactElement } from "react";

/* Components */
import CodeBlock from "@/components/Chat/CodeBlock/CodeBlock";
import MarkdownProse from "@/components/Chat/MarkdownProse/MarkdownProse";
import Copy from "@/components/ui/icons/Copy";
import Sparkle from "@/components/ui/icons/Sparkle";

/* Utils */
import { parseAssistantSegments } from "@/utils/chat.utils";

/* Styles */
import styles from "./assistantMessage.module.css";

type AssistantMessageProps = {
	content: string;
	modelName: string;
	showActions?: boolean;
	showHeader?: boolean;
	onCopyToSnippet?: (content: string) => void;
	onReplaceSnippet?: (content: string) => void;
};

const AssistantMessage = ({
	content,
	modelName,
	showActions = true,
	showHeader = true,
	onCopyToSnippet,
	onReplaceSnippet,
}: AssistantMessageProps): ReactElement => {
	const segments = parseAssistantSegments(content);
	const showCopy = showActions && typeof onCopyToSnippet === "function";

	return (
		<div className={styles.assistantTurn}>
			{showHeader && (
				<div className={styles.assistantHeader}>
					<span className={styles.assistantHeaderIcon}>
						<Sparkle width={14} height={14} />
					</span>
					<span>{modelName || "AI"}</span>
				</div>
			)}

			<div className={styles.assistantBody}>
				{segments.map((segment, index) =>
					segment.type === "code" ? (
						<CodeBlock
							key={index}
							body={segment.body}
							language={segment.language}
							onApply={
								onReplaceSnippet
									? (blockBody) => onReplaceSnippet(blockBody)
									: undefined
							}
						/>
					) : (
						<MarkdownProse key={index} content={segment.content} />
					)
				)}
			</div>

			{showCopy && (
				<div className={styles.actions}>
					<button
						type="button"
						className={styles.actionButton}
						onClick={() => onCopyToSnippet?.(content)}
					>
						<Copy width={12} height={12} />
						<span>Copy to snippet</span>
					</button>
				</div>
			)}
		</div>
	);
};

export default AssistantMessage;
