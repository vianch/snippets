import { Fragment, ReactElement } from "react";

/* Lib */
import markdownToolbarActions from "@/lib/markdown/markdownToolbarActions";

/* Types */
import type { EditorView } from "@codemirror/view";

/* Styles */
import styles from "./markdownToolbar.module.css";

type MarkdownToolbarProps = {
	getEditorView: () => EditorView | null;
};

const MarkdownToolbar = ({
	getEditorView,
}: MarkdownToolbarProps): ReactElement => {
	const runAction = (apply: (view: EditorView) => void): void => {
		const editorView = getEditorView();

		if (!editorView) {
			return;
		}

		apply(editorView);
	};

	return (
		<div
			aria-label="Markdown formatting"
			className={styles.toolbar}
			role="toolbar"
		>
			{markdownToolbarActions.map((action) => {
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
		</div>
	);
};

export default MarkdownToolbar;
