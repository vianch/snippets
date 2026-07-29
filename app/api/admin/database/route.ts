import { NextRequest, NextResponse } from "next/server";

import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { logger } from "@/lib/logger/logger";
import { loadActiveConfig } from "@/lib/storage/config.server";
import { introspectSchema } from "@/lib/storage/server/introspect";
import { runWithServerDriver } from "@/lib/storage/server/resolve";
import { requireAdmin } from "@/lib/supabase/adminGuard";

// Admin-only. Returns the live schema of whichever backend `storage_config`
// currently points at. The source is never supplied by the client — it is read
// from the active config — so switching backends switches this view with it.
//
// This connection bypasses RLS by design; `requireAdmin` is the only thing
// standing between a signed-in user and every row, so it runs first and the
// connection details never leave the server.
export const GET = async (request: NextRequest): Promise<NextResponse> => {
	const guard = await requireAdmin(request);

	if (guard.error) {
		return guard.error;
	}

	const config = await loadActiveConfig();

	try {
		const schema = await runWithServerDriver(config, async (driver) => ({
			backend: config.backend,
			dialect: driver.dialect,
			tables: await introspectSchema(driver),
		}));

		return NextResponse.json(schema, {
			headers: { "Cache-Control": "no-store" },
		});
	} catch (cause) {
		logger.error(cause, { query: "introspect database schema" });

		return NextResponse.json(
			{
				error:
					cause instanceof Error
						? cause.message
						: "Schema introspection failed",
			},
			{ status: HttpStatusCode.InternalServerError }
		);
	}
};
