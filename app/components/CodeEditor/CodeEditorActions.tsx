"use client";

import { ReactElement } from "react";

/* Hooks */
import useSnippetActions from "@/components/CodeEditor/hooks/useSnippetActions";

/* Components */
import Camera from "@/components/ui/icons/Camera";
import Clock from "@/components/ui/icons/Clock";
import Copy from "@/components/ui/icons/Copy";
import EyeClosed from "@/components/ui/icons/EyeClosed";
import EyeOpen from "@/components/ui/icons/EyeOpen";
import Globe from "@/components/ui/icons/Globe";
import Share from "@/components/ui/icons/Share";
import ScreenshotModal from "@/components/ScreenshotModal/ScreenshotModal";

/* Styles */
import styles from "./codeEditorActions.module.css";

type CodeEditorActionsProps = {
	currentSnippet: CurrentSnippet;
	isPreviewVisible?: boolean;
	isPublic: boolean;
	onTogglePreview?: () => void;
	onTogglePublic: () => void;
	onToggleHistory?: () => void;
	showHistory?: boolean;
	showPreviewToggle?: boolean;
	hasVersions?: boolean;
};

// Mobile-only fixed bottom strip. Details (ⓘ) lives in the editor row instead,
// since on mobile it is the only route to tags and folder. The desktop
// equivalent is CodeEditorActionsMenu.
const CodeEditorActions = ({
	currentSnippet,
	isPreviewVisible = false,
	isPublic,
	onTogglePreview,
	onTogglePublic,
	onToggleHistory,
	showHistory = false,
	showPreviewToggle = false,
	hasVersions = false,
}: CodeEditorActionsProps): ReactElement => {
	const {
		screenshotModalOpen,
		closeScreenshotModal,
		copyHandler,
		openScreenshotModal,
		shareHandler,
	} = useSnippetActions({ currentSnippet });

	return (
		<>
			<div className={styles.actionsContainer}>
				<button
					className={styles.actionButton}
					type="button"
					aria-label="Screenshot"
					onClick={openScreenshotModal}
				>
					<Camera width={24} height={24} />
					<span className={styles.tooltip}>Screenshot</span>
				</button>
				{hasVersions && (
					<button
						className={`${styles.actionButton} ${showHistory ? styles.actionButtonActive : ""}`}
						type="button"
						aria-label={showHistory ? "Hide history" : "Show history"}
						onClick={onToggleHistory}
					>
						<Clock width={24} height={24} />
						<span className={styles.tooltip}>History</span>
					</button>
				)}
				<button
					className={styles.actionButton}
					type="button"
					aria-label="Copy code"
					onClick={copyHandler}
				>
					<Copy width={24} height={24} />
					<span className={styles.tooltip}>Copy code</span>
				</button>
				<button
					className={styles.actionButton}
					type="button"
					aria-label="Share snippet"
					onClick={shareHandler}
				>
					<Share width={24} height={24} />
					<span className={styles.tooltip}>Share</span>
				</button>
				<button
					className={`${styles.actionButton} ${isPublic ? styles.actionButtonActive : ""}`}
					type="button"
					aria-label={isPublic ? "Make private" : "Make public"}
					onClick={onTogglePublic}
				>
					<Globe width={24} height={24} />
					<span className={styles.tooltip}>
						{isPublic ? "Make private" : "Make public"}
					</span>
				</button>
				{showPreviewToggle && (
					<button
						className={`${styles.actionButton} ${isPreviewVisible ? styles.actionButtonActive : ""}`}
						type="button"
						aria-label={isPreviewVisible ? "Hide preview" : "Show preview"}
						aria-pressed={isPreviewVisible}
						onClick={onTogglePreview}
					>
						{isPreviewVisible ? (
							<EyeOpen width={24} height={24} />
						) : (
							<EyeClosed width={24} height={24} />
						)}
						<span className={styles.tooltip}>
							{isPreviewVisible ? "Hide preview" : "Show preview"}
						</span>
					</button>
				)}
			</div>

			{screenshotModalOpen && (
				<ScreenshotModal
					isOpen={screenshotModalOpen}
					snippet={currentSnippet}
					onClose={closeScreenshotModal}
				/>
			)}
		</>
	);
};

export default CodeEditorActions;
