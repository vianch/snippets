"use client";

import { ReactElement, useEffect, useState } from "react";

/* Components */
import Aside from "@/components/Aside/Aside";
import SnippetList from "@/components/SnippetList/SnippetList";
import CodeEditor from "@/components/CodeEditor/CodeEditor";

/* Lib */
import defaultMenuItems from "@/lib/config/aside";
import supabase from "@/lib/supabase/client";

/* Styles */

import styles from "./snippets.module.css";

export default function Page(): ReactElement {
	const [snippets, setSnippets] = useState<Snippet[]>([]);

	const getSnippets = async (): Promise<void> => {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (user?.id) {
			const { data } = await supabase
				.from("snippet")
				.select()
				.eq("user_id", user.id);

			setSnippets(data as Snippet[]);
		}
	};

	useEffect(() => {
		if (supabase) {
			getSnippets().then(() => null);
		}
	}, []);

	return (
		<>
			<Aside menuItems={defaultMenuItems} />

			<section className={styles.mainContent}>
				<SnippetList snippets={snippets} />
				{snippets?.length > 0 && <CodeEditor snippet={snippets[0]} />}
			</section>
		</>
	);
}
