"use client";

import { ChangeEvent, ReactElement, useMemo, useState } from "react";

/* Lib */
import { MaxSnippetTags } from "@/lib/constants/core";

/* Components */
import Badge from "@/components/ui/Badge/Badge";
import Input from "@/components/ui/Input/Input";
import TagSuggestions from "@/components/CodeEditor/TagSuggestions";

/* Utils */
import filterTagSuggestions from "@/utils/tag.utils";

/* Styles */
import styles from "../codeEditor.module.css";

type TagsFieldProps = {
	tagList: string[];
	availableTags?: TagItem[];
	onNewTag: (tag: string) => void;
	onRemoveTag: (tag: string) => void;
	onTouched: (touched: boolean) => void;
};

const TagsField = ({
	tagList,
	availableTags,
	onNewTag,
	onRemoveTag,
	onTouched,
}: TagsFieldProps): ReactElement => {
	const [tagQuery, setTagQuery] = useState<string>("");
	const suggestions = useMemo(
		() => filterTagSuggestions(availableTags ?? [], tagQuery, tagList),
		[availableTags, tagQuery, tagList]
	);
	const canAddTag = tagList.length < MaxSnippetTags;

	const commitTag = (tag: string): void => {
		setTagQuery("");
		onNewTag(tag);
	};

	return (
		<div className={styles.detailsField}>
			<label className={styles.detailsLabel}>Tags</label>

			{tagList.length > 0 && (
				<div className={styles.detailsChips}>
					{tagList.map((tag: string, index: number): ReactElement => (
						<Badge
							key={`${index + 1}-snippet-details-tag`}
							className={styles.detailsChip}
							onRemove={() => onRemoveTag(tag)}
						>
							{tag ?? ""}
						</Badge>
					))}
				</div>
			)}

			{canAddTag ? (
				<div className={styles.detailsAutocomplete}>
					<Input
						cleanOnBlur
						disableMargin
						type="text"
						placeholder={tagList.length > 0 ? "Add another tag…" : "Add a tag…"}
						value={tagQuery}
						maxLength={25}
						onChange={(event: ChangeEvent<HTMLInputElement>) => {
							setTagQuery(event.target.value);
							// Marks the snippet dirty on every keystroke, even when no tag
							// is committed. Pre-existing behaviour — preserved verbatim.
							onTouched(true);
						}}
						onKeyDown={commitTag}
						onBlur={commitTag}
					/>

					<TagSuggestions
						suggestions={suggestions}
						onSelect={commitTag}
						onDismiss={() => setTagQuery("")}
					/>
				</div>
			) : (
				<span className={styles.detailsHelper}>
					{`${tagList.length} of ${MaxSnippetTags} tags used`}
				</span>
			)}
		</div>
	);
};

export default TagsField;
