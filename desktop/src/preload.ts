import { contextBridge } from "electron";

/*
 * Exposes a tiny, read-only flag so the web app can detect when it is running
 * inside the desktop shell (e.g. to hide any "download the app" banner).
 * Available as `window.snippetsDesktop`.
 */

const SnippetsAppUrl = "https://snippets.vianch.com";

contextBridge.exposeInMainWorld("snippetsDesktop", {
	appUrl: SnippetsAppUrl,
	isDesktopApp: true,
	platform: process.platform,
});
