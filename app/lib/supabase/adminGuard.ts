import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { User } from "@supabase/supabase-js";

import { demoAccountData } from "@/lib/constants/account";
import { AppRole } from "@/lib/constants/roles";
import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { resolveUserRole } from "@/lib/supabase/roles";
import createSupabaseServerClient from "@/lib/supabase/server";

// True when the email belongs to the protected, read-only demo account.
export const isDemoAccount = (email: string | null | undefined): boolean =>
	(email ?? "").toLowerCase() === demoAccountData.email.toLowerCase();

// Server-side authorization gate for admin API routes. Returns either a denial
// response to send back immediately, or the verified admin `user`. This is the
// authoritative check — never trust the client to assert its own role.
export const requireAdmin = async (
	request: NextRequest
): Promise<
	{ error: NextResponse; user: null } | { error: null; user: User }
> => {
	const { supabase } = await createSupabaseServerClient(request);
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return {
			error: NextResponse.json(
				{ error: "Unauthorized" },
				{ status: HttpStatusCode.Unauthorized }
			),
			user: null,
		};
	}

	const role = await resolveUserRole(supabase, user.id);

	if (role !== AppRole.Admin) {
		return {
			error: NextResponse.json(
				{ error: "Forbidden" },
				{ status: HttpStatusCode.Forbidden }
			),
			user: null,
		};
	}

	return { error: null, user };
};

// Blocks mutations when the acting admin is the demo account (read-only demo).
// Returns a 403 response to send back, or null when the caller may mutate.
export const rejectDemoActor = (user: User): NextResponse | null => {
	if (isDemoAccount(user.email)) {
		return NextResponse.json(
			{ error: "The demo administrator is read-only" },
			{ status: HttpStatusCode.Forbidden }
		);
	}

	return null;
};

// Blocks mutations that target the protected demo account, regardless of who is
// acting. Returns a 403 response to send back, or null when the target is fine.
export const rejectDemoTarget = (
	email: string | null | undefined
): NextResponse | null => {
	if (isDemoAccount(email)) {
		return NextResponse.json(
			{ error: "The demo account cannot be modified" },
			{ status: HttpStatusCode.Forbidden }
		);
	}

	return null;
};
