"use client";

import { useState, useCallback, useEffect, useRef, RefObject } from "react";

type UsePreviewResizeReturn = {
	editorWidthPercent: number;
	handlePreviewMouseDown: () => void;
};

const usePreviewResize = (
	containerRef: RefObject<HTMLDivElement | null>
): UsePreviewResizeReturn => {
	const [editorWidthPercent, setEditorWidthPercent] = useState(50);
	const [isDragging, setIsDragging] = useState(false);
	const isDraggingRef = useRef(false);

	const handlePreviewMouseDown = useCallback(() => {
		setIsDragging(true);
		isDraggingRef.current = true;
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	}, []);

	const handleMouseMove = useCallback(
		(event: MouseEvent) => {
			if (!isDraggingRef.current || !containerRef.current) return;

			const rect = containerRef.current.getBoundingClientRect();
			const mouseX = event.clientX - rect.left;
			const percent = (mouseX / rect.width) * 100;

			setEditorWidthPercent(Math.max(25, Math.min(75, percent)));
		},
		[containerRef]
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(false);
		isDraggingRef.current = false;
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
	}, []);

	useEffect(() => {
		if (isDragging) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);

			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};
		}

		return undefined;
	}, [isDragging, handleMouseMove, handleMouseUp]);

	return {
		editorWidthPercent,
		handlePreviewMouseDown,
	};
};

export default usePreviewResize;
