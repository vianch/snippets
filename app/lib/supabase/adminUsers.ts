import { AdminUserAttributes, User } from "@supabase/supabase-js";

import {
	BanDuration,
	UnbanDuration,
	UsersPerPage,
} from "@/lib/constants/admin.constants";
import {
	RecoveryOtpType,
	RecoveryTokenHashParam,
	RecoveryTypeParam,
	ResetPasswordRoutePath,
} from "@/lib/constants/auth.constants";
import { AppRole } from "@/lib/constants/roles";
import { ThemeNames } from "@/lib/config/themes";
import { logger } from "@/lib/logger/logger";
import createSupabaseAdminClient from "@/lib/supabase/admin";
import { isDemoAccount } from "@/lib/supabase/adminGuard";
import { fetchRoleMap, setUserRole } from "@/lib/supabase/roles";

const readMetaString = (
	metadata: Record<string, unknown>,
	key: string
): string | undefined => {
	const value = metadata[key];

	return typeof value === "string" ? value : undefined;
};

const isUserBanned = (user: User): boolean => {
	// banned_until isn't on the base User type but GoTrue returns it to admins.
	const bannedUntil = (user as { banned_until?: string | null }).banned_until;

	if (!bannedUntil) {
		return false;
	}

	return new Date(bannedUntil).getTime() > Date.now();
};

const toAdminUser = (user: User, role: AppRole): AdminUser => {
	const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
	const email = user.email ?? "";
	const usernameFromEmail = email.split("@")[0] ?? "";

	return {
		createdAt: user.created_at,
		email,
		id: user.id,
		isDemo: isDemoAccount(email),
		isDisabled: isUserBanned(user),
		lastSignInAt: user.last_sign_in_at ?? null,
		role,
		theme: readMetaString(metadata, "theme") ?? ThemeNames.ShadesOfPurple,
		username: readMetaString(metadata, "username") ?? usernameFromEmail,
	};
};

export const listAdminUsers = async (): Promise<AdminUsersResponse> => {
	const admin = createSupabaseAdminClient();
	const { data, error } = await admin.auth.admin.listUsers({
		page: 1,
		perPage: UsersPerPage,
	});

	if (error || !data) {
		logger.error(error ?? "listAdminUsers returned no data", {
			source: "listAdminUsers",
		});

		return { total: 0, users: [] };
	}

	const roleMap = await fetchRoleMap(data.users.map((user) => user.id));
	const users = data.users
		.map((user) => toAdminUser(user, roleMap[user.id] ?? AppRole.User))
		.sort((first, second) => second.createdAt.localeCompare(first.createdAt));

	return { total: users.length, users };
};

export const getAdminUserEmail = async (
	userId: string
): Promise<string | null> => {
	const admin = createSupabaseAdminClient();
	const { data } = await admin.auth.admin.getUserById(userId);

	return data?.user?.email ?? null;
};

export const createAdminUser = async (
	payload: AdminUserCreatePayload
): Promise<{ error: string | null; userId: string | null }> => {
	const admin = createSupabaseAdminClient();
	const { data, error } = await admin.auth.admin.createUser({
		email: payload.email,
		email_confirm: true,
		password: payload.password,
		user_metadata: {
			...(payload.username ? { username: payload.username } : {}),
			...(payload.theme ? { theme: payload.theme } : {}),
		},
	});

	if (error || !data?.user) {
		logger.error(error ?? "Could not create user", {
			source: "createAdminUser",
		});

		return { error: error?.message ?? "Could not create user", userId: null };
	}

	// The signup trigger seeds a default role; this guarantees the requested one.
	const { error: roleError } = await setUserRole(
		data.user.id,
		payload.role ?? AppRole.User
	);

	if (roleError) {
		logger.error(roleError, { source: "createAdminUser:setUserRole" });

		return { error: roleError, userId: data.user.id };
	}

	return { error: null, userId: data.user.id };
};

export const updateAdminUser = async (
	userId: string,
	payload: AdminUserUpdatePayload
): Promise<{ error: string | null }> => {
	const admin = createSupabaseAdminClient();
	const wantsMetadata =
		payload.username !== undefined || payload.theme !== undefined;
	// Merge into existing metadata so unrelated keys (avatar, ai_*) survive.
	const existingMetadata = wantsMetadata
		? (((await admin.auth.admin.getUserById(userId)).data?.user
				?.user_metadata ?? {}) as Record<string, unknown>)
		: {};
	const mergedMetadata = {
		...existingMetadata,
		...(payload.username !== undefined ? { username: payload.username } : {}),
		...(payload.theme !== undefined ? { theme: payload.theme } : {}),
	};
	const attributes: AdminUserAttributes = {
		...(payload.email !== undefined ? { email: payload.email } : {}),
		...(payload.isDisabled !== undefined
			? { ban_duration: payload.isDisabled ? BanDuration : UnbanDuration }
			: {}),
		...(wantsMetadata ? { user_metadata: mergedMetadata } : {}),
	};

	if (Object.keys(attributes).length > 0) {
		const { error } = await admin.auth.admin.updateUserById(userId, attributes);

		if (error) {
			logger.error(error, { source: "updateAdminUser:updateUserById" });

			return { error: error.message };
		}
	}

	if (payload.role !== undefined) {
		const { error } = await setUserRole(userId, payload.role);

		if (error) {
			logger.error(error, { source: "updateAdminUser:setUserRole" });

			return { error };
		}
	}

	return { error: null };
};

export const deleteAdminUser = async (
	userId: string
): Promise<{ error: string | null }> => {
	const admin = createSupabaseAdminClient();
	const { error } = await admin.auth.admin.deleteUser(userId);

	return { error: error?.message ?? null };
};

export const setAdminUserPassword = async (
	userId: string,
	password: string
): Promise<{ error: string | null }> => {
	const admin = createSupabaseAdminClient();
	const { error } = await admin.auth.admin.updateUserById(userId, { password });

	return { error: error?.message ?? null };
};

// Forces a user to re-authenticate by revoking their active sessions.
export const revokeUserSessions = async (
	userId: string
): Promise<{ error: string | null }> => {
	const admin = createSupabaseAdminClient();
	const { error } = await admin.rpc("admin_revoke_user_sessions", {
		target_user: userId,
	});

	return { error: error?.message ?? null };
};

// Builds a link to the app's own /reset-password page rather than returning
// GoTrue's raw action_link. The raw link verifies through Supabase and then
// drops the user on the site root, which has no recovery form. Instead we hand
// back the one-time hashed token and let the reset page redeem it with
// verifyOtp, so the user lands on a "set new password" form. The path is
// relative so it resolves against whatever origin the dashboard runs on.
export const generatePasswordResetLink = async (
	email: string
): Promise<{ actionLink: string | null; error: string | null }> => {
	const admin = createSupabaseAdminClient();
	const { data, error } = await admin.auth.admin.generateLink({
		email,
		type: "recovery",
	});

	if (error || !data?.properties?.hashed_token) {
		logger.error(error ?? "Could not generate a recovery link", {
			source: "generatePasswordResetLink",
		});

		return {
			actionLink: null,
			error: error?.message ?? "Could not generate a recovery link",
		};
	}

	const params = new URLSearchParams({
		[RecoveryTokenHashParam]: data.properties.hashed_token,
		[RecoveryTypeParam]: RecoveryOtpType,
	});
	const actionLink = `${ResetPasswordRoutePath}?${params.toString()}`;

	return { actionLink, error: null };
};
