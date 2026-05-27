import { createClient, SupabaseClient } from "@supabase/supabase-js";

export const isAdminClientConfigured = (): boolean =>
	Boolean(
		process.env.NEXT_PUBLIC_SUPABASE_URL &&
		process.env.SUPABASE_SERVICE_ROLE_KEY
	);

// Server-only client backed by the service-role key. Never import this from
// client components — it must only run inside API routes.
const createSupabaseAdminClient = (): SupabaseClient =>
	createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
		process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
		{
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		}
	);

export default createSupabaseAdminClient;
