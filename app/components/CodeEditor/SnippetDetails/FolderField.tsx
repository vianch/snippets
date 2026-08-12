"use client";

import { ChangeEvent, ReactElement, useMemo, useState } from "react";

/* Lib */
import { PetEvent } from "@/lib/constants/pets.constants";
import { emitPetEvent } from "@/lib/store/pet.store";

/* Components */
import Folder from "@/components/ui/icons/Folder";
import Input from "@/components/ui/Input/Input";
import TagSuggestions from "@/components/CodeEditor/TagSuggestions";

/* Utils */
import filterTagSuggestions from "@/utils/tag.utils";

/* Styles */
import styles from "../codeEditor.module.css";

type FolderFieldProps = {
	folder?: string | null;
	availableFolders?: TagItem[];
	onFolderChange: (folder: string) => void;
};

const FolderField = ({
	folder,
	availableFolders,
	onFolderChange,
}: FolderFieldProps): ReactElement => {
	// Transient, and deliberately not `folder`: the input is bound to the
	// persisted value, so using it as the query would keep the popover open for
	// as long as the panel is and the text prefix-matches.
	const [folderQuery, setFolderQuery] = useState<string>("");
	// Excludes nothing — the exact match is the value the user is confirming.
	const suggestions = useMemo(
		() => filterTagSuggestions(availableFolders ?? [], folderQuery, []),
		[availableFolders, folderQuery]
	);

	// Only the discrete pick emits to the pet: the free-text path fires on every
	// keystroke, which would turn one folder rename into thirty bubbles.
	const commitFolder = (selectedFolder: string): void => {
		setFolderQuery("");
		onFolderChange(selectedFolder);
		emitPetEvent(PetEvent.FolderChanged);
	};

	return (
		<div className={styles.detailsField}>
			<label className={styles.detailsLabel}>
				<Folder width={14} height={14} />
				Folder
			</label>
			<div className={styles.detailsAutocomplete}>
				<Input
					placeholder="e.g. Recipes, Work, Snippets-2026"
					value={folder ?? ""}
					maxLength={60}
					disableMargin
					onChange={(event: ChangeEvent<HTMLInputElement>) => {
						setFolderQuery(event.target.value);
						onFolderChange(event.target.value);
					}}
					onBlur={() => setFolderQuery("")}
				/>

				<TagSuggestions
					ariaLabel="Folder suggestions"
					suggestions={suggestions}
					onSelect={commitFolder}
					onDismiss={() => setFolderQuery("")}
				/>
			</div>
			<span className={styles.detailsHelper}>
				Pick an existing folder or type a new name.
			</span>
		</div>
	);
};

export default FolderField;
