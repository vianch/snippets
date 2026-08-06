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
import AiChatModal from "@/components/CodeEditor/AiChatModal/AiChatModal";
import ScreenshotModal from "@/components/ScreenshotModal/ScreenshotModal";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorActionsMenuProps = {
	currentSnippet: CurrentSnippet;
	allSnippets?: Snippet[];
	hasVersions: boolean;
	hideAiButton?: boolean;
	isMobile: boolean;
	isPublic: boolean;
	showHistory: boolean;
	onApplyAiCode?: (code: string) => void;
	onCopyToSnippet?: (content: string) => void;
	onReplaceSnippet?: (content: string) => void;
	onToggleHistory: () => void;
	onTogglePublic: () => void;
};

// Desktop chrome: every snippet action lives in the overflow menu, which sits
// after Save. The modals are siblings of <Menu> because Menu unmounts its
// portal the moment an item is selected.
const CodeEditorActionsMenu = ({
	currentSnippet,
	allSnippets,
	hasVersions,
	hideAiButton = false,
	isMobile,
	isPublic,
	showHistory,
	onApplyAiCode,
	onCopyToSnippet,
	onReplaceSnippet,
	onToggleHistory,
	onTogglePublic,
}: CodeEditorActionsMenuProps): ReactElement => {
	const {
		aiChatOpen,
		screenshotModalOpen,
		closeAiChat,
		closeScreenshotModal,
		copyHandler,
		openAiChat,
		openScreenshotModal,
		shareHandler,
	} = useSnippetActions({ currentSnippet });
	// Menu items are data, not DOM: the media query that hides .headerActionsMenu
	// cannot reach into a portaled row list, so mobile must be excluded here in
	// JS as well. Mobile reaches these actions through the fixed bottom bar.
	const showAiItem = !isMobile && !hideAiButton;
	const menuItems: MenuItem[] = [
		{
			icon: <Copy width={16} height={16} />,
			label: "Copy code",
			onSelect: copyHandler,
		},
		...(showAiItem
			? [
					{
						icon: <Sparkle width={16} height={16} />,
						label: "Ask AI",
						onSelect: openAiChat,
					},
				]
			: []),
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
				<Menu ariaLabel="Snippet actions" items={menuItems} />
			</div>

			{showAiItem && (
				<AiChatModal
					isOpen={aiChatOpen}
					currentSnippet={currentSnippet}
					allSnippets={allSnippets}
					onClose={closeAiChat}
					onApplyCode={(code: string) => onApplyAiCode?.(code)}
					onCopyToSnippet={onCopyToSnippet}
					onReplaceSnippet={onReplaceSnippet}
				/>
			)}

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
