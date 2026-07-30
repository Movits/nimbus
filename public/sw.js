// Service worker do nimbuswear.com.br (landing + vitrine /loja/).
// Motivo: o GitHub Pages serve tudo com cache de 10 minutos, então quem volta
// ao site depois disso baixa as texturas 3D de novo e revê o loader. Aqui as
// visitas de retorno saem do cache local:
//   - /assets/ (bundles e texturas com hash do Vite): cache-first, imutáveis;
//   - imagens e fontes: stale-while-revalidate (usa o cache e atualiza atrás);
//   - HTML e demais: network-first (deploy novo aparece no próximo load), com
//     fallback ao cache se a rede falhar.
// Ao mudar a estratégia, troque a VERSAO: o activate apaga os caches antigos.
const VERSAO = "nimbus-v1";
const RUNTIME = `${VERSAO}-runtime`;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((c) => !c.startsWith(VERSAO)).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const resp = await fetch(req);
  if (resp.ok) (await caches.open(RUNTIME)).put(req, resp.clone());
  return resp;
}

// resposta opaca (cross-origin sem CORS, ex.: fontes) tem ok=false mas serve
const cacheavel = (resp) => resp.ok || resp.type === "opaque";

async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(req);
  const rede = fetch(req)
    .then((resp) => {
      if (cacheavel(resp)) cache.put(req, resp.clone());
      return resp;
    })
    .catch(() => hit);
  return hit || rede;
}

async function networkFirst(req) {
  const cache = await caches.open(RUNTIME);
  try {
    const resp = await fetch(req);
    if (resp.ok) cache.put(req, resp.clone());
    return resp;
  } catch (e) {
    const hit = await cache.match(req);
    if (hit) return hit;
    throw e;
  }
}

// Terceiros que valem cache local (fontes; respostas opacas são aceitas)
const TERCEIROS = ["https://fonts.googleapis.com", "https://fonts.gstatic.com"];

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    if (TERCEIROS.includes(url.origin)) ev.respondWith(staleWhileRevalidate(req));
    return;
  }
  if (url.pathname.startsWith("/assets/")) {
    ev.respondWith(cacheFirst(req));
  } else if (/\.(webp|avif|png|jpe?g|gif|svg|ico|woff2?)$/.test(url.pathname)) {
    ev.respondWith(staleWhileRevalidate(req));
  } else {
    ev.respondWith(networkFirst(req));
  }
});
