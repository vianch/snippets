import type { Metadata } from "next";

import metaGenerator from "@/utils/meta.utils";

export const metadata: Metadata = metaGenerator({
	description: "Stickies notes for snippets.",
	title: "Sticky notes board",
	image: "/assets/images/jpg/ss.jpg",
	canonicalPath: "/notes",
});

export default function NotesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <main>{children}</main>;
}
