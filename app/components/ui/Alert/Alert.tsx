import { ReactElement } from "react";

import Check from "@/components/ui/icons/Check";
import Warning from "@/components/ui/icons/Warning";
import Error from "@/components/ui/icons/Error";
import Info from "@/components/ui/icons/Info";

/* Styles */
import styles from "./alert.module.css";

type AlertProps = {
	children: Children;
	className?: string;
	severity?: Severity;
	iconSize?: number;
	onClick?: () => void;
};

const Alert = ({
	children,
	className = "",
	severity = "success",
	iconSize = 24,
	onClick = () => {},
}: AlertProps): ReactElement => {
	return (
		<div
			className={`
        ${styles.alert} 
        ${className} 
        ${severity === "success" ? styles.success : ""} 
        ${severity === "warning" ? styles.warning : ""} 
        ${severity === "error" ? styles.error : ""} 
        ${severity === "info" ? styles.info : ""}
			`}
			onClick={onClick}
		>
			{iconSize !== 0 && (
				<span className={styles.iconContainer}>
					{severity === "success" && (
						<Check width={iconSize} height={iconSize} />
					)}
					{severity === "warning" && (
						<Warning width={iconSize} height={iconSize} />
					)}
					{severity === "error" && <Error width={iconSize} height={iconSize} />}
					{severity === "info" && <Info width={iconSize} height={iconSize} />}
				</span>
			)}

			<div>{children}</div>
		</div>
	);
};

export default Alert;
