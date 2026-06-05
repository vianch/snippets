type EditorHeightParams = {
	hasMarkdownToolbar: boolean;
	hasRightPane: boolean;
	isMobile: boolean;
	isTrashActive: boolean;
};

export const calculateEditorHeight = ({
	hasMarkdownToolbar,
	hasRightPane,
	isMobile,
	isTrashActive,
}: EditorHeightParams): string => {
	if (isMobile && !isTrashActive) {
		return hasRightPane ? "calc(50vh - 5rem)" : "calc(100vh - 9.7rem)";
	}

	if (isTrashActive && !isMobile) {
		return "100vh";
	}

	if (isTrashActive && isMobile) {
		return "calc(100vh - 3.2rem)";
	}

	if (hasMarkdownToolbar) {
		return "calc(100vh - 8.45rem)";
	}

	return "calc(100vh - 6.45rem)";
};

export const calculatePreviewHeight = (isMobile: boolean): string => {
	if (isMobile) {
		return "calc(50vh - 5rem)";
	}

	return "calc(100vh - 6.45rem)";
};

// Full-height single pane used by the mobile AI Code|Chat tab switcher: total
// viewport minus the header + tags + tab bar (top) and the editor action bar +
// nav bar (bottom).
export const chatTabPaneHeight = "calc(100vh - 15.5rem)";
