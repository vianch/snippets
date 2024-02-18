"use client";

import { ReactElement, useEffect, useState } from "react";

/* Components */
import Aside from "@/components/Aside/Aside";
import SnippetList from "@/components/SnippetList/SnippetList";
import CodeEditor from "@/components/CodeEditor/CodeEditor";

/* Lib and Utils */
import defaultMenuItems from "@/lib/config/aside";
import { getAllSnippets, saveSnippet } from "@/lib/supabase/queries";
import sortSnippetsByUpdatedAt from "@/utils/array.utils";

/* Styles */
import styles from "./snippets.module.css";

export default function Page(): ReactElement {
	const [snippets, setSnippets] = useState<Snippet[]>([]);
	const [activeSnippetIndex, setActiveSnippetIndex] = useState<number>(0);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	const getSnippets = async (): Promise<void> => {
		const data = await getAllSnippets();

		if (data?.length > 0) {
			setSnippets(data);
		}
	};

	const updateSnippet = async (
		currentSnippet: CurrentSnippet | null = null
	): Promise<void> => {
		if (currentSnippet) {
			const foundIndex = snippets.findIndex(
				(snippet: Snippet): boolean =>
					snippet.snippet_id === currentSnippet.snippet_id
			);

			if (foundIndex !== -1) {
				const snippetsCopy = [...snippets];

				snippetsCopy[foundIndex].name = currentSnippet.name;
				snippetsCopy[foundIndex].snippet = currentSnippet.snippet;
				snippetsCopy[foundIndex].language = currentSnippet.language;
				snippetsCopy[foundIndex].updated_at = currentSnippet.updated_at;

				setSnippets(sortSnippetsByUpdatedAt(snippetsCopy));

				// TODO: dont move to the first position if the snippet save on leave focus
				setActiveSnippetIndex(0);
				setIsSaving(false);
			}
		}
	};

	const saveSnippetHandler = async (
		currentSnippet: CurrentSnippet
	): Promise<void> => {
		if (snippets[activeSnippetIndex]?.snippet_id) {
			setIsSaving(true);
			const updatedSnippet = {
				...currentSnippet,
				updated_at: new Date().toISOString(),
			};

			await saveSnippet(updatedSnippet);

			setTimeout(() => {
				updateSnippet(updatedSnippet);
			}, 1000);
		}
	};

	const newSnippetHandler = (newSnippet: Snippet): void => {
		if (newSnippet) {
			setSnippets([newSnippet, ...snippets]);
		}
	};

	useEffect(() => {
		getSnippets().then(() => null);
	}, []);

	return (
		<>
			<Aside menuItems={defaultMenuItems} />

			<section className={styles.mainContent}>
				<SnippetList
					snippets={snippets}
					activeSnippetIndex={activeSnippetIndex}
					onNewSnippet={newSnippetHandler}
					onActiveSnippet={setActiveSnippetIndex}
				/>

				<CodeEditor
					snippet={snippets?.length > 0 ? snippets[activeSnippetIndex] : null}
					isSaving={isSaving}
					onSave={saveSnippetHandler}
				/>
			</section>
		</>
	);
}
