import {
	AllowedRemoteUrlProtocols,
	BlockedHostnames,
	BlockedHostnameSuffixes,
	PrivateIpv4Pattern,
	PrivateIpv6Pattern,
} from "@/lib/constants/network";

const stripIpv6Brackets = (hostname: string): string =>
	hostname.startsWith("[") && hostname.endsWith("]")
		? hostname.slice(1, -1)
		: hostname;

// Guard for server-side fetches against user-supplied URLs. Blocks non-HTTP
// schemes and hosts that resolve to loopback / private / link-local ranges.
// Note: this validates the literal host only — it does not resolve DNS, so a
// public hostname that resolves to a private IP (DNS rebinding) is not caught
// here. Pair with not forwarding server credentials to user-supplied URLs.
const isSafeRemoteUrl = (rawUrl: string): boolean => {
	if (!rawUrl) {
		return false;
	}

	let parsed: URL;

	try {
		parsed = new URL(rawUrl);
	} catch {
		return false;
	}

	if (!AllowedRemoteUrlProtocols.includes(parsed.protocol)) {
		return false;
	}

	const hostname = stripIpv6Brackets(parsed.hostname).toLowerCase();

	if (!hostname) {
		return false;
	}

	if (BlockedHostnames.includes(hostname)) {
		return false;
	}

	if (BlockedHostnameSuffixes.some((suffix) => hostname.endsWith(suffix))) {
		return false;
	}

	if (PrivateIpv4Pattern.test(hostname)) {
		return false;
	}

	if (PrivateIpv6Pattern.test(hostname)) {
		return false;
	}

	return true;
};

export { isSafeRemoteUrl };
