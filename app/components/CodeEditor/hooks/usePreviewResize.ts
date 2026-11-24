"use client";

import { useState, useCallback, useEffect, useRef, RefObject } from "react";

type UsePreviewResizeReturn = {
	editorWidthPercent: number;
	aiPanelWidthPercent: number;
	handleAiPanelMouseDown: () => void;
	handlePreviewMouseDown: () => void;
};

type ResizeTarget = "aiPanel" | "editor";

const usePreviewResize = (
	containerRef: RefObject<HTMLDivElement | null>
): UsePreviewResizeReturn => {
	const [editorWidthPercent, setEditorWidthPercent] = useState(50);
	const [aiPanelWidthPercent, setAiPanelWidthPercent] = useState(50);
	const [resizeTarget, setResizeTarget] = useState<ResizeTarget | null>(null);
	const resizeTargetRef = useRef<ResizeTarget | null>(null);

	const startResize = useCallback((target: ResizeTarget) => {
		setResizeTarget(target);
		resizeTargetRef.current = target;
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	}, []);
	const handlePreviewMouseDown = useCallback(() => {
		startResize("editor");
	}, [startResize]);
	const handleAiPanelMouseDown = useCallback(() => {
		startResize("aiPanel");
	}, [startResize]);

	const handleMouseMove = useCallback(
		(event: MouseEvent) => {
			if (!resizeTargetRef.current || !containerRef.current) {
				return;
			}

			const rect = containerRef.current.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;

			if (resizeTargetRef.current === "editor") {
				const percent = (mouseX / rect.width) * 100;

				setEditorWidthPercent(Math.max(25, Math.min(75, percent)));

				return;
			}

			const remainingWidth = rect.width * ((100 - editorWidthPercent) / 100);
			const percent = ((rect.width - mouseX) / remainingWidth) * 100;

			setAiPanelWidthPercent(Math.max(20, Math.min(80, percent)));
		},
		[containerRef, editorWidthPercent]
	);

	const handleMouseUp = useCallback(() => {
		setResizeTarget(null);
		resizeTargetRef.current = null;
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
	}, []);

	useEffect(() => {
		if (resizeTarget) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);

			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};
		}

		return undefined;
	}, [resizeTarget, handleMouseMove, handleMouseUp]);

	return {
		editorWidthPercent,
		aiPanelWidthPercent,
		handleAiPanelMouseDown,
		handlePreviewMouseDown,
	};
};

export default usePreviewResize;
