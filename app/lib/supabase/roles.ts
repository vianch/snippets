import { SupabaseClient } from "@supabase/supabase-js";

import { AppRole, RoleClaimKey, RolesTableName } from "@/lib/constants/roles";
import createSupabaseAdminClient from "@/lib/supabase/admin";

// Coerces any stored/claimed value into a known role, defaulting to User.
export const normalizeRole = (value: unknown): AppRole =>
	value === AppRole.Admin ? AppRole.Admin : AppRole.User;

export const isAdminRole = (role: AppRole): boolean => role === AppRole.Admin;

// Reads the role from the JWT (zero database round-trip) when the custom access
// token hook is registered. Returns null when the claim is absent.
const readRoleFromClaims = async (
	client: SupabaseClient
): Promise<AppRole | null> => {
	const { data } = await client.auth.getClaims();
	// The hook injects `user_role`; the typed JwtPayload doesn't know about it.
	const claims = data?.claims as Record<string, unknown> | undefined;
	const claimed = claims?.[RoleClaimKey];

	if (claimed === AppRole.Admin || claimed === AppRole.User) {
		return claimed;
	}

	return null;
};

// Resolves the role for the *current* session client: JWT claim first, then a
// direct read of the user's own row (allowed by RLS) as a fallback. Works in
// both the proxy and Server Components.
export const resolveUserRole = async (
	client: SupabaseClient,
	userId: string
): Promise<AppRole> => {
	const claimRole = await readRoleFromClaims(client);

	if (claimRole) {
		return claimRole;
	}

	const { data } = await client
		.from(RolesTableName)
		.select("role")
		.eq("user_id", userId)
		.maybeSingle();

	return normalizeRole(data?.role);
};

// Bulk role lookup for arbitrary users via the service-role client (bypasses
// RLS). Used by the admin user list. Missing users default to User.
export const fetchRoleMap = async (
	userIds: string[]
): Promise<Record<string, AppRole>> => {
	if (userIds.length === 0) {
		return {};
	}

	const admin = createSupabaseAdminClient();
	const { data } = await admin
		.from(RolesTableName)
		.select("user_id, role")
		.in("user_id", userIds);

	const map: Record<string, AppRole> = {};

	(data ?? []).forEach((row: { user_id: string; role: string }) => {
		map[row.user_id] = normalizeRole(row.role);
	});

	return map;
};

// Sets (upserts) a user's role via the service-role client. Note: the change
// only reaches an existing session's JWT after its next token refresh; the
// admin UI reflects the DB value immediately because it re-reads the table.
export const setUserRole = async (
	userId: string,
	role: AppRole
): Promise<{ error: string | null }> => {
	const admin = createSupabaseAdminClient();
	const { error } = await admin
		.from(RolesTableName)
		.upsert(
			{ user_id: userId, role, updated_at: new Date().toISOString() },
			{ onConflict: "user_id" }
		);

	return { error: error?.message ?? null };
};
