import { ReactElement } from "react";

import Input from "@/components/ui/Input/Input";
import Tag from "@/components/ui/icons/Tag";
import Badge from "@/components/ui/Badge/Badge";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorTagsProps = {
	tags: Tags;
	onNewTag: (tag: string) => void;
};

const CodeEditorTags = ({
	tags = [],
	onNewTag,
}: CodeEditorTagsProps): ReactElement => {
	return (
		<section className={styles.tagsContainer}>
			<label>
				<Tag width={24} height={24} />{" "}
			</label>
			{tags?.length > 0 &&
				tags.map(
					(tag: string, index: number): ReactElement => (
						<Badge key={`${index + 1}-code-editor-tag`}>{tag}</Badge>
					)
				)}

			<div className={styles.tagInput}>
				<Input
					className={`inputField `}
					type="text"
					placeholder="New Tag"
					value=""
					required={true}
					onKeyDown={onNewTag}
				/>
			</div>
		</section>
	);
};

export default CodeEditorTags;
