import { ReactElement, ReactNode } from "react";

declare global {
	type Children = ReactNode | string | ReactElement | number;

	type Severity = "error" | "warning" | "info" | "success";
	type SnapshotPadding = "lg" | "md" | "sm" | "xl";

	type TableColumn = {
		align?: "right";
		label: string;
	};

	type MenuItem = {
		danger?: boolean;
		disabled?: boolean;
		icon?: ReactNode;
		label: string;
		onSelect: () => void;
	};
	type Variants =
		| "primary"
		| "secondary"
		| "tertiary"
		| "cta"
		| Severity
		| "empty";
}
