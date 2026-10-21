const BUILD = '__BUILD__';
const CACHE = `juggermaster-${BUILD}`;
const FILES = __FILES__;
const ROOT = new URL('./', self.location.href);
const META = new URL('.offline-complete', ROOT).href;
const urlFor = path => new URL(path, ROOT).href;

async function fillCache() {
  const cache = await caches.open(CACHE);
  await cache.addAll(FILES.map(file => new Request(urlFor(file.url), { integrity: file.integrity, cache: 'reload' })));
  await cache.put(META, new Response(JSON.stringify(FILES.map(file => urlFor(file.url))), { headers: { 'Content-Type': 'application/json' } }));
}
async function complete(build) {
  if (typeof build !== 'string' || !/^[a-z0-9.-]+$/.test(build)) return false;
  const name = `juggermaster-${build}`;
  if (!(await caches.keys()).includes(name)) return false;
  const cache = await caches.open(name), marker = await cache.match(META);
  if (!marker) return false;
  const urls = await marker.json();
  if (!Array.isArray(urls) || !urls.length) return false;
  return (await Promise.all(urls.map(url => cache.match(url)))).every(Boolean);
}
async function pruneCaches(client) {
  // Keep old caches while another window could still be using an older build.
  const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  if (windows.length !== 1 || windows[0].id !== client?.id) return;
  for (const name of await caches.keys()) {
    if (name.startsWith('juggermaster-') && name !== CACHE) await caches.delete(name);
  }
}
self.addEventListener('install', event => event.waitUntil(fillCache().catch(async error => { await caches.delete(CACHE); throw error; })));
// Alte Caches bleiben für noch geöffnete Spiele verfügbar.
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('message', event => {
  const message = event.data;
  if (message?.type === 'ACTIVATE') { self.skipWaiting(); return; }
  if (!event.ports[0]) return;
  event.waitUntil((async () => {
    try {
      if (message?.type === 'REPAIR_OFFLINE' && message.build === BUILD && !await complete(BUILD)) await fillCache();
      const ready = await complete(message?.build);
      if (ready && message.build === BUILD) await pruneCaches(event.source);
      event.ports[0].postMessage(ready);
    } catch { event.ports[0].postMessage(false); }
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
  const relative = url.pathname.slice(ROOT.pathname.length);
  if (request.mode === 'navigate' && (relative === '' || relative === 'index.html')) {
    event.respondWith((async () => await (await caches.open(CACHE)).match(urlFor('index.html')) || fetch(request))());
    return;
  }
  if (relative === 'sw.js') return;
  event.respondWith((async () => await (await caches.open(CACHE)).match(request) || await caches.match(request) || fetch(request))());
});
