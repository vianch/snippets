// Sentry edge-runtime SDK init (POC). Imported from instrumentation.ts.
// Runs for middleware and edge routes.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1,
	enableLogs: true,
	debug: false,
});
