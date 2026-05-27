import { NextRequest, NextResponse } from "next/server";

import { isAdminClientConfigured } from "@/lib/supabase/admin";
import createSupabaseServerClient from "@/lib/supabase/server";
import {
	consumeRecoveryCode,
	deleteUserMfaFactors,
} from "@/lib/supabase/mfaAdmin";

const normalizeRecoveryCode = (value: unknown): string => {
	if (typeof value !== "string") {
		return "";
	}

	return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	if (!isAdminClientConfigured()) {
		return NextResponse.json(
			{ error: "Recovery is not configured on the server" },
			{ status: 503 }
		);
	}

	const { supabase } = await createSupabaseServerClient(request);
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const code = normalizeRecoveryCode(body?.code);

	if (!code) {
		return NextResponse.json(
			{ error: "Recovery code required" },
			{ status: 400 }
		);
	}

	const isValid = await consumeRecoveryCode(user.id, code);

	if (!isValid) {
		return NextResponse.json(
			{ error: "Invalid recovery code" },
			{ status: 400 }
		);
	}

	const { error } = await deleteUserMfaFactors(user.id);

	if (error) {
		return NextResponse.json(
			{ error: "Could not remove two-factor authentication" },
			{ status: 500 }
		);
	}

	return NextResponse.json({ success: true });
};
