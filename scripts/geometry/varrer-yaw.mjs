// VARREDURA DE YAW COM O MERIDIANO DA ESTAMPA DESENHADO.
//
// O dono apontou o defeito que nenhum instrumento daqui pega: as estampas
// saem giradas em torno do corpo. Os modelos posam em 3/4 e as capas foram
// compostas com yaw 0. Num cilindro girado por psi, o meio da silhueta
// corresponde ao meridiano psi e nao ao centro das costas, entao centrar a
// arte ali a poe em phi = -psi.
//
// E cego para todo check que compara a caixa da arte com o meio da silhueta,
// porque num cilindro girado o meio da silhueta E o eixo projetado. Por isso
// `fidelidade-horizontal` aprovava e o olho reprovava.
//
// O que este script desenha e a COLUNA DO MEIO DA MALHA, ou seja o meridiano
// central da estampa. Ela tem que cair sobre a costura central das costas da
// peca — que e o unico landmark do eixo verdadeiro visivel na foto, melhor que
// o meio da silhueta e melhor que os vincos de cava. Foi o dono que apontou
// essa linha.
//
// Uso: node scripts/geometry/varrer-yaw.mjs --receita <r.json> --saida <a.jpg>
//        --yaws 0,-14,-20,-26

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import sharp from "sharp";
import { planejar } from "../compose-art.mjs";
import { artMesh } from "./render.mjs";


const arg = (n, d = null) => { const i = process.argv.indexOf(n); return i === -1 ? d : process.argv[i + 1]; };
const receitaPath = arg("--receita");
const saida = arg("--saida");
const yaws = String(arg("--yaws", "0,-7,-14,-21")).split(",").map(Number);
if (!receitaPath || !saida) { console.error("uso: --receita <r.json> --saida <a.jpg> [--yaws 0,-14,-20]"); process.exit(1); }
const rec = JSON.parse(fs.readFileSync(receitaPath, "utf8"));
const [awv, ahv] = String(rec.arte_cm).split("x").map(Number);
const base = {
  produto: rec.produto, peca: rec.peca, foto: String(rec.foto).replace(/\\/g, "/"), arte: String(rec.arte).replace(/\\/g, "/"),
  aw: awv, ah: ahv, gola: rec.gola, barra: rec.barra, centro: rec.centro ?? 0.5,
  torso: rec.torso ?? null, placement: rec.placement,
};
const TMP = fs.mkdtempSync("tmp-yaw-");
const meta = await sharp(base.foto).metadata();

const tiles = [];
for (const yaw of yaws) {
  const out = `${TMP}/mer_${yaw}.png`;
  {
    execFileSync("node", ["scripts/produce-cover.mjs", "compor",
      "--produto", base.produto, "--peca", base.peca, "--foto", base.foto, "--arte", base.arte,
      "--arte-cm", `${base.aw}x${base.ah}`, "--gola", String(base.gola), "--barra", String(base.barra),
      "--centro", String(base.centro), ...(base.torso ? ["--torso", String(base.torso)] : []), "--placement", String(base.placement),
      "--yaw", String(yaw), "--relevo", "3", "--opacidade", "0.93",
      "--sombra-min", "0.6", "--sombra-max", "1.35", "--sombra-tecido", "0.9", "--out", out],
      { stdio: "ignore" });
  }
  const plano = planejar({
    golaFrac: base.gola, barraFrac: base.barra, centroFrac: base.centro,
    imgW: meta.width, imgH: meta.height, artW_cm: base.aw, artH_cm: base.ah,
    peca: base.peca, torsoFrac: base.torso, yawDeg: yaw, placementCm: base.placement,
  });
  const { cols, rows, pts } = artMesh(plano.params);
  const i = Math.floor(cols / 2);
  const pontos = [];
  for (let j = 0; j < rows; j += 1) { const q = pts[j * cols + i]; if (q) pontos.push(q); }
  // prolonga a linha para cima e para baixo, para dar para comparar com a costura
  const p0 = pontos[0], p1 = pontos[pontos.length - 1];
  const dx = (p1[0] - p0[0]) / (p1[1] - p0[1] || 1);
  const topo = [p0[0] - dx * (p0[1] - 0.30 * meta.height), 0.30 * meta.height];
  const baixo = [p1[0] + dx * (0.92 * meta.height - p1[1]), 0.92 * meta.height];
  const d = [topo, ...pontos, baixo].map((p, k) => `${k ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${meta.width}" height="${meta.height}">
    <path d="${d}" fill="none" stroke="#00e5ff" stroke-width="3" opacity="0.95"/></svg>`;
  const ov = await sharp(Buffer.from(svg)).resize(meta.width, meta.height, { fit: "fill" }).png().toBuffer();
  const comAlinha = await sharp(out).composite([{ input: ov }]).png().toBuffer();
  const crop = await sharp(comAlinha).extract({
    left: Math.round(0.24 * meta.width), top: Math.round(0.28 * meta.height),
    width: Math.round(0.52 * meta.width), height: Math.round(0.52 * meta.height),
  }).resize({ width: 430 }).png().toBuffer();
  const m = await sharp(crop).metadata();
  const rot = await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="430" height="26"><rect width="100%" height="100%" fill="#fff"/><text x="6" y="19" font-family="monospace" font-size="16" fill="#111">yaw ${yaw}</text></svg>`)).png().toBuffer();
  tiles.push(await sharp({ create: { width: 430, height: m.height + 26, channels: 3, background: "#fff" } })
    .composite([{ input: rot, top: 0, left: 0 }, { input: crop, top: 26, left: 0 }]).png().toBuffer());
}
const m0 = await sharp(tiles[0]).metadata();
await sharp({ create: { width: 430 * tiles.length + 8 * (tiles.length - 1), height: m0.height, channels: 3, background: "#fff" } })
  .composite(tiles.map((b, i) => ({ input: b, left: i * 438, top: 0 })))
  .jpeg({ quality: 94 }).toFile(saida);
fs.rmSync(TMP, { recursive: true, force: true });
console.log(`${saida} — yaws ${yaws.join(", ")}`);
