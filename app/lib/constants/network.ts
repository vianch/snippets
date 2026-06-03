export const AllowedRemoteUrlProtocols: readonly string[] = ["http:", "https:"];

export const BlockedHostnames: readonly string[] = ["localhost"];

export const BlockedHostnameSuffixes: readonly string[] = [
	".internal",
	".local",
	".localhost",
];

// IPv4 literals in loopback, private, link-local, CGNAT and "this host"
// ranges. A user-supplied URL pointing at any of these must never be fetched
// server-side (SSRF into internal services / cloud metadata).
export const PrivateIpv4Pattern =
	/^(?:0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[0-1])\.|100\.(?:6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\.)/;

// IPv6 loopback (::1), unspecified (::), unique-local (fc00::/7) and
// link-local (fe80::/10).
export const PrivateIpv6Pattern = /^(?:::1$|::$|fc|fd|fe80:)/i;
