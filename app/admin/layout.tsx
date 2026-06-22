import { ReactElement } from "react";
import { redirect } from "next/navigation";

/* Lib */
import { AppRole, NonAdminRedirectPath } from "@/lib/constants/roles";
import { resolveUserRole } from "@/lib/supabase/roles";
import createSupabaseServerComponentClient from "@/lib/supabase/serverComponent";

// Server-side authorization gate. This re-validates on the server even though
// the proxy already guards /admin, so the page is safe if middleware is ever
// bypassed or misconfigured (defense in depth).
export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}): Promise<ReactElement> {
	const supabase = await createSupabaseServerComponentClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(NonAdminRedirectPath);
	}

	const role = await resolveUserRole(supabase, user.id);

	if (role !== AppRole.Admin) {
		redirect(NonAdminRedirectPath);
	}

	return <>{children}</>;
}
