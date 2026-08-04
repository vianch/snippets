import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import {
	Aleo,
	Google_Sans_Code,
	Google_Sans_Flex,
	Inconsolata,
	Inter,
	Montserrat,
	Open_Sans,
	Raleway,
	Source_Code_Pro,
	Source_Sans_3,
} from "next/font/google";
import { cookies } from "next/headers";

/* Styles */
import "./globals.css";

/* Lib */
import { fontCookieName, themeCookieName } from "@/lib/constants/cookies";

/* Utils */
import metaGenerator from "@/utils/meta.utils";

/* Components */
import Toasty from "@/components/ui/Toasty/Toasty";

// next/font has no capsize metrics for the Google Sans faces yet, so its
// automatic size-adjusted fallback can't be generated. Opt out explicitly and
// name the fallback stack ourselves instead of letting it warn on every render.
const googleSansFlex = Google_Sans_Flex({
	adjustFontFallback: false,
	display: "swap",
	fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
	subsets: ["latin"],
	variable: "--font-google-sans-flex",
});
const googleSansCode = Google_Sans_Code({
	adjustFontFallback: false,
	display: "swap",
	fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
	subsets: ["latin"],
	variable: "--font-google-sans-code",
});
const sourceCodePro = Source_Code_Pro({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-source-code-pro",
});
const montserrat = Montserrat({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-montserrat",
});
const aleo = Aleo({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-aleo",
});
const openSans = Open_Sans({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-open-sans",
});
const sourceSans3 = Source_Sans_3({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-source-sans-3",
});
const raleway = Raleway({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-raleway",
});
const inconsolata = Inconsolata({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inconsolata",
});
// The app's font before the typography selector existed. Kept loaded so it can
// stay the last real family in every --app-font chain.
const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

// These classes go on <html>, not <body>: --app-font is declared on :root and
// its nested var() is substituted in the scope where it is declared, so the
// per-font variables have to exist on that same element or the whole
// font-family resolves to an invalid value.
const fontVariables = [
	inter.variable,
	googleSansFlex.variable,
	googleSansCode.variable,
	sourceCodePro.variable,
	montserrat.variable,
	aleo.variable,
	openSans.variable,
	sourceSans3.variable,
	raleway.variable,
	inconsolata.variable,
].join(" ");

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
	const font = cookieStore.get(fontCookieName)?.value;

	return (
		<html
			className={fontVariables}
			lang="en"
			{...(theme ? { "data-theme": theme } : {})}
			{...(font ? { "data-font": font } : {})}
		>
			<head>
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
				/>
			</head>
			<body>
				{children}
				<Analytics />
				<Toasty />
			</body>
		</html>
	);
}
