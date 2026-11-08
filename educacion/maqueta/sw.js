// Service worker mínimo de la app del alumno (EDU.06a): sirve para que Chrome ofrezca "Instalar".
// RED PRIMERO: siempre se pide la versión nueva al servidor; la copia guardada solo se usa si
// no hay internet. Así nunca queda pegada una versión vieja.
const CACHE = 'nande-alumno-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;   // lo de afuera (CDN, voz) no se toca
  e.respondWith((async () => {
    try {
      const resp = await fetch(r, { cache: 'no-store' });
      if (resp.ok && resp.type === 'basic') { const c = await caches.open(CACHE); c.put(r, resp.clone()); }
      return resp;
    } catch (err) {
      const guardada = await caches.match(r);
      if (guardada) return guardada;
      throw err;
    }
  })());
});
