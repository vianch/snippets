"use client";

// POC test page. Visit /sentry-example-page and click the button to throw a
// sample error (frontend + backend) and confirm Sentry is capturing events.
// ponytail: throwaway verification page — delete once Sentry is confirmed.
import * as Sentry from "@sentry/nextjs";

const SentryExamplePage = () => {
	const triggerError = async (): Promise<void> => {
		await Sentry.startSpan(
			{ name: "Example Frontend Span", op: "test" },
			async () => {
				const response = await fetch("/api/sentry-example-api");

				if (!response.ok) {
					throw new Error("Sentry Example Frontend Error (POC)");
				}
			}
		);
	};

	return (
		<main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
			<h1>sentry-example-page</h1>
			<p>Click the button to send a sample error to Sentry.</p>
			<button type="button" onClick={triggerError}>
				Throw Sample Error
			</button>
		</main>
	);
};

export default SentryExamplePage;
