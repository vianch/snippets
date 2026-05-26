"use client";

import { ReactElement, useMemo, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";

/* Lib */
import SupportedLanguages from "@/lib/config/languages";
import languageExtensions from "@/lib/codeEditor";
import inlineCompletion from "@/lib/inlineCompletion";
import wikiLinkAutocomplete from "@/lib/wikiLinkAutocomplete";
import useViewPortStore from "@/lib/store/viewPort.store";
import useUserStore from "@/lib/store/user.store";
import codeMirrorOptions from "@/lib/constants/codeMirror";
import { SnippetState } from "@/lib/constants/core";
import { getCodeMirrorTheme, ThemeName } from "@/lib/config/themes";
import { aiActions } from "@/lib/constants/ai";
import { requestAiAction } from "@/utils/ai.utils";

/* Hooks */
import useCurrentSnippet from "@/components/CodeEditor/hooks/useCurrentSnippet";
import useKeyboardSave from "@/components/CodeEditor/hooks/useKeyboardSave";
import usePreviewResize from "@/components/CodeEditor/hooks/usePreviewResize";

/* Components */
import CodeEditorTags from "@/components/CodeEditor/CodeEditorTags";
import CodeEditorHeader from "@/components/CodeEditor/CodeEditorHeader";
import CodeEditorActions from "@/components/CodeEditor/CodeEditorActions";
import SnippetDetails from "@/components/CodeEditor/SnippetDetails/SnippetDetails";
import History from "@/components/History/History";
import MarkdownPreview from "@/components/MarkdownPreview/MarkdownPreview";
import AiAssistantPanel from "@/components/AiAssistantPanel/AiAssistantPanel";
import SkeletonCodeEditor from "@/components/ui/Skeleton/SkeletonCodeEditor";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

/* Utils */
import {
	calculateEditorHeight,
	calculatePreviewHeight,
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
	rightPane?: RightPaneMode;
	onSave: (
		currentSnippet: CurrentSnippet,
		fromButton: boolean | SnippetState.Favorite
	) => void;
	onStarred: (currentSnippet: CurrentSnippet) => void;
	onPublicToggle: (currentSnippet: CurrentSnippet) => void;
	onTouched: (touched: boolean) => void;
	onWikiNavigate?: (target: string) => void;
};

const CodeEditor = ({
	isLoading,
	snippet,
	codeEditorStates,
	defaultLanguage = SupportedLanguages.Markdown,
	allSnippets,
	rightPane = "preview",
	onSave,
	onStarred,
	onPublicToggle,
	onTouched,
	onWikiNavigate,
}: CodeEditorProps): ReactElement => {
	const isMobile = useViewPortStore((state) => state.isMobile);
	const theme = useUserStore((state) => state.theme) as ThemeName;
	const { menuType } = codeEditorStates ?? {};
	const isTrashActive = menuType === "trash";
	const editorContentRef = useRef<HTMLDivElement>(null);
	const editorTheme = useMemo(() => getCodeMirrorTheme(theme), [theme]);

	const {
		currentSnippet,
		setCurrentSnippet,
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

	useKeyboardSave(saveHandler, isTrashActive);

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
	const isChatMode = rightPane === "chat";
	const showPreview = !isChatMode && isMarkdownLanguage && !isTrashActive;
	const showChatPane = isChatMode && !isTrashActive;
	const hasRightPane = showPreview || showChatPane;

	const editorHeight = calculateEditorHeight({
		isMobile,
		isTrashActive,
		hasRightPane,
	});
	const previewHeight = calculatePreviewHeight(isMobile);

	return (
		<div
			className={`${styles.codeEditorContainer} ${!snippet && !isLoading && styles.noSnippetContainer}`}
		>
			{isLoading ? (
				<SkeletonCodeEditor />
			) : snippet ? (
				<>
					{!isTrashActive && (
						<>
							<CodeEditorHeader
								currentSnippet={currentSnippet}
								codeEditorStates={codeEditorStates}
								snippetName={snippet?.name ?? ""}
								onStarred={starringHandler}
								onUpdateName={updateCurrentSnippetName}
								onSetLanguage={setLanguageHandler}
								onSave={saveHandler}
							/>

							<CodeEditorTags
								activeTag={codeEditorStates?.menuType ?? ""}
								currentSnippet={currentSnippet}
								allSnippets={allSnippets}
								isPublic={currentSnippet.is_public ?? false}
								showDetails={showDetails}
								hideAiButton={isChatMode}
								onNewTag={newTagHandler}
								onChange={() => onTouched(true)}
								onRemoveTag={removeTagHandler}
								onToggleDetails={() => setShowDetails(!showDetails)}
								onTogglePublic={togglePublicHandler}
								onToggleHistory={() => setShowHistory(!showHistory)}
								showHistory={showHistory}
								hasVersions={versionCount > 0}
								onApplyAiCode={updateCurrentSnippetValue}
								onCopyToSnippet={handleCopyToSnippet}
								onReplaceSnippet={updateCurrentSnippetValue}
							/>

							{isMobile && (
								<div className={styles.mobileActions}>
									<CodeEditorActions
										currentSnippet={currentSnippet}
										allSnippets={allSnippets}
										isPublic={currentSnippet.is_public ?? false}
										showDetails={showDetails}
										hideAiButton={isChatMode}
										onToggleDetails={() => setShowDetails(!showDetails)}
										onTogglePublic={togglePublicHandler}
										onToggleHistory={() => setShowHistory(!showHistory)}
										showHistory={showHistory}
										hasVersions={versionCount > 0}
										onApplyAiCode={updateCurrentSnippetValue}
										onCopyToSnippet={handleCopyToSnippet}
										onReplaceSnippet={updateCurrentSnippetValue}
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
									onRestore={(version) => {
										const restoredLanguage =
											version.language as SupportedLanguages;

										if (!preRestoreSnapshot) {
											setPreRestoreSnapshot({ ...currentSnippet });
										}

										setCurrentSnippet({
											...currentSnippet,
											snippet: version.content,
											language: restoredLanguage,
											name: version.name,
											tags: version.tags,
											extension: languageExtensions[restoredLanguage],
										});
										onTouched(true);
										setShowDetails(false);
										refreshVersionCount(currentSnippet.snippet_id);
									}}
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
									isMobile={isMobile}
									onClose={() => setShowDetails(false)}
									onUrlChange={updateCurrentSnippetUrl}
									onNotesChange={updateCurrentSnippetNotes}
									onFolderChange={updateCurrentSnippetFolder}
								/>
							)}
						</>
					)}

					{hasRightPane ? (
						<div
							ref={editorContentRef}
							className={isMobile ? styles.splitViewMobile : styles.splitView}
						>
							<div
								className={styles.editorPanel}
								style={
									!isMobile ? { width: `${editorWidthPercent}%` } : undefined
								}
							>
								<CodeMirror
									autoFocus={false}
									indentWithTab={true}
									basicSetup={codeMirrorOptions}
									placeholder={"Write your snipped here"}
									className={styles.codeMirrorContainer}
									value={currentSnippet?.snippet ?? ""}
									extensions={[
										currentSnippet.extension,
										inlineCompletionExtension,
										wikiAutocompleteExtension,
									]}
									theme={editorTheme}
									height={editorHeight}
									width="100%"
									onChange={updateCurrentSnippetValue}
								/>
							</div>
							{!isMobile && (
								<div
									className={styles.previewResizer}
									onMouseDown={handlePreviewMouseDown}
								/>
							)}
							{showChatPane ? (
								<AiAssistantPanel
									currentSnippet={currentSnippet}
									allSnippets={allSnippets}
									height={previewHeight}
									onCopyToSnippet={handleCopyToSnippet}
									onReplaceSnippet={updateCurrentSnippetValue}
								/>
							) : (
								<MarkdownPreview
									content={currentSnippet.snippet}
									height={previewHeight}
									onWikiNavigate={onWikiNavigate}
								/>
							)}
						</div>
					) : (
						<CodeMirror
							autoFocus={false}
							indentWithTab={true}
							basicSetup={
								isTrashActive ? { lineNumbers: true } : codeMirrorOptions
							}
							placeholder={"Write your snipped here"}
							className={styles.codeMirrorContainer}
							value={currentSnippet?.snippet ?? ""}
							extensions={[currentSnippet.extension, wikiAutocompleteExtension]}
							theme={editorTheme}
							height={editorHeight}
							width="100%"
							readOnly={isTrashActive}
							onChange={updateCurrentSnippetValue}
						/>
					)}
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
