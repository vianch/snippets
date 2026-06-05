import { ReactElement, ReactNode } from "react";

/* Components */
import CloseSquare from "@/components/ui/icons/CloseSquare";

/* Styles */
import styles from "./badge.module.css";

type BadgeProps = {
	onRemove?: () => void | null;
	children: ReactElement | ReactNode;
};

const Badge = ({ children, onRemove }: BadgeProps): ReactElement => {
	return (
		<div className={styles.badgeWrapper}>
			<span className={styles.badgeLabel}>{children}</span>
			{onRemove && (
				<button
					type="button"
					className={styles.removeBadge}
					aria-label="Remove tag"
					onClick={onRemove}
				>
					<CloseSquare width={16} height={16} />
				</button>
			)}
		</div>
	);
};

export default Badge;
