import { ReactElement, ReactNode } from "react";

/* Components */
import Tag from "@/components/ui/icons/Tag";

/* Styles */
import styles from "./badge.module.css";

type BadgeProps = {
	key?: string;
	children: ReactElement | ReactNode;
};

const Badge = ({ key = "", children }: BadgeProps): ReactElement => {
	return (
		<div className={styles.badgeWrapper} key={key}>
			<span>
				<Tag width={18} height={18} />
			</span>
			{children}
		</div>
	);
};

export default Badge;
