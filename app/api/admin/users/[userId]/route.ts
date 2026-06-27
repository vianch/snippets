import { NextRequest, NextResponse } from "next/server";

import { AppRole } from "@/lib/constants/roles";
import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { logger } from "@/lib/logger/logger";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import {
	rejectDemoActor,
	rejectDemoTarget,
	requireAdmin,
} from "@/lib/supabase/adminGuard";
import {
	deleteAdminUser,
	getAdminUserEmail,
	updateAdminUser,
} from "@/lib/supabase/adminUsers";
import { fetchRoleMap } from "@/lib/supabase/roles";

const serviceUnavailable = (): NextResponse =>
	NextResponse.json(
		{ error: "Admin features are not configured on the server" },
		{ status: HttpStatusCode.ServiceUnavailable }
	);

export const PATCH = async (
	request: NextRequest,
	context: { params: Promise<{ userId: string }> }
): Promise<NextResponse> => {
	if (!isAdminClientConfigured()) {
		return serviceUnavailable();
	}

	const guard = await requireAdmin(request);

	if (guard.error) {
		logger.error("Admin guard denied", {
			method: request.method,
			route: "/api/admin/users/[userId]",
			status: guard.error.status,
		});

		return guard.error;
	}

	const demoActorBlock = rejectDemoActor(guard.user);

	if (demoActorBlock) {
		return demoActorBlock;
	}

	const { userId } = await context.params;
	const targetEmail = await getAdminUserEmail(userId);
	const demoTargetBlock = rejectDemoTarget(targetEmail);

	if (demoTargetBlock) {
		return demoTargetBlock;
	}

	const body = (await request
		.json()
		.catch(() => ({}))) as AdminUserUpdatePayload;
	const payload: AdminUserUpdatePayload = {
		...(body.email !== undefined ? { email: body.email } : {}),
		...(body.username !== undefined ? { username: body.username } : {}),
		...(body.theme !== undefined ? { theme: body.theme } : {}),
		...(body.isDisabled !== undefined ? { isDisabled: body.isDisabled } : {}),
		...(body.role !== undefined
			? { role: body.role === AppRole.Admin ? AppRole.Admin : AppRole.User }
			: {}),
	};

	// Don't let an admin strip their own admin role and lock themselves out.
	if (payload.role === AppRole.User && guard.user.id === userId) {
		return NextResponse.json(
			{ error: "You cannot remove your own admin role" },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	// Admin accounts can't be disabled — demote to user first.
	if (payload.isDisabled === true) {
		const roleMap = await fetchRoleMap([userId]);

		if (roleMap[userId] === AppRole.Admin) {
			return NextResponse.json(
				{ error: "Admin users cannot be disabled" },
				{ status: HttpStatusCode.Forbidden }
			);
		}
	}

	const { error } = await updateAdminUser(userId, payload);

	if (error) {
		return NextResponse.json({ error }, { status: HttpStatusCode.BadRequest });
	}

	return NextResponse.json({ success: true });
};

export const DELETE = async (
	request: NextRequest,
	context: { params: Promise<{ userId: string }> }
): Promise<NextResponse> => {
	if (!isAdminClientConfigured()) {
		return serviceUnavailable();
	}

	const guard = await requireAdmin(request);

	if (guard.error) {
		logger.error("Admin guard denied", {
			method: request.method,
			route: "/api/admin/users/[userId]",
			status: guard.error.status,
		});

		return guard.error;
	}

	const demoActorBlock = rejectDemoActor(guard.user);

	if (demoActorBlock) {
		return demoActorBlock;
	}

	const { userId } = await context.params;

	if (guard.user.id === userId) {
		return NextResponse.json(
			{ error: "You cannot delete your own account" },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	const targetEmail = await getAdminUserEmail(userId);
	const demoTargetBlock = rejectDemoTarget(targetEmail);

	if (demoTargetBlock) {
		return demoTargetBlock;
	}

	// Admin accounts are protected — demote to user before deleting.
	const roleMap = await fetchRoleMap([userId]);

	if (roleMap[userId] === AppRole.Admin) {
		return NextResponse.json(
			{ error: "Admin users cannot be deleted" },
			{ status: HttpStatusCode.Forbidden }
		);
	}

	const { error } = await deleteAdminUser(userId);

	if (error) {
		return NextResponse.json({ error }, { status: HttpStatusCode.BadRequest });
	}

	return NextResponse.json({ success: true });
};
