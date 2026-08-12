"use client";

import { ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";

/* Lib */
import SupportedLanguages from "@/lib/config/languages";
import inlineCompletion from "@/lib/inlineCompletion";
import markdownKeymap from "@/lib/markdown/markdownKeymap";
import wikiLinkAutocomplete from "@/lib/wikiLinkAutocomplete";
import useViewPortStore from "@/lib/store/viewPort.store";
import useUserStore from "@/lib/store/user.store";
import codeMirrorOptions from "@/lib/constants/codeMirror";
import { SnippetState } from "@/lib/constants/core";
import {
	LanguagePreviewKinds,
	PreviewKind,
} from "@/lib/constants/preview.constants";
import { getCodeMirrorTheme, ThemeName } from "@/lib/config/themes";
import { aiActions, AiPaneTab } from "@/lib/constants/ai";
import { requestAiAction } from "@/utils/ai.utils";

/* Hooks */
import useCurrentSnippet from "@/components/CodeEditor/hooks/useCurrentSnippet";
import useFocusModeShortcut from "@/components/CodeEditor/hooks/useFocusModeShortcut";
import useKeyboardSave from "@/components/CodeEditor/hooks/useKeyboardSave";
import usePreviewResize from "@/components/CodeEditor/hooks/usePreviewResize";

/* Components */
import CodeEditorHeader from "@/components/CodeEditor/CodeEditorHeader";
import CodeEditorActions from "@/components/CodeEditor/CodeEditorActions";
import FocusModeBar from "@/components/CodeEditor/FocusModeBar";
import MarkdownToolbar from "@/components/CodeEditor/MarkdownToolbar";
import SnippetDetails from "@/components/CodeEditor/SnippetDetails/SnippetDetails";
import History from "@/components/History/History";
import MarkdownPreview from "@/components/MarkdownPreview/MarkdownPreview";
import HtmlPreview from "@/components/HtmlPreview/HtmlPreview";
import CodeConsole from "@/components/CodeConsole/CodeConsole";
import AiAssistantPanel from "@/components/AiAssistantPanel/AiAssistantPanel";
import SkeletonCodeEditor from "@/components/ui/Skeleton/SkeletonCodeEditor";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

/* Utils */
import {
	calculateEditorHeight,
	calculatePreviewHeight,
	chatTabPaneHeight,
} from "@/components/CodeEditor/editorHeight";

/* Styles */
import styles from "./codeEditor.module.css";

type RightPaneMode = "preview" | "chat";

type CodeEditorProps = {
	isLoading: boolean;
	snippet: Snippet | null;
	defaultLanguage?: SupportedLanguages;
	codeEditorStates: SnippetEditorStates;
	allSnippets: Snippet[];
	availableTags?: TagItem[];
	availableFolders?: TagItem[];
	rightPane?: RightPaneMode;
	onSave: (
		currentSnippet: CurrentSnippet,
		fromButton: boolean | SnippetState.Favorite
	) => void;
	onStarred: (currentSnippet: CurrentSnippet) => void;
	onPublicToggle: (currentSnippet: CurrentSnippet) => void;
	onTouched: (touched: boolean) => void;
	onWikiNavigate?: (target: string) => void;
	onActiveSnippet?: (snippetId: UUID | null) => void;
	onNewSnippet?: () => void;
	onUploadMarkdown: (upload: UploadedMarkdown) => void;
};

const CodeEditor = ({
	isLoading,
	snippet,
	codeEditorStates,
	defaultLanguage = SupportedLanguages.Markdown,
	allSnippets,
	availableTags,
	availableFolders,
	rightPane = "preview",
	onSave,
	onStarred,
	onPublicToggle,
	onTouched,
	onWikiNavigate,
	onActiveSnippet,
	onNewSnippet,
	onUploadMarkdown,
}: CodeEditorProps): ReactElement => {
	const isMobile = useViewPortStore((state) => state.isMobile);
	const isFocusMode = useViewPortStore((state) => state.isFocusMode);
	const setFocusMode = useViewPortStore((state) => state.setFocusMode);
	const theme = useUserStore((state) => state.theme) as ThemeName;
	const { menuType, touched } = codeEditorStates ?? {};
	const isTrashActive = menuType === "trash";
	const [mobileChatTab, setMobileChatTab] = useState<AiPaneTab>(AiPaneTab.Chat);
	// null means "follow the viewport": on mobile and tablet the editor owns the
	// full height and the preview is opt-in, on desktop the split is the default.
	// A toggle pins an explicit choice for the session.
	const [previewOverride, setPreviewOverride] = useState<boolean | null>(null);
	const isPreviewVisible = previewOverride ?? !isMobile;
	const editorContentRef = useRef<HTMLDivElement>(null);
	const detailsAnchorRef = useRef<HTMLButtonElement>(null);
	const editorViewRef = useRef<EditorView | null>(null);
	const editorTheme = useMemo(() => getCodeMirrorTheme(theme), [theme]);

	const {
		currentSnippet,
		setCurrentSnippet,
		tagList,
		showDetails,
		setShowDetails,
		showHistory,
		setShowHistory,
		versionCount,
		preRestoreSnapshot,
		setPreRestoreSnapshot,
		updateCurrentSnippetValue,
		updateCurrentSnippetName,
		updateCurrentSnippetUrl,
		updateCurrentSnippetNotes,
		updateCurrentSnippetFolder,
		setLanguageHandler,
		starringHandler,
		newTagHandler,
		removeTagHandler,
		togglePublicHandler,
		refreshVersionCount,
		restoreVersionHandler,
		saveHandler,
	} = useCurrentSnippet({
		snippet,
		defaultLanguage,
		codeEditorStates,
		onSave,
		onStarred,
		onPublicToggle,
		onTouched,
	});

	useKeyboardSave(saveHandler, isTrashActive || !touched);

	const inlineCompletionExtension = useMemo(
		() =>
			inlineCompletion({
				enabled: !isTrashActive,
				language: currentSnippet.language,
				fetchCompletion: async (prefix, language) => {
					const response = await requestAiAction(
						aiActions.complete,
						prefix,
						language
					);

					return response.result;
				},
			}),
		[isTrashActive, currentSnippet.language]
	);

	const wikiAutocompleteExtension = useMemo(
		() => wikiLinkAutocomplete(allSnippets),
		[allSnippets]
	);

	const handleCopyToSnippet = (content: string): void => {
		const existing = currentSnippet?.snippet ?? "";
		const next = existing.length > 0 ? `${existing}\n${content}` : content;

		updateCurrentSnippetValue(next);
	};

	const { editorWidthPercent, handlePreviewMouseDown } =
		usePreviewResize(editorContentRef);

	const isMarkdownLanguage =
		currentSnippet?.language === SupportedLanguages.Markdown;
	const previewKind =
		LanguagePreviewKinds[currentSnippet.language] ?? PreviewKind.None;
	const hasPreviewPanel = previewKind !== PreviewKind.None;
	const isChatMode = rightPane === "chat";
	const showPreview =
		!isChatMode && hasPreviewPanel && !isTrashActive && isPreviewVisible;
	const showChatPane = isChatMode && !isTrashActive;
	const hasRightPane = showPreview || showChatPane;
	const showPreviewToggle = hasPreviewPanel && !isChatMode;
	const canToggleFocusMode = isMarkdownLanguage && !isTrashActive;

	const togglePreviewHandler = (): void => {
		setPreviewOverride(!isPreviewVisible);
	};

	// Long-form prose fixes: wrap instead of horizontal-scrolling, and let the
	// browser spellcheck markdown content the way it would a text field.
	const markdownProseExtensions = useMemo(
		() =>
			isMarkdownLanguage && !isTrashActive
				? [
						EditorView.lineWrapping,
						EditorView.contentAttributes.of({ spellcheck: "true" }),
					]
				: [],
		[isMarkdownLanguage, isTrashActive]
	);

	const showMarkdownToolbar =
		!isMobile &&
		!isTrashActive &&
		!isFocusMode &&
		(isMarkdownLanguage || (hasPreviewPanel && !isChatMode));

	const toggleFocusModeHandler = (): void => {
		if (!canToggleFocusMode) {
			return;
		}

		setFocusMode(!isFocusMode);
	};

	useFocusModeShortcut({
		canToggleFocusMode,
		isFocusMode,
		onExit: () => setFocusMode(false),
		onToggle: toggleFocusModeHandler,
	});

	// Focus mode is only meaningful for prose languages, outside trash. If
	// either condition stops holding while it's on (language switch, trash
	// open), drop back to the normal layout instead of leaving a broken
	// overlay.
	useEffect(() => {
		if (isFocusMode && !canToggleFocusMode) {
			setFocusMode(false);
		}
	}, [isFocusMode, canToggleFocusMode, setFocusMode]);

	useEffect(() => {
		if (!isFocusMode) {
			return;
		}

		const previousOverflow = document.body.style.overflow;

		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isFocusMode]);

	const editorHeight = calculateEditorHeight({
		hasMarkdownToolbar: showMarkdownToolbar,
		hasRightPane,
		isFocusMode,
		isMobile,
		isTrashActive,
	});
	const previewHeight = calculatePreviewHeight(isMobile, isFocusMode);

	return (
		<div
			className={`${styles.codeEditorContainer} ${!snippet && !isLoading && styles.noSnippetContainer} ${isFocusMode ? styles.focusOverlay : ""}`}
		>
			{isLoading ? (
				<SkeletonCodeEditor />
			) : snippet ? (
				<>
					{!isTrashActive && !isFocusMode && (
						<>
							<CodeEditorHeader
								currentSnippet={currentSnippet}
								codeEditorStates={codeEditorStates}
								snippetName={snippet?.name ?? ""}
								allSnippets={allSnippets}
								tagList={tagList}
								detailsAnchorRef={detailsAnchorRef}
								hasVersions={versionCount > 0}
								hideAiButton={isChatMode}
								isMobile={isMobile}
								showDetails={showDetails}
								showHistory={showHistory}
								onApplyAiCode={updateCurrentSnippetValue}
								onCopyToSnippet={handleCopyToSnippet}
								onRemoveTag={removeTagHandler}
								onReplaceSnippet={updateCurrentSnippetValue}
								onSave={saveHandler}
								onSetLanguage={setLanguageHandler}
								onStarred={starringHandler}
								onToggleDetails={() => setShowDetails(!showDetails)}
								onToggleHistory={() => setShowHistory(!showHistory)}
								onTogglePublic={togglePublicHandler}
								onUpdateName={updateCurrentSnippetName}
							/>

							{isMobile && (
								<div className={styles.mobileActions}>
									<CodeEditorActions
										currentSnippet={currentSnippet}
										isPreviewVisible={isPreviewVisible}
										isPublic={currentSnippet.is_public ?? false}
										onTogglePreview={togglePreviewHandler}
										onTogglePublic={togglePublicHandler}
										onToggleHistory={() => setShowHistory(!showHistory)}
										showHistory={showHistory}
										showPreviewToggle={showPreviewToggle}
										hasVersions={versionCount > 0}
									/>
								</div>
							)}

							{currentSnippet.snippet_id && (
								<History
									snippetId={currentSnippet.snippet_id}
									isOpen={showHistory}
									onClose={() => {
										setShowHistory(false);
										setPreRestoreSnapshot(null);
									}}
									onRestore={restoreVersionHandler}
									undoSnapshot={preRestoreSnapshot}
									onUndo={() => {
										if (!preRestoreSnapshot) return;

										setCurrentSnippet({ ...preRestoreSnapshot });
										onTouched(true);
										setPreRestoreSnapshot(null);
										refreshVersionCount(currentSnippet.snippet_id);
									}}
								/>
							)}

							{showDetails && (
								<SnippetDetails
									currentSnippet={currentSnippet}
									anchorRef={detailsAnchorRef}
									isMobile={isMobile}
									tagList={tagList}
									availableTags={availableTags}
									availableFolders={availableFolders}
									onClose={() => setShowDetails(false)}
									onNewTag={newTagHandler}
									onRemoveTag={removeTagHandler}
									onTouched={onTouched}
									onUrlChange={updateCurrentSnippetUrl}
									onNotesChange={updateCurrentSnippetNotes}
									onFolderChange={updateCurrentSnippetFolder}
								/>
							)}
						</>
					)}

					{isFocusMode && (
						<FocusModeBar
							content={currentSnippet.snippet ?? ""}
							isPreviewVisible={isPreviewVisible}
							showPreviewToggle={showPreviewToggle}
							snippetName={currentSnippet.name ?? ""}
							onExit={() => setFocusMode(false)}
							onTogglePreview={togglePreviewHandler}
						/>
					)}

					{/* One stable tree for every mode: the right pane, resizer, and
					    toolbar toggle in and out around a single CodeMirror instance,
					    so toggling the preview never remounts the editor (which would
					    wipe undo history, cursor, and scroll position). */}
					<div
						ref={editorContentRef}
						className={isMobile ? styles.splitViewMobile : styles.splitView}
					>
						{showChatPane && isMobile && (
							<div className={styles.chatTabs} role="tablist">
								<button
									type="button"
									role="tab"
									aria-selected={mobileChatTab === AiPaneTab.Chat}
									className={`${styles.chatTab} ${mobileChatTab === AiPaneTab.Chat ? styles.chatTabActive : ""}`}
									onClick={() => setMobileChatTab(AiPaneTab.Chat)}
								>
									Chat
								</button>
								<button
									type="button"
									role="tab"
									aria-selected={mobileChatTab === AiPaneTab.Code}
									className={`${styles.chatTab} ${mobileChatTab === AiPaneTab.Code ? styles.chatTabActive : ""}`}
									onClick={() => setMobileChatTab(AiPaneTab.Code)}
								>
									Code
								</button>
							</div>
						)}

						<div
							className={`${styles.editorPanel} ${
								showChatPane && isMobile && mobileChatTab !== AiPaneTab.Code
									? styles.paneHidden
									: ""
							} ${isFocusMode && !hasRightPane ? styles.focusEditorPanel : ""}`}
							style={
								!isMobile
									? { width: hasRightPane ? `${editorWidthPercent}%` : "100%" }
									: undefined
							}
						>
							{showMarkdownToolbar && (
								<MarkdownToolbar
									getEditorView={() => editorViewRef.current}
									isFocusMode={isFocusMode}
									isPreviewVisible={isPreviewVisible}
									onToggleFocusMode={toggleFocusModeHandler}
									onTogglePreview={togglePreviewHandler}
									onUploadMarkdown={onUploadMarkdown}
									showFormattingActions={isMarkdownLanguage}
									showPreviewToggle={showPreviewToggle}
								/>
							)}
							<CodeMirror
								autoFocus={false}
								indentWithTab={true}
								basicSetup={
									isTrashActive ? { lineNumbers: true } : codeMirrorOptions
								}
								placeholder={"Write your snipped here"}
								className={`${styles.codeMirrorContainer} ${
									isFocusMode ? styles.focusCodeMirror : ""
								}`}
								value={currentSnippet?.snippet ?? ""}
								extensions={[
									currentSnippet.extension,
									inlineCompletionExtension,
									wikiAutocompleteExtension,
									...(isMarkdownLanguage && !isTrashActive
										? [markdownKeymap]
										: []),
									...markdownProseExtensions,
								]}
								theme={editorTheme}
								height={
									showChatPane && isMobile ? chatTabPaneHeight : editorHeight
								}
								width="100%"
								readOnly={isTrashActive}
								onChange={updateCurrentSnippetValue}
								onCreateEditor={(view) => {
									editorViewRef.current = view;
								}}
							/>
						</div>
						{!isMobile && hasRightPane && (
							<div
								className={styles.previewResizer}
								onMouseDown={handlePreviewMouseDown}
							/>
						)}
						{showChatPane ? (
							<AiAssistantPanel
								currentSnippet={currentSnippet}
								allSnippets={allSnippets}
								height={isMobile ? chatTabPaneHeight : previewHeight}
								className={
									isMobile && mobileChatTab !== AiPaneTab.Chat
										? styles.paneHidden
										: ""
								}
								onCopyToSnippet={handleCopyToSnippet}
								onReplaceSnippet={updateCurrentSnippetValue}
								onSelectSnippet={onActiveSnippet}
								onNewSnippet={onNewSnippet}
							/>
						) : !showPreview ? null : previewKind === PreviewKind.Html ? (
							<HtmlPreview
								content={currentSnippet.snippet ?? ""}
								height={previewHeight}
							/>
						) : previewKind === PreviewKind.Console ? (
							<CodeConsole
								key={currentSnippet.snippet_id}
								code={currentSnippet.snippet ?? ""}
								height={previewHeight}
								language={currentSnippet.language}
							/>
						) : (
							<MarkdownPreview
								content={currentSnippet.snippet}
								height={previewHeight}
								onWikiNavigate={onWikiNavigate}
							/>
						)}
					</div>
				</>
			) : (
				<EmptyState
					title="No snippet selected"
					description="Select a snippet from the list to start editing"
					illustration="cursor"
				/>
			)}
		</div>
	);
};

export default CodeEditor;
