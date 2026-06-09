"use client";

import { ReactElement, useEffect, useState } from "react";

/* Components */
import Aside from "@/components/Aside/Aside";
import AccountModal from "@/components/AccountModal/AccountModal";
import CodeEditor from "@/components/CodeEditor/CodeEditor";
import CommandPalette from "@/components/CommandPalette/CommandPalette";
import ResizableLayout from "@/components/ResizableLayout/ResizableLayout";
import SnippetList from "@/components/SnippetList/SnippetList";
import useSmartGroups from "@/components/SnippetsWorkspace/hooks/useSmartGroups";

/* Lib */
import {
	getAllSnippets,
	getSnippetsByFolder,
	getSnippetsByState,
	getSnippetsByTag,
	getUncategorizedSnippets,
	saveSnippet,
	saveSnippetVersion,
	setNewSnippet,
	setSnippetState,
	trashRestoreSnippet,
} from "@/lib/supabase/queries";
import { MenuItems, SnippetState } from "@/lib/constants/core";
import { ToastType } from "@/lib/constants/toast";
import useToastStore from "@/lib/store/toast.store";
import { findSnippetByName } from "@/lib/wikiLinkResolver";

/* Utils */
import sortSnippetsByUpdatedAt from "@/utils/array.utils";
import { computeFolders, computeTags } from "@/utils/snippets.utils";
import { useDeviceViewPort } from "@/utils/ui.utils";

type SnippetsWorkspaceProps = {
	rightPane?: "preview" | "chat";
};

const SnippetsWorkspace = ({
	rightPane = "preview",
}: SnippetsWorkspaceProps): ReactElement => {
	useDeviceViewPort();

	const defaultCodeEditorStates: SnippetEditorStates = {
		activeSnippetId: null,
		isSaving: false,
		touched: false,
		menuType: "none",
	};
	const [snippets, setSnippets] = useState<Snippet[]>([]);
	const [tags, setTags] = useState<TagItem[]>([]);
	const [folders, setFolders] = useState<TagItem[]>([]);
	const { smartGroups, handleSaveSmartGroup, handleRemoveSmartGroup } =
		useSmartGroups();
	const [seedSearch, setSeedSearch] = useState<{
		query: string;
		nonce: number;
	} | null>(null);
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
				(snippetItem: Snippet) => snippetItem.state === SnippetState.Favorite
			).length
		);
		setPublicCount(
			snippetList.filter((snippetItem: Snippet) => snippetItem.is_public).length
		);
	};

	const getSnippets = async (
		state: SnippetState = SnippetState.Active
	): Promise<void> => {
		const isActive = state === SnippetState.Active;
		const data = isActive
			? await getAllSnippets()
			: await getSnippetsByState(state);

		setSnippets(data);

		if (isActive) {
			setTags(computeTags(data));
			setFolders(computeFolders(data));
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
		fromButton: boolean | SnippetState.Favorite = false
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

		if (fromButton !== SnippetState.Favorite) {
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
		updatedSnippet: Snippet | null = null,
		previousTags: Tags = null,
		previousFolder: string | null = null
	) => {
		if (
			updatedSnippet &&
			updatedSnippet.tags === previousTags &&
			(updatedSnippet.folder ?? null) === previousFolder
		) {
			return;
		}

		const allSnippets = await getAllSnippets();
		const updatedSnippetList = updatedSnippet
			? allSnippets.map((snippet) =>
					snippet.snippet_id === updatedSnippet.snippet_id
						? updatedSnippet
						: snippet
				)
			: allSnippets;

		setTags(computeTags(updatedSnippetList));
		setFolders(computeFolders(updatedSnippetList));
		updateMenuCounts(updatedSnippetList);
	};

	const saveSnippetHandler = async (
		currentSnippet: CurrentSnippet,
		fromButton: boolean | SnippetState.Favorite = false
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

			const previousTags = activeSnippet.tags ?? null;
			const previousFolder = activeSnippet.folder ?? null;
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

			updateSnippetTagList(updatedSnippet, previousTags, previousFolder).then(
				() => null
			);

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

	const toggleFavoriteFromListHandler = async (
		snippet: Snippet
	): Promise<void> => {
		const toggledState =
			snippet.state === SnippetState.Favorite
				? SnippetState.Active
				: SnippetState.Favorite;
		const isFavoriteMenu = codeEditorStates.menuType === MenuItems.Favorites;
		const shouldRemoveFromList =
			isFavoriteMenu && toggledState !== SnippetState.Favorite;

		if (shouldRemoveFromList) {
			const removedIndex = findSnippetIndexById(snippet.snippet_id);

			if (removedIndex === -1) {
				return;
			}

			const remaining = snippets.filter(
				(item: Snippet): boolean => item.snippet_id !== snippet.snippet_id
			);

			setSnippets(remaining);
			setActiveSnippetId(pickNextActiveId(removedIndex, remaining));
		} else {
			setSnippets(
				snippets.map(
					(item: Snippet): Snippet =>
						item.snippet_id === snippet.snippet_id
							? { ...item, state: toggledState }
							: item
				)
			);
		}

		setFavoritesCount(
			toggledState === SnippetState.Favorite
				? favoritesCount + 1
				: favoritesCount - 1
		);

		await setSnippetState(snippet.snippet_id, toggledState);
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
			await getSnippets(SnippetState.Inactive);

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
			await getSnippets(SnippetState.Favorite);

			setCodedEditorStates((prev) => ({
				...prev,
				menuType: MenuItems.Favorites,
			}));
		}
	};

	const getSnippetsByFolderHandler = async (folder: string): Promise<void> => {
		if (folder.length === 0) {
			return;
		}

		const data = await getSnippetsByFolder(folder);

		setCodedEditorStates({
			...defaultCodeEditorStates,
			menuType: folder,
			activeSnippetId: data?.[0]?.snippet_id ?? null,
		});

		setSnippets(data);
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
		state: SnippetState = SnippetState.Inactive
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

	const handleSmartGroupClick = async (group: SmartGroup): Promise<void> => {
		await getSnippets();

		setCodedEditorStates((prev) => ({
			...prev,
			menuType: `smart:${group.name}`,
		}));
		setSeedSearch({ query: group.query, nonce: Date.now() });
	};

	const handleAccountModalClose = (): void => {
		setIsAccountModalOpen(false);
	};

	const handleWikiNavigate = async (target: string): Promise<void> => {
		const trimmed = target.trim();

		if (!trimmed) return;

		const inCurrentView = findSnippetByName(snippets, trimmed);

		if (inCurrentView) {
			setActiveSnippetId(inCurrentView.snippet_id);

			return;
		}

		const allActive = await getAllSnippets();
		const found = findSnippetByName(allActive, trimmed);

		if (!found) {
			addToast({
				type: ToastType.Warning,
				message: `No snippet found matching "${trimmed}"`,
			});

			return;
		}

		setSnippets(allActive);
		setCodedEditorStates({
			...defaultCodeEditorStates,
			menuType: MenuItems.All,
			activeSnippetId: found.snippet_id,
		});
	};

	const createSnippetFromPalette = async (): Promise<void> => {
		const newSnippet = await setNewSnippet();

		if (newSnippet) {
			newSnippetHandler(newSnippet);
		}
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
				hideSnippetList={rightPane === "chat"}
				aside={
					<Aside
						isLoading={isLoading}
						codeEditorStates={codeEditorStates}
						tags={tags}
						folders={folders}
						smartGroups={smartGroups}
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
						onFolderClick={getSnippetsByFolderHandler}
						onSmartGroupClick={handleSmartGroupClick}
						onSmartGroupRemove={handleRemoveSmartGroup}
						onAccountClick={handleAccountClick}
					/>
				}
				snippetList={
					<SnippetList
						isLoading={isLoading}
						snippets={snippets}
						codeEditorStates={codeEditorStates}
						seedSearch={seedSearch}
						canSaveSmartGroup
						onNewSnippet={newSnippetHandler}
						onActiveSnippet={setActiveSnippetId}
						onDeleteSnippet={trashRestoreSnippetHandler}
						onRestoreSnippet={trashRestoreSnippetHandler}
						onToggleFavorite={toggleFavoriteFromListHandler}
						onEmptyTrash={emptyTrashHandler}
						onSaveSmartGroup={handleSaveSmartGroup}
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
						allSnippets={snippets}
						rightPane={rightPane}
						onSave={saveSnippetHandler}
						onStarred={onStarredHandler}
						onPublicToggle={onPublicToggleHandler}
						onTouched={touchedHandler}
						onWikiNavigate={handleWikiNavigate}
						onActiveSnippet={setActiveSnippetId}
						onNewSnippet={createSnippetFromPalette}
					/>
				}
			/>
			<AccountModal
				isOpen={isAccountModalOpen}
				onClose={handleAccountModalClose}
			/>
			<CommandPalette
				snippets={snippets}
				tags={tags}
				onActiveSnippet={setActiveSnippetId}
				onNewSnippet={createSnippetFromPalette}
				onGetAll={getSnippetsHandler}
				onGetUncategorized={getUncategorizedHandler}
				onGetPublic={getPublicHandler}
				onGetFavorites={getFavoritesHandler}
				onGetTrash={getTrashHandler}
				onTagClick={getSnippetsByTagHandler}
				onAccountClick={handleAccountClick}
			/>
		</>
	);
};

export default SnippetsWorkspace;
