import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { sql } from "@codemirror/lang-sql";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";
import { rust } from "@codemirror/lang-rust";
import { php } from "@codemirror/lang-php";
import { json } from "@codemirror/lang-json";
import { java } from "@codemirror/lang-java";
import { yaml } from "@codemirror/lang-yaml";

import SupportedLanguages from "@/lib/config/languages";

const languageExtensions: LanguageExtensions = {
	[SupportedLanguages.JavaScript]: javascript({
		jsx: true,
		typescript: true,
	}),
	[SupportedLanguages.CSS]: css(),
	[SupportedLanguages.HTML]: html(),
	[SupportedLanguages.SQL]: sql(),
	[SupportedLanguages.Python]: python(),
	[SupportedLanguages.Markdown]: markdown(),
	[SupportedLanguages.Rust]: rust(),
	[SupportedLanguages.PHP]: php(),
	[SupportedLanguages.JSON]: json(),
	[SupportedLanguages.Java]: java(),
	[SupportedLanguages.YAML]: yaml(),
};

export default languageExtensions;
