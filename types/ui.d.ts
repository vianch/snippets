import { ReactElement, ReactNode } from "react";

declare global {
	type Children = ReactNode | string | ReactElement | number;

	type Severity = "error" | "warning" | "info" | "success";
	type SnapshotPadding = "lg" | "md" | "sm" | "xl";
	type Variants = "primary" | "secondary" | "tertiary" | Severity | "empty";
}
