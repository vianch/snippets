import { ReactElement } from "react";

/* Lib */
import { themeList, ThemeName } from "@/lib/config/themes";

/* Styles */
import styles from "./accountModal.module.css";

type ThemePreviewProps = {
	activeTheme?: string;
	onThemeChange: (themeName: ThemeName) => void;
};

const ThemePreview = ({
	activeTheme,
	onThemeChange,
}: ThemePreviewProps): ReactElement => {
	return (
		<div className={styles.themeGrid}>
			{themeList.map((themeConfig) => (
				<button
					key={themeConfig.name}
					type="button"
					className={`${styles.themeOption} ${
						activeTheme === themeConfig.name ? styles.themeOptionSelected : ""
					}`}
					onClick={() => onThemeChange(themeConfig.name)}
				>
					<div className={styles.themePreview}>
						<div
							className={styles.themePreviewSidebar}
							style={{
								backgroundColor: themeConfig.previewColors.sidebar,
							}}
						/>
						<div
							className={styles.themePreviewMain}
							style={{
								backgroundColor: themeConfig.previewColors.bg,
							}}
						>
							<div
								className={styles.themePreviewAccent}
								style={{
									backgroundColor: themeConfig.previewColors.accent,
								}}
							/>
							<div
								className={styles.themePreviewText}
								style={{
									backgroundColor: themeConfig.previewColors.text,
								}}
							/>
							<div
								className={styles.themePreviewText}
								style={{
									backgroundColor: themeConfig.previewColors.text,
									width: "60%",
								}}
							/>
						</div>
					</div>
					<span
						className={styles.themeName}
						style={{
							color:
								activeTheme === themeConfig.name
									? themeConfig.previewColors.accent
									: undefined,
						}}
					>
						{themeConfig.label}
					</span>
				</button>
			))}
		</div>
	);
};

export default ThemePreview;
