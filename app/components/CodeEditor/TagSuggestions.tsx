"use client";

import { ReactElement, useEffect, useState } from "react";

/* Styles */
import styles from "./tagSuggestions.module.css";

type TagSuggestionsProps = {
	suggestions: string[];
	onSelect: (tag: string) => void;
	onDismiss: () => void;
};

const TagSuggestions = ({
	suggestions,
	onSelect,
	onDismiss,
}: TagSuggestionsProps): ReactElement | null => {
	// -1 keeps the raw typed text as the default commit target, so Enter only
	// picks a suggestion once the user has arrowed into the list.
	const [activeIndex, setActiveIndex] = useState(-1);

	useEffect(() => {
		setActiveIndex(-1);
	}, [suggestions]);

	useEffect(() => {
		if (suggestions.length === 0) {
			return;
		}

		const handleKeyDown = (event: globalThis.KeyboardEvent): void => {
			if (event.key === "ArrowDown") {
				event.preventDefault();
				event.stopPropagation();
				setActiveIndex((current) =>
					current + 1 >= suggestions.length ? 0 : current + 1
				);
			} else if (event.key === "ArrowUp") {
				event.preventDefault();
				event.stopPropagation();
				setActiveIndex((current) =>
					current <= 0 ? suggestions.length - 1 : current - 1
				);
			} else if (event.key === "Enter" || event.key === "Tab") {
				const activeSuggestion = suggestions[activeIndex];

				if (activeSuggestion) {
					event.preventDefault();
					event.stopPropagation();
					onSelect(activeSuggestion);
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
	}, [suggestions, activeIndex, onSelect, onDismiss]);

	if (suggestions.length === 0) {
		return null;
	}

	return (
		<ul className={styles.popover} role="listbox" aria-label="Tag suggestions">
			{suggestions.map((suggestion, index) => (
				<li
					key={suggestion}
					role="option"
					aria-selected={index === activeIndex}
					className={`${styles.option} ${index === activeIndex ? styles.optionActive : ""}`}
					onMouseDown={(event) => {
						// Keeps focus on the input so the blur handler does not commit
						// the half-typed query before the click lands.
						event.preventDefault();
						onSelect(suggestion);
					}}
					onMouseEnter={() => setActiveIndex(index)}
				>
					<span className={styles.optionName}>{suggestion}</span>
				</li>
			))}
		</ul>
	);
};

export default TagSuggestions;
