"use client";

import { MouseEvent, ReactElement, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* Constants */
import { MenuItems } from "@/lib/constants/core";

/* Components */
import AsideItem from "@/components/AsideItem/AsideItem";
import SignOut from "@/components/ui/icons/SignOut";

/* Lib */
import supabase from "@/lib/supabase/client";
import useMenuStore from "@/lib/store/menu.store";

/* Utils */
import { useCloseOutsideCodeEditor } from "@/utils/ui.utils";

/* Components */
import Trash from "@/components/ui/icons/Trash";
import Book from "@/components/ui/icons/Book";
import Bookmark from "@/components/ui/icons/Bookmark";
import Star from "@/components/ui/icons/Star";
import Loading from "@/components/ui/icons/Loading";
import List from "@/components/ui/icons/List";
import Rows from "@/components/ui/icons/Rows";
import CaretDown from "@/components/ui/icons/CaretDown";

/* Styles */
import { getUserEmailBySession } from "@/lib/supabase/queries";
import styles from "./aside.module.css";

type AsideProps = {
	codeEditorStates: SnippetEditorStates;
	tags: TagItem[];
	onGetAll: () => void;
	onGetFavorites: () => void;
	onGetTrash: () => void;
	onTagClick: (tag: string) => void;
};

const Aside = ({
	codeEditorStates,
	tags,
	onGetFavorites,
	onGetAll,
	onGetTrash,
	onTagClick,
}: AsideProps): ReactElement => {
	const [userName, setUserName] = useState<string | undefined | null>("");
	const asideRef = useRef<HTMLDivElement | null>(null);
	const [isLoginOut, setIsLoginOut] = useState<boolean>(false);
	const [isTagsExpanded, setIsTagsExpanded] = useState<boolean>(false);
	const mainMenuOpen = useMenuStore((state) => state.mainMenuOpen);
	const toggleSnippetList = useMenuStore((state) => state.toggleSnippetList);
	const toggleMainMenu = useMenuStore((state) => state.toggleMainMenu);
	const closeMainMenu = useMenuStore((state) => state.closeMainMenu);
	const closeSnippetList = useMenuStore((state) => state.closeSnippetList);
	const { menuType } = codeEditorStates;
	const router = useRouter();

	const signOut = async (
		event: MouseEvent<HTMLAnchorElement>
	): Promise<void> => {
		setIsLoginOut(true);
		event.preventDefault();
		const { error } = await supabase.auth.signOut();

		if (!error) {
			router.push("/login");
		} else {
			router.push("/login?error=logout_failed");
		}

		setIsLoginOut(false);
	};

	const clickMenuHandler = (
		event: MouseEvent<HTMLAnchorElement>,
		type: MenuItemType
	): void => {
		event?.preventDefault();

		switch (type) {
			case MenuItems.All:
				onGetAll();
				break;

			case MenuItems.Favorites:
				onGetFavorites();
				break;

			case MenuItems.Trash:
				onGetTrash();
				break;

			default:
				break;
		}
	};

	const handlerMobileOpenSnippetList = (): void => {
		closeMainMenu();
		toggleSnippetList();
	};

	const handlerMobileOpenMainMenu = (): void => {
		closeSnippetList();
		toggleMainMenu();
	};

	const handlerTagClick = (tag: string): void => {
		onTagClick(tag);
	};

	const toggleTagsExpansion = (): void => {
		setIsTagsExpanded(!isTagsExpanded);
	};

	useEffect(() => {
		getUserEmailBySession().then((email) => {
			if (email) {
				const username = email.split("@")[0];

				setUserName(username);
			}
		});
	}, []);

	useCloseOutsideCodeEditor(asideRef);

	return (
		<>
			<aside
				id="aside-menu"
				ref={asideRef}
				className={`${styles.container} ${mainMenuOpen ? styles.containerOpen : styles.containerClosed}`}
			>
				<section className={styles.section}>
					<div
						className={`${styles.settingsItems} ${styles.mail} ${!userName && styles.mailLoading}`}
					>
						{userName && (
							<img
								alt="user mask"
								className={styles.icon}
								src="/assets/images/avatars/frog.png"
								height="32"
							/>
						)}
						{userName}
					</div>
				</section>

				<section className={styles.section}>
					<a
						className={`${styles.linkItem} green-color ${(menuType === MenuItems.All || menuType === MenuItems.None || !menuType || menuType?.length === 0) && styles.linkItemActive}`}
						onClick={(event: MouseEvent<HTMLAnchorElement>) =>
							clickMenuHandler(event, "all")
						}
					>
						<Book className={styles.icon} width={18} height={18} />
						All Snippets
					</a>

					<a
						className={`${styles.linkItem} yellow-color ${menuType === MenuItems.Favorites && styles.linkItemActive}`}
						onClick={(event: MouseEvent<HTMLAnchorElement>) =>
							clickMenuHandler(event, "favorites")
						}
					>
						<Star className={styles.icon} width={18} height={18} />
						Favorites
					</a>

					<a
						className={`${styles.linkItem} red-color ${menuType === MenuItems.Trash && styles.linkItemActive}`}
						onClick={(event: MouseEvent<HTMLAnchorElement>) =>
							clickMenuHandler(event, "trash")
						}
					>
						<Trash className={styles.icon} height={18} width={18} />
						Trash
					</a>
				</section>

				{tags?.length > 0 && (
					<section className={styles.section}>
						<h2
							className={`${styles.title} purple-color ${styles.titleClickable}`}
							onClick={toggleTagsExpansion}
						>
							<Bookmark className={styles.icon} width={18} height={18} />
							Tags
							<CaretDown
								className={`${styles.caretIcon} ${isTagsExpanded ? styles.caretExpanded : styles.caretCollapsed}`}
								width={12}
								height={12}
							/>
						</h2>

						{isTagsExpanded && (
							<AsideItem
								active={menuType}
								items={tags}
								onItemClicked={handlerTagClick}
							/>
						)}
					</section>
				)}

				<section className={styles.section}>
					<a className={styles.settingsItems} onClick={signOut}>
						{isLoginOut ? (
							<Loading className={styles.signOutIcon} width={24} height={24} />
						) : (
							<SignOut className={styles.signOutIcon} width={24} height={24} />
						)}
						Log out
					</a>
				</section>
			</aside>

			<aside className={styles.mobileMenuContainer}>
				<ul className={styles.mobileItemList}>
					<li id="mobile-icon-main-menu" onClick={handlerMobileOpenMainMenu}>
						<List className={styles.mobileIcon} />
					</li>
					<li id="mobile-icon-open-list" onClick={handlerMobileOpenSnippetList}>
						<Rows className={styles.mobileIcon} />
					</li>
				</ul>
			</aside>
		</>
	);
};

export default Aside;
