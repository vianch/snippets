"use client";

import { ReactElement, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

/* Components */
import Book from "@/components/ui/icons/Book";
import DotsThreeVertical from "@/components/ui/icons/DotsThreeVertical";
import Loading from "@/components/ui/icons/Loading";
import SignOut from "@/components/ui/icons/SignOut";

/* Lib */
import { NotesMenuCloseKey } from "@/lib/constants/notes";
import { signOutUser } from "@/lib/supabase/userQueries";

/* Styles */
import styles from "./notesMenu.module.css";

const NotesMenu = (): ReactElement => {
	const router = useRouter();
	const menuContainerRef = useRef<HTMLDivElement | null>(null);
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

	const snippetsItemHandler = (): void => {
		setIsMenuOpen(false);
		router.push("/snippets");
	};

	const signOutItemHandler = async (): Promise<void> => {
		setIsSigningOut(true);

		const signOutError = await signOutUser();

		// Hard navigation so the proxy re-evaluates auth with the cleared session
		// cookies; a soft router.push can leave the stale page mounted.
		window.location.href = signOutError
			? "/login?error=logout_failed"
			: "/login";
	};

	useEffect(() => {
		if (!isMenuOpen) {
			return;
		}

		const closeOnOutsideClick = (event: MouseEvent): void => {
			const clickedNode = event.target;
			const isInsideMenu =
				clickedNode instanceof Node &&
				(menuContainerRef.current?.contains(clickedNode) ?? false);

			if (!isInsideMenu) {
				setIsMenuOpen(false);
			}
		};

		const closeOnEscape = (event: KeyboardEvent): void => {
			if (event.key === NotesMenuCloseKey) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("click", closeOnOutsideClick);
		document.addEventListener("keydown", closeOnEscape);

		return () => {
			document.removeEventListener("click", closeOnOutsideClick);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isMenuOpen]);

	return (
		<div className={styles.menuContainer} ref={menuContainerRef}>
			<button
				type="button"
				className={styles.trigger}
				aria-label="Notes menu"
				aria-haspopup="menu"
				aria-expanded={isMenuOpen}
				onClick={() => setIsMenuOpen((current) => !current)}
			>
				<DotsThreeVertical width={20} height={20} />
			</button>

			<div
				className={clsx(styles.menu, isMenuOpen && styles.menuOpen)}
				role="menu"
				aria-label="Notes"
				inert={!isMenuOpen}
			>
				<button
					type="button"
					className={styles.menuItem}
					role="menuitem"
					onClick={snippetsItemHandler}
				>
					<Book className={styles.menuIcon} width={16} height={16} />
					<span className={styles.menuLabel}>Snippets</span>
				</button>

				<div className={styles.menuSeparator} />

				<button
					type="button"
					className={clsx(styles.menuItem, styles.menuItemDanger)}
					role="menuitem"
					disabled={isSigningOut}
					onClick={signOutItemHandler}
				>
					{isSigningOut ? (
						<Loading className={styles.menuIcon} width={16} height={16} />
					) : (
						<SignOut className={styles.menuIcon} width={16} height={16} />
					)}
					<span className={styles.menuLabel}>Log out</span>
				</button>
			</div>
		</div>
	);
};

export default NotesMenu;
