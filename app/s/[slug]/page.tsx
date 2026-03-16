"use client";

import { ReactElement, useEffect, useState, use } from "react";
import CodeMirror from "@uiw/react-codemirror";

/* Components */
import NavHeader from "@/components/NavHeader/NavHeader";
import Footer from "@/components/Footer/Footer";
import Badge from "@/components/ui/Badge/Badge";

/* Lib and Utils */
import languageExtensions from "@/lib/codeEditor";
import { getCodeMirrorTheme, ThemeNames } from "@/lib/config/themes";
import { getPublicSnippet } from "@/lib/supabase/queries";
import SupportedLanguages from "@/lib/config/languages";

/* Styles */
import styles from "./publicSnippet.module.css";

type PageProps = {
	params: Promise<{ slug: string }>;
};

export default function PublicSnippetPage({ params }: PageProps): ReactElement {
	const { slug } = use(params);
	const [snippet, setSnippet] = useState<Snippet | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		const fetchSnippet = async () => {
			try {
				const data = await getPublicSnippet(slug);

				if (data) {
					setSnippet(data);
				} else {
					setError(true);
				}
			} catch {
				setError(true);
			}

			setLoading(false);
		};

		fetchSnippet();
	}, [slug]);

	const editorTheme = getCodeMirrorTheme(ThemeNames.Dracula);
	const extension =
		languageExtensions[snippet?.language ?? SupportedLanguages.Markdown];
	const tagList =
		snippet?.tags && snippet.tags.length > 0 ? snippet.tags.split(",") : [];

	if (loading) {
		return (
			<main className={styles.main}>
				<NavHeader />
				<div className={styles.container}>
					<p className={styles.loading}>Loading snippet...</p>
				</div>
				<Footer />
			</main>
		);
	}

	if (error || !snippet) {
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
					<span className={styles.language}>{snippet.language}</span>
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
			<Footer />
		</main>
	);
}
