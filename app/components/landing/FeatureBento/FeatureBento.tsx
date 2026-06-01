import { ReactElement } from "react";

import { landingFeatures } from "@/lib/constants/landing";

import FeatureCard from "@/components/landing/FeatureCard/FeatureCard";

import styles from "./featureBento.module.css";

const FeatureBento = (): ReactElement => {
	return (
		<div className={styles.grid}>
			{landingFeatures.map((feature) => (
				<FeatureCard feature={feature} key={feature.title} />
			))}
		</div>
	);
};

export default FeatureBento;
