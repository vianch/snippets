import { ReactElement, RefObject } from "react";

/* Lib */
import { themeList } from "@/lib/config/themes";
import {
	defaultCodeWindowBackground,
	paddingPresets,
	SnapshotOptions,
} from "@/lib/constants/screenshot";

/* Styles */
import styles from "./snapshotCard.module.css";

type SnapshotCardProps = {
	cardRef: RefObject<HTMLDivElement | null>;
	highlightedCode: string;
	options: SnapshotOptions;
	snippetName: string;
};

const SnapshotCard = ({
	cardRef,
	highlightedCode,
	options,
	snippetName,
}: SnapshotCardProps): ReactElement => {
	const themeConfig = themeList.find((theme) => theme.name === options.theme);
	const codeWindowBackground =
		themeConfig?.previewColors.bg ?? defaultCodeWindowBackground;

	return (
		<div
			ref={cardRef}
			className={styles.cardWrapper}
			style={{
				background: options.background,
				padding: paddingPresets[options.padding],
			}}
		>
			<div
				className={styles.codeWindow}
				style={{ backgroundColor: codeWindowBackground }}
			>
				{options.showWindowChrome && (
					<div className={styles.windowChrome}>
						<div className={`${styles.dot} ${styles.dotRed}`} />
						<div className={`${styles.dot} ${styles.dotYellow}`} />
						<div className={`${styles.dot} ${styles.dotGreen}`} />

						<span className={styles.windowTitle}>{snippetName}</span>
					</div>
				)}

				<div
					className={styles.codeOutput}
					style={{ fontFamily: `"${options.fontFamily}", monospace` }}
					dangerouslySetInnerHTML={{ __html: highlightedCode }}
				/>
			</div>
		</div>
	);
};

export default SnapshotCard;
