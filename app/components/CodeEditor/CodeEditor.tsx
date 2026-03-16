"use client";

import {
	ReactElement,
	useState,
	useEffect,
	useMemo,
	useCallback,
	useRef,
	ChangeEvent,
} from "react";
import CodeMirror from "@uiw/react-codemirror";

/* Lib */
import SupportedLanguages from "@/lib/config/languages";
import languageExtensions from "@/lib/codeEditor";
import useViewPortStore from "@/lib/store/viewPort.store";
import useUserStore from "@/lib/store/user.store";
import useToastStore from "@/lib/store/toast.store";
import codeMirrorOptions from "@/lib/constants/codeMirror";
import { getCodeMirrorTheme, ThemeName } from "@/lib/config/themes";
import { ToastType } from "@/lib/constants/toast";
import {
	toggleSnippetPublic,
	getSnippetVersions,
} from "@/lib/supabase/queries";

/* Components */
import CodeEditorTags from "@/components/CodeEditor/CodeEditorTags";
import CodeEditorHeader from "@/components/CodeEditor/CodeEditorHeader";
import CodeEditorActions from "@/components/CodeEditor/CodeEditorActions";
import MarkdownPreview from "@/components/MarkdownPreview/MarkdownPreview";
import Input from "@/components/ui/Input/Input";
import SkeletonCodeEditor from "@/components/ui/Skeleton/SkeletonCodeEditor";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorProps = {
	isLoading: boolean;
	snippet: Snippet | null;
	defaultLanguage?: SupportedLanguages;
	codeEditorStates: SnippetEditorStates;
	onSave: (
		currentSnippet: CurrentSnippet,
		fromButton: boolean | "favorite"
	) => void;
	onStarred: (currentSnippet: CurrentSnippet) => void;
	onPublicToggle: (currentSnippet: CurrentSnippet) => void;
	onTouched: (touched: boolean) => void;
};

const CodeEditor = ({
	isLoading,
	snippet,
	codeEditorStates,
	defaultLanguage = SupportedLanguages.Markdown,
	onSave,
	onStarred,
	onPublicToggle,
	onTouched,
}: CodeEditorProps): ReactElement => {
	const isMobile = useViewPortStore((state) => state.isMobile);
	const theme = useUserStore((state) => state.theme) as ThemeName;
	const { addToast } = useToastStore();
	const { menuType, touched } = codeEditorStates ?? {};
	const isTrashActive = menuType === "trash";
	const [currentSnippet, setCurrentSnippet] = useState<CurrentSnippet>({
		...({} as Snippet),
		snippet: "",
		tags: null,
		language: defaultLanguage,
		extension: languageExtensions[defaultLanguage],
	});
	const isMarkdownLanguage =
		currentSnippet?.language === SupportedLanguages.Markdown;
	const showPreview = isMarkdownLanguage && !isTrashActive;
	const [showDetails, setShowDetails] = useState(false);
	const [versionCount, setVersionCount] = useState(0);

	const editorContentRef = useRef<HTMLDivElement>(null);
	const [editorWidthPercent, setEditorWidthPercent] = useState(50);
	const [isDraggingPreview, setIsDraggingPreview] = useState(false);

	const handlePreviewMouseDown = useCallback(() => {
		setIsDraggingPreview(true);
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	}, []);

	const handlePreviewMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDraggingPreview || !editorContentRef.current) return;

			const rect = editorContentRef.current.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const percent = (mouseX / rect.width) * 100;

			setEditorWidthPercent(Math.max(25, Math.min(75, percent)));
		},
		[isDraggingPreview]
	);

	const handlePreviewMouseUp = useCallback(() => {
		setIsDraggingPreview(false);
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
	}, []);

	const editorTheme = useMemo(() => getCodeMirrorTheme(theme), [theme]);

	const setLanguageExtension = (newLanguage: SupportedLanguages): void => {
		setCurrentSnippet({
			...currentSnippet,
			language: newLanguage,
			extension: languageExtensions[newLanguage],
		});

		onTouched(true);
	};

	const setLanguageHandler = (selectedLanguage: string): void => {
		const languageSelected = selectedLanguage ?? defaultLanguage;

		setLanguageExtension(languageSelected as SupportedLanguages);
	};

	const updateCurrentSnippetValue = (value: string): void => {
		setCurrentSnippet({
			...currentSnippet,
			snippet: value ?? "",
		});

		onTouched(true);
	};

	const updateCurrentSnippetName = (
		event: ChangeEvent<HTMLInputElement>
	): void => {
		event?.preventDefault();

		const name = event?.target?.value ?? "";

		const newCurrentSnippet = {
			...currentSnippet,
			name,
		};

		setCurrentSnippet(newCurrentSnippet);

		onTouched(name?.length > 0);
	};

	const starringHandler = (): void => {
		const newCurrentSnippet = {
			...currentSnippet,
			state: currentSnippet?.state === "favorite" ? "active" : "favorite",
		} as CurrentSnippet;
		const isFavoriteMenu = codeEditorStates?.menuType === "favorites";
		const fromButton = isFavoriteMenu ? "favorite" : true;

		setCurrentSnippet(newCurrentSnippet);
		onSave(newCurrentSnippet, fromButton);

		if (isFavoriteMenu) {
			onStarred(newCurrentSnippet);
		}
	};

	const newTagHandler = (newTagValue: string): void => {
		const tagList = currentSnippet?.tags ? currentSnippet.tags?.split(",") : [];
		const newTagValueTrimmed = newTagValue.trim();

		if (
			!newTagValue ||
			newTagValue.length >= 28 ||
			tagList.length >= 3 ||
			tagList.includes(newTagValueTrimmed)
		)
			return;

		const updatedTags = currentSnippet?.tags
			? `${currentSnippet.tags},${newTagValueTrimmed}`
			: newTagValueTrimmed;

		setCurrentSnippet({ ...currentSnippet, tags: updatedTags });
		onTouched(true);
	};

	const removeTagHandler = (tagRemoved: string): void => {
		if (!tagRemoved) return;

		const updatedTags = currentSnippet?.tags
			? currentSnippet.tags
					.split(",")
					.filter((tag: string) => tag !== tagRemoved)
					.join(",")
			: null;

		setCurrentSnippet({ ...currentSnippet, tags: updatedTags });
		onTouched(true);
	};

	const updateCurrentSnippetUrl = (
		event: ChangeEvent<HTMLInputElement>
	): void => {
		setCurrentSnippet({ ...currentSnippet, url: event.target.value });
		onTouched(true);
	};

	const updateCurrentSnippetNotes = (
		event: ChangeEvent<HTMLTextAreaElement>
	): void => {
		setCurrentSnippet({ ...currentSnippet, notes: event.target.value });
		onTouched(true);
	};

	const togglePublicHandler = async (): Promise<void> => {
		const newIsPublic = !currentSnippet.is_public;
		const slug = await toggleSnippetPublic(
			currentSnippet.snippet_id,
			newIsPublic,
			currentSnippet.public_slug
		);

		const updatedSnippet = {
			...currentSnippet,
			is_public: newIsPublic,
			public_slug: slug,
		};

		setCurrentSnippet(updatedSnippet);
		onPublicToggle(updatedSnippet);
		onTouched(false);

		if (newIsPublic && slug) {
			const shareUrl = `${window.location.origin}/s/${slug}`;

			await navigator.clipboard.writeText(shareUrl).catch(() => null);
			addToast({
				type: ToastType.Success,
				message: "Snippet is now public! Link copied.",
			});
		} else {
			addToast({
				type: ToastType.Info,
				message: "Snippet is now private",
			});
		}
	};

	const calculateEditorHeight = (): string => {
		if (isMobile && !isTrashActive) {
			return isMarkdownLanguage ? "calc(50vh - 5rem)" : "calc(100vh - 9.7rem)";
		}

		if (isTrashActive && !isMobile) {
			return "100vh";
		}

		if (isTrashActive && isMobile) {
			return "calc(100vh - 3.2rem)";
		}

		return "calc(100vh - 6.45rem)";
	};

	const calculatePreviewHeight = (): string => {
		if (isMobile) {
			return "calc(50vh - 5rem)";
		}

		return "calc(100vh - 6.45rem)";
	};

	const handleExplicitSave = (): void => {
		onSave(currentSnippet, true);
	};

	const handleKeyBoardSave = (event: KeyboardEvent): void => {
		if (
			(event.ctrlKey && event.key === "s") ||
			(event.metaKey && event.key === "s")
		) {
			if (!isTrashActive) {
				handleExplicitSave();
			}

			event.preventDefault();
		}
	};

	useEffect(() => {
		if (snippet?.language) {
			setLanguageExtension(snippet.language);
		}
	}, [snippet?.language]);

	useEffect(() => {
		if (snippet) {
			if (touched && !isTrashActive) {
				onSave(currentSnippet, false);
			}

			// New Snippet selected info
			setCurrentSnippet({
				...currentSnippet,
				...snippet,
				extension: languageExtensions[snippet.language ?? defaultLanguage],
			});

			onTouched(false);
		}
	}, [snippet]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyBoardSave);

		// Clean up event listener when component unmounts
		return () => {
			window.removeEventListener("keydown", handleKeyBoardSave);
		};
	}, [currentSnippet]);

	useEffect(() => {
		if (showDetails && currentSnippet?.snippet_id) {
			getSnippetVersions(currentSnippet.snippet_id)
				.then((versions) => setVersionCount(versions.length))
				.catch(() => setVersionCount(0));
		}
	}, [showDetails]);

	useEffect(() => {
		if (isDraggingPreview) {
			document.addEventListener("mousemove", handlePreviewMouseMove);
			document.addEventListener("mouseup", handlePreviewMouseUp);

			return () => {
				document.removeEventListener("mousemove", handlePreviewMouseMove);
				document.removeEventListener("mouseup", handlePreviewMouseUp);
			};
		}

		return undefined;
	}, [isDraggingPreview, handlePreviewMouseMove, handlePreviewMouseUp]);

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
								onSave={handleExplicitSave}
							/>

							<CodeEditorTags
								activeTag={codeEditorStates?.menuType ?? ""}
								currentSnippet={currentSnippet}
								isPublic={currentSnippet.is_public ?? false}
								showDetails={showDetails}
								onNewTag={newTagHandler}
								onChange={() => onTouched(true)}
								onRemoveTag={removeTagHandler}
								onToggleDetails={() => setShowDetails(!showDetails)}
								onTogglePublic={togglePublicHandler}
							/>

							{isMobile && (
								<div className={styles.mobileActions}>
									<CodeEditorActions
										currentSnippet={currentSnippet}
										isPublic={currentSnippet.is_public ?? false}
										showDetails={showDetails}
										onToggleDetails={() => setShowDetails(!showDetails)}
										onTogglePublic={togglePublicHandler}
									/>
								</div>
							)}

							{showDetails && (
								<>
									{!isMobile && (
										<div
											className={styles.detailsOverlay}
											onClick={() => setShowDetails(false)}
										/>
									)}
									<div
										className={
											isMobile ? styles.detailsPanelMobile : styles.detailsPanel
										}
									>
										<div className={styles.detailsHeader}>
											<span className={styles.detailsTitle}>
												Snippet Details
											</span>
											<button
												type="button"
												className={styles.detailsClose}
												onClick={() => setShowDetails(false)}
											>
												&times;
											</button>
										</div>
										<div className={styles.detailsContainer}>
											<div className={styles.detailsField}>
												<label className={styles.detailsLabel}>
													Source URL
												</label>
												<Input
													placeholder="https://..."
													value={currentSnippet?.url ?? ""}
													onChange={updateCurrentSnippetUrl}
													maxLength={200}
													disableMargin
												/>
											</div>

											<div className={styles.detailsField}>
												<label className={styles.detailsLabel}>Notes</label>
												<textarea
													className={styles.notesField}
													placeholder="Add notes about this snippet..."
													value={currentSnippet?.notes ?? ""}
													onChange={updateCurrentSnippetNotes}
													maxLength={500}
													rows={4}
												/>
											</div>

											<div className={styles.detailsField}>
												<label className={styles.detailsLabel}>Version</label>
												<span className={styles.detailsValue}>
													{versionCount > 0
														? `v${versionCount}`
														: "No versions saved yet"}
												</span>
											</div>

											{currentSnippet.is_public &&
												currentSnippet.public_slug && (
													<div className={styles.detailsField}>
														<label className={styles.detailsLabel}>
															Public link
														</label>
														<a
															className={styles.publicLink}
															href={`/s/${currentSnippet.public_slug}`}
															target="_blank"
															rel="noopener noreferrer"
														>
															{`${typeof window !== "undefined" ? window.location.origin : ""}/s/${currentSnippet.public_slug}`}
														</a>
													</div>
												)}
										</div>
									</div>
								</>
							)}
						</>
					)}

					{showPreview ? (
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
									value={snippet?.snippet ?? ""}
									extensions={[currentSnippet.extension]}
									theme={editorTheme}
									height={calculateEditorHeight()}
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
							<MarkdownPreview
								content={currentSnippet.snippet}
								height={calculatePreviewHeight()}
							/>
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
							value={snippet?.snippet ?? ""}
							extensions={[currentSnippet.extension]}
							theme={editorTheme}
							height={calculateEditorHeight()}
							width="100%"
							readOnly={isTrashActive}
							onChange={updateCurrentSnippetValue}
						/>
					)}
				</>
			) : (
				<p className={styles.noSnippet}>No snippet selected</p>
			)}
		</div>
	);
};

export default CodeEditor;
