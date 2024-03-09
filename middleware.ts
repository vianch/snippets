import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(
	request: NextRequest
): Promise<NextResponse | unknown> {
	const response = NextResponse.next();
	const supabase = createMiddlewareClient({ req: request, res: response });
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error) {
		response.cookies.delete("my-auth-token-name");

		return NextResponse.redirect(new URL("/login", request.url));
	}

	// if user is signed in and the current path is / redirect the user to /account
	if (user && request.nextUrl.pathname === "/login") {
		return NextResponse.redirect(new URL("/snippets", request.url));
	}

	if (!user && request.nextUrl.pathname === "/snippets") {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	return response;
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: ["/", "/snippets"],
};
