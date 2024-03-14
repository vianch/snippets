"use client";

import { ReactElement, useState, useEffect, useMemo, ChangeEvent } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { draculaInit } from "@uiw/codemirror-theme-dracula";

/* Lib */
import SupportedLanguages from "@/lib/config/languages";
import languageExtensions from "@/lib/codeEditor";
import useViewPortStore from "@/lib/store/viewPort";
import codeMirrorOptions from "@/lib/constants/codeMirror";

/* Styles */
import CodeEditorHeader from "@/components/CodeEditor/CodeEditorHeader";
import CodeEditorTags from "@/components/CodeEditor/CodeEditorTags";
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
	const { menuType, isSaving, touched } = codeEditorStates ?? {};
	const isTrashActive = menuType === "trash";
	const [currentSnippet, setCurrentSnippet] = useState<CurrentSnippet>({
		...({} as Snippet),
		snippet: "",
		tags: [],
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
		if (
			newTagValue &&
			currentSnippet?.tags &&
			newTagValue?.length > 0 &&
			currentSnippet.tags?.length < 5
		) {
			const newCurrentSnippet = {
				...currentSnippet,
				...{
					tags: [...(currentSnippet?.tags ?? []), newTagValue],
				},
			};

			setCurrentSnippet(newCurrentSnippet);

			onTouched(true);
		}
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
								isSaving={isSaving}
								snippetName={snippet?.name ?? ""}
								onStarred={starringHandler}
								onUpdateName={updateCurrentSnippetName}
								onSetLanguage={setLanguageHandler}
								onSave={() => onSave(currentSnippet, true)}
							/>

							<CodeEditorTags
								tags={currentSnippet?.tags ?? []}
								onNewTag={newTagHandler}
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
