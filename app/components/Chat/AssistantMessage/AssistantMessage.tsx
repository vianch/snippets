"use client";

import { memo, ReactElement, useMemo } from "react";

/* Lib */
import { SegmentType } from "@/lib/constants/ai";

/* Components */
import CodeBlock from "@/components/Chat/CodeBlock/CodeBlock";
import MarkdownProse from "@/components/Chat/MarkdownProse/MarkdownProse";
import ThinkingDisclosure from "@/components/Chat/ThinkingDisclosure/ThinkingDisclosure";
import Copy from "@/components/ui/icons/Copy";
import Sparkle from "@/components/ui/icons/Sparkle";

/* Utils */
import { parseAssistantSegments } from "@/utils/chat.utils";

/* Styles */
import styles from "./assistantMessage.module.css";

type AssistantMessageProps = {
	content: string;
	modelName: string;
	thinking?: string;
	showActions?: boolean;
	showHeader?: boolean;
	onCopyToSnippet?: (content: string) => void;
	onReplaceSnippet?: (content: string) => void;
};

const AssistantMessage = ({
	content,
	modelName,
	thinking,
	showActions = true,
	showHeader = true,
	onCopyToSnippet,
	onReplaceSnippet,
}: AssistantMessageProps): ReactElement => {
	const segments = useMemo(() => parseAssistantSegments(content), [content]);
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

			{thinking && thinking.length > 0 && (
				<ThinkingDisclosure isActive={false} text={thinking} />
			)}

			<div className={styles.assistantBody}>
				{segments.map((segment, index) =>
					segment.type === SegmentType.Code ? (
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

export default memo(AssistantMessage);
