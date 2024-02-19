"use client";

import { MouseEvent, ReactElement, useMemo } from "react";

import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import MagnifyingGlass from "@/components/ui/icons/MagnifyingGlass";
import Plus from "@/components/ui/icons/Plus";

/* Utils */
import { setNewSnippet } from "@/lib/supabase/queries";
import formatDateToDDMMYYYY from "@/utils/date.utils";

/* Styles */
import Trash from "@/components/ui/icons/Trash";
import styles from "./snippetlist.module.css";

type SnippetListProps = {
	snippets?: Snippet[];
	activeSnippetIndex: number;
	onActiveSnippet: (index: number) => void;
	onNewSnippet: (newSnippet: Snippet) => void;
};

const SnippetList = ({
	snippets = [],
	activeSnippetIndex,
	onNewSnippet,
	onActiveSnippet,
}: SnippetListProps): ReactElement => {
	const formattedDates = useMemo(
		(): string[] =>
			snippets.map((snippet: Snippet) =>
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

	return (
		<aside className={styles.snippetsListContainer}>
			<div className={styles.fields}>
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

				<Button
					className={styles.addButton}
					variant="secondary"
					onClick={newSnippetHandler}
				>
					<Plus width="18" height="18" />
				</Button>
			</div>

			<ul className={styles.snippetsList}>
				{snippets.map((snippet, index) => (
					<li
						className={`${styles.snippetItem} ${activeSnippetIndex === index ? styles.active : ""}`}
						key={snippet.snippet_id}
						onClick={(event) => snippetClickHandler(event, index)}
					>
						<div className={styles.itemLeftSide}>
							<Trash className={styles.trashIcon} width="18" height="18" />
							{snippet?.name ?? ""}
						</div>

						<span className={styles.snippetDate}>{formattedDates[index]}</span>
					</li>
				))}
			</ul>
		</aside>
	);
};

export default SnippetList;
