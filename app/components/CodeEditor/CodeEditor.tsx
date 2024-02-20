"use client";

import { ReactElement, useState, useEffect, useMemo, ChangeEvent } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { draculaInit } from "@uiw/codemirror-theme-dracula";

import SupportedLanguages from "@/lib/config/languages";
import languageExtensions from "@/lib/codeEditor";

import Select from "@/components/ui/Select/Select";
import Button from "@/components/ui/Button/Button";
import Floppy from "@/components/ui/icons/Floppy";
import Loading from "@/components/ui/icons/Loading";
import Input from "@/components/ui/Input/Input";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorProps = {
	snippet: Snippet | null;
	defaultLanguage?: SupportedLanguages;
	codeEditorStates: SnippetEditorStates;
	onSave: (currentSnippet: CurrentSnippet, fromButton: boolean) => void;
	onTouched: (touched: boolean) => void;
};

const CodeEditor = ({
	snippet,
	codeEditorStates,
	defaultLanguage = SupportedLanguages.JavaScript,
	onSave,
	onTouched,
}: CodeEditorProps): ReactElement => {
	const { menuType, isSaving, touched } = codeEditorStates ?? {};
	const isTrashActive = menuType === "trash";
	const [currentSnippet, setCurrentSnippet] = useState<CurrentSnippet>({
		...({} as Snippet),
		snippet: "",
		language: defaultLanguage,
		extension: languageExtensions[defaultLanguage],
	});
	const codeMirrorOptions = {
		lineNumbers: true,
		highlightActiveLineGutter: true,
		highlightSpecialChars: true,
		history: true,
		foldGutter: true,
		drawSelection: true,
		dropCursor: false,
		allowMultipleSelections: false,
		indentOnInput: true,
		syntaxHighlighting: true,
		bracketMatching: true,
		closeBrackets: true,
		autocompletion: true,
		rectangularSelection: true,
		highlightActiveLine: true,
		highlightSelectionMatches: true,
		closeBracketsKeymap: true,
		defaultKeymap: true,
		searchKeymap: false,
		historyKeymap: true,
		foldKeymap: true,
		completionKeymap: true,
		lintKeymap: true,
		tabSize: 2,
	};

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
						<div className={styles.header}>
							<div className={styles.headerLeftSide}>
								<Input
									placeholder="Untitled"
									value={snippet?.name ?? ""}
									maxLength={34}
									onChange={updateCurrentSnippetName}
								/>
							</div>

							<div className={styles.headerRightSide}>
								<Select
									value={currentSnippet.language}
									items={Object.keys(languageExtensions)}
									onSelect={setLanguageHandler}
								/>

								<Button
									className={styles.button}
									variant="secondary"
									disabled={isSaving}
									onClick={() => onSave(currentSnippet, true)}
								>
									{isSaving ? (
										<Loading className={styles.icon} width={16} height={16} />
									) : (
										<Floppy className={styles.icon} width={16} height={16} />
									)}{" "}
									Save
								</Button>
							</div>
						</div>
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
						height={!isTrashActive ? "calc(100vh - 4rem)" : "100vh"}
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
