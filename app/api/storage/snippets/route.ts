import { NextRequest, NextResponse } from "next/server";

import {
	ServerSideBackends,
	StorageOp,
} from "@/lib/constants/storage.constants";
import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { logger } from "@/lib/logger/logger";
import { loadActiveConfig } from "@/lib/storage/config.server";
import { runWithServerStorage } from "@/lib/storage/server/resolve";
import createSupabaseServerClient from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const runtime = "nodejs";

type StorageRequestBody = {
	args?: unknown[];
	op?: StorageOp;
};

// Runs one storage op for the calling user against the active credentialed
// backend. `userId` is taken from the verified session and injected — the
// client never supplies it, so a user cannot read another user's snippets.
const dispatch = (
	storage: SnippetStorage,
	userId: UUID,
	op: StorageOp,
	args: unknown[]
): Promise<unknown> => {
	switch (op) {
		case StorageOp.EmptyTrash:
			return storage.emptyTrash(userId);

		case StorageOp.GetPublicBySlug:
			// wire args are untyped JSON; shape matches the interface per op
			return storage.getPublicBySlug(args[0] as string);

		case StorageOp.GetVersion:
			return storage.getVersion(args[0] as UUID);

		case StorageOp.GetVersions:
			return storage.getVersions(args[0] as UUID);

		case StorageOp.List:
			return storage.list(userId);

		case StorageOp.ListByFolder:
			return storage.listByFolder(userId, args[0] as string);

		case StorageOp.ListByState:
			return storage.listByState(userId, args[0] as SnippetState);

		case StorageOp.ListByTag:
			return storage.listByTag(userId, args[0] as string);

		case StorageOp.ListUncategorized:
			return storage.listUncategorized(userId);

		case StorageOp.Save:
			return storage.save(userId, args[0] as CurrentSnippet);

		case StorageOp.SaveVersion:
			return storage.saveVersion(
				userId,
				args[0] as UUID,
				args[1] as CurrentSnippet
			);

		case StorageOp.Search:
			return storage.search(userId, args[0] as string);

		case StorageOp.SetState:
			return storage.setState(userId, args[0] as UUID, args[1] as SnippetState);

		case StorageOp.TogglePublic:
			return storage.togglePublic(
				userId,
				args[0] as UUID,
				args[1] as boolean,
				args[2] as string | null
			);

		default:
			throw new Error(`Unknown storage op: ${op}`);
	}
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
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

	const body = (await request.json().catch(() => ({}))) as StorageRequestBody;

	if (!body.op) {
		return NextResponse.json(
			{ error: "Missing op" },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	const config = await loadActiveConfig();

	if (!ServerSideBackends.includes(config.backend)) {
		return NextResponse.json(
			{ error: "Active backend does not run server-side" },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	try {
		const result = await runWithServerStorage(config, (storage) =>
			dispatch(storage, user.id as UUID, body.op as StorageOp, body.args ?? [])
		);

		return NextResponse.json({ result }, { status: HttpStatusCode.Ok });
	} catch (cause) {
		logger.error(cause, { query: `storage op ${body.op}` });

		return NextResponse.json(
			{ error: cause instanceof Error ? cause.message : "Storage error" },
			{ status: HttpStatusCode.InternalServerError }
		);
	}
};
