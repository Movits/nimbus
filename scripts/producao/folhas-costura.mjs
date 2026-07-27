// Folhas de contato para leitura de costura: cabeca+gola de cada blank,
// contraste pela cor, eixo (centro) em magenta, grade fina de 0.01.
import fs from "node:fs";
import sharp from "sharp";
const S = process.argv[2];
const { fila } = JSON.parse(fs.readFileSync("nuvemshop/producao/fila-recomposicao.json", "utf8"));
const X0 = 0.25, X1 = 0.75, Y0 = 0.06, Y1 = 0.42, TW = 620;
const tiles = [];
for (const f of fila) {
  const meta = await sharp(f.blank).metadata();
  const esc = f.cor === "preta" ? [3.4, -18] : [4.6, -920];
  const crop = await sharp(f.blank).linear(esc[0], esc[1])
    .extract({ left: Math.round(X0 * meta.width), top: Math.round(Y0 * meta.height),
      width: Math.round((X1 - X0) * meta.width), height: Math.round((Y1 - Y0) * meta.height) })
    .resize({ width: TW }).png().toBuffer();
  const m = await sharp(crop).metadata();
  let g = "";
  for (let x = Math.ceil(X0 * 100); x <= Math.floor(X1 * 100); x += 1) {
    const px = ((x / 100 - X0) / (X1 - X0)) * TW;
    const grossa = x % 5 === 0;
    g += `<rect x="${px.toFixed(1)}" y="14" width="${grossa ? 1.4 : 0.6}" height="${m.height}" fill="#ff2d2d" opacity="${grossa ? 0.8 : 0.35}"/>`;
    if (grossa) g += `<text x="${(px + 2).toFixed(1)}" y="26" font-family="monospace" font-size="10" fill="#ff2d2d" stroke="#000" stroke-width="0.3">${(x / 100).toFixed(2)}</text>`;
  }
  const ax = ((f.centro ?? 0.5) - X0) / (X1 - X0) * TW;
  g += `<rect x="${ax.toFixed(1)}" y="14" width="2" height="${m.height}" fill="#ff00ff"/>`;
  g += `<rect x="0" y="0" width="${TW}" height="14" fill="#fff"/><text x="3" y="11" font-family="monospace" font-size="11" fill="#111">${f.id}-${f.cor} centro=${f.centro ?? "?"}</text>`;
  const sv = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${m.height + 14}">${g}</svg>`)).png().toBuffer();
  const tile = await sharp({ create: { width: TW, height: m.height + 14, channels: 3, background: "#fff" } })
    .composite([{ input: crop, top: 14, left: 0 }, { input: sv, top: 0, left: 0 }]).png().toBuffer();
  tiles.push({ tile, h: m.height + 14, rot: `${f.id}-${f.cor}` });
}
const COLS = 3, ROWS = 3;
let folha = 0;
for (let i = 0; i < tiles.length; i += COLS * ROWS) {
  const grupo = tiles.slice(i, i + COLS * ROWS);
  const hMax = Math.max(...grupo.map((t) => t.h));
  const W = COLS * TW + (COLS - 1) * 6, H = Math.ceil(grupo.length / COLS) * (hMax + 6);
  await sharp({ create: { width: W, height: H, channels: 3, background: "#ffffff" } })
    .composite(grupo.map((t, k) => ({ input: t.tile, left: (k % COLS) * (TW + 6), top: Math.floor(k / COLS) * (hMax + 6) })))
    .jpeg({ quality: 90 }).toFile(`${S}/costuras-${String(folha).padStart(2, "0")}.jpg`);
  folha += 1;
}
console.log(`folhas: ${folha} | tiles: ${tiles.length}`);
