"use client";

import { ReactElement, useEffect, useState } from "react";

/* Components */
import Aside from "@/components/Aside/Aside";
import SnippetList from "@/components/SnippetList/SnippetList";
import CodeEditor from "@/components/CodeEditor/CodeEditor";

/* Lib */
import defaultMenuItems from "@/lib/config/aside";
import { getAllSnippets } from "@/lib/supabase/queries";

/* Styles */

import styles from "./snippets.module.css";

export default function Page(): ReactElement {
	const [snippets, setSnippets] = useState<Snippet[]>([]);

	const getSnippets = async (): Promise<void> => {
		const data = await getAllSnippets();

		setSnippets(data);
	};

	useEffect(() => {
		getSnippets().then(() => null);
	}, []);

	return (
		<>
			<Aside menuItems={defaultMenuItems} />

			<section className={styles.mainContent}>
				<SnippetList snippets={snippets} />
				<CodeEditor
					snippet={snippets?.length > 0 ? snippets[0] : null}
					onSave={getSnippets}
				/>
			</section>
		</>
	);
}
