"use client";

import {
	ChangeEvent,
	ReactElement,
	useMemo,
	useRef,
	useState,
	useEffect,
} from "react";

import Input from "@/components/ui/Input/Input";
import MagnifyingGlass from "@/components/ui/icons/MagnifyingGlass";

/* Utils */
import { emptyTrash, setNewSnippet } from "@/lib/supabase/queries";
import formatDateToDDMMYYYY from "@/utils/date.utils";
import { pinFavoritesFirst } from "@/utils/array.utils";
import { useCloseOutsideCodeEditor } from "@/utils/ui.utils";

/* Lib */
import useMenuStore from "@/lib/store/menu.store";

/* Components */
import Trash from "@/components/ui/icons/Trash";
import NewFile from "@/components/ui/icons/NewFile";
import Alert from "@/components/ui/Alert/Alert";
import Check from "@/components/ui/icons/Check";
import CloseSquare from "@/components/ui/icons/CloseSquare";
import Floppy from "@/components/ui/icons/Floppy";
import Loading from "@/components/ui/icons/Loading";
import SkeletonSnippetItem from "@/components/ui/Skeleton/SkeletonSnippetItem";
import SnippetItem from "@/components/SnippetItem/SnippetItem";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

/* Styles */
import styles from "./snippetlist.module.css";

type SeedSearch = { query: string; nonce: number };

interface SnippetListProps extends SnippetItemProps {
	isLoading: boolean;
	snippets?: Snippet[];
	seedSearch?: SeedSearch | null;
	canSaveSmartGroup?: boolean;
	onNewSnippet: (newSnippet: Snippet) => void;
	onEmptyTrash: () => void;
	onSaveSmartGroup?: (name: string, query: string) => Promise<void> | void;
}

const maxSmartGroupNameLength = 40;

const SnippetList = ({
	isLoading,
	snippets = [],
	codeEditorStates,
	seedSearch,
	canSaveSmartGroup,
	onNewSnippet,
	onActiveSnippet,
	onDeleteSnippet,
	onRestoreSnippet,
	onToggleFavorite,
	onEmptyTrash,
	onSaveSmartGroup,
}: SnippetListProps): ReactElement => {
	const { menuType } = codeEditorStates ?? {};
	const [searchData, setSearchData] = useState<SearchData>({
		searchQuery: "",
		originalSnippets: snippets,
		snippetsFound: snippets,
	});
	const [deleteAll, setDeleteAll] = useState<boolean>(false);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);
	const [smartGroupFormOpen, setSmartGroupFormOpen] = useState<boolean>(false);
	const [smartGroupName, setSmartGroupName] = useState<string>("");
	const [isSavingSmartGroup, setIsSavingSmartGroup] = useState<boolean>(false);
	const asideRef = useRef<HTMLDivElement | null>(null);
	const mobileListOpen = useMenuStore((state) => state.snippetListOpen);
	const isTrashActive = menuType === "trash";
	const formattedDates = useMemo(
		(): Map<UUID, string> =>
			new Map(
				snippets?.map((snippet: Snippet) => [
					snippet.snippet_id,
					formatDateToDDMMYYYY(snippet.updated_at ?? ""),
				]) ?? []
			),
		[snippets]
	);

	const orderedSnippets = useMemo(
		(): Snippet[] =>
			isTrashActive
				? searchData.snippetsFound
				: pinFavoritesFirst(searchData.snippetsFound),
		[searchData.snippetsFound, isTrashActive]
	);

	const newSnippetHandler = async (): Promise<void> => {
		const newSnippet = await setNewSnippet();

		if (newSnippet) {
			onNewSnippet(newSnippet);
		}
	};

	const handleSearchInputChange = (
		event: ChangeEvent<HTMLInputElement>
	): void => {
		const query = event.target.value;

		setSearchData({
			...searchData,
			searchQuery: query,
			snippetsFound:
				query?.length > 0
					? searchData.originalSnippets.filter((item: Snippet) => {
							const lowerQuery = query.toLowerCase();

							return (
								item.name.toLowerCase().includes(lowerQuery) ||
								item.snippet.toLowerCase().includes(lowerQuery) ||
								(item.tags ?? "").toLowerCase().includes(lowerQuery)
							);
						})
					: searchData.originalSnippets,
		});
	};

	const handleDeleteAll = async (): Promise<void> => {
		if (deleteAll) {
			setIsDeleting(true);
			await emptyTrash();
			setDeleteAll(false);
			setIsDeleting(false);
			onEmptyTrash();
		}
	};

	useEffect(() => {
		setSearchData({
			searchQuery: "",
			originalSnippets: snippets,
			snippetsFound: snippets,
		});
	}, [snippets]);

	useEffect(() => {
		if (!seedSearch || !seedSearch.query) return;

		const lowerQuery = seedSearch.query.toLowerCase();

		setSearchData((prev) => ({
			searchQuery: seedSearch.query,
			originalSnippets: prev.originalSnippets,
			snippetsFound: prev.originalSnippets.filter((item: Snippet) => {
				return (
					item.name.toLowerCase().includes(lowerQuery) ||
					item.snippet.toLowerCase().includes(lowerQuery) ||
					(item.tags ?? "").toLowerCase().includes(lowerQuery)
				);
			}),
		}));
	}, [seedSearch?.nonce, seedSearch?.query]);

	const handleStartSaveSmartGroup = (): void => {
		setSmartGroupName(searchData.searchQuery.slice(0, maxSmartGroupNameLength));
		setSmartGroupFormOpen(true);
	};

	const handleCancelSaveSmartGroup = (): void => {
		setSmartGroupName("");
		setSmartGroupFormOpen(false);
	};

	const handleSubmitSaveSmartGroup = async (): Promise<void> => {
		const trimmedName = smartGroupName.trim();
		const trimmedQuery = searchData.searchQuery.trim();

		if (!trimmedName || !trimmedQuery || !onSaveSmartGroup) return;

		setIsSavingSmartGroup(true);

		try {
			await onSaveSmartGroup(trimmedName, trimmedQuery);
			setSmartGroupName("");
			setSmartGroupFormOpen(false);
		} finally {
			setIsSavingSmartGroup(false);
		}
	};

	useEffect(() => {
		if (!isTrashActive && deleteAll) {
			setDeleteAll(false);
		}

		return () => {
			setDeleteAll(false);
		};
	}, [isTrashActive]);

	useCloseOutsideCodeEditor(asideRef);

	return (
		<aside
			id="snippet-list-aside"
			ref={asideRef}
			className={`${styles.snippetsListContainer} ${mobileListOpen ? styles.mobileListOpen : styles.mobileListClosed}`}
		>
			<div id="snippet-list-header" className={styles.fields}>
				<Input
					placeholder="Search..."
					value={searchData.searchQuery}
					Icon={
						<MagnifyingGlass
							className={styles.searchIcon}
							height="18"
							width="18"
						/>
					}
					onChange={handleSearchInputChange}
				/>

				{canSaveSmartGroup &&
					searchData.searchQuery.length > 0 &&
					!isTrashActive && (
						<button
							type="button"
							className={styles.saveSearchButton}
							title="Save as smart group"
							onClick={handleStartSaveSmartGroup}
						>
							<Floppy width={20} height={20} />
						</button>
					)}

				{isTrashActive ? (
					<Trash
						className={styles.addButton}
						width={28}
						height={28}
						onClick={() => setDeleteAll(true)}
					/>
				) : (
					<NewFile
						className={styles.addButton}
						width="32"
						height="32"
						onClick={newSnippetHandler}
					/>
				)}
			</div>

			{smartGroupFormOpen && (
				<div className={styles.smartGroupForm}>
					<input
						type="text"
						className={styles.smartGroupInput}
						placeholder="Smart group name"
						value={smartGroupName}
						maxLength={maxSmartGroupNameLength}
						autoFocus
						onChange={(event) => setSmartGroupName(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								void handleSubmitSaveSmartGroup();
							} else if (event.key === "Escape") {
								handleCancelSaveSmartGroup();
							}
						}}
					/>
					<button
						type="button"
						className={styles.smartGroupSaveButton}
						disabled={isSavingSmartGroup || smartGroupName.trim().length === 0}
						onClick={handleSubmitSaveSmartGroup}
					>
						Save
					</button>
					<button
						type="button"
						className={styles.smartGroupCancelButton}
						onClick={handleCancelSaveSmartGroup}
					>
						Cancel
					</button>
				</div>
			)}

			{isLoading ? (
				<ul className={styles.snippetsList}>
					{Array.from({ length: 6 }).map((_, index) => (
						<SkeletonSnippetItem key={index} />
					))}
				</ul>
			) : searchData?.snippetsFound?.length > 0 ? (
				<ul id="snippet-list-items" className={styles.snippetsList}>
					<li
						className={`${styles.deleteAlert} ${deleteAll ? styles.alertShow : styles.alertHide}`}
					>
						<Alert severity="warning" iconSize={0}>
							<div className={styles.alertInfo}>
								Deleting all items permanently?
								<span className={styles.alertIcons}>
									{isDeleting ? (
										<Loading width={16} height={16} />
									) : (
										<>
											<Check
												className={styles.alertCheckIcon}
												width={16}
												height={16}
												onClick={handleDeleteAll}
											/>
											<CloseSquare
												className={styles.alertCrossIcon}
												width={16}
												height={16}
												onClick={() => setDeleteAll(false)}
											/>
										</>
									)}
								</span>
							</div>
						</Alert>
					</li>

					{orderedSnippets.map((snippet: Snippet) => (
						<SnippetItem
							key={snippet.snippet_id}
							snippet={snippet}
							dateFormatted={formattedDates.get(snippet.snippet_id) ?? ""}
							isTrashActive={isTrashActive}
							codeEditorStates={codeEditorStates}
							onActiveSnippet={onActiveSnippet}
							onDeleteSnippet={onDeleteSnippet}
							onRestoreSnippet={onRestoreSnippet}
							onToggleFavorite={onToggleFavorite}
						/>
					))}
				</ul>
			) : (
				<div className={styles.noSnippetContainer}>
					{searchData.searchQuery ? (
						<EmptyState
							title="No matches found"
							description="Try a different search term"
							illustration="search"
							actionLabel="Clear search"
							onAction={() =>
								setSearchData({
									searchQuery: "",
									originalSnippets: snippets,
									snippetsFound: snippets,
								})
							}
						/>
					) : isTrashActive ? (
						<EmptyState
							title="Trash is empty"
							description="Deleted snippets will appear here"
							illustration="trash"
						/>
					) : (
						<EmptyState
							title="No snippets yet"
							description="Create your first snippet to get started"
							illustration="code"
							actionLabel="Create snippet"
							onAction={newSnippetHandler}
						/>
					)}
				</div>
			)}
		</aside>
	);
};

export default SnippetList;
