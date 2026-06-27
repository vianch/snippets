import { NextRequest, NextResponse } from "next/server";

import { MinPasswordLength } from "@/lib/constants/admin.constants";
import { AppRole } from "@/lib/constants/roles";
import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { logger } from "@/lib/logger/logger";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { rejectDemoActor, requireAdmin } from "@/lib/supabase/adminGuard";
import { createAdminUser, listAdminUsers } from "@/lib/supabase/adminUsers";

// This endpoint reflects live mutations (create/disable/delete), so it must
// never be cached by Next's data cache or the browser.
export const dynamic = "force-dynamic";

const NoStoreHeaders = { "Cache-Control": "no-store" } as const;

const serviceUnavailable = (): NextResponse =>
	NextResponse.json(
		{ error: "Admin features are not configured on the server" },
		{ status: HttpStatusCode.ServiceUnavailable }
	);

export const GET = async (request: NextRequest): Promise<NextResponse> => {
	if (!isAdminClientConfigured()) {
		return serviceUnavailable();
	}

	const guard = await requireAdmin(request);

	if (guard.error) {
		logger.error("Admin guard denied", {
			method: request.method,
			route: "/api/admin/users",
			status: guard.error.status,
		});

		return guard.error;
	}

	const response = await listAdminUsers();

	return NextResponse.json(response, { headers: NoStoreHeaders });
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	if (!isAdminClientConfigured()) {
		return serviceUnavailable();
	}

	const guard = await requireAdmin(request);

	if (guard.error) {
		logger.error("Admin guard denied", {
			method: request.method,
			route: "/api/admin/users",
			status: guard.error.status,
		});

		return guard.error;
	}

	const demoBlock = rejectDemoActor(guard.user);

	if (demoBlock) {
		return demoBlock;
	}

	const body = (await request
		.json()
		.catch(() => ({}))) as AdminUserCreatePayload;

	if (!body.email || !body.password) {
		return NextResponse.json(
			{ error: "Email and password are required" },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	if (body.password.length < MinPasswordLength) {
		return NextResponse.json(
			{ error: `Password must be at least ${MinPasswordLength} characters` },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	const { error, userId } = await createAdminUser({
		email: body.email,
		password: body.password,
		role: body.role === AppRole.Admin ? AppRole.Admin : AppRole.User,
		...(body.theme ? { theme: body.theme } : {}),
		...(body.username ? { username: body.username } : {}),
	});

	if (error) {
		return NextResponse.json({ error }, { status: HttpStatusCode.BadRequest });
	}

	return NextResponse.json({ userId }, { status: HttpStatusCode.Ok });
};
