import { NextRequest, NextResponse } from "next/server";

import { SnippetState } from "@/lib/constants/core";
import {
	ExportFormat,
	ServerSideBackends,
	SnippetTableName,
} from "@/lib/constants/storage.constants";
import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { loadActiveConfig } from "@/lib/storage/config.server";
import { buildSqlDump, buildSqliteFile } from "@/lib/storage/server/export";
import { runWithServerStorage } from "@/lib/storage/server/resolve";
import createSupabaseAdminClient from "@/lib/supabase/admin";
import createSupabaseServerClient from "@/lib/supabase/server";

const fetchSnippets = async (
	config: StorageConfig,
	userId: UUID
): Promise<Snippet[]> => {
	if (ServerSideBackends.includes(config.backend)) {
		return runWithServerStorage(config, (storage) => storage.list(userId));
	}

	const supabase = createSupabaseAdminClient();
	const { data } = await supabase
		.from(SnippetTableName)
		.select()
		.match({ user_id: userId })
		.neq("state", SnippetState.Inactive);

	return (data ?? []) as Snippet[];
};

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

	const format =
		request.nextUrl.searchParams.get("format") === ExportFormat.Sql
			? ExportFormat.Sql
			: ExportFormat.Sqlite;
	const snippets = await fetchSnippets(config, user.id as UUID);

	if (format === ExportFormat.Sql) {
		return new NextResponse(buildSqlDump(snippets), {
			headers: {
				"Content-Disposition": 'attachment; filename="snippets.sql"',
				"Content-Type": "text/plain; charset=utf-8",
			},
		});
	}

	const bytes = await buildSqliteFile(snippets);

	return new NextResponse(new Uint8Array(bytes), {
		headers: {
			"Content-Disposition": 'attachment; filename="snippets.sqlite"',
			"Content-Type": "application/octet-stream",
		},
	});
};
