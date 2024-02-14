"use client";

import { ReactElement, useState, useEffect, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { draculaInit } from "@uiw/codemirror-theme-dracula";
import { LanguageSupport } from "@codemirror/language";

import SupportedLanguages from "@/lib/config/languages";
import languageExtensions from "@/lib/codeEditor";

import Select from "@/components/ui/Select/Select";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorProps = {
	snippet: Snippet;
	defaultLanguage?: SupportedLanguages;
};

const CodeEditor = ({
	snippet,
	defaultLanguage = SupportedLanguages.YAML,
}: CodeEditorProps): ReactElement => {
	const [language, setLanguage] = useState<SupportedLanguages>(
		snippet?.language ?? defaultLanguage
	);

	const [extension, setExtension] = useState<LanguageSupport>(
		languageExtensions[snippet?.language ?? defaultLanguage]
	);

	const setLanguageExtension = (newLanguage: SupportedLanguages): void => {
		setLanguage(newLanguage);
		setExtension(languageExtensions[newLanguage]);
	};

	const setLanguageHandler = (selectedLanguage: string): void => {
		const languageSelected = selectedLanguage ?? defaultLanguage;

		setLanguageExtension(languageSelected as SupportedLanguages);
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

	if (snippet) {
		return (
			<div className={styles.codeEditorContainer}>
				<Select
					value={language}
					items={Object.keys(languageExtensions)}
					onSelect={setLanguageHandler}
				/>

				<CodeMirror
					className={styles.codeMirrorContainer}
					value={snippet?.snippet ?? ""}
					extensions={[extension]}
					theme={draculaTheme}
					height="100vh"
					width="100%"
				/>
			</div>
		);
	}

	return <></>;
};

export default CodeEditor;
