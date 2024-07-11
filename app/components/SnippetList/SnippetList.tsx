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
import { useCloseOutsideCodeEditor } from "@/utils/ui.utils";

/* Lib */
import useMenuStore from "@/lib/store/menu";

/* Components */
import Trash from "@/components/ui/icons/Trash";
import NewFile from "@/components/ui/icons/NewFile";
import Alert from "@/components/ui/Alert/Alert";
import Check from "@/components/ui/icons/Check";
import CloseSquare from "@/components/ui/icons/CloseSquare";
import Loading from "@/components/ui/icons/Loading";
import SnippetItem from "@/components/SnippetItem/SnippetItem";

/* Styles */
import styles from "./snippetlist.module.css";

interface SnippetListProps extends SnippetItemProps {
	snippets?: Snippet[];
	onNewSnippet: (newSnippet: Snippet) => void;
	onEmptyTrash: () => void;
}

const SnippetList = ({
	snippets = [],
	codeEditorStates,
	onNewSnippet,
	onActiveSnippet,
	onDeleteSnippet,
	onRestoreSnippet,
	onEmptyTrash,
}: SnippetListProps): ReactElement => {
	const { menuType } = codeEditorStates ?? {};
	const [searchData, setSearchData] = useState<SearchData>({
		searchQuery: "",
		originalSnippets: snippets,
		snippetsFound: snippets,
	});
	const [deleteAll, setDeleteAll] = useState<boolean>(false);
	const [isDeleting, setIsDeleting] = useState<boolean>(false);
	const asideRef = useRef<HTMLDivElement | null>(null);
	const mobileListOpen = useMenuStore((state) => state.snippetListOpen);
	const isTrashActive = menuType === "trash";
	const formattedDates = useMemo(
		(): string[] =>
			snippets?.map((snippet: Snippet) =>
				formatDateToDDMMYYYY(snippet.updated_at ?? "")
			),
		[snippets]
	);

	const newSnippetHandler = async (): Promise<void> => {
		const newSnippet = await setNewSnippet();

		if (newSnippet) {
			onNewSnippet(newSnippet);
		}
	};

	const handleSearchInputChange = async (
		event: ChangeEvent<HTMLInputElement>
	): Promise<void> => {
		setSearchData({
			...searchData,
			searchQuery: event.target.value,
			snippetsFound:
				event.target.value?.length > 0
					? searchData.originalSnippets.filter((item: Snippet) =>
							item.name
								.toLowerCase()
								.includes(searchData.searchQuery.toLowerCase())
						)
					: searchData.originalSnippets,
		});
	};

	const getSnippetIndex = (snippetId: UUID): number =>
		searchData?.originalSnippets.findIndex(
			(snippet: Snippet): boolean => snippet.snippet_id === snippetId
		);

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

			{searchData?.snippetsFound?.length > 0 ? (
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

					{searchData.snippetsFound.map((snippet: Snippet) => {
						const originalIndex = getSnippetIndex(snippet.snippet_id);

						return (
							<SnippetItem
								key={snippet.snippet_id}
								snippet={snippet}
								dateFormatted={formattedDates[originalIndex]}
								isTrashActive={isTrashActive}
								originalIndex={originalIndex}
								codeEditorStates={codeEditorStates}
								onActiveSnippet={onActiveSnippet}
								onDeleteSnippet={onDeleteSnippet}
								onRestoreSnippet={onRestoreSnippet}
							/>
						);
					})}
				</ul>
			) : (
				<div className={styles.noSnippetContainer}>
					<p className={styles.noSnippet}>No Snippets found</p>
				</div>
			)}
		</aside>
	);
};

export default SnippetList;
