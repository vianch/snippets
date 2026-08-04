import { ReactElement } from "react";

/* Lib */
import { fontList } from "@/lib/config/fonts";

/* Styles */
import styles from "./accountModal.module.css";

type FontPreviewProps = {
	activeFont?: string;
	onFontChange: (fontName: FontName) => void;
};

const FontPreview = ({
	activeFont,
	onFontChange,
}: FontPreviewProps): ReactElement => {
	return (
		<div className={styles.fontGrid}>
			{fontList.map((fontConfig) => (
				<button
					key={fontConfig.name}
					type="button"
					className={`${styles.fontOption} ${
						activeFont === fontConfig.name ? styles.fontOptionSelected : ""
					}`}
					onClick={() => onFontChange(fontConfig.name)}
				>
					<span
						className={styles.fontPreviewSample}
						style={{ fontFamily: `var(${fontConfig.cssVariable})` }}
					>
						Aa
					</span>
					<span
						className={styles.fontName}
						style={{ fontFamily: `var(${fontConfig.cssVariable})` }}
					>
						{fontConfig.label}
					</span>
				</button>
			))}
		</div>
	);
};

export default FontPreview;
