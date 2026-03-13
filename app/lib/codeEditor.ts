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
import { go } from "@codemirror/lang-go";
import { cpp } from "@codemirror/lang-cpp";

import SupportedLanguages from "@/lib/config/languages";

const languageExtensions: LanguageExtensions = {
	[SupportedLanguages.Markdown]: markdown(),
	[SupportedLanguages.C]: cpp(),
	[SupportedLanguages.Cpp]: cpp(),
	[SupportedLanguages.CSS]: css(),
	[SupportedLanguages.Go]: go(),
	[SupportedLanguages.HTML]: html(),
	[SupportedLanguages.Java]: java(),
	[SupportedLanguages.JavaScript]: javascript({
		jsx: true,
		typescript: true,
	}),
	[SupportedLanguages.JSON]: json(),
	[SupportedLanguages.PHP]: php(),
	[SupportedLanguages.Python]: python(),
	[SupportedLanguages.Rust]: rust(),
	[SupportedLanguages.SQL]: sql(),
	[SupportedLanguages.YAML]: yaml(),
};

export default languageExtensions;
