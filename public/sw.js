/*
 * Snippets service worker.
 *
 * Intentionally minimal: it exists to make the app installable as a PWA and to
 * speed up repeat loads of static assets. It never caches navigations or API
 * responses, so authenticated/Supabase content is always fetched fresh.
 */

const CacheName = "snippets-static-v1";
const StaticPrefixes = ["/_next/static/", "/assets/"];

self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(
					keys
						.filter((key) => key !== CacheName)
						.map((key) => caches.delete(key))
				)
			)
			.then(() => self.clients.claim())
	);
});

self.addEventListener("fetch", (event) => {
	const { request } = event;

	if (request.method !== "GET") {
		return;
	}

	const requestUrl = new URL(request.url);

	if (requestUrl.origin !== self.location.origin) {
		return;
	}

	const isStaticAsset = StaticPrefixes.some((prefix) =>
		requestUrl.pathname.startsWith(prefix)
	);

	if (!isStaticAsset) {
		return;
	}

	event.respondWith(
		caches.open(CacheName).then(async (cache) => {
			const cached = await cache.match(request);

			if (cached) {
				return cached;
			}

			const response = await fetch(request);

			if (response && response.ok) {
				cache.put(request, response.clone());
			}

			return response;
		})
	);
});
