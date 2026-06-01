"use client";

import { ReactElement, useState } from "react";
import { useRouter } from "next/navigation";

import {
	HeroEyebrow,
	HeroFileName,
	HeroHeadline,
	HeroPrimaryCta,
	HeroSecondaryCta,
	HeroSubhead,
	heroCodeLines,
	heroGhostHint,
	heroGhostLine,
} from "@/lib/constants/landing";
import { ThemeNames, themeList } from "@/lib/config/themes";

import Starfield from "@/components/landing/Starfield/Starfield";
import Button from "@/components/ui/Button/Button";

import type { ThemeName } from "@/lib/config/themes";

import styles from "./hero.module.css";

const featuresSectionId = "features";

const Hero = (): ReactElement => {
	const router = useRouter();
	const [activeTheme, setActiveTheme] = useState<ThemeName>(
		ThemeNames.ShadesOfPurple
	);

	const primaryHandler = (): void => {
		router.push("/login");
	};

	const secondaryHandler = (): void => {
		document
			.getElementById(featuresSectionId)
			?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<section className={styles.hero}>
			<Starfield />

			<div className={`container ${styles.inner}`}>
				<div className={styles.copy}>
					<span className={styles.eyebrow}>{HeroEyebrow}</span>

					<h1 className={styles.title}>{HeroHeadline}</h1>

					<p className={styles.subhead}>{HeroSubhead}</p>

					<div className={styles.actions}>
						<Button variant="cta" onClick={primaryHandler}>
							{HeroPrimaryCta}
						</Button>

						<Button variant="tertiary" onClick={secondaryHandler}>
							{HeroSecondaryCta}
						</Button>
					</div>
				</div>

				<div className={styles.editorColumn}>
					<div className={styles.editor} data-theme={activeTheme}>
						<div className={styles.editorBar}>
							<span className={styles.dots}>
								<span className={styles.dot} />
								<span className={styles.dot} />
								<span className={styles.dot} />
							</span>

							<span className={styles.fileName}>{HeroFileName}</span>
						</div>

						<pre className={styles.code}>
							{heroCodeLines.map((line, lineIndex) => (
								<span className={styles.line} key={lineIndex}>
									{line.map((token, tokenIndex) => (
										<span data-token={token.kind} key={tokenIndex}>
											{token.text}
										</span>
									))}
								</span>
							))}

							<span className={`${styles.line} ${styles.ghostLine}`}>
								<span className={styles.ghost}>{heroGhostLine}</span>

								<span className={styles.tabHint}>⇥ {heroGhostHint}</span>
							</span>
						</pre>
					</div>

					<div className={styles.themeRow}>
						{themeList.map((theme) => (
							<button
								className={styles.themeChip}
								data-active={theme.name === activeTheme}
								key={theme.name}
								onClick={() => setActiveTheme(theme.name)}
								type="button"
							>
								<span
									className={styles.themeDot}
									style={{ background: theme.previewColors.accent }}
								/>
								{theme.label}
							</button>
						))}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
