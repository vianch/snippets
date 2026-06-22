import { CSSProperties, ReactElement, ReactNode } from "react";

/* Styles */
import styles from "./card.module.css";

type CardProps = {
	actions?: ReactNode;
	children: ReactNode;
	className?: string;
	style?: CSSProperties;
	subtitle?: string;
	title?: string;
};

const Card = ({
	actions,
	children,
	className = "",
	style,
	subtitle,
	title,
}: CardProps): ReactElement => {
	return (
		<section className={`${styles.card} ${className}`} style={style}>
			{(title || actions) && (
				<header className={styles.header}>
					{(title || subtitle) && (
						<div className={styles.heading}>
							{title && <h3 className={styles.title}>{title}</h3>}
							{subtitle && <p className={styles.subtitle}>{subtitle}</p>}
						</div>
					)}
					{actions && <div className={styles.actions}>{actions}</div>}
				</header>
			)}
			{children}
		</section>
	);
};

export default Card;
