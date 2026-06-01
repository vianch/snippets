import { ReactElement } from "react";

/* Constants */
import {
	FeaturesHeading,
	FeaturesSubheading,
	ShortcutsHeading,
	ShortcutsSubheading,
	ThemesHeading,
	ThemesSubheading,
} from "@/lib/constants/landing";

/* Components */
import Footer from "@/components/Footer/Footer";
import NavHeader from "@/components/NavHeader/NavHeader";
import FeatureBento from "@/components/landing/FeatureBento/FeatureBento";
import Hero from "@/components/landing/Hero/Hero";
import LanguageMarquee from "@/components/landing/LanguageMarquee/LanguageMarquee";
import Reveal from "@/components/landing/Reveal/Reveal";
import SectionHeading from "@/components/landing/SectionHeading/SectionHeading";
import ShortcutsShowcase from "@/components/landing/ShortcutsShowcase/ShortcutsShowcase";
import StatsBar from "@/components/landing/StatsBar/StatsBar";
import ThemeShowcase from "@/components/landing/ThemeShowcase/ThemeShowcase";

/* Styles */
import styles from "./page.module.css";

const Home = (): ReactElement => {
	return (
		<main className={styles.main}>
			<NavHeader />

			<Hero />

			<StatsBar />

			<section className={`container ${styles.section}`} id="features">
				<Reveal>
					<SectionHeading
						subtitle={FeaturesSubheading}
						title={FeaturesHeading}
					/>
				</Reveal>

				<Reveal delay={80}>
					<FeatureBento />
				</Reveal>
			</section>

			<LanguageMarquee />

			<section className={`container ${styles.section}`}>
				<Reveal>
					<SectionHeading subtitle={ThemesSubheading} title={ThemesHeading} />
				</Reveal>

				<Reveal delay={80}>
					<ThemeShowcase />
				</Reveal>
			</section>

			<section className={`container ${styles.section}`}>
				<Reveal>
					<SectionHeading
						subtitle={ShortcutsSubheading}
						title={ShortcutsHeading}
					/>
				</Reveal>

				<Reveal delay={80}>
					<ShortcutsShowcase />
				</Reveal>
			</section>

			<Footer />
		</main>
	);
};

export default Home;
