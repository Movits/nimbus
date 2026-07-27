// Folhas de releitura de torso/centro para as variantes marcadas na auditoria.
import fs from "node:fs";
import sharp from "sharp";
const S = process.argv[2];
const { fila } = JSON.parse(fs.readFileSync("nuvemshop/producao/fila-recomposicao.json", "utf8"));
const alvo = fila.filter((f) => f.precisa_releitura.length);
const X0 = 0.12, X1 = 0.88, Y0 = 0.30, Y1 = 0.80, TW = 900;
const tiles = [];
for (const f of alvo) {
  const meta = await sharp(f.blank).metadata();
  const esc = f.cor === "preta" ? [3.4, -18] : [2.2, -160];
  const crop = await sharp(f.blank).linear(esc[0], esc[1])
    .extract({ left: Math.round(X0 * meta.width), top: Math.round(Y0 * meta.height),
      width: Math.round((X1 - X0) * meta.width), height: Math.round((Y1 - Y0) * meta.height) })
    .resize({ width: TW }).png().toBuffer();
  const m = await sharp(crop).metadata();
  let g = "";
  for (let x = Math.ceil(X0 * 50); x <= Math.floor(X1 * 50); x += 1) {
    const fr = x / 50;
    const px = ((fr - X0) / (X1 - X0)) * TW;
    const grossa = x % 5 === 0;
    g += `<rect x="${px.toFixed(1)}" y="16" width="${grossa ? 1.6 : 0.6}" height="${m.height}" fill="#ff2d2d" opacity="${grossa ? 0.85 : 0.35}"/>`;
    if (grossa) g += `<text x="${(px + 2).toFixed(1)}" y="30" font-family="monospace" font-size="12" fill="#ff2d2d" stroke="#000" stroke-width="0.35">${fr.toFixed(2)}</text>`;
  }
  const ax = (((f.centro ?? 0.5)) - X0) / (X1 - X0) * TW;
  g += `<rect x="${ax.toFixed(1)}" y="16" width="2" height="${m.height}" fill="#ff00ff"/>`;
  g += `<rect x="0" y="0" width="${TW}" height="16" fill="#fff"/><text x="3" y="12" font-family="monospace" font-size="12" fill="#111">${f.id}-${f.cor} ${f.peca} centro=${f.centro ?? "?"} torso=${f.torso ?? "?"} :: ${f.precisa_releitura[0].slice(0, 60)}</text>`;
  const sv = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${TW}" height="${m.height + 16}">${g}</svg>`)).png().toBuffer();
  tiles.push(await sharp({ create: { width: TW, height: m.height + 16, channels: 3, background: "#fff" } })
    .composite([{ input: crop, top: 16, left: 0 }, { input: sv, top: 0, left: 0 }]).png().toBuffer());
}
const POR = 4;
let n = 0;
for (let i = 0; i < tiles.length; i += POR) {
  const grupo = tiles.slice(i, i + POR);
  const ms = await Promise.all(grupo.map((t) => sharp(t).metadata()));
  const H = ms.reduce((s, m2) => s + m2.height + 6, 0);
  await sharp({ create: { width: TW, height: H, channels: 3, background: "#fff" } })
    .composite(grupo.map((t, k2) => ({ input: t, left: 0, top: ms.slice(0, k2).reduce((s, m2) => s + m2.height + 6, 0) })))
    .jpeg({ quality: 90 }).toFile(`${S}/torso-${n}.jpg`);
  n += 1;
}
console.log(`alvo ${alvo.length} | folhas ${n}`);
console.log(alvo.map((a) => `${a.id}-${a.cor}`).join(" "));
