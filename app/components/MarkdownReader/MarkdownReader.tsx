import { FC, ReactElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

/* Lib */
import SupportedLanguages from "@/lib/config/languages";

/* Styles */
import styles from "./markdownReader.module.css";

type MarkdownReaderProps = {
	snippet: Snippet | null;
};

const MarkdownReader: FC<MarkdownReaderProps> = ({
	snippet,
}: MarkdownReaderProps): ReactElement => {
	if (!snippet || snippet.language !== SupportedLanguages.Markdown) {
		return <></>;
	}

	return (
		<div className={styles.container}>
			<Markdown
				className={styles.markdown}
				remarkPlugins={[remarkGfm]}
				rehypePlugins={[rehypeRaw]}
			>
				{snippet.snippet}
			</Markdown>
		</div>
	);
};

export default MarkdownReader;
