// Deriva as imagens editoriais da vitrine a partir do repo privado nimbus-assets.
//
// Regras de segurança (o repo nimbus é PÚBLICO):
//   arte NUNCA inteira: só recorte que sangra, achatado sobre campo de cor,
//   sem canal alpha, máximo 900 px no lado maior. Um crop não é um arquivo
//   de impressão.
//   casting/mockups: máximo 1600 px, WebP q78, alvo <= 200 KB.
//
// Uso: node scripts/vitrine/build-media.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const ASSETS = process.env.NIMBUS_ASSETS || path.resolve(RAIZ, "..", "nimbus-assets");
const SAIDA = path.join(RAIZ, "public/loja-preview/media");
fs.mkdirSync(SAIDA, { recursive: true });

// campos de cor por coleção (mesmos tokens da vitrine)
const CAMPO = { street: "#101418", reliquia: "#0b2360", nuvem: "#dcebfa" };

async function editorial(entrada, saida, largura) {
  await sharp(entrada)
    .resize({ width: largura, height: 1600, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#f7fbff" }).webp({ quality: 78 }).toFile(saida);
}

// recorte sangrado: fatia um trecho da arte, compõe sobre o campo de cor e
// achata. O resultado é textura de fundo, não asset reutilizável.
async function texturaArte(entrada, saida, cor, escuro) {
  const img = sharp(entrada);
  const meta = await img.metadata();
  // fatia central-superior, cortando ~45% da arte (sangra pelas bordas)
  const w = Math.round(meta.width * 0.72);
  const h = Math.round(w * 0.66);
  const left = Math.round((meta.width - w) / 2);
  const top = Math.round(meta.height * 0.06);
  const recorte = await img.extract({ left, top, width: w, height: Math.min(h, meta.height - top) })
    .resize({ width: 900 }).png().toBuffer();
  const fundo = sharp({ create: { width: 900, height: Math.round((h / w) * 900), channels: 3, background: cor } });
  await fundo.composite([{ input: recorte, blend: escuro ? "screen" : "multiply", gravity: "north" }])
    .webp({ quality: 74 }).toFile(saida);
}

const jobs = [];

// 1) hero e editorial do casting
const CASTING = path.join(ASSETS, "casting/2026-07-16");
jobs.push(editorial(path.join(ASSETS, "marketing/2026-07-29-vitrine/hero-editorial-niemeyer.png"), path.join(SAIDA, "hero-editorial-1600.webp"), 1600));
jobs.push(editorial(path.join(CASTING, "casting-board-4-modelos.png"), path.join(SAIDA, "hero-casting-1600.webp"), 1600));
jobs.push(editorial(path.join(CASTING, "caio-identidade-3-vistas.png"), path.join(SAIDA, "editorial-street-1200.webp"), 1200));
jobs.push(editorial(path.join(CASTING, "clara-identidade-3-vistas.png"), path.join(SAIDA, "editorial-reliquia-1200.webp"), 1200));
jobs.push(editorial(path.join(CASTING, "gabriel-identidade-3-vistas.png"), path.join(SAIDA, "editorial-nuvem-1200.webp"), 1200));

// 2) banda "O caimento" (única peça vestida em resolução real)
jobs.push(editorial(path.join(ASSETS, "mockups/2026-07-29-oversized-plain/modelo-costas-65.png"), path.join(SAIDA, "caimento-costas-1400.webp"), 1400));

// 3) texturas de coleção a partir das artes 4K (recorte sangrado, sem alpha)
const PRONTOS = path.join(ASSETS, "designs/prontos");
jobs.push(texturaArte(path.join(PRONTOS, "STREET/costas/sao-miguel-spray-4k.png"), path.join(SAIDA, "colecao-street-900.webp"), CAMPO.street, true));
jobs.push(texturaArte(path.join(PRONTOS, "RELIQUIA/costas/azulejo-cruz-4k.png"), path.join(SAIDA, "colecao-reliquia-900.webp"), CAMPO.reliquia, true));
jobs.push(texturaArte(path.join(PRONTOS, "NUVEM/costas/sagrado-coracao-nuvem-4k.png"), path.join(SAIDA, "colecao-nuvem-900.webp"), CAMPO.nuvem, false));

await Promise.all(jobs);

// auditoria de saída: teto de tamanho, teto de pixels, zero alpha
let falhas = 0;
for (const f of fs.readdirSync(SAIDA).filter((f) => f.endsWith(".webp"))) {
  const p = path.join(SAIDA, f);
  const kb = fs.statSync(p).size / 1024;
  const m = await sharp(p).metadata();
  const problemas = [];
  if (kb > 200) problemas.push(`${kb.toFixed(0)} KB > 200`);
  if (Math.max(m.width, m.height) > 1600) problemas.push(`${m.width}x${m.height} > 1600`);
  if (m.hasAlpha) problemas.push("tem alpha");
  if (f.startsWith("colecao-") && Math.max(m.width, m.height) > 900) problemas.push("arte acima de 900px");
  console.log(`${f}: ${m.width}x${m.height} ${kb.toFixed(0)} KB${problemas.length ? "  !! " + problemas.join(", ") : ""}`);
  if (problemas.length) falhas++;
}
process.exit(falhas ? 1 : 0);
