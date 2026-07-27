// Folhas da auditoria visual (Pass B): cada capa composta com o meridiano da
// estampa desenhado, para julgar yaw/alinhamento sobre a capa pronta.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
const S = process.argv[2];
const D = "nuvemshop/assets/producao-capas";
const rel = JSON.parse(fs.readFileSync("nuvemshop/producao/relatorio-recomposicao.json", "utf8"));
const { fila } = JSON.parse(fs.readFileSync("nuvemshop/producao/fila-recomposicao.json", "utf8"));
const X0 = 0.20, X1 = 0.80, Y0 = 0.10, Y1 = 0.92, TW = 850;
const tiles = [];
for (const f of fila) {
  const k = `${f.id}|${f.cor}`;
  const r = rel[k];
  if (!r?.ok) { continue; }
  const png = path.join(D, f.id, r.out);
  const rec = JSON.parse(fs.readFileSync(png.replace(/\.png$/, ".receita.json"), "utf8"));
  const meta = await sharp(png).metadata();
  // meridiano da estampa: centro para yaw 0; deslocado para yaw != 0 — desenha
  // a partir da geometria gravada (aproximacao: coluna central do alvo)
  const mer = rec.yaw ? null : (rec.centro ?? 0.5); // para yaw!=0 a linha vem do ajuste (costura)
  const linha = mer != null ? `<rect x="${(mer * meta.width).toFixed(1)}" y="0" width="2" height="${meta.height}" fill="#00e5ff" opacity="0.85"/>` : "";
  const cab = `${f.id}-${f.cor} ${f.peca} yaw=${r.yaw} ${r.gate}${r.releitura ? " [RELEITURA]" : ""}${r.oclusao ? " [OCL]" : ""}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">${linha}
    <rect x="0" y="0" width="${meta.width}" height="26" fill="#fff" opacity="0.85"/>
    <text x="6" y="19" font-family="monospace" font-size="15" fill="#111">${cab}</text></svg>`;
  const comp = await sharp(png).composite([{ input: Buffer.from(svg) }]).png().toBuffer();
  const crop = await sharp(comp).extract({
    left: Math.round(X0 * meta.width), top: Math.round(Y0 * meta.height),
    width: Math.round((X1 - X0) * meta.width), height: Math.round((Y1 - Y0) * meta.height),
  }).resize({ width: TW }).png().toBuffer();
  tiles.push(crop);
}
const COLS = 2, ROWS = 3;
let n = 0;
for (let i = 0; i < tiles.length; i += COLS * ROWS) {
  const grupo = tiles.slice(i, i + COLS * ROWS);
  const ms = await Promise.all(grupo.map((t) => sharp(t).metadata()));
  const hMax = Math.max(...ms.map((m) => m.height));
  const W = COLS * TW + (COLS - 1) * 8;
  const H = Math.ceil(grupo.length / COLS) * (hMax + 8);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#fff" } })
    .composite(grupo.map((t, k2) => ({ input: t, left: (k2 % COLS) * (TW + 8), top: Math.floor(k2 / COLS) * (hMax + 8) })))
    .jpeg({ quality: 88 }).toFile(`${S}/passB-${String(n).padStart(2, "0")}.jpg`);
  n += 1;
}
console.log(`tiles ${tiles.length} | folhas ${n}`);
