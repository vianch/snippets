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
	const [codeEditorStates, setCodedEditorStates] = useState<{
		activeSnippetIndex: number;
		isSaving: boolean;
		touched: boolean;
	}>({
		activeSnippetIndex: 0,
		isSaving: false,
		touched: false,
	});

	const setActiveSnippetIndex = (index: number): void => {
		setCodedEditorStates({
			...codeEditorStates,
			activeSnippetIndex: index,
		});
	};

	const touchedHandler = (touched: boolean): void => {
		setCodedEditorStates({
			...codeEditorStates,
			touched,
		});
	};

	const getSnippets = async (): Promise<void> => {
		const data = await getAllSnippets();

		if (data?.length > 0) {
			setSnippets(data);
		}
	};

	const updateSnippet = async (
		currentSnippet: CurrentSnippet | null = null,
		fromButton = false
	): Promise<void> => {
		if (!currentSnippet) {
			return;
		}

		const foundIndex = snippets.findIndex(
			(snippet: Snippet): boolean =>
				snippet.snippet_id === currentSnippet.snippet_id
		);

		if (foundIndex === -1) {
			return;
		}

		const updatedSnippets = snippets.map((snippet, index) =>
			index === foundIndex ? { ...snippet, ...currentSnippet } : snippet
		);

		const snippetsSorted = sortSnippetsByUpdatedAt(updatedSnippets);

		setSnippets(snippetsSorted);

		const newActiveSnippetIndex =
			codeEditorStates.activeSnippetIndex > foundIndex
				? codeEditorStates.activeSnippetIndex
				: codeEditorStates.activeSnippetIndex + 1;
		const activeSnippetIndex = fromButton ? 0 : newActiveSnippetIndex;

		setCodedEditorStates({
			...codeEditorStates,
			activeSnippetIndex,
			isSaving: false,
			touched: false,
		});
	};

	const saveSnippetHandler = async (
		currentSnippet: CurrentSnippet,
		fromButton = false
	): Promise<void> => {
		if (snippets[codeEditorStates?.activeSnippetIndex ?? 0]?.snippet_id) {
			setCodedEditorStates({
				...codeEditorStates,
				isSaving: true,
			});

			const updatedSnippet = {
				...currentSnippet,
				updated_at: new Date().toISOString(),
			};

			await saveSnippet(updatedSnippet);

			setTimeout(() => {
				updateSnippet(updatedSnippet, fromButton);
			}, 1000);
		}
	};

	const newSnippetHandler = (newSnippet: Snippet): void => {
		if (newSnippet) {
			setSnippets([newSnippet, ...snippets]);

			setActiveSnippetIndex(
				!codeEditorStates.touched ? 0 : codeEditorStates.activeSnippetIndex + 1
			);
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
					activeSnippetIndex={codeEditorStates.activeSnippetIndex}
					onNewSnippet={newSnippetHandler}
					onActiveSnippet={setActiveSnippetIndex}
				/>

				<CodeEditor
					snippet={
						snippets?.length > 0
							? snippets[codeEditorStates.activeSnippetIndex]
							: null
					}
					isSaving={codeEditorStates.isSaving}
					onSave={saveSnippetHandler}
					touched={codeEditorStates.touched}
					onTouched={touchedHandler}
				/>
			</section>
		</>
	);
}
