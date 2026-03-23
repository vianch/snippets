import { ReactElement } from "react";

/* Components */
import Select from "@/components/ui/Select/Select";

/* Lib */
import { themeList } from "@/lib/config/themes";
import {
	backgroundPresets,
	fontOptions,
	SnapshotOptions,
} from "@/lib/constants/screenshot";

/* Styles */
import styles from "./snapshotControls.module.css";

type SnapshotControlsProps = {
	onOptionsChange: (next: SnapshotOptions) => void;
	options: SnapshotOptions;
};

const paddingLabels: Record<SnapshotPadding, string> = {
	lg: "L",
	md: "M",
	sm: "S",
	xl: "XL",
};

const paddingValues: SnapshotPadding[] = ["sm", "md", "lg", "xl"];

const themeLabels = themeList.map((theme) => theme.label);
const fontLabels = fontOptions.map((font) => font.label);

const SnapshotControls = ({
	onOptionsChange,
	options,
}: SnapshotControlsProps): ReactElement => {
	const selectedThemeLabel =
		themeList.find((theme) => theme.name === options.theme)?.label ??
		themeList[0].label;

	const selectedFontLabel =
		fontOptions.find((font) => font.value === options.fontFamily)?.label ??
		fontOptions[0].label;

	const handleThemeChange = (label: string): void => {
		const selected = themeList.find((theme) => theme.label === label);

		if (selected) {
			onOptionsChange({ ...options, theme: selected.name });
		}
	};

	const handleFontChange = (label: string): void => {
		const selected = fontOptions.find((font) => font.label === label);

		if (selected) {
			onOptionsChange({ ...options, fontFamily: selected.value });
		}
	};

	const handlePaddingChange = (padding: SnapshotPadding): void => {
		onOptionsChange({ ...options, padding });
	};

	const handleBackgroundChange = (value: string): void => {
		onOptionsChange({ ...options, background: value });
	};

	const handleChromeToggle = (): void => {
		onOptionsChange({
			...options,
			showWindowChrome: !options.showWindowChrome,
		});
	};

	return (
		<div className={styles.controls}>
			<div className={styles.section}>
				<span className={styles.sectionLabel}>Background</span>

				<div className={styles.swatchGrid}>
					{backgroundPresets.map((preset) => (
						<button
							aria-label={preset.label}
							className={`${styles.swatch} ${options.background === preset.value ? styles.swatchActive : ""}`}
							key={preset.label}
							style={{ background: preset.value }}
							title={preset.label}
							type="button"
							onClick={() => handleBackgroundChange(preset.value)}
						/>
					))}
				</div>
			</div>

			<div className={styles.section}>
				<span className={styles.sectionLabel}>Theme</span>
				<Select
					items={themeLabels}
					value={selectedThemeLabel}
					onSelect={handleThemeChange}
				/>
			</div>

			<div className={styles.section}>
				<span className={styles.sectionLabel}>Font</span>

				<div className={styles.fontSelect}>
					<Select
						items={fontLabels}
						value={selectedFontLabel}
						onSelect={handleFontChange}
					/>
				</div>
			</div>

			<div className={styles.section}>
				<span className={styles.sectionLabel}>Padding</span>

				<div className={styles.paddingGroup}>
					{paddingValues.map((paddingValue) => (
						<button
							aria-pressed={options.padding === paddingValue}
							className={`${styles.paddingButton} ${options.padding === paddingValue ? styles.paddingButtonActive : ""}`}
							key={paddingValue}
							type="button"
							onClick={() => handlePaddingChange(paddingValue)}
						>
							{paddingLabels[paddingValue]}
						</button>
					))}
				</div>
			</div>

			<div className={styles.section}>
				<span className={styles.sectionLabel}>Window chrome</span>

				<label className={styles.toggleLabel}>
					<input
						checked={options.showWindowChrome}
						className={styles.toggleInput}
						type="checkbox"
						onChange={handleChromeToggle}
					/>
					<span
						className={`${styles.toggle} ${options.showWindowChrome ? styles.toggleOn : ""}`}
					/>
				</label>
			</div>
		</div>
	);
};

export default SnapshotControls;
