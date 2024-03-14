import { ChangeEvent, ReactElement } from "react";

/* Lib */
import languageExtensions from "@/lib/codeEditor";

/* Components */
import StarFilled from "@/components/ui/icons/StarFilled";
import Star from "@/components/ui/icons/Star";
import Input from "@/components/ui/Input/Input";
import Select from "@/components/ui/Select/Select";
import Button from "@/components/ui/Button/Button";
import Loading from "@/components/ui/icons/Loading";
import Floppy from "@/components/ui/icons/Floppy";

/* Styles */
import styles from "./codeEditor.module.css";

type CodeEditorHeaderTypes = {
	currentSnippet: CurrentSnippet;
	isSaving: boolean;
	snippetName: string;
	onStarred: () => void;
	onUpdateName: (event: ChangeEvent<HTMLInputElement>) => void;
	onSetLanguage: (language: string) => void;
	onSave: () => void;
};

const CodeEditorHeader = ({
	currentSnippet,
	isSaving,
	snippetName = "",
	onStarred,
	onUpdateName,
	onSetLanguage,
	onSave,
}: CodeEditorHeaderTypes): ReactElement => {
	return (
		<div className={styles.header}>
			<div className={styles.headerLeftSide}>
				{currentSnippet?.state === "favorite" ? (
					<StarFilled
						className={styles.starIcon}
						height={18}
						width={18}
						fill="#f1fa8c"
						onClick={onStarred}
					/>
				) : (
					<Star
						className={styles.starIcon}
						height={18}
						width={18}
						onClick={onStarred}
					/>
				)}

				<Input
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
					className={styles.button}
					variant="secondary"
					disabled={isSaving}
					onClick={onSave}
				>
					{isSaving ? (
						<Loading className={styles.icon} width={16} height={16} />
					) : (
						<Floppy className={styles.icon} width={16} height={16} />
					)}{" "}
					Save
				</Button>
			</div>
		</div>
	);
};

export default CodeEditorHeader;
