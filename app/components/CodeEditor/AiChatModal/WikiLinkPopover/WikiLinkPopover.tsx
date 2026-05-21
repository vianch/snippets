"use client";

import { ReactElement, useEffect, useState } from "react";

/* Styles */
import styles from "./wikiLinkPopover.module.css";

type WikiLinkPopoverProps = {
	isOpen: boolean;
	query: string;
	snippets: Snippet[];
	onSelect: (name: string) => void;
	onDismiss: () => void;
};

const maxSuggestions = 12;

const WikiLinkPopover = ({
	isOpen,
	query,
	snippets,
	onSelect,
	onDismiss,
}: WikiLinkPopoverProps): ReactElement | null => {
	const [activeIndex, setActiveIndex] = useState(0);

	const normalized = query.toLowerCase();
	const matches = snippets
		.filter(
			(snippet) =>
				snippet.name && snippet.name.toLowerCase().includes(normalized)
		)
		.slice(0, maxSuggestions);

	useEffect(() => {
		setActiveIndex(0);
	}, [query, isOpen]);

	useEffect(() => {
		if (!isOpen || matches.length === 0) {
			return;
		}

		const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
			if (event.key === "ArrowDown") {
				event.preventDefault();
				event.stopPropagation();
				setActiveIndex((prev) => Math.min(prev + 1, matches.length - 1));
			} else if (event.key === "ArrowUp") {
				event.preventDefault();
				event.stopPropagation();
				setActiveIndex((prev) => Math.max(prev - 1, 0));
			} else if (event.key === "Enter" || event.key === "Tab") {
				if (matches[activeIndex]) {
					event.preventDefault();
					event.stopPropagation();
					onSelect(matches[activeIndex].name);
				}
			} else if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				onDismiss();
			}
		};

		document.addEventListener("keydown", handleKeyDown, true);

		return () => {
			document.removeEventListener("keydown", handleKeyDown, true);
		};
	}, [isOpen, matches, activeIndex, onSelect, onDismiss]);

	if (!isOpen || matches.length === 0) {
		return null;
	}

	return (
		<ul
			className={styles.popover}
			role="listbox"
			aria-label="Snippet suggestions"
		>
			{matches.map((snippet, index) => (
				<li
					key={snippet.snippet_id}
					role="option"
					aria-selected={index === activeIndex}
					className={`${styles.option} ${index === activeIndex ? styles.optionActive : ""}`}
					onMouseDown={(event) => {
						event.preventDefault();
						onSelect(snippet.name);
					}}
					onMouseEnter={() => setActiveIndex(index)}
				>
					<span className={styles.optionName}>{snippet.name}</span>
					{snippet.language && (
						<span className={styles.optionLang}>{snippet.language}</span>
					)}
				</li>
			))}
		</ul>
	);
};

export default WikiLinkPopover;
