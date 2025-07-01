import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";

/* Styles */
import "./globals.css";

/* Utils */
import metaGenerator from "@/utils/meta.utils";

/* Components */
import Toasty from "@/components/ui/Toasty/Toasty";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = metaGenerator({
	description:
		"Snippets, Your sanctuary for organized code brilliance. Easily manage, retrieve, and thrive in coding.",
	title: "Snippets",
	image: "/assets/images/jpg/ss.jpg",
	canonicalPath: "/",
});

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<head>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
				/>
			</head>
			<body className={inter.className}>
				{children}
				<Analytics />
				<Toasty />
			</body>
		</html>
	);
}
