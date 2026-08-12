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

// Mobile and tablet measure against dvh, not vh: vh is the large viewport, so a
// vh-sized pane runs underneath the browser's URL/toolbar. The inset also keeps
// the pane clear of the home-indicator area the bottom bars pad for.
const mobileSafeArea = "env(safe-area-inset-bottom, 0px)";

export const calculateEditorHeight = ({
	hasMarkdownToolbar,
	hasRightPane,
	isFocusMode,
	isMobile,
	isTrashActive,
}: EditorHeightParams): string => {
	if (isFocusMode) {
		return `calc(100dvh - ${focusModeBarHeight})`;
	}

	if (isMobile && !isTrashActive) {
		return hasRightPane
			? `calc(50dvh - 3.4rem - (${mobileSafeArea} / 2))`
			: `calc(100dvh - 6.5rem - ${mobileSafeArea})`;
	}

	if (isTrashActive && !isMobile) {
		return "100vh";
	}

	if (isTrashActive && isMobile) {
		return `calc(100dvh - 3.2rem - ${mobileSafeArea})`;
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
		return `calc(100dvh - ${focusModeBarHeight})`;
	}

	if (isMobile) {
		return `calc(50dvh - 3.4rem - (${mobileSafeArea} / 2))`;
	}

	return "calc(100vh - 3.25rem)";
};

// Full-height single pane used by the mobile AI Code|Chat tab switcher: total
// viewport minus the merged header row + tab bar (top) and the editor action bar +
// nav bar (bottom).
export const chatTabPaneHeight = `calc(100dvh - 12.3rem - ${mobileSafeArea})`;
