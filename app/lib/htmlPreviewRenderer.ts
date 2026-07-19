import DOMPurify from "isomorphic-dompurify";

/* Lib */
import { HtmlPreviewContentSecurityPolicy } from "@/lib/constants/preview.constants";

// Sanitization here is defense in depth: the preview iframe is rendered with
// sandbox="" (opaque origin, scripts disabled), so anything DOMPurify were to
// miss still could not execute or reach the parent application.
export const buildHtmlPreviewDocument = (content: string): string => {
	// WHOLE_DOCUMENT keeps <head>/<body> and their <style> blocks intact — the
	// default (body-fragment) mode drops the <head>, so a full-document snippet
	// loses all its styling. The sandboxed iframe contains whatever renders.
	const sanitizedDocument = DOMPurify.sanitize(content, {
		WHOLE_DOCUMENT: true,
	});

	const headMeta = `<head><meta charset="utf-8" /><meta http-equiv="Content-Security-Policy" content="${HtmlPreviewContentSecurityPolicy}" />`;

	// WHOLE_DOCUMENT always emits a <head>; inject the CSP as its first child.
	if (sanitizedDocument.includes("<head>")) {
		return `<!doctype html>${sanitizedDocument.replace("<head>", headMeta)}`;
	}

	return `<!doctype html><html>${headMeta}</head><body>${sanitizedDocument}</body></html>`;
};
