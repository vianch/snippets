import { NextRequest, NextResponse } from "next/server";

import { MinPasswordLength } from "@/lib/constants/admin.constants";
import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import {
	rejectDemoActor,
	rejectDemoTarget,
	requireAdmin,
} from "@/lib/supabase/adminGuard";
import {
	generatePasswordResetLink,
	getAdminUserEmail,
	setAdminUserPassword,
} from "@/lib/supabase/adminUsers";

const serviceUnavailable = (): NextResponse =>
	NextResponse.json(
		{ error: "Admin features are not configured on the server" },
		{ status: HttpStatusCode.ServiceUnavailable }
	);

// With { newPassword } the password is set directly; without it, a recovery
// link is generated and returned (useful when SMTP isn't configured locally).
export const POST = async (
	request: NextRequest,
	context: { params: Promise<{ userId: string }> }
): Promise<NextResponse> => {
	if (!isAdminClientConfigured()) {
		return serviceUnavailable();
	}

	const guard = await requireAdmin(request);

	if (guard.error) {
		return guard.error;
	}

	const demoActorBlock = rejectDemoActor(guard.user);

	if (demoActorBlock) {
		return demoActorBlock;
	}

	const { userId } = await context.params;
	const targetEmail = await getAdminUserEmail(userId);

	if (!targetEmail) {
		return NextResponse.json(
			{ error: "User not found" },
			{ status: HttpStatusCode.NotFound }
		);
	}

	const demoTargetBlock = rejectDemoTarget(targetEmail);

	if (demoTargetBlock) {
		return demoTargetBlock;
	}

	const body = (await request.json().catch(() => ({}))) as {
		newPassword?: string;
	};

	if (body.newPassword) {
		if (body.newPassword.length < MinPasswordLength) {
			return NextResponse.json(
				{ error: `Password must be at least ${MinPasswordLength} characters` },
				{ status: HttpStatusCode.BadRequest }
			);
		}

		const { error } = await setAdminUserPassword(userId, body.newPassword);

		if (error) {
			return NextResponse.json(
				{ error },
				{ status: HttpStatusCode.BadRequest }
			);
		}

		return NextResponse.json({ success: true });
	}

	const { actionLink, error } = await generatePasswordResetLink(targetEmail);

	if (error) {
		return NextResponse.json({ error }, { status: HttpStatusCode.BadRequest });
	}

	return NextResponse.json({ actionLink, success: true });
};
