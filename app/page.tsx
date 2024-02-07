import { ReactElement } from "react";

/* Components */
import Aside from "@/components/Aside/Aside";
import SnippetList from "@/components/SnippetList/SnippetList";

/* Lib */
import defaultMenuItems from "@/lib/config/aside";

/* Styles */

import styles from "./page.module.css";

export default function Home(): ReactElement {
	return (
		<main className={styles.main}>
			<Aside menuItems={defaultMenuItems} />

			<section className={styles.mainContent}>
				<SnippetList />
			</section>
		</main>
	);
}
