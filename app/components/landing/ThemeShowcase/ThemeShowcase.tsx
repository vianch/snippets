"use client";

import { ReactElement, useEffect, useState } from "react";

import { themeCookieName } from "@/lib/constants/cookies";
import { setCookie } from "@/lib/cookies";
import { isValidTheme, themeList } from "@/lib/config/themes";

import type { ThemeName } from "@/lib/config/themes";

import styles from "./themeShowcase.module.css";

const ThemeShowcase = (): ReactElement => {
	const [activeTheme, setActiveTheme] = useState<ThemeName | null>(null);

	useEffect(() => {
		const currentTheme = document.documentElement.dataset.theme;

		if (currentTheme && isValidTheme(currentTheme)) {
			setActiveTheme(currentTheme);
		}
	}, []);

	useEffect(() => {
		if (!activeTheme) {
			return;
		}

		document.documentElement.dataset.theme = activeTheme;
		setCookie(themeCookieName, activeTheme);
	}, [activeTheme]);

	return (
		<div className={styles.grid}>
			{themeList.map((theme) => (
				<button
					className={styles.card}
					data-active={theme.name === activeTheme}
					key={theme.name}
					onClick={() => setActiveTheme(theme.name)}
					type="button"
				>
					<span
						className={styles.preview}
						style={{ background: theme.previewColors.bg }}
					>
						<span
							className={styles.sidebar}
							style={{ background: theme.previewColors.sidebar }}
						/>

						<span className={styles.lines}>
							<span
								className={styles.lineLong}
								style={{ background: theme.previewColors.accent }}
							/>

							<span
								className={styles.line}
								style={{ background: theme.previewColors.text }}
							/>

							<span
								className={styles.lineShort}
								style={{ background: theme.previewColors.accent }}
							/>
						</span>
					</span>

					<span className={styles.meta}>
						<span className={styles.name}>{theme.label}</span>

						<span className={styles.tag}>
							{theme.isDark ? "Dark" : "Light"}
						</span>
					</span>
				</button>
			))}
		</div>
	);
};

export default ThemeShowcase;
