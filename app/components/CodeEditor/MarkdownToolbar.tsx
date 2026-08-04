import { ChangeEvent, Fragment, ReactElement, useRef } from "react";

/* Lib */
import markdownToolbarActions from "@/lib/markdown/markdownToolbarActions";
import {
	markdownExtensionPattern,
	markdownFileAccept,
} from "@/lib/constants/markdown.constants";

/* Components */
import EyeClosed from "@/components/ui/icons/EyeClosed";
import EyeOpen from "@/components/ui/icons/EyeOpen";
import FocusMode from "@/components/ui/icons/FocusMode";
import Upload from "@/components/ui/icons/Upload";

/* Types */
import type { EditorView } from "@codemirror/view";

/* Styles */
import styles from "./markdownToolbar.module.css";

type MarkdownToolbarProps = {
	getEditorView: () => EditorView | null;
	isFocusMode: boolean;
	isPreviewVisible: boolean;
	onToggleFocusMode: () => void;
	onTogglePreview: () => void;
	onUploadMarkdown: (upload: UploadedMarkdown) => void;
	showFormattingActions: boolean;
	showPreviewToggle: boolean;
};

const MarkdownToolbar = ({
	getEditorView,
	isFocusMode,
	isPreviewVisible,
	onToggleFocusMode,
	onTogglePreview,
	onUploadMarkdown,
	showFormattingActions,
	showPreviewToggle,
}: MarkdownToolbarProps): ReactElement => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const runAction = (apply: (view: EditorView) => void): void => {
		const editorView = getEditorView();

		if (!editorView) {
			return;
		}

		apply(editorView);
	};

	const handleFileSelected = async (
		event: ChangeEvent<HTMLInputElement>
	): Promise<void> => {
		const file = event.target.files?.[0];

		// Reset so picking the same file twice still fires a change event.
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}

		if (!file) {
			return;
		}

		onUploadMarkdown({
			content: await file.text(),
			name: file.name.replace(markdownExtensionPattern, ""),
		});
	};

	const previewToggleLabel = isPreviewVisible ? "Hide preview" : "Show preview";
	const focusModeLabel = isFocusMode
		? "Exit distraction-free writing"
		: "Enter distraction-free writing";

	return (
		<div
			aria-label={
				showFormattingActions ? "Markdown formatting" : "Editor toolbar"
			}
			className={styles.toolbar}
			role="toolbar"
		>
			{showFormattingActions &&
				markdownToolbarActions.map((action) => {
					const ActionIcon = action.icon;

					return (
						<Fragment key={action.label}>
							{action.hasDividerBefore ? (
								<span aria-hidden="true" className={styles.divider} />
							) : null}
							<button
								aria-label={action.label}
								className={styles.toolbarButton}
								onClick={() => runAction(action.apply)}
								title={action.label}
								type="button"
							>
								<ActionIcon height={16} width={16} />
							</button>
						</Fragment>
					);
				})}
			{showFormattingActions && (
				<>
					<span aria-hidden="true" className={styles.divider} />
					<button
						aria-label="Upload markdown file"
						className={styles.toolbarButton}
						onClick={() => fileInputRef.current?.click()}
						title="Upload markdown file"
						type="button"
					>
						<Upload height={16} width={16} />
					</button>
					<input
						accept={markdownFileAccept}
						hidden
						onChange={handleFileSelected}
						ref={fileInputRef}
						type="file"
					/>
				</>
			)}
			{showPreviewToggle && (
				<button
					aria-label={previewToggleLabel}
					aria-pressed={isPreviewVisible}
					className={`${styles.toolbarButton} ${styles.previewToggle}`}
					onClick={onTogglePreview}
					title={previewToggleLabel}
					type="button"
				>
					{isPreviewVisible ? (
						<EyeOpen height={16} width={16} />
					) : (
						<EyeClosed height={16} width={16} />
					)}
				</button>
			)}
			{showFormattingActions && (
				<>
					<span aria-hidden="true" className={styles.divider} />
					<button
						aria-label={focusModeLabel}
						aria-pressed={isFocusMode}
						className={styles.toolbarButton}
						onClick={onToggleFocusMode}
						title={focusModeLabel}
						type="button"
					>
						<FocusMode height={16} width={16} />
					</button>
				</>
			)}
		</div>
	);
};

export default MarkdownToolbar;
