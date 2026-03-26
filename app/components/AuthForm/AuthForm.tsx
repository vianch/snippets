"use client";

import {
	ReactElement,
	useState,
	FormEvent,
	ChangeEvent,
	useEffect,
} from "react";
import { useRouter } from "next/navigation";

/* Lib */
import { FormMessageTypes, regexPatterns } from "@/lib/constants/form";
import supabase from "@/lib/supabase/client";

/* Components */
import Input from "@/components/ui/Input/Input";
import Button from "@/components/ui/Button/Button";
import Loading from "@/components/ui/icons/Loading";
import Envelope from "@/components/ui/icons/Envelope";
import Lock from "@/components/ui/icons/Lock";
import EyeOpen from "@/components/ui/icons/EyeOpen";
import EyeClosed from "@/components/ui/icons/EyeClosed";
import Alert from "@/components/ui/Alert/Alert";

/* Styles */
import styles from "./authform.module.css";

const AuthForm = (): ReactElement => {
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [formData, setFormData] = useState<{
		email: string;
		password: string;
		text: string;
		type: FormMessageTypes;
	}>({
		email: "",
		password: "",
		text: "",
		type: FormMessageTypes.Unset,
	});
	const router = useRouter();

	const handleLogin = async (
		event: FormEvent<HTMLFormElement>
	): Promise<void> => {
		event?.preventDefault();
		setSubmitted(true);

		const isEmailValid = regexPatterns.email.test(formData.email);
		const isPasswordValid = regexPatterns.password.test(formData.password);

		if (!isEmailValid) {
			setFormData({
				...formData,
				text: "Invalid email",
				type: FormMessageTypes.Warning,
			});

			return;
		}

		if (!isPasswordValid) {
			setFormData({
				...formData,
				text: "Invalid password",
				type: FormMessageTypes.Warning,
			});

			return;
		}

		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email: formData.email,
			password: formData.password,
		});

		if (error) {
			setFormData({
				...formData,
				text: error?.message ?? "something went wrong!, try again later",
				type: FormMessageTypes.Error,
			});
			setLoading(false);
		} else {
			setFormData({
				...formData,
				text: "Login success",
				type: FormMessageTypes.Success,
			});
			router.push("/snippets");
		}
	};

	const handleInputChange = (
		event: ChangeEvent<HTMLInputElement>,
		fieldType: "email" | "password" = "email"
	) => {
		const value = event.target.value ?? "";

		setFormData({
			...formData,
			[fieldType]: value,
			text: "",
			type: FormMessageTypes.Unset,
		});
		setSubmitted(false);
	};

	const togglePasswordVisibility = () => {
		setShowPassword((previous) => !previous);
	};

	useEffect(() => {
		return () => {
			setLoading(false);
		};
	}, []);

	const passwordToggleIcon = showPassword ? (
		<EyeOpen width={20} height={20} onClick={togglePasswordVisibility} />
	) : (
		<EyeClosed width={20} height={20} onClick={togglePasswordVisibility} />
	);

	return (
		<form className={styles.form} onSubmit={handleLogin}>
			{submitted && formData.type !== FormMessageTypes.Unset && (
				<Alert severity={formData.type}>{formData.text}</Alert>
			)}

			<Input
				className="inputField"
				fat
				dark={false}
				type="email"
				placeholder="Email"
				Icon={<Envelope width={24} height={24} />}
				value={formData.email}
				required={true}
				onChange={handleInputChange}
			/>

			<Input
				className="inputField"
				fat
				dark={false}
				type={showPassword ? "text" : "password"}
				placeholder="Password"
				Icon={<Lock width={24} height={24} />}
				SuffixIcon={passwordToggleIcon}
				value={formData.password}
				required={true}
				onChange={(event) => handleInputChange(event, "password")}
			/>

			<Button className={styles.button} disabled={loading} variant="secondary">
				{loading ? <Loading width={24} height={24} /> : <span>Log in</span>}
			</Button>
		</form>
	);
};

export default AuthForm;
