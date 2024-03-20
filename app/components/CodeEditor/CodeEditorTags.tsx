import { ReactElement, useEffect, useState } from "react";

import Input from "@/components/ui/Input/Input";
import Tag from "@/components/ui/icons/Tag";
import Badge from "@/components/ui/Badge/Badge";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorTagsProps = {
	tags: Tags;
	onNewTag: (tag: string) => void;
	onRemoveTag: (tag: string) => void;
};

const CodeEditorTags = ({
	tags = null,
	onNewTag,
	onRemoveTag,
}: CodeEditorTagsProps): ReactElement => {
	const [tagList, setTagList] = useState<string[]>([]);
	const getTagForSnippet = (snippetTag: Tags): string[] =>
		snippetTag && snippetTag?.length > 0 ? snippetTag.trim().split(",") : [];

	useEffect(() => {
		setTagList(getTagForSnippet(tags));
	}, [tags]);

	return (
		<section className={styles.tagsContainer}>
			<label>
				<Tag width={24} height={24} />{" "}
			</label>
			{tagList?.length > 0 &&
				tagList.map(
					(tag: string, index: number): ReactElement => (
						<Badge
							key={`${index + 1}-code-editor-tag`}
							onRemove={() => onRemoveTag(tag)}
						>
							{tag ?? ""}
						</Badge>
					)
				)}

			{tagList?.length < 3 && (
				<div className={styles.tagInput}>
					<Input
						className={`inputField `}
						type="text"
						placeholder="New Tag"
						value=""
						required={true}
						onKeyDown={onNewTag}
						maxLength={25}
					/>
				</div>
			)}
		</section>
	);
};

export default CodeEditorTags;
