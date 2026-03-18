import { NextRequest, NextResponse } from "next/server";

const defaultOllamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";

export const GET = async (request: NextRequest): Promise<NextResponse> => {
	try {
		const ollamaUrl =
			request.nextUrl.searchParams.get("ollama_url") || defaultOllamaUrl;
		const response = await fetch(`${ollamaUrl}/api/tags`);

		if (!response.ok) {
			return NextResponse.json({ models: [] });
		}

		const data = await response.json();
		const modelNames = (data.models || []).map(
			(model: { name: string }) => model.name
		);

		return NextResponse.json({ models: modelNames });
	} catch (_error) {
		return NextResponse.json({ models: [] });
	}
};
