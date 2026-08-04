import { ReactElement, useMemo } from "react";

/* Components */
import EyeClosed from "@/components/ui/icons/EyeClosed";
import EyeOpen from "@/components/ui/icons/EyeOpen";
import CloseSquare from "@/components/ui/icons/CloseSquare";

/* Utils */
import {
	countCharacters,
	countWords,
	estimateReadingMinutes,
} from "@/utils/markdown.utils";

/* Styles */
import styles from "./focusModeBar.module.css";

type FocusModeBarProps = {
	content: string;
	isPreviewVisible: boolean;
	showPreviewToggle: boolean;
	snippetName: string;
	onExit: () => void;
	onTogglePreview: () => void;
};

const FocusModeBar = ({
	content,
	isPreviewVisible,
	showPreviewToggle,
	snippetName,
	onExit,
	onTogglePreview,
}: FocusModeBarProps): ReactElement => {
	const wordCount = useMemo(() => countWords(content), [content]);
	const characterCount = useMemo(() => countCharacters(content), [content]);
	const readingMinutes = useMemo(
		() => estimateReadingMinutes(wordCount),
		[wordCount]
	);
	const previewToggleLabel = isPreviewVisible ? "Hide preview" : "Show preview";

	return (
		<div className={styles.bar}>
			<span className={styles.name}>{snippetName || "Untitled"}</span>

			<span className={styles.stats}>
				{wordCount} words · {characterCount} characters · {readingMinutes} min
				read
			</span>

			<div className={styles.actions}>
				{showPreviewToggle && (
					<button
						aria-label={previewToggleLabel}
						aria-pressed={isPreviewVisible}
						className={styles.actionButton}
						onClick={onTogglePreview}
						title={previewToggleLabel}
						type="button"
					>
						{isPreviewVisible ? (
							<EyeOpen height={16} width={16} />
						) : (
							<EyeClosed height={16} width={16} />
						)}
					</button>
				)}

				<button
					aria-label="Exit distraction-free writing"
					className={styles.actionButton}
					onClick={onExit}
					title="Exit distraction-free writing (Esc)"
					type="button"
				>
					<CloseSquare height={16} width={16} />
				</button>
			</div>
		</div>
	);
};

export default FocusModeBar;
