"use client";

import { MouseEvent, ReactElement, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* Components */
import AsideItem from "@/components/AsideItem/AsideItem";
import SignOut from "@/components/ui/icons/SignOut";

/* Lib */
import supabase from "@/lib/supabase/client";
import useMenuStore from "@/lib/store/menu";

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

/* Styles */
import styles from "./aside.module.css";

type AsideProps = {
	tags: TagItem[];
	onGetAll: () => void;
	onGetFavorites: () => void;
	onGetTrash: () => void;
	onTagClick: (tag: string) => void;
};

const Aside = ({
	tags,
	onGetFavorites,
	onGetAll,
	onGetTrash,
	onTagClick,
}: AsideProps): ReactElement => {
	const asideRef = useRef<HTMLDivElement | null>(null);
	const [activeMenu, setActiveMenu] = useState<MenuItemType>("all");
	const [isLoginOut, setIsLoginOut] = useState<boolean>(false);
	const mainMenuOpen = useMenuStore((state) => state.mainMenuOpen);
	const toggleSnippetList = useMenuStore((state) => state.toggleSnippetList);
	const toggleMainMenu = useMenuStore((state) => state.toggleMainMenu);
	const closeMainMenu = useMenuStore((state) => state.closeMainMenu);
	const closeSnippetList = useMenuStore((state) => state.closeSnippetList);

	const router = useRouter();

	const signOut = async (
		event: MouseEvent<HTMLAnchorElement>
	): Promise<void> => {
		setIsLoginOut(true);
		event.preventDefault();

		if (!isLoginOut) {
			const { error } = await supabase.auth.signOut();

			if (!error) {
				router.push("/login");
			}
		}

		setIsLoginOut(false);
	};

	const clickMenuHandler = (
		event: MouseEvent<HTMLAnchorElement>,
		type: MenuItemType
	): void => {
		event?.preventDefault();
		setActiveMenu(type);

		switch (type) {
			case "all":
				onGetAll();
				break;

			case "favorites":
				onGetFavorites();
				break;

			case "trash":
				onGetTrash();
				break;

			default:
				setActiveMenu("none");
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
		setActiveMenu(tag);
		onTagClick(tag);
	};

	useCloseOutsideCodeEditor(asideRef);

	return (
		<>
			<aside
				id="aside-menu"
				ref={asideRef}
				className={`${styles.container} ${mainMenuOpen ? styles.containerOpen : styles.containerClosed}`}
			>
				<section className={styles.section}>
					<a
						className={`${styles.linkItem} green-color ${activeMenu === "all" && styles.linkItemActive}`}
						onClick={(event: MouseEvent<HTMLAnchorElement>) =>
							clickMenuHandler(event, "all")
						}
					>
						<Book className={styles.icon} width={18} height={18} />
						All Snippets
					</a>

					<a
						className={`${styles.linkItem} yellow-color ${activeMenu === "favorites" && styles.linkItemActive}`}
						onClick={(event: MouseEvent<HTMLAnchorElement>) =>
							clickMenuHandler(event, "favorites")
						}
					>
						<Star className={styles.icon} width={18} height={18} />
						Favorites
					</a>

					<a
						className={`${styles.linkItem} red-color ${activeMenu === "trash" && styles.linkItemActive}`}
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
						<h2 className={`${styles.title} purple-color`}>
							<Bookmark className={styles.icon} width={18} height={18} />
							Tags
						</h2>

						<AsideItem
							active={activeMenu}
							items={tags}
							onItemClicked={handlerTagClick}
						/>
					</section>
				)}

				<section className={styles.section}>
					<a className={styles.settingsItems}>
						<img
							alt="user mask"
							className={styles.icon}
							src="/assets/images/avatars/frog.png"
							height="32"
						/>
						User
					</a>

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
