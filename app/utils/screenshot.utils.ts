import { toPng } from "html-to-image";

const googleFontsBaseUrl = "https://fonts.googleapis.com/css2?family=";
const fontLoadTimeoutMs = 3000;

export const loadFont = async (
	fontFamily: string,
	googleFamilyParam?: string
): Promise<void> => {
	if (!googleFamilyParam) {
		return;
	}

	const linkId = `google-font-${fontFamily.replace(/\s+/g, "-").toLowerCase()}`;

	if (!document.getElementById(linkId)) {
		const link = document.createElement("link");

		link.id = linkId;
		link.rel = "stylesheet";
		link.href = `${googleFontsBaseUrl}${googleFamilyParam}&display=swap`;
		document.head.appendChild(link);
	}

	try {
		await Promise.race([
			document.fonts.ready,
			new Promise<void>((_, reject) =>
				setTimeout(
					() => reject(new Error("Font load timeout")),
					fontLoadTimeoutMs
				)
			),
		]);
	} catch {
		// continue with system fallback font
	}
};

export const captureElement = async (element: HTMLElement): Promise<string> => {
	return toPng(element, {
		cacheBust: true,
		pixelRatio: window.devicePixelRatio ?? 2,
	});
};

export const downloadImage = (dataUrl: string, filename: string): void => {
	const anchor = document.createElement("a");

	anchor.href = dataUrl;
	anchor.download = `${filename}.png`;
	anchor.click();
};
