import { NextRequest, NextResponse } from "next/server";

import { HttpStatusCode } from "@/lib/constants/ui.constants";
import fetchLinkPreview from "@/lib/linkPreview/fetchLinkPreview.server";
import createSupabaseServerClient from "@/lib/supabase/server";

// Authenticated proxy for link-preview metadata. Never forwards upstream
// error text to the client — every failure collapses to the same generic
// message so this cannot be used to probe internal network responses.
export const GET = async (
	request: NextRequest
): Promise<NextResponse<LinkPreviewData | LinkPreviewErrorResponse>> => {
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

	const requestedUrl = request.nextUrl.searchParams.get("url");

	if (!requestedUrl) {
		return NextResponse.json(
			{ error: "Missing url query parameter" },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	const preview = await fetchLinkPreview(requestedUrl);

	if (!preview) {
		return NextResponse.json(
			{ error: "Unable to generate a preview for this URL" },
			{ status: HttpStatusCode.BadRequest }
		);
	}

	return NextResponse.json(preview, {
		headers: { "Cache-Control": "private, max-age=300" },
	});
};
