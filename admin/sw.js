/* Control Panel service worker: makes the panel installable as an app.
   Network first, so a new version on the site is always used; the saved copy only opens the app when offline. */
const CACHE = "control-panel-v1";
const SHELL = ["./", "admin.css", "admin.js", "manifest.webmanifest", "icons/icon-192.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // only the panel's own files; GitHub, Hugging Face and the site itself always go straight to the network
  if (e.request.method !== "GET" || url.origin !== location.origin || !url.pathname.startsWith("/admin/")) return;
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match("./"))));
});
