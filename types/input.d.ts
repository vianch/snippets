interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	className?: string;
	fat?: boolean;
	type?: "email" | "password" | "text";
	placeholder?: string;
	value?: string | number | readonly string[] | undefined;
	required?: boolean;
	maxLength?: number;
	Icon?: React.ReactElement | null;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown?: (inputValue: string) => void;
	dark?: boolean;
}
