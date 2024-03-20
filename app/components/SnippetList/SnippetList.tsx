"use client";

import { MouseEvent, ReactElement, useMemo, useRef } from "react";

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
					value=""
					Icon={
						<MagnifyingGlass
							className={styles.searchIcon}
							height="18"
							width="18"
						/>
					}
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
					{snippets.map((snippet, index) => (
						<li
							className={`${styles.snippetItem} ${activeSnippetIndex === index ? styles.active : ""}`}
							key={snippet.snippet_id}
							onClick={(event) => snippetClickHandler(event, index)}
						>
							<div className={styles.itemLeftSide}>
								{!isTrashActive && (
									<Trash
										className={styles.trashIcon}
										width="18"
										height="18"
										onClick={() =>
											onDeleteSnippet(snippet?.snippet_id, index, "inactive")
										}
									/>
								)}

								{snippet?.state === "inactive" && (
									<Restore
										className={styles.restoreIcon}
										width="18"
										height="18"
										onClick={() =>
											onRestoreSnippet(snippet?.snippet_id, index, "active")
										}
									/>
								)}
								{snippet?.name ?? "Untitled"}
							</div>

							<span className={styles.snippetDate}>
								{formattedDates[index]}
							</span>
						</li>
					))}
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
