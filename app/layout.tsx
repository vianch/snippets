import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";

/* Styles */
import "./globals.css";

/* Lib */
import { themeCookieName } from "@/lib/constants/cookies";

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

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const theme = cookieStore.get(themeCookieName)?.value;

	return (
		<html lang="en" {...(theme ? { "data-theme": theme } : {})}>
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
