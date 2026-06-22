import { NextRequest, NextResponse } from "next/server";

import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { isAdminClientConfigured } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/adminGuard";
import { computeSnippetAnalytics } from "@/lib/supabase/adminAnalytics";

// Analytics must reflect the current database, never a cached snapshot.
export const dynamic = "force-dynamic";

const NoStoreHeaders = { "Cache-Control": "no-store" } as const;

export const GET = async (request: NextRequest): Promise<NextResponse> => {
	if (!isAdminClientConfigured()) {
		return NextResponse.json(
			{ error: "Admin features are not configured on the server" },
			{ status: HttpStatusCode.ServiceUnavailable }
		);
	}

	const guard = await requireAdmin(request);

	if (guard.error) {
		return guard.error;
	}

	const analytics = await computeSnippetAnalytics();

	return NextResponse.json(analytics, { headers: NoStoreHeaders });
};
