"use client";

import { ReactElement, useCallback, useRef, useState } from "react";

/* Components */
import Book from "@/components/ui/icons/Book";
import CaretDown from "@/components/ui/icons/CaretDown";
import Check from "@/components/ui/icons/Check";
import NewFile from "@/components/ui/icons/NewFile";

/* Utils */
import { useClickOutside } from "@/utils/ui.utils";

/* Styles */
import styles from "./snippetPicker.module.css";

type SnippetPickerProps = {
	activeSnippetId: UUID | null;
	onNew?: () => void;
	onSelect: (snippetId: UUID) => void;
	snippets: Snippet[];
};

const SnippetPicker = ({
	activeSnippetId,
	onNew,
	onSelect,
	snippets,
}: SnippetPickerProps): ReactElement => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const pickerRef = useRef<HTMLDivElement>(null);
	const closeMenu = useCallback(() => setIsOpen(false), []);

	useClickOutside(pickerRef, closeMenu, isOpen);

	const activeSnippet = snippets.find(
		(snippet) => snippet.snippet_id === activeSnippetId
	);
	const activeName = activeSnippet?.name?.trim()
		? activeSnippet.name
		: "Untitled";

	const handleSelect = (snippetId: UUID): void => {
		onSelect(snippetId);
		setIsOpen(false);
	};

	const handleNew = (): void => {
		onNew?.();
		setIsOpen(false);
	};

	return (
		<div className={styles.picker} ref={pickerRef}>
			<button
				type="button"
				className={styles.trigger}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				onClick={() => setIsOpen(!isOpen)}
			>
				<Book className={styles.triggerIcon} width={14} height={14} />
				<span className={styles.triggerLabel}>{activeName}</span>
				<CaretDown className={styles.caret} width={12} height={12} />
			</button>

			{isOpen && (
				<div className={styles.menu} role="listbox">
					{onNew && (
						<button
							type="button"
							className={styles.newItem}
							onClick={handleNew}
						>
							<NewFile width={14} height={14} />
							<span>New snippet</span>
						</button>
					)}

					<div className={styles.menuList}>
						{snippets.map((snippet) => (
							<button
								key={snippet.snippet_id}
								type="button"
								role="option"
								aria-selected={snippet.snippet_id === activeSnippetId}
								className={`${styles.item} ${snippet.snippet_id === activeSnippetId ? styles.itemActive : ""}`}
								onClick={() => handleSelect(snippet.snippet_id)}
							>
								<span className={styles.itemCheck}>
									{snippet.snippet_id === activeSnippetId && (
										<Check width={12} height={12} />
									)}
								</span>
								<span className={styles.itemName}>
									{snippet.name?.trim() ? snippet.name : "Untitled"}
								</span>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default SnippetPicker;
