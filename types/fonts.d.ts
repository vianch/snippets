import { FontNames } from "@/lib/config/fonts";

declare global {
	type FontName = (typeof FontNames)[keyof typeof FontNames];

	type FontConfig = {
		cssVariable: string;
		label: string;
		name: FontName;
	};
}

export {};
