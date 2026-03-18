import { ReactElement, useState } from "react";

/* Components */
import Clock from "@/components/ui/icons/Clock";
import Copy from "@/components/ui/icons/Copy";
import Globe from "@/components/ui/icons/Globe";
import Info from "@/components/ui/icons/Info";
import Share from "@/components/ui/icons/Share";
import Sparkle from "@/components/ui/icons/Sparkle";
import AiDropdown from "@/components/CodeEditor/AiDropdown/AiDropdown";

/* Lib */
import useToastStore from "@/lib/store/toast.store";
import { ToastType } from "@/lib/constants/toast";

/* Styles */
import styles from "./codeEditorActions.module.css";

type CodeEditorActionsProps = {
	currentSnippet: CurrentSnippet;
	isPublic: boolean;
	showDetails: boolean;
	onToggleDetails: () => void;
	onTogglePublic: () => void;
	onToggleHistory?: () => void;
	showHistory?: boolean;
	hasVersions?: boolean;
	onAiAction?: (action: AiAction) => void;
};

const CodeEditorActions = ({
	currentSnippet,
	isPublic,
	showDetails,
	onToggleDetails,
	onTogglePublic,
	onToggleHistory,
	showHistory = false,
	hasVersions = false,
	onAiAction,
}: CodeEditorActionsProps): ReactElement => {
	const { addToast } = useToastStore();
	const [aiDropdownOpen, setAiDropdownOpen] = useState(false);

	const handleCopy = async (): Promise<void> => {
		try {
			await navigator.clipboard.writeText(currentSnippet?.snippet ?? "");
			addToast({
				type: ToastType.Success,
				message: "Code copied to clipboard",
			});
		} catch (_error) {
			addToast({
				type: ToastType.Error,
				message: "Failed to copy code to clipboard",
			});
		}
	};

	const handleShare = async (): Promise<void> => {
		if (navigator?.share) {
			await navigator.share({
				title: `Code Snippet: ${currentSnippet?.name ?? "Untitled"}`,
				text: currentSnippet?.snippet ?? "",
			});
		} else {
			const shareData = `Code Snippet: ${currentSnippet?.name ?? "Untitled"}\n\n${currentSnippet?.snippet ?? ""}`;

			await navigator.clipboard.writeText(shareData);
			addToast({
				type: ToastType.Success,
				message: "Code copied to clipboard for sharing",
			});
		}
	};

	const handleAiClick = (): void => {
		if (!currentSnippet?.snippet?.trim()) {
			addToast({
				type: ToastType.Error,
				message: "No code to analyze",
			});

			return;
		}

		setAiDropdownOpen(!aiDropdownOpen);
	};

	const handleAiAction = (action: AiAction): void => {
		setAiDropdownOpen(false);
		onAiAction?.(action);
	};

	return (
		<div className={styles.actionsContainer}>
			<div className={styles.aiButtonWrapper}>
				<button
					className={`${styles.actionButton} ${aiDropdownOpen ? styles.actionButtonActive : ""}`}
					onClick={handleAiClick}
					type="button"
				>
					<Sparkle width={24} height={24} />
					<span className={styles.tooltip}>AI</span>
				</button>
				<AiDropdown
					isOpen={aiDropdownOpen}
					onAction={handleAiAction}
					onClose={() => setAiDropdownOpen(false)}
				/>
			</div>
			{hasVersions && (
				<button
					className={`${styles.actionButton} ${showHistory ? styles.actionButtonActive : ""}`}
					onClick={onToggleHistory}
					type="button"
				>
					<Clock width={24} height={24} />
					<span className={styles.tooltip}>History</span>
				</button>
			)}
			<button
				className={`${styles.actionButton} ${showDetails ? styles.actionButtonActive : ""}`}
				onClick={onToggleDetails}
				type="button"
			>
				<Info width={24} height={24} />
				<span className={styles.tooltip}>Details</span>
			</button>
			<button
				className={styles.actionButton}
				onClick={handleCopy}
				type="button"
			>
				<Copy width={24} height={24} />
				<span className={styles.tooltip}>Copy code</span>
			</button>
			<button
				className={styles.actionButton}
				onClick={handleShare}
				type="button"
			>
				<Share width={24} height={24} />
				<span className={styles.tooltip}>Share</span>
			</button>
			<button
				className={`${styles.actionButton} ${isPublic ? styles.actionButtonActive : ""}`}
				onClick={onTogglePublic}
				type="button"
			>
				<Globe width={24} height={24} />
				<span className={styles.tooltip}>
					{isPublic ? "Make private" : "Make public"}
				</span>
			</button>
		</div>
	);
};

export default CodeEditorActions;
