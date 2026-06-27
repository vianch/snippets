import { NextRequest, NextResponse } from "next/server";

import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { logger } from "@/lib/logger/logger";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import {
	rejectDemoActor,
	rejectDemoTarget,
	requireAdmin,
} from "@/lib/supabase/adminGuard";
import {
	getAdminUserEmail,
	revokeUserSessions,
} from "@/lib/supabase/adminUsers";

// Force sign-out: revokes the target user's sessions so they must log in again.
export const POST = async (
	request: NextRequest,
	context: { params: Promise<{ userId: string }> }
): Promise<NextResponse> => {
	if (!isAdminClientConfigured()) {
		return NextResponse.json(
			{ error: "Admin features are not configured on the server" },
			{ status: HttpStatusCode.ServiceUnavailable }
		);
	}

	const guard = await requireAdmin(request);

	if (guard.error) {
		logger.error("Admin guard denied", {
			method: request.method,
			route: "/api/admin/users/[userId]/disconnect",
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

	const { error } = await revokeUserSessions(userId);

	if (error) {
		return NextResponse.json({ error }, { status: HttpStatusCode.BadRequest });
	}

	return NextResponse.json({ success: true });
};
