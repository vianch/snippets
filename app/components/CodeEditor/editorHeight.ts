type EditorHeightParams = {
	isMobile: boolean;
	isTrashActive: boolean;
	isMarkdownLanguage: boolean;
};

export const calculateEditorHeight = ({
	isMobile,
	isTrashActive,
	isMarkdownLanguage,
}: EditorHeightParams): string => {
	if (isMobile && !isTrashActive) {
		return isMarkdownLanguage ? "calc(50vh - 5rem)" : "calc(100vh - 9.7rem)";
	}

	if (isTrashActive && !isMobile) {
		return "100vh";
	}

	if (isTrashActive && isMobile) {
		return "calc(100vh - 3.2rem)";
	}

	return "calc(100vh - 6.45rem)";
};

export const calculatePreviewHeight = (isMobile: boolean): string => {
	if (isMobile) {
		return "calc(50vh - 5rem)";
	}

	return "calc(100vh - 6.45rem)";
};
