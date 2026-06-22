// Authorization roles and the wiring that exposes them to middleware.
// Mirrors the `app_role` enum and `user_roles` table created in
// supabase/migrations/20260621090000_create_user_roles.sql.

export const enum AppRole {
	Admin = "admin",
	User = "user",
}

// JWT claim injected by the custom access token hook
// (supabase/migrations/20260621090100_create_custom_access_token_hook.sql).
export const RoleClaimKey = "user_role";

export const RolesTableName = "user_roles";

export const AdminRoutePath = "/admin";

// Where non-admins are sent when they hit an admin-only surface.
export const NonAdminRedirectPath = "/snippets";
