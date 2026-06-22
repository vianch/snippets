import { ReactElement, ReactNode } from "react";

/* Styles */
import styles from "./tooltip.module.css";

type TooltipProps = {
	children: ReactNode;
	label: string;
};

// Hover/focus tooltip shown above the wrapped control, matching the editor
// action-button tooltip pattern.
const Tooltip = ({ children, label }: TooltipProps): ReactElement => {
	return (
		<span className={styles.wrapper}>
			{children}
			<span className={styles.tooltip} role="tooltip">
				{label}
			</span>
		</span>
	);
};

export default Tooltip;
