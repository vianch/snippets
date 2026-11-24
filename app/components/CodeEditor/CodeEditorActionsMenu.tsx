"use client";

import { ReactElement } from "react";

/* Hooks */
import useSnippetActions from "@/components/CodeEditor/hooks/useSnippetActions";

/* Components */
import Camera from "@/components/ui/icons/Camera";
import Clock from "@/components/ui/icons/Clock";
import Copy from "@/components/ui/icons/Copy";
import Globe from "@/components/ui/icons/Globe";
import Menu from "@/components/ui/Menu/Menu";
import Share from "@/components/ui/icons/Share";
import Sparkle from "@/components/ui/icons/Sparkle";
import ScreenshotModal from "@/components/ScreenshotModal/ScreenshotModal";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorActionsMenuProps = {
	currentSnippet: CurrentSnippet;
	hasVersions: boolean;
	hideAiButton?: boolean;
	isMobile: boolean;
	isPublic: boolean;
	showHistory: boolean;
	isAiPanelVisible: boolean;
	onToggleAiPanel: () => void;
	onToggleHistory: () => void;
	onTogglePublic: () => void;
};

// Desktop chrome: snippet actions sit beside Save. ScreenshotModal stays a
// sibling of <Menu> because Menu unmounts its portal after an item is selected.
const CodeEditorActionsMenu = ({
	currentSnippet,
	hasVersions,
	hideAiButton = false,
	isMobile,
	isPublic,
	showHistory,
	isAiPanelVisible,
	onToggleAiPanel,
	onToggleHistory,
	onTogglePublic,
}: CodeEditorActionsMenuProps): ReactElement => {
	const {
		screenshotModalOpen,
		closeScreenshotModal,
		copyHandler,
		openScreenshotModal,
		shareHandler,
	} = useSnippetActions({ currentSnippet });
	// Menu items are data, not DOM: the media query that hides .headerActionsMenu
	// cannot reach into a portaled row list, so mobile must be excluded here in
	// JS as well. Mobile reaches these actions through the fixed bottom bar.
	const showAiButton = !isMobile && !hideAiButton;
	const menuItems: MenuItem[] = [
		{
			icon: <Copy width={16} height={16} />,
			label: "Copy code",
			onSelect: copyHandler,
		},
		{
			icon: <Camera width={16} height={16} />,
			label: "Screenshot",
			onSelect: openScreenshotModal,
		},
		{
			// Disabled rather than omitted so the menu keeps a stable length.
			disabled: !hasVersions,
			icon: <Clock width={16} height={16} />,
			label: showHistory ? "Hide history" : "Show history",
			onSelect: onToggleHistory,
		},
		{
			icon: <Share width={16} height={16} />,
			label: "Share",
			onSelect: shareHandler,
		},
		{
			icon: <Globe width={16} height={16} />,
			label: isPublic ? "Make private" : "Make public",
			onSelect: onTogglePublic,
		},
	];

	return (
		<>
			<div className={styles.headerActionsMenu}>
				{showAiButton && (
					<button
						className={`${styles.aiPanelButton} ${
							isAiPanelVisible ? styles.aiPanelButtonActive : ""
						}`}
						type="button"
						aria-label="Ask AI"
						aria-pressed={isAiPanelVisible}
						title="Ask AI"
						onClick={onToggleAiPanel}
					>
						<Sparkle width={16} height={16} />
					</button>
				)}
				<Menu ariaLabel="Snippet actions" items={menuItems} />
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

export default CodeEditorActionsMenu;
