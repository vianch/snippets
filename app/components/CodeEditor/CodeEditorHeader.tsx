import { ChangeEvent, ReactElement } from "react";

/* Lib */
import languageExtensions from "@/lib/codeEditor";
import { SnippetState } from "@/lib/constants/core";

/* Components */
import StarFilled from "@/components/ui/icons/StarFilled";
import Star from "@/components/ui/icons/Star";
import Input from "@/components/ui/Input/Input";
import Select from "@/components/ui/Select/Select";
import Button from "@/components/ui/Button/Button";
import Check from "@/components/ui/icons/Check";
import Loading from "@/components/ui/icons/Loading";
import Floppy from "@/components/ui/icons/Floppy";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorHeaderTypes = {
	currentSnippet: CurrentSnippet;
	codeEditorStates: SnippetEditorStates;
	snippetName: string;
	onStarred: () => void;
	onUpdateName: (event: ChangeEvent<HTMLInputElement>) => void;
	onSetLanguage: (language: string) => void;
	onSave: () => void;
};

const CodeEditorHeader = ({
	currentSnippet,
	codeEditorStates,
	snippetName = "",
	onStarred,
	onUpdateName,
	onSetLanguage,
	onSave,
}: CodeEditorHeaderTypes): ReactElement => {
	const { isSaving, touched } = codeEditorStates ?? {};
	const isFavorite = currentSnippet?.state === SnippetState.Favorite;

	return (
		<div className={styles.header}>
			<div className={styles.headerLeftSide}>
				<button
					type="button"
					className={`${styles.starButton} ${isFavorite ? styles.starButtonActive : ""}`}
					aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
					aria-pressed={isFavorite}
					onClick={onStarred}
				>
					{isFavorite ? (
						<StarFilled height={18} width={18} fill="currentColor" />
					) : (
						<Star height={18} width={18} />
					)}
					<span className={styles.tooltip}>
						{isFavorite ? "Favorited" : "Favorite"}
					</span>
				</button>

				<Input
					ghost
					disableMargin
					className={styles.titleInput}
					placeholder="Untitled"
					value={snippetName}
					maxLength={34}
					onChange={onUpdateName}
				/>
			</div>

			<div className={styles.headerRightSide}>
				<Select
					value={currentSnippet.language}
					items={Object.keys(languageExtensions)}
					onSelect={onSetLanguage}
				/>

				<Button
					className={`${styles.saveButton} ${touched ? styles.touched : ""}`}
					variant="secondary"
					disabled={isSaving}
					aria-label="Save snippet"
					onClick={onSave}
				>
					{isSaving ? (
						<Loading className={styles.icon} width={16} height={16} />
					) : touched ? (
						<Floppy className={styles.icon} width={16} height={16} />
					) : (
						<Check className={styles.icon} width={16} height={16} />
					)}
					{isSaving ? "Saving" : touched ? "Save" : "Saved"}
					{touched && <span className={styles.dirtyDot} aria-hidden="true" />}
				</Button>
			</div>
		</div>
	);
};

export default CodeEditorHeader;
