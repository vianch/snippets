import { NextRequest, NextResponse } from "next/server";

import { openAiExcludedPrefixes } from "@/lib/constants/ai";
import { HttpStatusCode } from "@/lib/constants/ui.constants";
import createSupabaseServerClient from "@/lib/supabase/server";
import { isSafeRemoteUrl } from "@/utils/url.utils";

const defaultOllamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
const ollamaCloudUrl = "https://ollama.com";
const anthropicVersion = process.env.ANTHROPIC_VERSION || "2023-06-01";
const openAiBaseUrl = "https://api.openai.com/v1";

const fetchOllamaModels = async (
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

const fetchClaudeModels = async (apiKey: string): Promise<string[]> => {
	const response = await fetch("https://api.anthropic.com/v1/models", {
		headers: {
			"x-api-key": apiKey,
			"anthropic-version": anthropicVersion,
		},
	});

	if (!response.ok) {
		throw new Error("Failed to fetch Claude models");
	}

	const data = await response.json();

	return (data.data || []).map((model: { id: string }) => model.id);
};

const fetchOpenAiCompatibleModels = async (
	baseUrl: string,
	providerLabel: string,
	apiKey: string,
	excludedPrefixes: readonly string[] = []
): Promise<string[]> => {
	const response = await fetch(`${baseUrl}/models`, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));

		const rawMessage: string =
			errorData?.error?.message ||
			`${providerLabel} API error ${response.status}`;
		const trimmed = rawMessage
			.replace(/:\s+sk-\S+/, "")
			.replace(/:\s+nvapi-\S+/, "")
			.split(". ")[0]
			.trim();

		throw new Error(trimmed);
	}

	const data = await response.json();

	return (data.data || [])
		.map((model: { id: string }) => model.id)
		.filter(
			(id: string) => !excludedPrefixes.some((prefix) => id.startsWith(prefix))
		)
		.sort();
};

export const GET = async (request: NextRequest): Promise<NextResponse> => {
	const { supabase } = await createSupabaseServerClient(request);
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json(
			{ error: "Unauthorized" },
			{ status: HttpStatusCode.Unauthorized }
		);
	}

	const provider = request.nextUrl.searchParams.get("provider") || "ollama";
	const headerApiKey = request.headers.get("x-api-key") || "";

	if (provider === "claude") {
		const apiKey = headerApiKey || process.env.ANTHROPIC_API_KEY || "";

		if (!apiKey) {
			return NextResponse.json({ models: [] });
		}

		try {
			const models = await fetchClaudeModels(apiKey);

			return NextResponse.json({ models });
		} catch (fetchError) {
			const message =
				fetchError instanceof Error ? fetchError.message : "Unknown error";

			return NextResponse.json({ models: [], error: message });
		}
	}

	if (provider === "openai") {
		const apiKey = headerApiKey || process.env.OPENAI_API_KEY || "";

		if (!apiKey) {
			return NextResponse.json({ models: [] });
		}

		try {
			const models = await fetchOpenAiCompatibleModels(
				openAiBaseUrl,
				"OpenAI",
				apiKey,
				openAiExcludedPrefixes
			);

			return NextResponse.json({ models });
		} catch (fetchError) {
			const message =
				fetchError instanceof Error ? fetchError.message : "Unknown error";

			return NextResponse.json({ models: [], error: message });
		}
	}

	if (provider === "nvidia") {
		const nvidiaModel =
			process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct";

		return NextResponse.json({ models: [nvidiaModel] });
	}

	// Default: Ollama
	const requestedOllamaUrl = request.nextUrl.searchParams.get("ollama_url");

	if (requestedOllamaUrl && !isSafeRemoteUrl(requestedOllamaUrl)) {
		return NextResponse.json(
			{ models: [], error: "Invalid ollama_url" },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	const ollamaUrl = requestedOllamaUrl || defaultOllamaUrl;
	// Only attach the server's Ollama key when targeting the operator-configured
	// default. A user-supplied URL gets only a key the caller provided.
	const ollamaApiKey = requestedOllamaUrl
		? headerApiKey
		: headerApiKey || process.env.OLLAMA_API_KEY || "";

	try {
		const models = await fetchOllamaModels(ollamaUrl, ollamaApiKey);

		return NextResponse.json({ models });
	} catch (_error) {
		// Custom URL failed
	}

	if (ollamaApiKey && ollamaUrl !== ollamaCloudUrl) {
		try {
			const models = await fetchOllamaModels(ollamaCloudUrl, ollamaApiKey);

			return NextResponse.json({ models });
		} catch (_error) {
			// Ollama Cloud failed
		}
	}

	return NextResponse.json({ models: [] });
};
