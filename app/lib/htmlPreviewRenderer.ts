import DOMPurify from "isomorphic-dompurify";

/* Lib */
import { HtmlPreviewContentSecurityPolicy } from "@/lib/constants/preview.constants";

// Sanitization here is defense in depth: the preview iframe is rendered with
// sandbox="" (opaque origin, scripts disabled), so anything DOMPurify were to
// miss still could not execute or reach the parent application.
export const buildHtmlPreviewDocument = (content: string): string => {
	const sanitizedHtml = DOMPurify.sanitize(content);

	return [
		'<!doctype html><html><head><meta charset="utf-8" />',
		`<meta http-equiv="Content-Security-Policy" content="${HtmlPreviewContentSecurityPolicy}" />`,
		"</head><body>",
		sanitizedHtml,
		"</body></html>",
	].join("");
};
