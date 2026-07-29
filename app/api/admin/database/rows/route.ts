import { NextRequest, NextResponse } from "next/server";

import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { logger } from "@/lib/logger/logger";
import { loadActiveConfig } from "@/lib/storage/config.server";
import { selectTablePage } from "@/lib/storage/server/introspect";
import { runWithServerDriver } from "@/lib/storage/server/resolve";
import { requireAdmin } from "@/lib/supabase/adminGuard";

// Admin-only. One page of rows from any table in the active backend. `table` and
// `orderBy` are identifiers and cannot be bound as parameters, so
// `selectTablePage` validates them against `IdentifierPattern` before they reach
// the SQL string — an invalid name throws and surfaces here as a 400.
export const GET = async (request: NextRequest): Promise<NextResponse> => {
	const guard = await requireAdmin(request);

	if (guard.error) {
		return guard.error;
	}

	const parameters = request.nextUrl.searchParams;
	const table = parameters.get("table");

	if (!table) {
		return NextResponse.json(
			{ error: "Missing table" },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	const requestedPage = Number.parseInt(parameters.get("page") ?? "", 10);
	const page =
		Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 0;
	const config = await loadActiveConfig();

	try {
		const rowsPage = await runWithServerDriver(config, (driver) =>
			selectTablePage(driver, table, parameters.get("orderBy"), page)
		);

		return NextResponse.json(rowsPage, {
			headers: { "Cache-Control": "no-store" },
		});
	} catch (cause) {
		logger.error(cause, { query: `read rows from ${table}` });

		return NextResponse.json(
			{ error: cause instanceof Error ? cause.message : "Row read failed" },
			{ status: HttpStatusCode.BadRequest }
		);
	}
};
