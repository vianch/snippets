import { ReactElement } from "react";

/* Components */
import Aside from "@/components/Aside/Aside";
import SnippetList from "@/components/SnippetList/SnippetList";
import CodeEditor from "@/components/CodeEditor/CodeEditor";

/* Lib */
import defaultMenuItems from "@/lib/config/aside";
import snippetListFixture from "@/lib/fixtures/snippetList";

/* Styles */
import styles from "./snippets.module.css";

export default function Page(): ReactElement {
	return (
		<>
			<Aside menuItems={defaultMenuItems} />

			<section className={styles.mainContent}>
				<SnippetList snippets={snippetListFixture} />
				<CodeEditor snippet={snippetListFixture[0]} />
			</section>
		</>
	);
}
