import { ReactElement } from "react";

/* Constants */
import {
	FeaturesHeading,
	FeaturesSubheading,
	ThemesHeading,
	ThemesSubheading,
} from "@/lib/constants/landing";

/* Components */
import Footer from "@/components/Footer/Footer";
import NavHeader from "@/components/NavHeader/NavHeader";
import SnipPet from "@/components/SnipPet/SnipPet";
import FeatureBento from "@/components/landing/FeatureBento/FeatureBento";
import Hero from "@/components/landing/Hero/Hero";
import PageStars from "@/components/landing/PageStars/PageStars";
import Reveal from "@/components/landing/Reveal/Reveal";
import SectionHeading from "@/components/landing/SectionHeading/SectionHeading";
import ThemeShowcase from "@/components/landing/ThemeShowcase/ThemeShowcase";

/* Styles */
import styles from "./page.module.css";

const Home = (): ReactElement => {
	return (
		<main className={styles.main}>
			<PageStars />

			<NavHeader />

			<Hero />

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

			<section className={`container ${styles.section}`}>
				<Reveal>
					<SectionHeading subtitle={ThemesSubheading} title={ThemesHeading} />
				</Reveal>

				<Reveal delay={80}>
					<ThemeShowcase />
				</Reveal>
			</section>

			<Footer />

			<SnipPet />
		</main>
	);
};

export default Home;
