"use client";

import { ReactElement, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* Components */
import DotsThreeVertical from "@/components/ui/icons/DotsThreeVertical";

/* Styles */
import styles from "./menu.module.css";

type MenuProps = {
	ariaLabel?: string;
	items: MenuItem[];
};

// Kebab (⋮) overflow menu. The dropdown is portaled to the body and positioned
// next to the trigger so it never clips inside scrollable containers (tables).
const Menu = ({
	ariaLabel = "More options",
	items,
}: MenuProps): ReactElement => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [coords, setCoords] = useState<{ left: number; top: number }>({
		left: 0,
		top: 0,
	});
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const menuRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		const handlePointer = (event: MouseEvent): void => {
			// event.target is an EventTarget; narrow to Node for contains().
			const target = event.target as Node;

			if (
				!menuRef.current?.contains(target) &&
				!triggerRef.current?.contains(target)
			) {
				setIsOpen(false);
			}
		};
		const handleKey = (event: KeyboardEvent): void => {
			if (event.key === "Escape") {
				setIsOpen(false);
			}
		};
		const handleScroll = (): void => setIsOpen(false);

		document.addEventListener("mousedown", handlePointer);
		document.addEventListener("keydown", handleKey);
		window.addEventListener("scroll", handleScroll, true);

		return () => {
			document.removeEventListener("mousedown", handlePointer);
			document.removeEventListener("keydown", handleKey);
			window.removeEventListener("scroll", handleScroll, true);
		};
	}, [isOpen]);

	const toggleMenu = (): void => {
		const trigger = triggerRef.current;

		if (!trigger) {
			return;
		}

		const rect = trigger.getBoundingClientRect();

		setCoords({ left: rect.right, top: rect.bottom + 4 });
		setIsOpen((current) => !current);
	};

	const handleSelect = (item: MenuItem): void => {
		if (item.disabled) {
			return;
		}

		setIsOpen(false);
		item.onSelect();
	};

	return (
		<div className={styles.container}>
			<button
				ref={triggerRef}
				type="button"
				className={styles.trigger}
				aria-label={ariaLabel}
				aria-haspopup="menu"
				aria-expanded={isOpen}
				onClick={toggleMenu}
			>
				<DotsThreeVertical width={18} height={18} />
			</button>

			{isOpen &&
				createPortal(
					<div
						ref={menuRef}
						className={styles.menu}
						role="menu"
						style={{ left: coords.left, top: coords.top }}
					>
						{items.map((item) => (
							<button
								key={item.label}
								type="button"
								role="menuitem"
								disabled={item.disabled}
								className={`${styles.item} ${item.danger ? styles.danger : ""}`}
								onClick={() => handleSelect(item)}
							>
								{item.icon && (
									<span className={styles.itemIcon}>{item.icon}</span>
								)}
								<span className={styles.itemLabel}>{item.label}</span>
							</button>
						))}
					</div>,
					document.body
				)}
		</div>
	);
};

export default Menu;
