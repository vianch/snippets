import type { Metadata } from "next";

import metaGenerator from "@/utils/meta.utils";

export const metadata: Metadata = metaGenerator({
	description:
		"Privacy Policy for Snippet Storage Platform. This Privacy Policy describes how we collect, use, and handle your information when you use our snippet storage service.",
	title: "Snippet Privacy Policy",
	image: "/assets/images/jpg/ss.jpg",
	canonicalPath: "/privacy-policy",
});

export default function PrivacyPolicyLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return <main style={{ overflow: "hidden" }}>{children}</main>;
}
