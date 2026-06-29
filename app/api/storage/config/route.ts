import { NextRequest, NextResponse } from "next/server";

import { HttpStatusCode } from "@/lib/constants/ui.constants";
import { logger } from "@/lib/logger/logger";
import {
	loadActiveConfig,
	saveActiveConfig,
} from "@/lib/storage/config.server";
import { isStorageSecretConfigured } from "@/lib/storage/crypto.server";
import { rejectDemoActor, requireAdmin } from "@/lib/supabase/adminGuard";

// Connection secrets are never returned to the client. The admin sees which
// fields are set (blanked) and re-enters secrets to change them.
const SecretKeys: (keyof StorageConnection)[] = ["authToken", "password"];

const maskConnection = (connection: StorageConnection): StorageConnection => {
	const masked: StorageConnection = { ...connection };

	for (const key of SecretKeys) {
		if (masked[key]) {
			delete masked[key];
		}
	}

	return masked;
};

const serviceUnavailable = (): NextResponse =>
	NextResponse.json(
		{ error: "Storage config encryption key is not set on the server" },
		{ status: HttpStatusCode.ServiceUnavailable }
	);

export const GET = async (request: NextRequest): Promise<NextResponse> => {
	const guard = await requireAdmin(request);

	if (guard.error) {
		return guard.error;
	}

	// Reading config never needs the secret: with no row we return the Supabase
	// default; a stored row only decrypts when the key is present. The secret is
	// only required to *save*, so we surface it as a flag, not a hard failure.
	const config = await loadActiveConfig();

	return NextResponse.json(
		{
			backend: config.backend,
			connection: maskConnection(config.connection),
			secretConfigured: isStorageSecretConfigured(),
		},
		{ headers: { "Cache-Control": "no-store" } }
	);
};

export const PUT = async (request: NextRequest): Promise<NextResponse> => {
	const guard = await requireAdmin(request);

	if (guard.error) {
		return guard.error;
	}

	const demoBlock = rejectDemoActor(guard.user);

	if (demoBlock) {
		return demoBlock;
	}

	if (!isStorageSecretConfigured()) {
		return serviceUnavailable();
	}

	const body = (await request.json().catch(() => null)) as StorageConfig | null;

	if (!body?.backend) {
		return NextResponse.json(
			{ error: "Missing backend" },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	try {
		await saveActiveConfig({
			backend: body.backend,
			connection: body.connection ?? {},
		});

		return NextResponse.json({ ok: true }, { status: HttpStatusCode.Ok });
	} catch (cause) {
		logger.error(cause, { query: "save storage config" });

		return NextResponse.json(
			{ error: cause instanceof Error ? cause.message : "Save failed" },
			{ status: HttpStatusCode.InternalServerError }
		);
	}
};
