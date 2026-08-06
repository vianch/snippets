declare global {
	type LinkPreviewData = {
		description: string | null;
		image: string | null;
		siteName: string | null;
		title: string | null;
		url: string;
	};

	type LinkPreviewCacheEntry = {
		expiresAt: number;
		preview: LinkPreviewData;
	};

	type LinkPreviewErrorResponse = {
		error: string;
	};
}

export {};
