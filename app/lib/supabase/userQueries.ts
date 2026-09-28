import supabase from "@/lib/supabase/client";
import { AppRole, RoleClaimKey, RolesTableName } from "@/lib/constants/roles";
import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { AuthError, UserAttributes, UserResponse } from "@supabase/supabase-js";

export const getUserDataFromServer = async (): Promise<User> => {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return user as User;
};

export const getUserDataFromSession = async (): Promise<Session> => {
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return session as Session;
};

// Resolve the session user once and invalidate the value when auth changes.
const sessionUserIdCache: { value: string | null } = { value: null };

supabase.auth.onAuthStateChange(() => {
	sessionUserIdCache.value = null;
});

export const getUserIdBySession = async (): Promise<string | null> => {
	if (sessionUserIdCache.value) {
		return sessionUserIdCache.value;
	}

	const session = await getUserDataFromSession();
	const userFromServer = session ? null : await getUserDataFromServer();

	sessionUserIdCache.value = session
		? (session?.user?.id ?? null)
		: (userFromServer?.id ?? null);

	return sessionUserIdCache.value;
};

export const getUserEmailBySession = async (): Promise<
	string | undefined | null
> => {
	const session = await getUserDataFromSession();

	if (session) {
		return session?.user?.email;
	}

	const userFromServer = await getUserDataFromServer();

	return userFromServer?.email ?? null;
};

export const getCurrentUserRole = async (): Promise<AppRole> => {
	const { data } = await supabase.auth.getClaims();
	const claims = data?.claims as Record<string, unknown> | undefined;
	const claimed = claims?.[RoleClaimKey];

	if (claimed === AppRole.Admin || claimed === AppRole.User) {
		return claimed;
	}

	const userId = await getUserIdBySession();

	if (!userId) {
		return AppRole.User;
	}

	const { data: roleRow } = await supabase
		.from(RolesTableName)
		.select("role")
		.eq("user_id", userId)
		.maybeSingle();

	return roleRow?.role === AppRole.Admin ? AppRole.Admin : AppRole.User;
};

export const updateUser = async (
	attributes: UserAttributes
): Promise<UserResponse> => {
	if (supabase) {
		return supabase.auth.updateUser(attributes);
	}

	return {
		error: new AuthError(
			"Supabase client not initialized",
			HttpStatusCode.ServiceUnavailable,
			undefined
		),
		data: { user: null },
	};
};

export const signOutUser = async (): Promise<AuthError | null> => {
	const { error } = await supabase.auth.signOut();

	return error;
};
