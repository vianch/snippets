import type { MetadataRoute } from "next";

const manifest = (): MetadataRoute.Manifest => ({
	background_color: "#1e1e3f",
	categories: ["developer", "productivity", "utilities"],
	description:
		"Your sanctuary for organized code brilliance. Easily manage, retrieve, and thrive in coding.",
	display: "standalone",
	icons: [
		{
			purpose: "any",
			sizes: "192x192",
			src: "/icon-192.png",
			type: "image/png",
		},
		{
			purpose: "any",
			sizes: "512x512",
			src: "/icon-512.png",
			type: "image/png",
		},
		{
			purpose: "maskable",
			sizes: "512x512",
			src: "/icon-512-maskable.png",
			type: "image/png",
		},
	],
	id: "/",
	name: "Snippets",
	scope: "/",
	short_name: "Snippets",
	start_url: "/snippets",
	theme_color: "#2d2b55",
});

export default manifest;
