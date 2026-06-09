import type { Metadata, Viewport } from "next";
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
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister/ServiceWorkerRegister";
import Toasty from "@/components/ui/Toasty/Toasty";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	...metaGenerator({
		description:
			"Snippets, Your sanctuary for organized code brilliance. Easily manage, retrieve, and thrive in coding.",
		title: "Snippets",
		image: "/assets/images/jpg/ss.jpg",
		canonicalPath: "/",
	}),
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "Snippets",
	},
	icons: {
		apple: "/apple-touch-icon.png",
		icon: [
			{ sizes: "192x192", type: "image/png", url: "/icon-192.png" },
			{ sizes: "512x512", type: "image/png", url: "/icon-512.png" },
		],
	},
	manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
	initialScale: 1,
	maximumScale: 1,
	themeColor: "#2d2b55",
	userScalable: false,
	width: "device-width",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const theme = cookieStore.get(themeCookieName)?.value;

	return (
		<html lang="en" {...(theme ? { "data-theme": theme } : {})}>
			<body className={inter.className}>
				{children}
				<ServiceWorkerRegister />
				<Analytics />
				<Toasty />
			</body>
		</html>
	);
}
