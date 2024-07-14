import { ReactElement, ReactNode } from "react";

declare global {
	type Children = ReactNode | string | ReactElement | number;

	type Severity = "error" | "warning" | "info" | "success";
	type Variants = "primary" | "secondary" | "tertiary" | Severity | "empty";
}
