import { Metadata } from "next";

const metaGenerator = ({
	title = "Snippets",
	image = null,
	description = "Snippets of code for development",
	canonicalPath = "/",
}: {
	canonicalPath: string;
	title: string;
	description: string;
	image: string | null;
}): Metadata => {
	const openGraphImage = image && image?.length > 0 ? { images: [image] } : {};

	return {
		metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? ""),
		title,
		description,
		openGraph: {
			...openGraphImage,
			title,
			description,
			url: canonicalPath,
		},
		twitter: {
			card: "summary",
			site: "@site",
			title,
			description,
			...openGraphImage,
		},
		robots: { canonical: canonicalPath },
	} as Metadata;
};

export default metaGenerator;
