// Adaptador: le um catalogo a partir das paginas PUBLICAS de uma loja.
//
// Funciona para Nuvemshop hoje e para Shopify sem mudanca estrutural, porque
// nao depende de API: extrai as URLs de imagem da propria pagina do produto e
// classifica cada uma baixando e medindo a borda. Se a loja mudar de tema, o que
// quebra e uma expressao regular, nao o medidor.
//
// Duas armadilhas de ambiente que custaram tempo e ficam registradas:
//
//   1. `http://` no CDN devolve 403 AccessDenied. `https://` devolve 200. O
//      codigo antigo usava http e isso foi lido por duas sessoes como "o CDN
//      esta bloqueado".
//   2. O `fetch` embutido do Node NAO le HTTPS_PROXY por padrao. Sem
//      NODE_USE_ENV_PROXY=1 toda requisicao volta 403 "Host not in allowlist",
//      que parece bloqueio do site e nao e.
//
// Uso: node scripts/geometry/provider/from-store.mjs <lista.csv> --out cat.json

import fs from "node:fs";
import sharp from "sharp";
import { whiteBorderFraction, classifyImage } from "./schema.mjs";

const UA = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  "accept-language": "pt-BR,pt;q=0.9",
};

if (!process.env.NODE_USE_ENV_PROXY && process.env.HTTPS_PROXY) {
  console.warn(
    "AVISO: NODE_USE_ENV_PROXY=1 nao esta definido e HTTPS_PROXY esta. O fetch do Node vai ignorar o proxy e devolver 403. Rode:\n  NODE_USE_ENV_PROXY=1 node " +
      process.argv[1],
  );
}

/** Todas as imagens de produto citadas numa pagina, sem o sufixo de tamanho. */
export function extractProductImageSlugs(html) {
  return [
    ...new Set(
      [...html.matchAll(/products\/([0-9]{6,}-[a-zA-Z0-9-]+?)(?:-\d+-\d+)?\.(?:webp|jpe?g|png)/g)].map((m) => m[1]),
    ),
  ];
}

/** Monta a URL de um slug num tamanho pedido. `cdnBase` termina em `/`. */
export const imageUrl = (cdnBase, slug, size = "1024-1024") => `${cdnBase}${slug}-${size}.webp`;

export async function classifyUrl(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) return null;
  const buf = Buffer.from(await r.arrayBuffer());
  const raw = await sharp(buf).resize(180, 180, { fit: "inside" }).raw().toBuffer({ resolveWithObject: true });
  const frac = whiteBorderFraction({
    data: raw.data, width: raw.info.width, height: raw.info.height, channels: raw.info.channels,
  });
  return { whiteBorder: +frac.toFixed(3), kind: classifyImage(frac), bytes: buf.length };
}

/**
 * @param {{id:string,title?:string,garment?:string,url:string}[]} produtos
 * @param {string} cdnBase
 */
export async function buildCatalog(produtos, cdnBase, { provider = "loja", onProgress } = {}) {
  const out = [];
  for (const p of produtos) {
    if (!p.url || !p.id) continue;
    let html;
    try {
      html = await (await fetch(p.url, { headers: UA })).text();
    } catch {
      out.push({ ...p, images: [], erro: "pagina inacessivel" });
      continue;
    }
    // So as imagens DESTE produto: a pagina tambem lista capas de relacionados.
    const slugs = extractProductImageSlugs(html).filter((s) => s.startsWith(p.id));
    const images = [];
    for (const slug of slugs) {
      const url = imageUrl(cdnBase, slug);
      try {
        const c = await classifyUrl(url);
        if (c) images.push({ url, slug, kind: c.kind, whiteBorder: c.whiteBorder });
      } catch { /* imagem individual falha nao derruba o produto */ }
    }
    out.push({ id: p.id, title: p.title, garment: p.garment, url: p.url, images });
    onProgress?.(out.length, produtos.length);
  }
  return { provider, fetchedAt: new Date().toISOString(), products: out };
}
