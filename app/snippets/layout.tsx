import styles from "./snippets.module.css";

export default function SnippetsLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return <main className={styles.main}>{children}</main>;
}
