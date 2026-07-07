import type { ConsoleMessageLevel } from "@/lib/constants/preview.constants";

declare global {
	type ConsoleEntry = {
		id: number;
		level: ConsoleMessageLevel;
		text: string;
	};

	type ConsoleSandboxMessage = {
		level: ConsoleMessageLevel;
		source: string;
		text: string;
	};
}
