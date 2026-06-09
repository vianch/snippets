import { app, BrowserWindow, shell } from "electron";
import * as path from "node:path";

/*
 * Thin desktop shell for Snippets. It does not bundle the Next.js server — it
 * simply loads the deployed web app in a native window, so every web feature
 * (middleware auth, /api/ai key-hiding, MFA) works unchanged and the content
 * auto-updates on every Vercel deploy.
 */

const DefaultAppUrl = "https://snippets.vianch.com";
const BackgroundColor = "#1e1e3f";
const WindowWidth = 1280;
const WindowHeight = 832;
const WindowMinWidth = 480;
const WindowMinHeight = 600;
const AbortedErrorCode = -3;

const appUrl = process.env.SNIPPETS_DESKTOP_URL ?? DefaultAppUrl;
const appOrigin = new URL(appUrl).origin;
const isDevelopment = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

const isInternalUrl = (target: string): boolean => {
	try {
		return new URL(target).origin === appOrigin;
	} catch {
		return false;
	}
};

const openExternally = (target: string): void => {
	if (target.startsWith("https://") || target.startsWith("http://")) {
		void shell.openExternal(target);
	}
};

const loadOfflineFallback = (): void => {
	void mainWindow?.loadFile(path.join(__dirname, "..", "offline.html"));
};

const createWindow = (): void => {
	mainWindow = new BrowserWindow({
		backgroundColor: BackgroundColor,
		height: WindowHeight,
		minHeight: WindowMinHeight,
		minWidth: WindowMinWidth,
		show: false,
		title: "Snippets",
		webPreferences: {
			contextIsolation: true,
			nodeIntegration: false,
			preload: path.join(__dirname, "preload.js"),
			sandbox: true,
		},
		width: WindowWidth,
	});

	mainWindow.once("ready-to-show", () => {
		mainWindow?.show();

		if (isDevelopment) {
			mainWindow?.webContents.openDevTools({ mode: "detach" });
		}
	});

	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		openExternally(url);

		return { action: "deny" };
	});

	mainWindow.webContents.on("will-navigate", (event, url) => {
		if (!isInternalUrl(url)) {
			event.preventDefault();
			openExternally(url);
		}
	});

	mainWindow.webContents.on(
		"did-fail-load",
		(_event, errorCode, _description, validatedUrl, isMainFrame) => {
			if (
				isMainFrame &&
				errorCode !== AbortedErrorCode &&
				isInternalUrl(validatedUrl || appUrl)
			) {
				loadOfflineFallback();
			}
		}
	);

	mainWindow.on("closed", () => {
		mainWindow = null;
	});

	void mainWindow.loadURL(appUrl);
};

const hasSingleInstanceLock = app.requestSingleInstanceLock();

if (!hasSingleInstanceLock) {
	app.quit();
} else {
	app.on("second-instance", () => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) {
				mainWindow.restore();
			}

			mainWindow.focus();
		}
	});

	app.setAppUserModelId("com.vianch.snippets");

	void app.whenReady().then(() => {
		createWindow();

		app.on("activate", () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				createWindow();
			}
		});
	});

	app.on("window-all-closed", () => {
		if (process.platform !== "darwin") {
			app.quit();
		}
	});
}
