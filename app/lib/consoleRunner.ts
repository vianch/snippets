import SupportedLanguages from "@/lib/config/languages";

export const prepareConsoleCode = async (
	code: string,
	language: SupportedLanguages
): Promise<string> => {
	if (language !== SupportedLanguages.TypeScript) {
		return code;
	}

	// ponytail: transpile with the already-installed typescript package,
	// lazy-loaded so it only downloads when a TypeScript snippet is run; swap
	// for a small transpiler (sucrase / esbuild-wasm) if chunk size matters.
	const typescriptModule = await import("typescript");

	const output = typescriptModule.transpileModule(code, {
		compilerOptions: {
			module: typescriptModule.ModuleKind.None,
			target: typescriptModule.ScriptTarget.ES2022,
		},
	});

	return output.outputText;
};
