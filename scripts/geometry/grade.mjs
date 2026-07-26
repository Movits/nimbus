// GRADE SOBRE O BLANK, para ler landmark no olho com regua.
//
// `measure-torso.mjs` e segunda opiniao e `eixo-costas.mjs` esta marcado como
// nao confiavel (mediu o tronco pela metade em peca preta). O eixo se le nos
// vincos de cava, e ler no olho sem regua produz numero chutado. Esta grade
// existe para que a leitura visual vire um numero citavel: cada linha e
// rotulada com a fracao da imagem, que e exatamente a unidade que `--gola`,
// `--barra`, `--centro` e `--torso` esperam.
//
// Uso: node scripts/geometry/grade.mjs <blank> <saida.png> [--passo 0.02]
//      [--zoom x0,y0,x1,y1]   recorta a regiao (fracoes) e amplia
//
// Linha grossa a cada 0.10, fina no passo. Vertical em vermelho, horizontal
// em ciano, para nao confundir eixo com altura.

import sharp from "sharp";

const [, , entrada, saida] = process.argv;
if (!entrada || !saida) {
  console.error("uso: node scripts/geometry/grade.mjs <blank> <saida.png> [--passo 0.02] [--zoom x0,y0,x1,y1]");
  process.exit(1);
}
const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i === -1 ? d : process.argv[i + 1];
};
const passo = Number(arg("--passo", "0.02"));
const zoom = arg("--zoom", null);

const src = sharp(entrada);
const meta = await src.metadata();

// O recorte trabalha em fracoes da imagem INTEIRA, e os rotulos continuam na
// escala da imagem inteira. Sem isso o numero lido no zoom nao serve para a
// linha de comando do compositor.
let x0 = 0, y0 = 0, x1 = 1, y1 = 1;
if (zoom) [x0, y0, x1, y1] = zoom.split(",").map(Number);
const cropL = Math.round(x0 * meta.width), cropT = Math.round(y0 * meta.height);
const cropW = Math.max(1, Math.round((x1 - x0) * meta.width));
const cropH = Math.max(1, Math.round((y1 - y0) * meta.height));

// Amplia ate ~1400px de lado maior, para o rotulo caber legivel.
const escala = Math.max(1, Math.min(4, Math.round(1400 / Math.max(cropW, cropH))));
const W = cropW * escala, H = cropH * escala;

const partes = [];
const linha = (x, y, w, h, cor, op) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cor}" opacity="${op}"/>`;

for (let f = 0; f <= 1.0001; f += passo) {
  const fr = +f.toFixed(4);
  const grossa = Math.abs(fr * 10 - Math.round(fr * 10)) < 1e-6;

  // vertical (eixo / centro / torso)
  if (fr >= x0 && fr <= x1) {
    const px = (fr - x0) * meta.width * escala;
    partes.push(linha(px.toFixed(1), 0, grossa ? 2 : 1, H, "#ff2d2d", grossa ? 0.85 : 0.4));
    if (grossa) partes.push(`<text x="${(px + 4).toFixed(1)}" y="18" font-family="monospace" font-size="15" fill="#ff2d2d" stroke="#000" stroke-width="0.6">${fr.toFixed(2)}</text>`);
  }
  // horizontal (gola / barra)
  if (fr >= y0 && fr <= y1) {
    const py = (fr - y0) * meta.height * escala;
    partes.push(linha(0, py.toFixed(1), W, grossa ? 2 : 1, "#00e5ff", grossa ? 0.85 : 0.4));
    if (grossa) partes.push(`<text x="4" y="${(py - 5).toFixed(1)}" font-family="monospace" font-size="15" fill="#00e5ff" stroke="#000" stroke-width="0.6">${fr.toFixed(2)}</text>`);
  }
}

const svg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${partes.join("")}</svg>`);
await sharp(entrada)
  .extract({ left: cropL, top: cropT, width: cropW, height: cropH })
  .resize(W, H, { kernel: "nearest" })
  .composite([{ input: svg, left: 0, top: 0 }])
  .png()
  .toFile(saida);

console.log(JSON.stringify({
  saida, origem: `${meta.width}x${meta.height}`, recorte: { x0, y0, x1, y1 }, escala, passo,
  nota: "rotulos em fracao da imagem INTEIRA, a mesma unidade de --gola/--barra/--centro/--torso",
}, null, 1));
