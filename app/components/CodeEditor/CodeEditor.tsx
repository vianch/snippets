"use client";

import { ReactElement } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { draculaInit } from "@uiw/codemirror-theme-dracula";

import styles from "./codeEditor.module.css";

type CodeEditorProps = {
	snippet: Snippet;
};

const CodeEditor = ({ snippet }: CodeEditorProps): ReactElement => {
	const draculaTheme = draculaInit({
		settings: {
			background: "#363945",
			fontFamily: "monospace",
		},
	});

	return (
		<div className={styles.codeEditorContainer}>
			<CodeMirror
				value={snippet?.snippet ?? ""}
				extensions={[javascript({ jsx: true })]}
				theme={draculaTheme}
				height="100vh"
				width="100%"
			/>
		</div>
	);
};

export default CodeEditor;
