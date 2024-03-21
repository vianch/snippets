"use client";

import {
	ChangeEvent,
	MouseEvent,
	ReactElement,
	useMemo,
	useRef,
	useState,
	useEffect,
} from "react";

import Input from "@/components/ui/Input/Input";
import MagnifyingGlass from "@/components/ui/icons/MagnifyingGlass";

/* Utils */
import { setNewSnippet } from "@/lib/supabase/queries";
import formatDateToDDMMYYYY from "@/utils/date.utils";
import { useCloseOutsideCodeEditor } from "@/utils/ui.utils";

/* Lib */
import useMenuStore from "@/lib/store/menu";

/* Components */
import Trash from "@/components/ui/icons/Trash";
import Restore from "@/components/ui/icons/Restore";
import NewFile from "@/components/ui/icons/NewFile";

/* Styles */
import styles from "./snippetlist.module.css";

type DeleteRestoreFunction = (
	snippetId: UUID,
	index: number,
	state: SnippetState
) => void;

type SnippetListProps = {
	snippets?: Snippet[];
	codeEditorStates: SnippetEditorStates;
	onActiveSnippet: (index: number) => void;
	onNewSnippet: (newSnippet: Snippet) => void;
	onDeleteSnippet: DeleteRestoreFunction;
	onRestoreSnippet: DeleteRestoreFunction;
};

const SnippetList = ({
	snippets = [],
	codeEditorStates: { activeSnippetIndex, menuType },
	onNewSnippet,
	onActiveSnippet,
	onDeleteSnippet,
	onRestoreSnippet,
}: SnippetListProps): ReactElement => {
	const [searchData, setSearchData] = useState<{
		searchQuery: string;
		originalSnippets: Snippet[];
		snippetsFound: Snippet[];
	}>({
		searchQuery: "",
		originalSnippets: snippets,
		snippetsFound: snippets,
	});
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

	const snippetClickHandler = (
		event: MouseEvent<HTMLLIElement>,
		index: number
	): void => {
		event.preventDefault();
		onActiveSnippet(index);
	};

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
					? searchData.originalSnippets.filter((item) =>
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

	useCloseOutsideCodeEditor(asideRef);

	useEffect(() => {
		setSearchData({
			searchQuery: "",
			originalSnippets: snippets,
			snippetsFound: snippets,
		});
	}, [snippets]);

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

				{!isTrashActive && (
					<NewFile
						className={styles.addButton}
						width="32"
						height="32"
						onClick={newSnippetHandler}
					/>
				)}
			</div>

			{snippets?.length > 0 ? (
				<ul id="snippet-list-items" className={styles.snippetsList}>
					{searchData.snippetsFound.map((snippet: Snippet) => {
						const originalIndex = getSnippetIndex(snippet.snippet_id);

						return (
							<li
								className={`${styles.snippetItem} ${activeSnippetIndex === originalIndex ? styles.active : ""}`}
								key={snippet.snippet_id}
								onClick={(event) => snippetClickHandler(event, originalIndex)}
							>
								<div className={styles.itemLeftSide}>
									{!isTrashActive && (
										<Trash
											className={styles.trashIcon}
											width="18"
											height="18"
											onClick={() =>
												onDeleteSnippet(
													snippet?.snippet_id,
													originalIndex,
													"inactive"
												)
											}
										/>
									)}

									{snippet?.state === "inactive" && (
										<Restore
											className={styles.restoreIcon}
											width="18"
											height="18"
											onClick={() =>
												onRestoreSnippet(
													snippet?.snippet_id,
													originalIndex,
													"active"
												)
											}
										/>
									)}
									{snippet?.name ?? "Untitled"}
								</div>

								<span className={styles.snippetDate}>
									{formattedDates[originalIndex]}
								</span>
							</li>
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
