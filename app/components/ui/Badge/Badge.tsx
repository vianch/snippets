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
			<span className={styles.removeBadge} onClick={onRemove}>
				<CloseSquare width={18} height={18} />
			</span>
			{children}
		</div>
	);
};

export default Badge;
