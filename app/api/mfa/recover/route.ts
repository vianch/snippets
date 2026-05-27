import { NextRequest, NextResponse } from "next/server";

import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import createSupabaseServerClient from "@/lib/supabase/server";
import {
	consumeRecoveryCode,
	deleteUserMfaFactors,
} from "@/lib/supabase/mfaAdmin";
import { normalizeRecoveryCode } from "@/utils/string.utils";

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	if (!isAdminClientConfigured()) {
		return NextResponse.json(
			{ error: "Recovery is not configured on the server" },
			{ status: HttpStatusCode.ServiceUnavailable }
		);
	}

	const { supabase } = await createSupabaseServerClient(request);
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json(
			{ error: "Unauthorized" },
			{ status: HttpStatusCode.Unauthorized }
		);
	}

	const body = await request.json().catch(() => null);
	const code = normalizeRecoveryCode(body?.code);

	if (!code) {
		return NextResponse.json(
			{ error: "Recovery code required" },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	const isValid = await consumeRecoveryCode(user.id, code);

	if (!isValid) {
		return NextResponse.json(
			{ error: "Invalid recovery code" },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	const { error } = await deleteUserMfaFactors(user.id);

	if (error) {
		return NextResponse.json(
			{ error: "Could not remove two-factor authentication" },
			{ status: HttpStatusCode.InternalServerError }
		);
	}

	return NextResponse.json({ success: true });
};
