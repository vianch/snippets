"use client";

import { MouseEvent, ReactElement } from "react";
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
import Tray from "@/components/ui/icons/Tray";
import Start from "@/components/ui/icons/Start";

/* Styles */
import styles from "./aside.module.css";

type MenuItems = {
	folders: Item[];
	tags: Item[];
};

type AsideProps = {
	menuItems: MenuItems;
	menuType: MenuItemType;
	onGetAll: () => void;
	onTrash: () => void;
};

const Aside = ({
	menuItems,
	menuType,
	onGetAll,
	onTrash,
}: AsideProps): ReactElement => {
	const { folders, tags } = menuItems || {};
	const router = useRouter();

	const signOut = async (
		event: MouseEvent<HTMLAnchorElement>
	): Promise<void> => {
		event.preventDefault();
		const { error } = await supabase.auth.signOut();

		if (!error) {
			router.push("/");
		}
	};

	return (
		<aside className={styles.container}>
			<section className={styles.section}>
				<a
					className={`${styles.linkItem} green-color ${menuType === "all" && styles.linkItemActive}`}
					onClick={onGetAll}
				>
					<Book className={styles.icon} width={18} height={18} />
					All Snippets
				</a>

				<a
					className={`${styles.linkItem} yellow-color ${menuType === "favorites" && styles.linkItemActive}`}
					onClick={onGetAll}
				>
					<Start className={styles.icon} width={18} height={18} />
					Favorites
				</a>

				<a
					className={`${styles.linkItem} red-color ${menuType === "trash" && styles.linkItemActive}`}
					onClick={onTrash}
				>
					<Trash className={styles.icon} height={18} width={18} />
					Trash
				</a>
			</section>

			<section className={styles.section}>
				<h2 className={`${styles.title} purple-color`}>
					<Tray className={styles.icon} width={18} height={18} />
					Folders
				</h2>

				<AsideItem items={folders} iconType="folder" />
			</section>

			<section className={styles.section}>
				<h2 className={`${styles.title} orange-color`}>
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
					<SignOut className={styles.signOutIcon} width={24} height={24} />
					Log out
				</a>
			</section>
		</aside>
	);
};

export default Aside;
