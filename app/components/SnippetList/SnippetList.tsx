"use client";

import { MouseEvent, ReactElement, useState, useMemo, useEffect } from "react";

import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import MagnifyingGlass from "@/components/ui/icons/MagnifyingGlass";
import Plus from "@/components/ui/icons/Plus";

/* Utils */
import formatDateToDDMMYYYY from "../../utils/date.utils";

/* Styles */
import styles from "./snippetlist.module.css";

type SnippetListProps = {
	snippets?: Snippet[];
};

const SnippetList = ({ snippets = [] }: SnippetListProps): ReactElement => {
	const [activeSnippet, setActiveSnippet] = useState<string | null>(null);

	const formattedDates = useMemo(
		(): string[] =>
			snippets.map((snippet: Snippet) =>
				formatDateToDDMMYYYY(snippet.updated_at ?? "")
			),
		[snippets]
	);

	const snippetClickHandler = (
		event: MouseEvent<HTMLLIElement>,
		snippetId: string
	): void => {
		event.preventDefault();
		setActiveSnippet(snippetId);
	};

	useEffect(() => {
		if (snippets?.length > 0) {
			setActiveSnippet(snippets[0].snippet_id);
		}
	}, [snippets]);

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

				<Button className={styles.addButton} variant="secondary">
					<Plus width="18" height="18" />
				</Button>
			</div>

			<ul className={styles.snippetsList}>
				{snippets.map((snippet, index) => (
					<li
						className={`${styles.snippetItem} ${activeSnippet === snippet.snippet_id ? styles.active : ""}`}
						key={snippet.snippet_id}
						onClick={(event) => snippetClickHandler(event, snippet.snippet_id)}
					>
						{snippet?.name ?? ""}
						<span className={styles.snippetDate}>{formattedDates[index]}</span>
					</li>
				))}
			</ul>
		</aside>
	);
};

export default SnippetList;
