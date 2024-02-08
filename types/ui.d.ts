import { ReactElement, ReactNode } from "react";

declare global {
	type Children = ReactNode | string | ReactElement | number;

	type Variants =
		| "primary"
		| "secondary"
		| "tertiary"
		| "danger"
		| "warning"
		| "success"
		| "info";
}
