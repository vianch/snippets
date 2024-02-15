interface InputProps {
	className?: string;
	type?: "email" | "password" | "text";
	placeholder?: string;
	value: string | number | readonly string[] | undefined;
	required?: boolean;
	maxLength?: number;
	Icon?: React.ReactElement | null;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	dark?: boolean;
}
