import type { Metadata } from "next";

import metaGenerator from "@/utils/meta.utils";

export const metadata: Metadata = metaGenerator({
	description:
		"Terms and Conditions of Demo Platform for Snippet Storage. By accessing or using the demo platform for snippet storage, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use the service.",
	title: "Snippet Terms and conditions",
	image: "/assets/images/jpg/ss.jpg",
	canonicalPath: "/terms",
});

export default function TermsLayout({
	children, // will be a page or nested layout
}: {
	children: React.ReactNode;
}) {
	return <main style={{ overflow: "hidden" }}>{children}</main>;
}
