import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createSupabaseServerClient from "@/lib/supabase/server";
import { MfaAssuranceLevel } from "@/lib/constants/mfa";
import {
	AdminRoutePath,
	AppRole,
	NonAdminRedirectPath,
} from "@/lib/constants/roles";
import { resolveUserRole } from "@/lib/supabase/roles";

export async function proxy(
	request: NextRequest
): Promise<NextResponse | unknown> {
	const { supabaseResponse, supabase } =
		await createSupabaseServerClient(request);
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const isProtectedPath =
		request.nextUrl.pathname === "/snippets" ||
		request.nextUrl.pathname.startsWith("/ai-assistant");
	const isLoginPath = request.nextUrl.pathname === "/login";
	const isAdminPath =
		request.nextUrl.pathname === AdminRoutePath ||
		request.nextUrl.pathname.startsWith(`${AdminRoutePath}/`);

	// A session that still needs to step up to aal2 has not finished the MFA
	// challenge yet. It must stay on /login to complete verification and must
	// not reach a protected route.
	const isMfaPending = await (async (): Promise<boolean> => {
		if (!user) {
			return false;
		}

		const { data: assuranceLevel } =
			await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

		return Boolean(
			assuranceLevel &&
			assuranceLevel.currentLevel === MfaAssuranceLevel.Aal1 &&
			assuranceLevel.nextLevel === MfaAssuranceLevel.Aal2
		);
	})();

	// Admin route guard. The role is read from the JWT claim (set by the custom
	// access token hook) with a database fallback — see resolveUserRole. Any
	// non-admin, unauthenticated, or MFA-pending request is bounced to /snippets.
	if (isAdminPath) {
		if (!user || isMfaPending) {
			return NextResponse.redirect(new URL(NonAdminRedirectPath, request.url));
		}

		const role = await resolveUserRole(supabase, user.id);

		if (role !== AppRole.Admin) {
			return NextResponse.redirect(new URL(NonAdminRedirectPath, request.url));
		}
	}

	// if user is fully signed in and the current path is /login redirect to /snippets
	if (user && isLoginPath && !isMfaPending) {
		return NextResponse.redirect(new URL("/snippets", request.url));
	}

	if (!user && isProtectedPath) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	if (user && isProtectedPath && isMfaPending) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return supabaseResponse;
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: [
		"/",
		"/snippets",
		"/ai-assistant/:path*",
		"/admin",
		"/admin/:path*",
		"/login",
	],
};
