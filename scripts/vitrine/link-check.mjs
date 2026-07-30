// Gate de links da vitrine. Varre os HTML gerados em public/loja e:
//   1) todo caminho interno (/loja/..., /img/...) tem que existir em
//      public/ no disco; caminho de página aceita index.html implícito;
//   2) toda URL externa da marca (loja.nimbuswear.com.br, nimbuswear.com.br)
//      e toda foto de produto na CDN da Nuvemshop tem que responder < 400.
// URLs de nimbuswear.com.br/loja-preview/* são a própria vitrine (canônicas e
// og:) e ainda podem não estar no ar quando o lint roda: viram checagem de
// disco, não de rede. SKIP_REDE=1 pula a parte de rede (uso offline).
// Sai com código != 0 se qualquer link quebrar.
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const PUBLIC = path.join(RAIZ, "public");
const VITRINE = path.join(PUBLIC, "loja");

const htmls = [];
(function anda(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) anda(p);
    else if (e.name.endsWith(".html")) htmls.push(p);
  }
})(VITRINE);

const internos = new Map(); // caminho -> primeira página que referencia
const externos = new Map();
for (const arq of htmls) {
  const html = fs.readFileSync(arq, "utf-8");
  const rel = path.relative(PUBLIC, arq);
  const urls = [];
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) urls.push(m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/g))
    for (const parte of m[1].split(",")) urls.push(parte.trim().split(/\s+/)[0]);
  for (const m of html.matchAll(/<meta[^>]+content="(https?:[^"]+)"/g)) urls.push(m[1]);

  for (let u of urls) {
    u = u.replace(/&amp;/g, "&");
    if (u.startsWith("#") || u.startsWith("mailto:") || u.startsWith("data:")) continue;
    const proprio = u.match(/^https:\/\/nimbuswear\.com\.br(\/loja\/[^?#]*)/);
    if (proprio) u = proprio[1];
    if (u.startsWith("/")) {
      if (!internos.has(u)) internos.set(u, rel);
    } else if (/^https:\/\/(loja\.nimbuswear\.com\.br|nimbuswear\.com\.br|dcdn-us\.mitiendanube\.com)\//.test(u)) {
      if (!externos.has(u)) externos.set(u, rel);
    }
    // fonts.googleapis/gstatic ficam de fora: preconnect + CSS estáveis do Google
  }
}

const erros = [];

for (const [u, pagina] of internos) {
  const limpo = u.split(/[?#]/)[0];
  const alvo = path.join(PUBLIC, limpo);
  const ok = fs.existsSync(alvo) &&
    (fs.statSync(alvo).isFile() || fs.existsSync(path.join(alvo, "index.html")));
  if (!ok) erros.push(`interno quebrado: ${u} (em ${pagina})`);
}

if (!process.env.SKIP_REDE) {
  const fila = [...externos.entries()];
  async function operario() {
    for (;;) {
      const item = fila.shift();
      if (!item) return;
      const [u, pagina] = item;
      try {
        let r = await fetch(u, { method: "HEAD", redirect: "follow" });
        if (r.status === 405 || r.status === 501) r = await fetch(u, { method: "GET", redirect: "follow" });
        if (r.status >= 400) erros.push(`externo ${r.status}: ${u} (em ${pagina})`);
      } catch (e) {
        erros.push(`externo sem resposta: ${u} (em ${pagina}): ${e.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: 6 }, operario));
}

if (erros.length) {
  console.error("LINK-CHECK FALHOU:\n" + erros.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log(`link-check OK: ${htmls.length} páginas, ${internos.size} caminhos internos, ${externos.size} URLs externas${process.env.SKIP_REDE ? " (rede pulada)" : ""}`);
