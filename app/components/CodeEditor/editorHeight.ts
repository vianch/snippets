type EditorHeightParams = {
	hasMarkdownToolbar: boolean;
	hasRightPane: boolean;
	isFocusMode: boolean;
	isMobile: boolean;
	isTrashActive: boolean;
};

// Fixed-overlay bar shown in place of the header/tags/toolbar while
// distraction-free writing is active.
const focusModeBarHeight = "3rem";

export const calculateEditorHeight = ({
	hasMarkdownToolbar,
	hasRightPane,
	isFocusMode,
	isMobile,
	isTrashActive,
}: EditorHeightParams): string => {
	if (isFocusMode) {
		return `calc(100vh - ${focusModeBarHeight})`;
	}

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

export const calculatePreviewHeight = (
	isMobile: boolean,
	isFocusMode: boolean = false
): string => {
	if (isFocusMode) {
		return `calc(100vh - ${focusModeBarHeight})`;
	}

	if (isMobile) {
		return "calc(50vh - 5rem)";
	}

	return "calc(100vh - 6.45rem)";
};

// Full-height single pane used by the mobile AI Code|Chat tab switcher: total
// viewport minus the header + tags + tab bar (top) and the editor action bar +
// nav bar (bottom).
export const chatTabPaneHeight = "calc(100vh - 15.5rem)";
