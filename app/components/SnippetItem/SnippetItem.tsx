import { FC, ReactElement, MouseEvent } from "react";

/* Components */
import Trash from "@/components/ui/icons/Trash";
import Restore from "@/components/ui/icons/Restore";
import LanguageBadge from "@/components/ui/LanguageBadge/LanguageBadge";

/* Stores */
import useMenuStore from "@/lib/store/menu.store";
import useViewPortStore from "@/lib/store/viewPort.store";

import styles from "@/components/SnippetList/snippetlist.module.css";

interface SnippetItemPropsComponent extends SnippetItemProps {
	dateFormatted: string;
	snippet: Snippet | null | undefined;
	isTrashActive: boolean;
}

const SnippetItem: FC<SnippetItemPropsComponent> = ({
	snippet,
	dateFormatted,
	codeEditorStates: { activeSnippetId, touched },
	isTrashActive,
	onActiveSnippet,
	onDeleteSnippet,
	onRestoreSnippet,
}: SnippetItemPropsComponent): ReactElement => {
	const isMobile = useViewPortStore((state) => state.isMobile);
	const closeSnippetList = useMenuStore((state) => state.closeSnippetList);

	if (snippet) {
		const snippetClickHandler = (event: MouseEvent<HTMLLIElement>): void => {
			event.preventDefault();
			onActiveSnippet(snippet.snippet_id);

			if (isMobile) {
				closeSnippetList();
			}
		};

		const isSnippetActive = activeSnippetId === snippet.snippet_id;

		return (
			<li
				className={`${styles.snippetItem} ${isSnippetActive ? styles.active : ""}`}
				key={snippet.snippet_id}
				onClick={snippetClickHandler}
			>
				<div className={styles.itemLeftSide}>
					{!isTrashActive && (
						<Trash
							className={styles.trashIcon}
							width="18"
							height="18"
							onClick={() => onDeleteSnippet(snippet?.snippet_id, "inactive")}
						/>
					)}

					{snippet?.state === "inactive" && (
						<Restore
							className={styles.restoreIcon}
							width="18"
							height="18"
							onClick={() => onRestoreSnippet(snippet?.snippet_id, "active")}
						/>
					)}
					{touched && isSnippetActive && "* "}
					{snippet?.name ?? "Untitled"}
					<LanguageBadge language={snippet.language} />
				</div>

				{dateFormatted && (
					<span className={styles.snippetDate}>{dateFormatted}</span>
				)}
			</li>
		);
	}

	return <></>;
};

export default SnippetItem;
