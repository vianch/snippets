"use client";

import { ReactElement, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

/* Lib */
import { FormMessageTypes, regexPatterns } from "@/lib/constants/form";
import supabase from "@/lib/supabase/client";

/* Components */
import Input from "@/components/ui/Input/Input";

/* Styles */
import Button from "@/components/ui/Button/Button";
import styles from "./authform.module.css";

const AuthForm = (): ReactElement => {
	const [loading, setLoading] = useState(false);
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

		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({
			email: formData.email,
			password: formData.password,
		});

		setLoading(false);

		if (error) {
			setFormData({
				...formData,
				text: error?.message ?? "something went wrong!, try again later",
				type: FormMessageTypes.Error,
			});
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
		const isValid = regexPatterns[fieldType].test(value);

		setFormData({
			...formData,
			[fieldType]: value,
			...(isValid
				? {}
				: {
						text: `Invalid ${fieldType}`,
						type: FormMessageTypes.Warning,
					}),
		});
	};

	return (
		<form className={styles.form} onSubmit={handleLogin}>
			<Input
				className="inputField"
				dark={false}
				type="email"
				placeholder="Your email"
				value={formData.email}
				required={true}
				onChange={handleInputChange}
			/>

			<Input
				className="inputField"
				dark={false}
				type="password"
				placeholder="Your Password"
				value={formData.password}
				required={true}
				onChange={(event) => handleInputChange(event, "password")}
			/>

			<Button className={styles.button} disabled={loading}>
				{loading ? <span>Loading</span> : <span>Log in</span>}
			</Button>

			{formData.type === FormMessageTypes.Error && (
				<div className={`formMessage formMessageError`}>{formData.text}</div>
			)}

			{formData.type === FormMessageTypes.Warning && (
				<div className={`formMessage formMessageError`}>{formData.text}</div>
			)}
		</form>
	);
};

export default AuthForm;
