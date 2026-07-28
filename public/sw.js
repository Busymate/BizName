// BizName service worker — intentionally minimal and online-only.
//
// What it DOES cache: the small fixed list of static files below
// (manifest, icons, favicon) via cache-first, plus Vite's hashed
// /assets/*.js and *.css chunks via a stale-while-revalidate strategy —
// this is a pure performance optimization for repeat visits, not an
// offline mode: if a chunk isn't cached yet, it's fetched from the
// network like normal.
//
// What it NEVER caches, on purpose: HTML page navigations, any request
// to /api/*, or anything from Supabase/Cloudinary/Flutterwave. Business
// data must always come from the backend — see index.html/main.jsx for
// the app-level "You're Offline" screen (src/components/OfflineScreen.jsx),
// which is a React component reacting to navigator.onLine, NOT a cached
// offline HTML page. Bump CACHE_VERSION when static assets change
// meaningfully so old caches don't linger.

const CACHE_VERSION = 'bn-static-v1';
const PRECACHE_URLS = ['/manifest.json', '/favicon.svg', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {
      // Precache is a nice-to-have, not required — never block install on it.
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // never intercept writes

  const url = new URL(request.url);

  // Never touch API calls, Supabase, Cloudinary, Flutterwave, or page
  // navigations — always hit the network so business data and HTML are
  // never served stale or offline.
  const isApi = url.pathname.startsWith('/api/');
  const isThirdPartyData =
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('cloudinary.com') ||
    url.hostname.includes('flutterwave.com');
  const isNavigation = request.mode === 'navigate';

  if (isApi || isThirdPartyData || isNavigation) {
    return; // let the browser handle it normally — no caching, no offline fallback
  }

  // Vite's hashed build output — safe to cache aggressively since the
  // filename itself changes whenever the content does.
  const isHashedAsset = url.pathname.startsWith('/assets/');

  if (isHashedAsset || PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
  // Everything else: default browser behavior (network), untouched.
});
