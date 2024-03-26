import type { Metadata } from "next";

import metaGenerator from "@/utils/meta.utils";

import styles from "./snippets.module.css";

export const metadata: Metadata = metaGenerator({
	description:
		"Snippet dashboard for storing code snippets. Easily manage, retrieve, and thrive in coding.",
	title: "Snippet dashboard",
	image: "/assets/images/jpg/ss.jpg",
	canonicalPath: "/snippets",
});

export default function SnippetsLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return <main className={styles.main}>{children}</main>;
}
