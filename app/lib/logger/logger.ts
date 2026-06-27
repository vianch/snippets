import * as Sentry from "@sentry/nextjs";

// Central error logger. Every handled error that would otherwise be swallowed
// (guard denials, error toasts, caught Supabase/service failures) routes through
// here so it reaches Sentry. Unhandled throws in API routes are already captured
// by the `onRequestError` instrumentation hook and need not call this.
// String errors are wrapped in an Error so Sentry groups them by message.
const logger = {
	error: (error: unknown, context?: Record<string, unknown>): void => {
		const exception = typeof error === "string" ? new Error(error) : error;

		Sentry.captureException(
			exception,
			context ? { extra: context } : undefined
		);
	},
};

export { logger };
