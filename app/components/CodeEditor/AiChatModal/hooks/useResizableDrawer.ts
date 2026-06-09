import { PointerEvent, useEffect, useState } from "react";

import {
	aiChatModalMinWidthPx,
	aiChatModalWidthStorageKey,
} from "@/lib/constants/ai";

type UseResizableDrawerResult = {
	drawerWidth: number;
	finishResize: (event: PointerEvent<HTMLDivElement>) => void;
	handleResizePointerDown: (event: PointerEvent<HTMLDivElement>) => void;
	handleResizePointerMove: (event: PointerEvent<HTMLDivElement>) => void;
	isResizing: boolean;
};

const useResizableDrawer = (isMobile: boolean): UseResizableDrawerResult => {
	const [drawerWidth, setDrawerWidth] = useState<number>(aiChatModalMinWidthPx);
	const [isResizing, setIsResizing] = useState<boolean>(false);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const stored = window.localStorage.getItem(aiChatModalWidthStorageKey);

		if (stored) {
			const parsed = Number.parseInt(stored, 10);

			if (Number.isFinite(parsed) && parsed >= aiChatModalMinWidthPx) {
				setDrawerWidth(Math.min(parsed, window.innerWidth));
			}
		}
	}, []);

	const handleResizePointerDown = (
		event: PointerEvent<HTMLDivElement>
	): void => {
		if (isMobile) {
			return;
		}

		event.preventDefault();
		event.currentTarget.setPointerCapture(event.pointerId);
		document.body.style.cursor = "ew-resize";
		document.body.style.userSelect = "none";
		setIsResizing(true);
	};

	const handleResizePointerMove = (
		event: PointerEvent<HTMLDivElement>
	): void => {
		if (!isResizing) {
			return;
		}

		const viewportWidth = window.innerWidth;
		const computed = viewportWidth - event.clientX;
		const clamped = Math.min(
			viewportWidth,
			Math.max(aiChatModalMinWidthPx, computed)
		);

		setDrawerWidth(clamped);
	};

	const finishResize = (event: PointerEvent<HTMLDivElement>): void => {
		if (!isResizing) {
			return;
		}

		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}

		document.body.style.cursor = "";
		document.body.style.userSelect = "";
		setIsResizing(false);
		window.localStorage.setItem(
			aiChatModalWidthStorageKey,
			String(Math.round(drawerWidth))
		);
	};

	return {
		drawerWidth,
		finishResize,
		handleResizePointerDown,
		handleResizePointerMove,
		isResizing,
	};
};

export default useResizableDrawer;
