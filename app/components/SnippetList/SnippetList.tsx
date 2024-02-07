import { ReactElement } from "react";

/* Styles */
import Search from "@/components/ui/Search/Search";
import styles from "./snippetlist.module.css";

type SnippetListProps = {
	snippets?: Snippet[];
};

const SnippetList = ({ snippets = [] }: SnippetListProps): ReactElement => {
	return (
		<aside className={styles.snippetsListContainer}>
			<Search />

			<ul className={styles.snippetsList}>
				{snippets?.map((snippet: Snippet, index: number) => (
					<li
						className={styles.snippetItem}
						key={`${index + 1}-${snippet.id}-snippet`}
					>
						{snippet.name}
						<span>{snippet.createdAt}</span>
					</li>
				))}
			</ul>
		</aside>
	);
};

export default SnippetList;
