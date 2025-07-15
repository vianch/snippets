import { ReactElement } from "react";

/* Components */
import Copy from "@/components/ui/icons/Copy";
import Share from "@/components/ui/icons/Share";

/* Lib */
import useToastStore from "@/lib/store/toast.store";
import { ToastType } from "@/lib/constants/toast";

/* Styles */
import styles from "./codeEditorActions.module.css";

type CodeEditorActionsProps = {
	currentSnippet: CurrentSnippet;
};

const CodeEditorActions = ({
	currentSnippet,
}: CodeEditorActionsProps): ReactElement => {
	const { addToast } = useToastStore();

	const handleCopy = async (): Promise<void> => {
		try {
			await navigator.clipboard.writeText(currentSnippet?.snippet ?? "");
			addToast({
				type: ToastType.Success,
				message: "Code copied to clipboard",
			});
		} catch (error) {
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
			// Fallback for browsers that don't support Web Share API
			const shareData = `Code Snippet: ${currentSnippet?.name ?? "Untitled"}\n\n${currentSnippet?.snippet ?? ""}`;

			await navigator.clipboard.writeText(shareData);
			addToast({
				type: ToastType.Success,
				message: "Code copied to clipboard for sharing",
			});
		}
	};

	return (
		<div className={styles.actionsContainer}>
			<button
				className={styles.actionButton}
				onClick={handleCopy}
				title="Copy to clipboard"
				type="button"
			>
				<Copy width={24} height={24} />
			</button>
			<button
				className={styles.actionButton}
				onClick={handleShare}
				title="Share snippet"
				type="button"
			>
				<Share width={24} height={24} />
			</button>
		</div>
	);
};

export default CodeEditorActions;
