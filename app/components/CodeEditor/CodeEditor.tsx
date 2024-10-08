"use client";

import { ReactElement, useState, useEffect, useMemo, ChangeEvent } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { draculaInit } from "@uiw/codemirror-theme-dracula";

/* Lib */
import SupportedLanguages from "@/lib/config/languages";
import languageExtensions from "@/lib/codeEditor";
import useViewPortStore from "@/lib/store/viewPort.store";
import codeMirrorOptions from "@/lib/constants/codeMirror";

/* Components */
import CodeEditorTags from "@/components/CodeEditor/CodeEditorTags";
import CodeEditorHeader from "@/components/CodeEditor/CodeEditorHeader";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorProps = {
	snippet: Snippet | null;
	defaultLanguage?: SupportedLanguages;
	codeEditorStates: SnippetEditorStates;
	onSave: (
		currentSnippet: CurrentSnippet,
		fromButton: boolean | "favorite"
	) => void;
	onStarred: (currentSnippet: CurrentSnippet) => void;
	onTouched: (touched: boolean) => void;
};

const CodeEditor = ({
	snippet,
	codeEditorStates,
	defaultLanguage = SupportedLanguages.JavaScript,
	onSave,
	onStarred,
	onTouched,
}: CodeEditorProps): ReactElement => {
	const isMobile = useViewPortStore((state) => state.isMobile);
	const { menuType, touched } = codeEditorStates ?? {};
	const isTrashActive = menuType === "trash";
	const [currentSnippet, setCurrentSnippet] = useState<CurrentSnippet>({
		...({} as Snippet),
		snippet: "",
		tags: null,
		language: defaultLanguage,
		extension: languageExtensions[defaultLanguage],
	});

	const draculaTheme = useMemo(
		() =>
			draculaInit({
				settings: {
					background: "#363945",
					fontFamily: "monospace",
				},
			}),
		[]
	);

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

	const calculateEditorHeight = (): string => {
		if (isMobile && !isTrashActive) {
			return "calc(100vh - 9.7rem)";
		}

		if (isTrashActive && !isMobile) {
			return "100vh";
		}

		if (isTrashActive && isMobile) {
			return "calc(100vh - 3.2rem)";
		}

		return "calc(100vh - 6.45rem)";
	};

	const handleKeyBoardSave = (event: KeyboardEvent): void => {
		if (
			(event.ctrlKey && event.key === "s") ||
			(event.metaKey && event.key === "s")
		) {
			if (!isTrashActive) {
				onSave(currentSnippet, true);
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

	return (
		<div
			className={`${styles.codeEditorContainer} ${!snippet && styles.noSnippetContainer}`}
		>
			{snippet && (
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
								onSave={() => onSave(currentSnippet, true)}
							/>

							<CodeEditorTags
								activeTag={codeEditorStates?.menuType ?? ""}
								tags={currentSnippet?.tags ?? ""}
								onNewTag={newTagHandler}
								onChange={() => onTouched(true)}
								onRemoveTag={removeTagHandler}
							/>
						</>
					)}

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
						theme={draculaTheme}
						height={calculateEditorHeight()}
						width="100%"
						readOnly={isTrashActive}
						onChange={updateCurrentSnippetValue}
					/>
				</>
			)}

			{!snippet && <p className={styles.noSnippet}>No snippet selected</p>}
		</div>
	);
};

export default CodeEditor;
