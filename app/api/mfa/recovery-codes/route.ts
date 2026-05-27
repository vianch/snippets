import { NextRequest, NextResponse } from "next/server";

import { MfaAssuranceLevel } from "@/lib/constants/mfa";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import createSupabaseServerClient from "@/lib/supabase/server";
import {
	generateRecoveryCodes,
	storeRecoveryCodeHashes,
} from "@/lib/supabase/mfaAdmin";

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	if (!isAdminClientConfigured()) {
		return NextResponse.json(
			{ error: "Recovery codes are not configured on the server" },
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

	const { data: assuranceLevel } =
		await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

	if (
		!assuranceLevel ||
		assuranceLevel.currentLevel !== MfaAssuranceLevel.Aal2
	) {
		return NextResponse.json(
			{ error: "Two-factor verification required" },
			{ status: 403 }
		);
	}

	const { hashes, plainCodes } = generateRecoveryCodes();
	const { error } = await storeRecoveryCodeHashes(user.id, hashes);

	if (error) {
		return NextResponse.json(
			{ error: "Could not store recovery codes" },
			{ status: 500 }
		);
	}

	return NextResponse.json({ codes: plainCodes });
};
