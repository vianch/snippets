import type { Metadata } from "next";

import metaGenerator from "@/utils/meta.utils";

import styles from "./aiAssistant.module.css";

export const metadata: Metadata = metaGenerator({
	description:
		"AI Assistant workspace: chat about your snippets, refactor, or get explanations alongside the editor.",
	title: "AI Assistant",
	image: "/assets/images/jpg/ss.jpg",
	canonicalPath: "/ai-assistant",
});

export default function AiAssistantLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <main className={styles.main}>{children}</main>;
}
