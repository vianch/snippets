"use client";

import { MouseEvent, ReactElement, useState } from "react";
import { useRouter } from "next/navigation";

/* Components */
import AsideItem from "@/components/AsideItem/AsideItem";
import SignOut from "@/components/ui/icons/SignOut";

/* Lib */
import supabase from "@/lib/supabase/client";

/* Components */
import Trash from "@/components/ui/icons/Trash";
import Book from "@/components/ui/icons/Book";
import Bookmark from "@/components/ui/icons/Bookmark";
import Star from "@/components/ui/icons/Star";
import Loading from "@/components/ui/icons/Loading";

/* Styles */
import styles from "./aside.module.css";

type MenuItems = {
	tags: Item[];
};

type AsideProps = {
	menuItems: MenuItems;
	onGetAll: () => void;
	onGetFavorites: () => void;
	onGetTrash: () => void;
};

const Aside = ({
	menuItems,
	onGetFavorites,
	onGetAll,
	onGetTrash,
}: AsideProps): ReactElement => {
	const [activeMenu, setActiveMenu] = useState<MenuItemType>("all");
	const [isLoginOut, setIsLoginOut] = useState<boolean>(false);
	const { tags } = menuItems || {};
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
				break;
		}
	};

	return (
		<aside className={styles.container}>
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

			<section className={styles.section}>
				<h2 className={`${styles.title} purple-color`}>
					<Bookmark className={styles.icon} width={18} height={18} />
					Tags
				</h2>

				<AsideItem items={tags} iconType="tag" />
			</section>

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
	);
};

export default Aside;
