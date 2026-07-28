// Registers the minimal, online-only service worker (public/sw.js).
// Only in production — during `vite dev` a service worker would just get
// in the way of hot module reloading, and there's nothing built to
// /assets/ yet for it to cache anyway.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[BizName] Service worker registration failed:', err);
    });
  });
}
