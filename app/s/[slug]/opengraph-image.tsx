import { ImageResponse } from "next/og";

import { getPublicSnippetBySlug } from "@/lib/supabase/public";

export const alt = "Snippet preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
	params: Promise<{ slug: string }>;
};

const previewLines = 8;
const previewLineMaxLength = 70;

const buildCodePreview = (code: string): string =>
	code
		.split("\n")
		.slice(0, previewLines)
		.map((line) =>
			line.length > previewLineMaxLength
				? `${line.slice(0, previewLineMaxLength)}…`
				: line
		)
		.join("\n");

export default async function Image({ params }: Props): Promise<ImageResponse> {
	const { slug } = await params;
	const snippet = await getPublicSnippetBySlug(slug);

	if (!snippet) {
		return new ImageResponse(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#1e1e2e",
					color: "#cdd6f4",
					fontSize: 56,
					fontFamily: "sans-serif",
				}}
			>
				Snippet not found
			</div>,
			size
		);
	}

	const preview = buildCodePreview(snippet.snippet);

	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				background: "linear-gradient(135deg, #1e1e2e 0%, #313244 100%)",
				color: "#cdd6f4",
				padding: 64,
				fontFamily: "sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: 24,
				}}
			>
				<div
					style={{
						fontSize: 56,
						fontWeight: 700,
						color: "#ffffff",
						display: "flex",
						maxWidth: 900,
						overflow: "hidden",
					}}
				>
					{snippet.name.slice(0, 60)}
				</div>
				<div
					style={{
						fontSize: 22,
						color: "#1e1e2e",
						background: "#89b4fa",
						padding: "8px 18px",
						borderRadius: 999,
						display: "flex",
						fontWeight: 600,
					}}
				>
					{snippet.language}
				</div>
			</div>

			<div
				style={{
					flex: 1,
					background: "rgba(0, 0, 0, 0.45)",
					borderRadius: 18,
					padding: 36,
					fontSize: 26,
					lineHeight: 1.45,
					color: "#a6e3a1",
					fontFamily: "monospace",
					whiteSpace: "pre",
					overflow: "hidden",
					display: "flex",
				}}
			>
				{preview}
			</div>

			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginTop: 28,
					fontSize: 22,
					color: "#7f849c",
				}}
			>
				<div style={{ display: "flex" }}>snippets.vianch.com</div>
				<div style={{ display: "flex" }}>/s/{slug}</div>
			</div>
		</div>,
		size
	);
}
