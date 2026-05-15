"use client";

import { ReactElement, useEffect, useState } from "react";

/* Components */
import Aside from "@/components/Aside/Aside";
import SnippetList from "@/components/SnippetList/SnippetList";
import CodeEditor from "@/components/CodeEditor/CodeEditor";
import ResizableLayout from "@/components/ResizableLayout/ResizableLayout";
import AccountModal from "@/components/AccountModal/AccountModal";

/* Lib and Utils */
import {
	getAllSnippets,
	getSnippetsByState,
	getSnippetsByTag,
	getUncategorizedSnippets,
	saveSnippet,
	saveSnippetVersion,
	trashRestoreSnippet,
} from "@/lib/supabase/queries";
import sortSnippetsByUpdatedAt from "@/utils/array.utils";
import { useDeviceViewPort } from "@/utils/ui.utils";
import { MenuItems } from "@/lib/constants/core";
import useToastStore from "@/lib/store/toast.store";
import { ToastType } from "@/lib/constants/toast";

export default function Page(): ReactElement {
	// Allow isMobile to be used across all Snippets page components
	useDeviceViewPort();

	const defaultCodeEditorStates: SnippetEditorStates = {
		activeSnippetId: null,
		isSaving: false,
		touched: false,
		menuType: "none",
	};
	const [snippets, setSnippets] = useState<Snippet[]>([]);
	const [tags, setTags] = useState<TagItem[]>([]);
	const [codeEditorStates, setCodedEditorStates] =
		useState<SnippetEditorStates>(defaultCodeEditorStates);
	const [publicCount, setPublicCount] = useState<number>(0);
	const [allCount, setAllCount] = useState<number>(0);
	const [uncategorizedCount, setUncategorizedCount] = useState<number>(0);
	const [favoritesCount, setFavoritesCount] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
	const { addToast } = useToastStore();

	const findIndexForCurrentSnippet = (currentSnippet: CurrentSnippet): number =>
		snippets.findIndex(
			(snippet: Snippet): boolean =>
				snippet.snippet_id === currentSnippet.snippet_id
		);

	const setActiveSnippetId = (snippetId: UUID | null): void => {
		setCodedEditorStates({
			...codeEditorStates,
			activeSnippetId: snippetId,
			isSaving: codeEditorStates.touched,
		});
	};

	const findSnippetIndexById = (snippetId: UUID | null): number =>
		snippetId
			? snippets.findIndex(
					(snippet: Snippet): boolean => snippet.snippet_id === snippetId
				)
			: -1;

	const pickNextActiveId = (
		removedIndex: number,
		remainingSnippets: Snippet[]
	): UUID | null => {
		if (remainingSnippets.length === 0) {
			return null;
		}

		const nextIndex = Math.min(removedIndex, remainingSnippets.length - 1);

		return remainingSnippets[nextIndex].snippet_id;
	};

	const touchedHandler = (touched: boolean): void => {
		setCodedEditorStates({
			...codeEditorStates,
			touched,
		});
	};

	const getTags = (snippetsLoaded: Snippet[]): void => {
		const tagCounts = {} as { [key: string]: number };

		if (!snippetsLoaded) return;

		snippetsLoaded?.forEach((snippet: Snippet) => {
			const snippetTags =
				snippet?.tags && snippet.tags?.length > 0
					? snippet.tags.split(",")
					: [];

			snippetTags.forEach((snippetTag: string) => {
				const tagName = snippetTag.trim();

				if (tagName in tagCounts) {
					tagCounts[tagName] += 1;
				} else {
					tagCounts[tagName] = 1;
				}
			});
		});

		const newTags = Object.keys(tagCounts)
			.sort()
			.map((tag) => ({
				name: tag,
				total: tagCounts[tag],
			}));

		setTags(newTags);
	};

	const updateMenuCounts = (snippetList: Snippet[]): void => {
		setAllCount(snippetList.length);
		setUncategorizedCount(
			snippetList.filter(
				(snippetItem: Snippet) =>
					!snippetItem.tags || snippetItem.tags.length === 0
			).length
		);
		setFavoritesCount(
			snippetList.filter(
				(snippetItem: Snippet) => snippetItem.state === "favorite"
			).length
		);
		setPublicCount(
			snippetList.filter((snippetItem: Snippet) => snippetItem.is_public).length
		);
	};

	const getSnippets = async (state: SnippetState = "active"): Promise<void> => {
		const isActive = state === "active";
		const data = isActive
			? await getAllSnippets()
			: await getSnippetsByState(state);

		setSnippets(data);

		if (isActive) {
			getTags(data);
			updateMenuCounts(data);
		}

		setCodedEditorStates({
			...defaultCodeEditorStates,
			activeSnippetId: data?.[0]?.snippet_id ?? null,
		});
		setIsLoading(false);
	};

	const updateSnippet = (
		currentSnippet: CurrentSnippet | null = null,
		fromButton: boolean | "favorite" = false
	): void => {
		if (!currentSnippet) {
			return;
		}

		const exists = snippets.some(
			(snippet: Snippet): boolean =>
				snippet.snippet_id === currentSnippet.snippet_id
		);

		if (!exists) {
			return;
		}

		if (fromButton !== "favorite") {
			const updatedSnippets = snippets.map((snippet) =>
				snippet.snippet_id === currentSnippet.snippet_id
					? { ...snippet, ...currentSnippet }
					: snippet
			);

			const snippetsSorted = sortSnippetsByUpdatedAt(updatedSnippets);

			setSnippets(snippetsSorted);
		}

		setCodedEditorStates({
			...codeEditorStates,
			isSaving: false,
			touched: false,
		});
	};

	const updateSnippetTagList = async (
		updatedSnippet: Snippet | null = null
	) => {
		const allSnippets = await getAllSnippets();
		const updatedSnippetList = updatedSnippet
			? allSnippets.map((snippet) =>
					snippet.snippet_id === updatedSnippet.snippet_id
						? updatedSnippet
						: snippet
				)
			: allSnippets;

		getTags(updatedSnippetList);
		updateMenuCounts(updatedSnippetList);
	};

	const saveSnippetHandler = async (
		currentSnippet: CurrentSnippet,
		fromButton: boolean | "favorite" = false
	): Promise<void> => {
		const activeSnippet = snippets.find(
			(snippet: Snippet): boolean =>
				snippet.snippet_id === codeEditorStates.activeSnippetId
		);

		if (
			activeSnippet?.snippet_id &&
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

			updateSnippet(updatedSnippet, fromButton);

			await saveSnippet(updatedSnippet);

			if (fromButton === true) {
				saveSnippetVersion(
					updatedSnippet.snippet_id,
					updatedSnippet as CurrentSnippet
				).catch(() => null);
			}

			updateSnippetTagList(updatedSnippet).then(() => null);

			if (fromButton && codeEditorStates.touched) {
				addToast({
					type: ToastType.Success,
					message: "Snippet saved successfully",
				});
			}
		} else {
			if (codeEditorStates.touched) {
				addToast({
					type: ToastType.Warning,
					message: "Cannot save snippet without a name or content",
				});
			}

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

		setActiveSnippetId(pickNextActiveId(currentIndex, cloneSnippets));
	};

	const onPublicToggleHandler = (currentSnippet: CurrentSnippet): void => {
		const newCount = currentSnippet.is_public
			? publicCount + 1
			: publicCount - 1;

		setPublicCount(newCount);

		if (
			!currentSnippet.is_public &&
			codeEditorStates.menuType === MenuItems.Public
		) {
			if (newCount <= 0) {
				getSnippets();

				return;
			}

			const currentIndex = findIndexForCurrentSnippet(currentSnippet);

			if (currentIndex === -1) {
				return;
			}

			const cloneSnippets = [...snippets];

			cloneSnippets.splice(currentIndex, 1);
			setSnippets(cloneSnippets);

			setActiveSnippetId(pickNextActiveId(currentIndex, cloneSnippets));
		}
	};

	const newSnippetHandler = (newSnippet: Snippet): void => {
		if (newSnippet) {
			setSnippets([newSnippet, ...snippets]);

			setActiveSnippetId(newSnippet.snippet_id);
		}
	};

	const getTrashHandler = async (): Promise<void> => {
		if (codeEditorStates.menuType !== MenuItems.Trash) {
			await getSnippets("inactive");

			setCodedEditorStates((prev) => ({
				...prev,
				menuType: MenuItems.Trash,
			}));
		}
	};

	const getSnippetsHandler = async (): Promise<void> => {
		if (codeEditorStates.menuType !== MenuItems.All) {
			await getSnippets();

			setCodedEditorStates((prev) => ({
				...prev,
				menuType: MenuItems.All,
			}));
		}
	};

	const getUncategorizedHandler = async (): Promise<void> => {
		if (codeEditorStates.menuType !== MenuItems.Uncategorized) {
			const data = await getUncategorizedSnippets();

			setSnippets(data);

			setCodedEditorStates({
				...defaultCodeEditorStates,
				menuType: MenuItems.Uncategorized,
				activeSnippetId: data?.[0]?.snippet_id ?? null,
			});
		}
	};

	const getPublicHandler = async (): Promise<void> => {
		if (codeEditorStates.menuType !== MenuItems.Public) {
			const allSnippets = await getAllSnippets();
			const publicSnippets = allSnippets.filter(
				(snippet: Snippet) => snippet.is_public
			);

			setSnippets(publicSnippets);

			setCodedEditorStates({
				...defaultCodeEditorStates,
				menuType: MenuItems.Public,
				activeSnippetId: publicSnippets?.[0]?.snippet_id ?? null,
			});
		}
	};

	const getFavoritesHandler = async (): Promise<void> => {
		if (codeEditorStates.menuType !== MenuItems.Favorites) {
			await getSnippets("favorite");

			setCodedEditorStates((prev) => ({
				...prev,
				menuType: MenuItems.Favorites,
			}));
		}
	};

	const getSnippetsByTagHandler = async (tag: string): Promise<void> => {
		if (tag.length === 0) {
			return;
		}

		const data = await getSnippetsByTag(tag);

		setCodedEditorStates({
			...defaultCodeEditorStates,
			menuType: tag,
			activeSnippetId: data?.[0]?.snippet_id ?? null,
		});

		setSnippets(data);
	};

	const trashRestoreSnippetHandler = async (
		snippetId: UUID,
		state: SnippetState = "inactive"
	): Promise<void> => {
		if (!snippetId) return;

		const foundIndex = findSnippetIndexById(snippetId);

		if (foundIndex === -1) return;

		const cloneSnippets = [...snippets];

		cloneSnippets.splice(foundIndex, 1);
		setSnippets(cloneSnippets);

		setCodedEditorStates((prevStates) => ({
			...prevStates,
			isSaving: true,
			touched: true,
			activeSnippetId: pickNextActiveId(foundIndex, cloneSnippets),
		}));

		await trashRestoreSnippet(snippetId, state);

		if (cloneSnippets.length > 0) {
			await updateSnippetTagList();
		} else {
			await getSnippets();
		}

		setCodedEditorStates((prevStates) => ({
			...prevStates,
			isSaving: false,
			touched: false,
		}));
	};

	const emptyTrashHandler = (): void => {
		setSnippets([]);
		setActiveSnippetId(null);
	};

	const handleAccountClick = (): void => {
		setIsAccountModalOpen(true);
	};

	const handleAccountModalClose = (): void => {
		setIsAccountModalOpen(false);
	};

	useEffect(() => {
		getSnippets().then(() => null);
	}, []);

	useEffect(() => {
		if (codeEditorStates.touched) {
			window.onbeforeunload = () => "You have unsaved changes.";
		} else {
			window.onbeforeunload = null;
		}

		return () => {
			window.onbeforeunload = null;
		};
	}, [codeEditorStates.touched]);

	return (
		<>
			<ResizableLayout
				aside={
					<Aside
						isLoading={isLoading}
						codeEditorStates={codeEditorStates}
						tags={tags}
						publicCount={publicCount}
						allCount={allCount}
						uncategorizedCount={uncategorizedCount}
						favoritesCount={favoritesCount}
						onGetAll={getSnippetsHandler}
						onGetUncategorized={getUncategorizedHandler}
						onGetPublic={getPublicHandler}
						onGetFavorites={getFavoritesHandler}
						onGetTrash={getTrashHandler}
						onTagClick={getSnippetsByTagHandler}
						onAccountClick={handleAccountClick}
					/>
				}
				snippetList={
					<SnippetList
						isLoading={isLoading}
						snippets={snippets}
						codeEditorStates={codeEditorStates}
						onNewSnippet={newSnippetHandler}
						onActiveSnippet={setActiveSnippetId}
						onDeleteSnippet={trashRestoreSnippetHandler}
						onRestoreSnippet={trashRestoreSnippetHandler}
						onEmptyTrash={emptyTrashHandler}
					/>
				}
				codeEditor={
					<CodeEditor
						isLoading={isLoading}
						snippet={
							snippets?.length > 0
								? (snippets.find(
										(snippet: Snippet): boolean =>
											snippet.snippet_id === codeEditorStates.activeSnippetId
									) ?? snippets[0])
								: null
						}
						codeEditorStates={codeEditorStates}
						onSave={saveSnippetHandler}
						onStarred={onStarredHandler}
						onPublicToggle={onPublicToggleHandler}
						onTouched={touchedHandler}
					/>
				}
			/>
			<AccountModal
				isOpen={isAccountModalOpen}
				onClose={handleAccountModalClose}
			/>
		</>
	);
}
