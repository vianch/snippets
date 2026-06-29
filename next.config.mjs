import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const securityHeaders = [
	{ key: "X-Frame-Options", value: "DENY" },
	{ key: "X-Content-Type-Options", value: "nosniff" },
	{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
	{
		key: "Strict-Transport-Security",
		value: "max-age=63072000; includeSubDomains; preload",
	},
];

const nextConfig = {
	reactStrictMode: false,
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
		];
	},
};

// Sentry build-time wrapper (POC). Source-map upload runs only when
// SENTRY_AUTH_TOKEN is present; without it the build still succeeds.
export default withSentryConfig(nextConfig, {
	org: "vianch",
	project: "snippets",
	silent: !process.env.CI,
	widenClientFileUpload: true,
	webpack: {
		treeshake: {
			removeDebugLogging: true,
		},
	},
});
