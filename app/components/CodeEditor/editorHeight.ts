type EditorHeightParams = {
	hasMarkdownToolbar: boolean;
	hasRightPane: boolean;
	isFocusMode: boolean;
	isMobile: boolean;
	isTrashActive: boolean;
};

// Fixed-overlay bar shown in place of the header row and toolbar while
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
		return hasRightPane ? "calc(50vh - 3.4rem)" : "calc(100vh - 6.5rem)";
	}

	if (isTrashActive && !isMobile) {
		return "100vh";
	}

	if (isTrashActive && isMobile) {
		return "calc(100vh - 3.2rem)";
	}

	if (hasMarkdownToolbar) {
		return "calc(100vh - 5.25rem)";
	}

	return "calc(100vh - 3.25rem)";
};

export const calculatePreviewHeight = (
	isMobile: boolean,
	isFocusMode: boolean = false
): string => {
	if (isFocusMode) {
		return `calc(100vh - ${focusModeBarHeight})`;
	}

	if (isMobile) {
		return "calc(50vh - 3.4rem)";
	}

	return "calc(100vh - 3.25rem)";
};

// Full-height single pane used by the mobile AI Code|Chat tab switcher: total
// viewport minus the merged header row + tab bar (top) and the editor action bar +
// nav bar (bottom).
export const chatTabPaneHeight = "calc(100vh - 12.3rem)";
