import supabase from "@/lib/supabase/client";

export const login = async (email: string, password: string) =>
	supabase.auth.signInWithPassword({
		email,
		password,
	});

export const signUp = async (email: string, password: string) =>
	supabase.auth.signUp({
		email,
		password,
	});
