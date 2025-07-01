"use client";

import { ReactElement, useRef, useCallback, useEffect, useState } from "react";
import useViewPortStore from "@/lib/store/viewPort.store";
import styles from "./resizableLayout.module.css";

type ResizableLayoutProps = {
	aside: ReactElement;
	snippetList: ReactElement;
	codeEditor: ReactElement;
};

const ResizableLayout = ({
	aside,
	snippetList,
	codeEditor,
}: ResizableLayoutProps): ReactElement => {
	const isMobile = useViewPortStore((state) => state.isMobile);
	const containerRef = useRef<HTMLDivElement>(null);
	const [asideWidth, setAsideWidth] = useState(250);
	const [snippetListWidth, setSnippetListWidth] = useState(380);
	const [isDragging, setIsDragging] = useState<"aside" | "snippetList" | null>(
		null
	);

	const handleMouseDown = useCallback((resizer: "aside" | "snippetList") => {
		setIsDragging(resizer);
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
	}, []);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isDragging || !containerRef.current) return;

			const containerRect = containerRef.current.getBoundingClientRect();
			const mouseX = e.clientX - containerRect.left;

			if (isDragging === "aside") {
				const newWidth = Math.max(200, Math.min(400, mouseX));

				setAsideWidth(newWidth);
			} else if (isDragging === "snippetList") {
				const newWidth = Math.max(380, Math.min(600, mouseX - asideWidth));

				setSnippetListWidth(newWidth);
			}
		},
		[isDragging, asideWidth]
	);

	const handleMouseUp = useCallback(() => {
		setIsDragging(null);
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

	// For mobile, return the original layout without resize functionality
	if (isMobile) {
		return (
			<div className={styles.mobileContainer}>
				{aside}
				{snippetList}
				{codeEditor}
			</div>
		);
	}

	return (
		<div ref={containerRef} className={styles.container}>
			<div className={styles.panel} style={{ width: `${asideWidth}px` }}>
				{aside}
			</div>

			<div
				className={styles.resizer}
				onMouseDown={() => handleMouseDown("aside")}
			/>

			<div className={styles.panel} style={{ width: `${snippetListWidth}px` }}>
				{snippetList}
			</div>

			<div
				className={styles.resizer}
				onMouseDown={() => handleMouseDown("snippetList")}
			/>

			<div className={styles.panel} style={{ flex: 1 }}>
				{codeEditor}
			</div>
		</div>
	);
};

export default ResizableLayout;
