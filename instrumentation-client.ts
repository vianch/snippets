// Sentry browser SDK init (POC). Runs on the client.
// Loaded automatically by Next.js via the instrumentation hook.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
	tracesSampleRate: 1,
	enableLogs: true,
	debug: false,
	integrations: [Sentry.replayIntegration()],
	// Session Replay — tuned for Sentry's free tier (~50 replays/mo).
	// Record only sessions that hit an error (buffered in memory, flushed on
	// error); skip random session sampling so the quota isn't burned on
	// uneventful sessions. Raise replaysSessionSampleRate to 1.0 locally if you
	// want to watch every session while testing.
	replaysSessionSampleRate: 0,
	replaysOnErrorSampleRate: 1.0,
});

// Required for navigation/transaction instrumentation in the App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
