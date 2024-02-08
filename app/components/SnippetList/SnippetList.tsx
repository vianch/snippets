"use client";

import { MouseEvent, ReactElement, useState, useMemo } from "react";

import Search from "@/components/ui/Search/Search";
import Button from "@/components/ui/Button/Button";

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
				formatDateToDDMMYYYY(snippet.createdAt)
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

	return (
		<aside className={styles.snippetsListContainer}>
			<Search />

			<Button className={styles.button} variant="primary">
				New snippet
			</Button>

			<ul className={styles.snippetsList}>
				{snippets.map((snippet, index) => (
					<li
						className={`${styles.snippetItem} ${activeSnippet === snippet.id ? styles.active : ""}`}
						key={snippet.id}
						onClick={(event) => snippetClickHandler(event, snippet.id)}
					>
						{snippet.name}
						<span className={styles.snippetDate}>{formattedDates[index]}</span>
					</li>
				))}
			</ul>
		</aside>
	);
};

export default SnippetList;
