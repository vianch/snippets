import { NextRequest, NextResponse } from "next/server";

const defaultOllamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
const ollamaCloudUrl = "https://ollama.com";

const fetchModels = async (
	baseUrl: string,
	apiKey?: string
): Promise<string[]> => {
	const headers: Record<string, string> = {};

	if (apiKey) {
		headers["Authorization"] = `Bearer ${apiKey}`;
	}

	const response = await fetch(`${baseUrl}/api/tags`, { headers });

	if (!response.ok) {
		throw new Error(`Failed to fetch models from ${baseUrl}`);
	}

	const data = await response.json();

	return (data.models || []).map((model: { name: string }) => model.name);
};

export const GET = async (request: NextRequest): Promise<NextResponse> => {
	const ollamaUrl =
		request.nextUrl.searchParams.get("ollama_url") || defaultOllamaUrl;
	const ollamaApiKey =
		request.nextUrl.searchParams.get("ollama_api_key") ||
		process.env.OLLAMA_API_KEY ||
		"";

	// Try custom URL first
	try {
		const models = await fetchModels(ollamaUrl, ollamaApiKey);

		return NextResponse.json({ models });
	} catch (_error) {
		// Custom URL failed
	}

	// Try Ollama Cloud as fallback
	if (ollamaApiKey && ollamaUrl !== ollamaCloudUrl) {
		try {
			const models = await fetchModels(ollamaCloudUrl, ollamaApiKey);

			return NextResponse.json({ models });
		} catch (_error) {
			// Ollama Cloud failed
		}
	}

	return NextResponse.json({ models: [] });
};
