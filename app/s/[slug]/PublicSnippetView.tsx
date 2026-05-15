"use client";

import { ReactElement, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";

/* Components */
import NavHeader from "@/components/NavHeader/NavHeader";
import Footer from "@/components/Footer/Footer";
import Badge from "@/components/ui/Badge/Badge";
import Button from "@/components/ui/Button/Button";
import Camera from "@/components/ui/icons/Camera";
import ScreenshotModal from "@/components/ScreenshotModal/ScreenshotModal";

/* Lib and Utils */
import languageExtensions from "@/lib/codeEditor";
import { getCodeMirrorTheme, ThemeNames } from "@/lib/config/themes";
import SupportedLanguages from "@/lib/config/languages";

/* Styles */
import styles from "./publicSnippet.module.css";

type Props = {
	snippet: Snippet | null;
};

export default function PublicSnippetView({ snippet }: Props): ReactElement {
	const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);

	const editorTheme = getCodeMirrorTheme(ThemeNames.Dracula);
	const extension =
		languageExtensions[snippet?.language ?? SupportedLanguages.Markdown];
	const tagList =
		snippet?.tags && snippet.tags.length > 0 ? snippet.tags.split(",") : [];

	if (!snippet) {
		return (
			<main className={styles.main}>
				<NavHeader />
				<div className={styles.container}>
					<h1 className={styles.errorTitle}>Snippet not found</h1>
					<p className={styles.errorText}>
						This snippet may have been removed or made private.
					</p>
				</div>
				<Footer />
			</main>
		);
	}

	return (
		<main className={styles.main}>
			<NavHeader />
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>{snippet.name}</h1>

					<div className={styles.headerActions}>
						<span className={styles.language}>{snippet.language}</span>

						<Button
							className={styles.screenshotButton}
							variant="secondary"
							onClick={() => setScreenshotModalOpen(true)}
						>
							<Camera height={15} width={15} />
							Screenshot
						</Button>
					</div>
				</div>

				{tagList.length > 0 && (
					<div className={styles.tags}>
						{tagList.map((tag, index) => (
							<Badge key={`${index}-public-tag`}>{tag.trim()}</Badge>
						))}
					</div>
				)}

				{snippet.notes && <p className={styles.notes}>{snippet.notes}</p>}

				<div className={styles.editor}>
					<CodeMirror
						value={snippet.snippet}
						extensions={extension ? [extension] : []}
						theme={editorTheme}
						readOnly={true}
						basicSetup={{ lineNumbers: true, foldGutter: false }}
						height="auto"
					/>
				</div>

				{snippet.url && (
					<a
						className={styles.sourceUrl}
						href={snippet.url}
						target="_blank"
						rel="noopener noreferrer"
					>
						Source: {snippet.url}
					</a>
				)}
			</div>

			<ScreenshotModal
				isOpen={screenshotModalOpen}
				snippet={snippet}
				onClose={() => setScreenshotModalOpen(false)}
			/>

			<Footer />
		</main>
	);
}
