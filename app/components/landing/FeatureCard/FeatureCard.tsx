import { ReactElement } from "react";

import styles from "./featureCard.module.css";

type FeatureCardProps = {
	feature: LandingFeature;
};

const FeatureCard = ({ feature }: FeatureCardProps): ReactElement => {
	const FeatureIcon = feature.icon;

	return (
		<article
			className={styles.card}
			data-accent={feature.accent}
			data-size={feature.size}
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
		</article>
	);
};

export default FeatureCard;
