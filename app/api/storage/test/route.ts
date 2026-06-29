import { NextRequest, NextResponse } from "next/server";

import { ServerSideBackends } from "@/lib/constants/storage.constants";
import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { testServerConnection } from "@/lib/storage/server/resolve";
import { requireAdmin } from "@/lib/supabase/adminGuard";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

// Admin-only. Tests a connection before it is saved. Supabase/Browser backends
// have nothing external to reach, so they always pass.
export const POST = async (request: NextRequest): Promise<NextResponse> => {
	const guard = await requireAdmin(request);

	if (guard.error) {
		return guard.error;
	}

	const body = (await request.json().catch(() => null)) as StorageConfig | null;

	if (!body?.backend) {
		return NextResponse.json(
			{ error: "Missing backend", ok: false },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	if (!ServerSideBackends.includes(body.backend)) {
		return NextResponse.json({ error: null, ok: true });
	}

	const result = await testServerConnection({
		backend: body.backend,
		connection: body.connection ?? {},
	});

	return NextResponse.json(result);
};
