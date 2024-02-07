import { ReactElement } from "react";

/* Components */
import AsideItem from "@/components/AsideItem/AsideItem";

/* Styles */
import styles from "./aside.module.css";

type MenuItems = {
	favorites: Item[];
	folders: Item[];
	tags: Item[];
};

type AsideProps = {
	menuItems: MenuItems;
};

const Aside = ({ menuItems }: AsideProps): ReactElement => {
	const { favorites, folders, tags } = menuItems || {};

	return (
		<aside className={styles.container}>
			<section className={styles.section}>
				<button className={styles.button}>New Snippet</button>
			</section>
			<section className={styles.section}>
				<h2 className={`${styles.title} green-color`}>
					<img
						alt="eye"
						className={styles.icon}
						src="/assets/images/icons/eye.png"
						height="16"
					/>
					Favorites
				</h2>

				<AsideItem items={favorites} iconType="star" />
			</section>

			<section className={styles.section}>
				<h2 className={`${styles.title} purple-color`}>
					<img
						alt="briefcase"
						className={styles.icon}
						src="/assets/images/icons/briefcase.png"
						height="16"
					/>
					Folders
				</h2>

				<AsideItem items={folders} iconType="folder" />
			</section>

			<section className={styles.section}>
				<h2 className={`${styles.title} yellow-color`}>
					<img
						alt="pencil"
						className={styles.icon}
						src="/assets/images/icons/pencil.png"
						height="16"
					/>
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
				<a className={styles.settingsItems}>
					<img
						alt="disk"
						className={styles.icon}
						src="/assets/images/icons/disk-board.png"
						height="32"
					/>
					Settings
				</a>
			</section>
		</aside>
	);
};

export default Aside;