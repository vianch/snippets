"use client";

import { ReactElement, useState, useEffect, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { draculaInit } from "@uiw/codemirror-theme-dracula";

import SupportedLanguages from "@/lib/config/languages";
import languageExtensions from "@/lib/codeEditor";
import { saveSnippet } from "@/lib/supabase/queries";

import Select from "@/components/ui/Select/Select";
import Button from "@/components/ui/Button/Button";
import Floppy from "@/components/ui/icons/Floppy";
import Loading from "@/components/ui/icons/Loading";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorProps = {
	snippet: Snippet | null;
	defaultLanguage?: SupportedLanguages;
	onSave?: null | (() => void);
};

const CodeEditor = ({
	snippet,
	defaultLanguage = SupportedLanguages.JavaScript,
	onSave = null,
}: CodeEditorProps): ReactElement => {
	const [currentSnippet, setCurrentSnippet] = useState<CurrentSnippet>({
		...({} as Snippet),
		snippet: "",
		language: defaultLanguage,
		extension: languageExtensions[defaultLanguage],
		isSaving: false,
	});

	const setLanguageExtension = (newLanguage: SupportedLanguages): void => {
		setCurrentSnippet({
			...currentSnippet,
			language: newLanguage,
			extension: languageExtensions[newLanguage],
		});
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
	};

	const saveSnippetHandler = async (): Promise<void> => {
		if (snippet?.snippet_id) {
			setCurrentSnippet({ ...currentSnippet, isSaving: true });
			await saveSnippet(currentSnippet, onSave);

			setTimeout(() => {
				setCurrentSnippet({ ...currentSnippet, isSaving: false });
			}, 1000);
		}
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

	useEffect(() => {
		if (snippet?.language) {
			setLanguageExtension(snippet.language);
		}
	}, [snippet?.language]);

	useEffect(() => {
		if (snippet) {
			setCurrentSnippet({ ...currentSnippet, ...snippet });
		}
	}, [snippet]);

	return (
		<div className={styles.codeEditorContainer}>
			<div className={styles.header}>
				<Select
					value={currentSnippet.language}
					items={Object.keys(languageExtensions)}
					onSelect={setLanguageHandler}
				/>

				<Button
					className={styles.button}
					variant="secondary"
					onClick={saveSnippetHandler}
				>
					{currentSnippet.isSaving ? (
						<Loading className={styles.icon} width={16} height={16} />
					) : (
						<Floppy className={styles.icon} width={16} height={16} />
					)}{" "}
					Save
				</Button>
			</div>

			<CodeMirror
				autoFocus
				basicSetup={{
					lineNumbers: true,
					highlightActiveLineGutter: true,
					highlightSpecialChars: true,
					history: true,
					foldGutter: true,
					drawSelection: true,
					dropCursor: true,
					allowMultipleSelections: true,
					indentOnInput: true,
					syntaxHighlighting: true,
					bracketMatching: true,
					closeBrackets: true,
					autocompletion: true,
					rectangularSelection: true,
					crosshairCursor: true,
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
				}}
				placeholder={"Write your snipped here"}
				className={styles.codeMirrorContainer}
				value={snippet?.snippet ?? ""}
				extensions={[currentSnippet.extension]}
				theme={draculaTheme}
				height="calc(100vh - 2.55rem)"
				width="100%"
				onChange={updateCurrentSnippetValue}
			/>
		</div>
	);
};

export default CodeEditor;
