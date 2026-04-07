"use client";

import { ReactElement, useRef, useCallback, useEffect, useState } from "react";
import useViewPortStore from "@/lib/store/viewPort.store";
import CaretDown from "@/components/ui/icons/CaretDown";
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
	const [isAsideCollapsed, setIsAsideCollapsed] = useState<boolean>(() => {
		if (typeof window === "undefined") return false;

		return localStorage.getItem("aside-collapsed") === "true";
	});
	const [lastAsideWidth, setLastAsideWidth] = useState(250);

	const toggleAside = (): void => {
		if (isAsideCollapsed) {
			setIsAsideCollapsed(false);
			setAsideWidth(lastAsideWidth);
		} else {
			setLastAsideWidth(asideWidth);
			setIsAsideCollapsed(true);
			setAsideWidth(0);
		}
	};

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
				const newWidth = Math.max(0, Math.min(400, mouseX));

				setAsideWidth(newWidth);
			} else if (isDragging === "snippetList") {
				const newWidth = Math.max(380, Math.min(600, mouseX - asideWidth));

				setSnippetListWidth(newWidth);
			}
		},
		[isDragging, asideWidth]
	);

	const handleMouseUp = useCallback(() => {
		if (isDragging === "aside") {
			if (asideWidth < 50) {
				setLastAsideWidth(lastAsideWidth > 50 ? lastAsideWidth : 250);
				setIsAsideCollapsed(true);
				setAsideWidth(0);
			} else {
				setLastAsideWidth(asideWidth);
			}
		}

		setIsDragging(null);
		document.body.style.cursor = "";
		document.body.style.userSelect = "";
	}, [isDragging, asideWidth, lastAsideWidth]);

	useEffect(() => {
		localStorage.setItem("aside-collapsed", String(isAsideCollapsed));
	}, [isAsideCollapsed]);

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
			<div
				className={`${styles.asideWrapper} ${isDragging !== "aside" ? styles.asideWrapperAnimated : ""}`}
				style={{ width: `${isAsideCollapsed ? 0 : asideWidth}px` }}
			>
				<div className={styles.asideContent}>{aside}</div>

				<button
					type="button"
					title={isAsideCollapsed ? "Show sidebar" : "Hide sidebar"}
					className={styles.asideToggleButton}
					aria-label={isAsideCollapsed ? "Show sidebar" : "Hide sidebar"}
					onClick={toggleAside}
				>
					<CaretDown
						className={
							isAsideCollapsed ? styles.caretExpand : styles.caretCollapse
						}
						width={12}
						height={12}
					/>
				</button>
			</div>

			<div
				className={`${styles.resizer} ${isAsideCollapsed ? styles.resizerHidden : ""}`}
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
