import { NextRequest, NextResponse } from "next/server";

import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { loadActiveConfig } from "@/lib/storage/config.server";
import createSupabaseServerClient from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

// Returns only the active backend *type* (no secrets) so the client facade can
// decide whether to run an op locally (Supabase/Browser) or via the server.
export const GET = async (request: NextRequest): Promise<NextResponse> => {
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

	const config = await loadActiveConfig();

	return NextResponse.json(
		{ backend: config.backend },
		{ headers: { "Cache-Control": "no-store" } }
	);
};
