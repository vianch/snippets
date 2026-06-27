import { languageServer } from "@marimo-team/codemirror-languageserver";

import SupportedLanguages, { languageServerIds } from "@/lib/config/languages";
import { isClient } from "@/utils/ui.utils";

import type { Extension } from "@codemirror/state";

type LspExtensionOptions = {
	enabled: boolean;
	language: SupportedLanguages | string;
	snippetId: string;
};

const lspExtension = ({
	enabled,
	language,
	snippetId,
}: LspExtensionOptions): Extension => {
	const serverUri = process.env.NEXT_PUBLIC_LSP_SERVER_URI;
	const languageId = languageServerIds[language];

	if (!enabled || !serverUri || !languageId || !isClient()) {
		return [];
	}

	// ponytail: documentUri has no real file extension — a generic LSP ws-proxy
	// routes on the `languageId` sent at didOpen, not the path. Add a per-language
	// extension map here if a server (e.g. pyright) needs it for module resolution.
	const documentUri = `file:///snippet-${snippetId}`;

	return languageServer({
		documentUri,
		languageId,
		rootUri: "file:///",
		// serverUri is non-empty here; the library types it as a ws/wss template literal.
		serverUri: serverUri as `ws://${string}` | `wss://${string}`,
		workspaceFolders: null,
	});
};

export default lspExtension;
