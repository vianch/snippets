import { FC, ReactElement, MouseEvent } from "react";

/* Components */
import Trash from "@/components/ui/icons/Trash";
import Restore from "@/components/ui/icons/Restore";

/* Stores */
import useMenuStore from "@/lib/store/menu.store";
import useViewPortStore from "@/lib/store/viewPort.store";

import styles from "@/components/SnippetList/snippetlist.module.css";

interface SnippetItemPropsComponent extends SnippetItemProps {
	dateFormatted: string;
	snippet: Snippet | null | undefined;
	originalIndex: number;
	isTrashActive: boolean;
}

const SnippetItem: FC<SnippetItemPropsComponent> = ({
	snippet,
	dateFormatted,
	codeEditorStates: { activeSnippetIndex, touched },
	isTrashActive,
	originalIndex,
	onActiveSnippet,
	onDeleteSnippet,
	onRestoreSnippet,
}: SnippetItemPropsComponent): ReactElement => {
	const isMobile = useViewPortStore((state) => state.isMobile);
	const closeSnippetList = useMenuStore((state) => state.closeSnippetList);

	if (snippet) {
		const snippetClickHandler = (
			event: MouseEvent<HTMLLIElement>,
			index: number
		): void => {
			event.preventDefault();
			onActiveSnippet(index);

			// Close the snippet list on mobile when a snippet is selected
			if (isMobile) {
				closeSnippetList();
			}
		};

		const isSnippetActive = activeSnippetIndex === originalIndex;

		return (
			<li
				className={`${styles.snippetItem} ${isSnippetActive ? styles.active : ""}`}
				key={snippet.snippet_id}
				onClick={(event: MouseEvent<HTMLLIElement>) =>
					snippetClickHandler(event, originalIndex)
				}
			>
				<div className={styles.itemLeftSide}>
					{!isTrashActive && (
						<Trash
							className={styles.trashIcon}
							width="18"
							height="18"
							onClick={() =>
								onDeleteSnippet(snippet?.snippet_id, originalIndex, "inactive")
							}
						/>
					)}

					{snippet?.state === "inactive" && (
						<Restore
							className={styles.restoreIcon}
							width="18"
							height="18"
							onClick={() =>
								onRestoreSnippet(snippet?.snippet_id, originalIndex, "active")
							}
						/>
					)}
					{touched && isSnippetActive && "* "}
					{snippet?.name ?? "Untitled"}
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
