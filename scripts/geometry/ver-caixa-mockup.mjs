// Desenha, sobre o mockup, a caixa de tinta lida e as linhas de gola/barra do
// template. E o verificador visual de `placement-mockup.mjs`.
//
// Existe porque numero de medidor nao vale sozinho neste projeto: a leitura que
// pos nove placements errados em producao tinha cara de medida boa em JSON, e
// so olhando a caixa desenhada e que se ve que ela ia da gola ate a barra.
//
// Uso: node scripts/geometry/ver-caixa-mockup.mjs <saida.jpg> <id> [<id>...]

import fs from "node:fs";
import sharp from "sharp";

const REFS = "nuvemshop/assets/product-lifestyle/2026-07-16/catalog/references";
const LEITURA = "nuvemshop/auditoria/2026-07-26-datum-mockups/horizontal-oficial.json";
const TEMPLATE = {
  "Camiseta Premium": [65.5, 453.5],
  "Camiseta Oversized Premium": [26, 492.5],
  "Moletom Canguru": [136.5, 475],
  "Blusão Moletom": [62, 450],
};

const [, , saida, ...ids] = process.argv;
if (!saida || !ids.length) {
  console.error("uso: node scripts/geometry/ver-caixa-mockup.mjs <saida.jpg> <id> [<id>...]");
  process.exit(1);
}
const leitura = JSON.parse(fs.readFileSync(LEITURA, "utf8"));

const tiles = [];
for (const id of ids) {
  const x = leitura.find((y) => y.product_id === id);
  if (!x || x.erro) { console.log(`${id}: ${x?.erro ?? "ausente"}`); continue; }
  const dir = fs.readdirSync(REFS).find((d) => d.startsWith(`${id}-`));
  const [gola, barra] = TEMPLATE[x.garment];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
    <rect x="${x.tinta_x0_px}" y="${x.tinta_topo_px}" width="${x.tinta_x1_px - x.tinta_x0_px}" height="${x.tinta_base_px - x.tinta_topo_px}" fill="none" stroke="#ff1744" stroke-width="3"/>
    <rect x="0" y="${gola}" width="500" height="2" fill="#00e5ff"/>
    <rect x="0" y="${barra}" width="500" height="2" fill="#00e5ff"/>
    <rect x="0" y="0" width="500" height="38" fill="#ffffff" opacity="0.82"/>
    <text x="6" y="16" font-family="monospace" font-size="13" fill="#111">${id} ${x.garment} ${x.mockup}</text>
    <text x="6" y="32" font-family="monospace" font-size="13" fill="#111">placement_frac ${x.placement_frac} · altura_frac ${x.altura_frac}</text>
  </svg>`;
  const base = await sharp(`${REFS}/${dir}/${x.mockup}`).resize(500, 500, { fit: "fill" }).png().toBuffer();
  const ov = await sharp(Buffer.from(svg)).resize(500, 500, { fit: "fill" }).png().toBuffer();
  tiles.push(await sharp(base).composite([{ input: ov }]).png().toBuffer());
}
if (!tiles.length) { console.error("nada para desenhar"); process.exit(2); }

const COLS = Math.min(3, tiles.length), T = 500, G = 8;
const rows = Math.ceil(tiles.length / COLS);
await sharp({ create: { width: COLS * T + (COLS - 1) * G, height: rows * T + (rows - 1) * G, channels: 3, background: "#ffffff" } })
  .composite(tiles.map((b, i) => ({ input: b, left: (i % COLS) * (T + G), top: Math.floor(i / COLS) * (T + G) })))
  .jpeg({ quality: 92 }).toFile(saida);
console.log(`${saida} — ${tiles.length} mockup(s)`);
