import { CSSProperties, ReactElement } from "react";

/* Components */
import Card from "@/components/ui/Card/Card";

/* Styles */
import styles from "./featureCard.module.css";

type FeatureCardProps = {
	feature: LandingFeature;
};

const FeatureCard = ({ feature }: FeatureCardProps): ReactElement => {
	const FeatureIcon = feature.icon;
	// Accent token derived from the feature's palette key (e.g. var(--cyan-color)).
	const cardStyle = {
		"--feature-accent": `var(--${feature.accent}-color)`,
	} as CSSProperties;

	return (
		<Card
			className={`${styles.card} ${styles[feature.size] ?? ""}`}
			style={cardStyle}
		>
			<h3 className={styles.title}>
				<span className={styles.iconWrap}>
					<FeatureIcon className={styles.icon} width={22} height={22} />
				</span>

				{feature.title}
			</h3>

			<p className={styles.description}>{feature.description}</p>

			{feature.image ? (
				<img
					className={styles.image}
					src={feature.image}
					alt={feature.title}
					loading="lazy"
				/>
			) : null}

			<span className={styles.detail}>{feature.detail}</span>
		</Card>
	);
};

export default FeatureCard;
