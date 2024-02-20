"use client";

import { ReactElement, useEffect, useState } from "react";

/* Components */
import Aside from "@/components/Aside/Aside";
import SnippetList from "@/components/SnippetList/SnippetList";
import CodeEditor from "@/components/CodeEditor/CodeEditor";

/* Lib and Utils */
import defaultMenuItems from "@/lib/config/aside";
import {
	getAllSnippets,
	saveSnippet,
	trashRestoreSnippet,
} from "@/lib/supabase/queries";
import sortSnippetsByUpdatedAt from "@/utils/array.utils";

/* Styles */
import styles from "./snippets.module.css";

export default function Page(): ReactElement {
	const defaultCodeEditorStates: SnippetEditorStates = {
		activeSnippetIndex: 0,
		isSaving: false,
		touched: false,
		menuType: "all",
	};
	const [snippets, setSnippets] = useState<Snippet[]>([]);
	const [codeEditorStates, setCodedEditorStates] =
		useState<SnippetEditorStates>(defaultCodeEditorStates);

	const findIndexForCurrentSnippet = (currentSnippet: CurrentSnippet): number =>
		snippets.findIndex(
			(snippet: Snippet): boolean =>
				snippet.snippet_id === currentSnippet.snippet_id
		);

	const setActiveSnippetIndex = (index: number): void => {
		setCodedEditorStates({
			...codeEditorStates,
			activeSnippetIndex: index,
			isSaving: codeEditorStates.touched,
		});
	};

	const touchedHandler = (touched: boolean): void => {
		setCodedEditorStates({
			...codeEditorStates,

			touched,
		});
	};

	const getSnippets = async (state: SnippetState = "active"): Promise<void> => {
		const data = await getAllSnippets(state);

		setSnippets(data);
		setCodedEditorStates(defaultCodeEditorStates);
	};

	const updateSnippet = async (
		currentSnippet: CurrentSnippet | null = null,
		fromButton = false
	): Promise<void> => {
		if (!currentSnippet) {
			return;
		}

		const foundIndex = findIndexForCurrentSnippet(currentSnippet);

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
		if (
			snippets[codeEditorStates?.activeSnippetIndex ?? 0]?.snippet_id &&
			currentSnippet?.name &&
			currentSnippet?.name?.length > 0 &&
			currentSnippet?.snippet
		) {
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
			}, 400);
		} else {
			setTimeout(() => {
				setCodedEditorStates({
					...codeEditorStates,
					isSaving: false,
				});
			}, 400);
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

	const getTrashHandler = async (): Promise<void> => {
		if (codeEditorStates.menuType !== "trash") {
			await getSnippets("inactive");
			setCodedEditorStates({
				...codeEditorStates,
				menuType: "trash",
				activeSnippetIndex: 0,
			});
		}
	};

	const getSnippetsHandler = async (): Promise<void> => {
		if (codeEditorStates.menuType !== "all") {
			await getSnippets();
		}
	};

	const trashRestoreSnippetHandler = async (
		snippetId: UUID,
		index: number,
		state: SnippetState = "inactive"
	): Promise<void> => {
		if (!snippetId) {
			return;
		}

		await trashRestoreSnippet(snippetId, state);

		const cloneSnippets = [...snippets];
		const foundIndex = cloneSnippets.findIndex(
			(snippet: Snippet): boolean => snippet.snippet_id === snippetId
		);

		if (foundIndex === -1) {
			return;
		}

		cloneSnippets.splice(foundIndex, 1);
		setSnippets(cloneSnippets);

		if (index > cloneSnippets.length - 1) {
			setActiveSnippetIndex(0);
		}
	};

	useEffect(() => {
		getSnippets().then(() => null);
	}, []);

	return (
		<>
			<Aside
				menuItems={defaultMenuItems}
				menuType={codeEditorStates.menuType}
				onGetAll={getSnippetsHandler}
				onTrash={getTrashHandler}
			/>

			<section className={styles.mainContent}>
				<SnippetList
					snippets={snippets}
					codeEditorStates={codeEditorStates}
					onNewSnippet={newSnippetHandler}
					onActiveSnippet={setActiveSnippetIndex}
					onDeleteSnippet={trashRestoreSnippetHandler}
					onRestoreSnippet={trashRestoreSnippetHandler}
				/>

				<CodeEditor
					snippet={
						snippets?.length > 0
							? snippets[codeEditorStates.activeSnippetIndex]
							: null
					}
					codeEditorStates={codeEditorStates}
					onSave={saveSnippetHandler}
					onTouched={touchedHandler}
				/>
			</section>
		</>
	);
}
