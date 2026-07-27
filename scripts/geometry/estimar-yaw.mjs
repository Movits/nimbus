// YAW MEDIDO PELA COSTURA CENTRAL — nao escolhido no olho.
//
// O dono pediu uma forma universal de acertar o yaw, e ela existe porque todo
// blank de costas tem um landmark do meridiano central da peca: a costura
// vertical do capuz no moletom, o centro da gola (etiqueta/pingo da ribana) na
// camiseta. Esse ponto e a unica marca do EIXO VERDADEIRO da roupa que nao
// depende de manga, braco nem pose — foi o dono que apontou a linha.
//
// A conta: num cilindro de raio R girado por psi, o meridiano central projeta
// em  x = cx + f*R*sin(psi) / (D - R*cos(psi)).  O meio da silhueta continua
// sendo cx para QUALQUER psi (por isso nenhum check anterior enxergava o
// erro). Entao `centro` (eixo, da silhueta) e `costura` (meridiano) sao dois
// landmarks independentes, e o yaw sai da distancia entre eles.
//
// A inversao NAO reimplementa a formula: varre o proprio `artMesh` — o mesmo
// codigo que rasteriza — e acha o yaw cujo meridiano central cai na costura.
// Formula copiada e a receita classica de erro de sinal.
//
// Uso: node scripts/geometry/estimar-yaw.mjs --receita <r.json> --costura-x <frac>

import fs from "node:fs";
import sharp from "sharp";
import { planejar } from "../compose-art.mjs";
import { artMesh } from "./render.mjs";

const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i === -1 ? d : process.argv[i + 1];
};
const receitaPath = arg("--receita");
const costuraX = Number(arg("--costura-x"));
if (!receitaPath || !Number.isFinite(costuraX)) {
  console.error("uso: --receita <r.json> --costura-x <fracao da largura da imagem>");
  process.exit(1);
}
const rec = JSON.parse(fs.readFileSync(receitaPath, "utf8"));
const [aw, ah] = String(rec.arte_cm).split("x").map(Number);
const meta = await sharp(String(rec.foto).replace(/\\/g, "/")).metadata();

/** x (px) do meridiano central da arte para um dado yaw, pelo proprio renderer. */
function meridianoPx(yaw) {
  const plano = planejar({
    golaFrac: rec.gola, barraFrac: rec.barra, centroFrac: rec.centro ?? 0.5,
    imgW: meta.width, imgH: meta.height, artW_cm: aw, artH_cm: ah,
    peca: rec.peca, torsoFrac: rec.torso ?? null, yawDeg: yaw, placementCm: rec.placement,
  });
  const { cols, rows, pts } = artMesh(plano.params);
  const i = Math.floor(cols / 2);
  const xs = [];
  for (let j = 0; j < rows; j += 1) { const q = pts[j * cols + i]; if (q) xs.push(q[0]); }
  return xs.reduce((s, v) => s + v, 0) / xs.length;
}

const alvo = costuraX * meta.width;
let melhor = { yaw: 0, erro: Infinity };
for (let y = -40; y <= 40; y += 0.25) {
  const e = Math.abs(meridianoPx(y) - alvo);
  if (e < melhor.erro) melhor = { yaw: y, erro: e };
}

// Diagnostico: quanto a costura foge do eixo, em fracao do torso visivel.
const eixoPx = (rec.centro ?? 0.5) * meta.width;
const torsoPx = (rec.torso ?? 0.35) * meta.width;

console.log(JSON.stringify({
  receita: receitaPath, produto: rec.produto, peca: rec.peca,
  costura_x: costuraX, eixo_centro: rec.centro ?? 0.5,
  desvio_costura_eixo_frac_torso: +(((alvo - eixoPx) / torsoPx)).toFixed(4),
  yaw_medido: melhor.yaw,
  residuo_px: +melhor.erro.toFixed(2),
  meridiano_yaw0_px: +meridianoPx(0).toFixed(1),
  nota: "yaw resolvido varrendo o proprio artMesh ate o meridiano central cair na costura",
}, null, 1));
