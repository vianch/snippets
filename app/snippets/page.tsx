"use client";

import { ReactElement, useEffect, useState } from "react";

/* Components */
import Aside from "@/components/Aside/Aside";
import SnippetList from "@/components/SnippetList/SnippetList";
import CodeEditor from "@/components/CodeEditor/CodeEditor";

/* Lib and Utils */
import {
	getAllSnippets,
	getSnippetsByState,
	getTags,
	saveSnippet,
	trashRestoreSnippet,
} from "@/lib/supabase/queries";
import sortSnippetsByUpdatedAt from "@/utils/array.utils";
import { useDeviceViewPort } from "@/utils/ui.utils";

export default function Page(): ReactElement {
	// Allow isMobile to be used across all Snippets page components
	useDeviceViewPort();

	const defaultCodeEditorStates: SnippetEditorStates = {
		activeSnippetIndex: 0,
		isSaving: false,
		touched: false,
		menuType: "all",
	};
	const [snippets, setSnippets] = useState<Snippet[]>([]);
	const [tags, setTags] = useState<TagItem[]>([]);
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
		const data =
			state === "active"
				? await getAllSnippets()
				: await getSnippetsByState(state);

		setSnippets(data);

		setCodedEditorStates(defaultCodeEditorStates);
	};

	const updateSnippet = (
		currentSnippet: CurrentSnippet | null = null,
		fromButton: boolean | "favorite" = false
	): number => {
		if (!currentSnippet) {
			return 0;
		}

		const foundIndex = findIndexForCurrentSnippet(currentSnippet);

		if (foundIndex === -1) {
			return 0;
		}

		if (fromButton !== "favorite") {
			const updatedSnippets = snippets.map((snippet, index) =>
				index === foundIndex ? { ...snippet, ...currentSnippet } : snippet
			);

			const snippetsSorted = sortSnippetsByUpdatedAt(updatedSnippets);

			setSnippets(snippetsSorted);
		}

		const newActiveSnippetIndex =
			codeEditorStates.activeSnippetIndex > foundIndex
				? codeEditorStates.activeSnippetIndex
				: codeEditorStates.activeSnippetIndex + 1;
		const activeSnippetIndex = fromButton === true ? 0 : newActiveSnippetIndex;

		const updatedCodeEditorStates = {
			...codeEditorStates,
			activeSnippetIndex,
			isSaving: false,
			touched: false,
		};

		setCodedEditorStates(updatedCodeEditorStates);

		return activeSnippetIndex;
	};

	const saveSnippetHandler = async (
		currentSnippet: CurrentSnippet,
		fromButton: boolean | "favorite" = false
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

			const activeSnippetIndex = updateSnippet(updatedSnippet, fromButton);

			await saveSnippet(updatedSnippet);

			if (activeSnippetIndex && fromButton !== "favorite" && !fromButton) {
				setCodedEditorStates({
					...codeEditorStates,
					isSaving: false,
					touched: false,
					activeSnippetIndex,
				});
			}
		} else {
			setTimeout(() => {
				setCodedEditorStates({
					...codeEditorStates,
					isSaving: false,
				});
			}, 400);
		}
	};

	const onStarredHandler = (currentSnippet: CurrentSnippet): void => {
		const currentIndex = findIndexForCurrentSnippet(currentSnippet);

		if (currentIndex === -1) {
			return;
		}

		const cloneSnippets = [...snippets];

		cloneSnippets.splice(currentIndex, 1);
		setSnippets(cloneSnippets);

		setActiveSnippetIndex(currentIndex > 0 ? currentIndex - 1 : 0);
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
			});
		}
	};

	const getSnippetsHandler = async (): Promise<void> => {
		if (codeEditorStates.menuType !== "all") {
			await getSnippets();
		}
	};

	const getFavoritesHandler = async (): Promise<void> => {
		if (codeEditorStates.menuType !== "favorites") {
			await getSnippets("favorite");

			setCodedEditorStates({
				...codeEditorStates,
				menuType: "favorites",
			});
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

		await trashRestoreSnippet(snippetId, state);
	};

	useEffect(() => {
		getSnippets().then(() => null);
		getTags().then((tagsData) => {
			if (tagsData?.length > 0) {
				setTags(tagsData);
			}
		});
	}, []);

	return (
		<>
			<Aside
				tags={tags}
				onGetAll={getSnippetsHandler}
				onGetFavorites={getFavoritesHandler}
				onGetTrash={getTrashHandler}
			/>

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
				onStarred={onStarredHandler}
				onTouched={touchedHandler}
			/>
		</>
	);
}
