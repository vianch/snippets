import { Fragment, ReactElement } from "react";

/* Lib */
import markdownToolbarActions from "@/lib/markdown/markdownToolbarActions";

/* Components */
import EyeClosed from "@/components/ui/icons/EyeClosed";
import EyeOpen from "@/components/ui/icons/EyeOpen";

/* Types */
import type { EditorView } from "@codemirror/view";

/* Styles */
import styles from "./markdownToolbar.module.css";

type MarkdownToolbarProps = {
	getEditorView: () => EditorView | null;
	isPreviewVisible: boolean;
	onTogglePreview: () => void;
	showFormattingActions: boolean;
	showPreviewToggle: boolean;
};

const MarkdownToolbar = ({
	getEditorView,
	isPreviewVisible,
	onTogglePreview,
	showFormattingActions,
	showPreviewToggle,
}: MarkdownToolbarProps): ReactElement => {
	const runAction = (apply: (view: EditorView) => void): void => {
		const editorView = getEditorView();

		if (!editorView) {
			return;
		}

		apply(editorView);
	};

	const previewToggleLabel = isPreviewVisible ? "Hide preview" : "Show preview";

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
		</div>
	);
};

export default MarkdownToolbar;
