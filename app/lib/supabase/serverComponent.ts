import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

// Supabase client for React Server Components / server-side route guards.
// Unlike server.ts (which is request/response based for the proxy), this reads
// the session from next/headers cookies. Cookie writes are a no-op because RSCs
// cannot mutate cookies — the proxy refreshes the session on navigation.
const createSupabaseServerComponentClient =
	async (): Promise<SupabaseClient> => {
		const cookieStore = await cookies();

		return createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				cookies: {
					getAll() {
						return cookieStore.getAll();
					},
					setAll(
						cookiesToSet: {
							name: string;
							value: string;
							options: Record<string, unknown>;
						}[]
					) {
						try {
							cookiesToSet.forEach(({ name, value, options }) =>
								cookieStore.set(name, value, options)
							);
						} catch {
							// Mutating cookies from a Server Component throws; the proxy
							// handles session refresh, so swallowing this is safe.
						}
					},
				},
			}
		);
	};

export default createSupabaseServerComponentClient;
