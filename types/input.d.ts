interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	className?: string;
	fat?: boolean;
	type?: "email" | "password" | "text";
	placeholder?: string;
	disabled?: boolean;
	disableMargin?: boolean; // Added to control margin
	value?: string | number | readonly string[] | undefined;
	required?: boolean;
	maxLength?: number;
	Icon?: React.ReactElement | null;
	cleanOnBlur?: boolean;
	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onBlur?: (inputValue: string) => void;
	onKeyDown?: (inputValue: string) => void;
	dark?: boolean;
}
