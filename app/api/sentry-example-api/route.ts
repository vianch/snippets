// POC test route. Throws on purpose so the example page can verify Sentry
// captures backend errors via the onRequestError hook.
// ponytail: throwaway verification route — delete once Sentry is confirmed.
export const dynamic = "force-dynamic";

export const GET = (): never => {
	throw new Error("Sentry Example API Error (POC)");
};
