import { pathToFileURL } from "node:url";
// OCLUSAO POS-COMPOSICAO: restaura os pixels da peca em branco por cima da
// arte composta, dentro de um poligono (tipicamente o capuz de um moletom).
//
// Por que existe. A composicao pinta a arte inteira sobre a foto, mas num
// moletom o drape do capuz cobre fisicamente o topo da estampa. Fingir que o
// capuz nao existe (pintar arte por cima dele) e defeito visivel; empurrar a
// arte para baixo do drape distorce o placement oficial em ate ~9 cm. A
// resposta certa e a mesma da fisica: a arte fica no lugar oficial e o capuz
// OCLUI o que cobriria. Como a foto composta e identica a peca em branco fora
// da zona da arte, restaurar o blank dentro do poligono do capuz produz
// exatamente a oclusao real, com a borda seguindo o drape.
//
// A borda do poligono e suavizada (feather) para o corte nao serrilhar.
//
// Uso:
//   node scripts/compose-occlude.mjs --composta v6.png --blank blank.png \
//     --poligono "39.5,37.5 41,39.5 43,41.5 46,43.2 49,44.3 52,44.6 55,44.3 58,43.2 61,41.3 63,39.2 64.5,37.2" \
//     --out v6-final.png [--feather 3]
//
// O poligono e a POLILINHA da borda inferior do capuz, em % da imagem
// (x,y separados por virgula; pontos separados por espaco), da esquerda para a
// direita. O script fecha o poligono automaticamente subindo ate o topo da
// imagem pelos dois extremos.

import fs from "node:fs";
import sharp from "sharp";

const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};

export async function ocluir({ composta, blank, polilinha, out, featherPx = 3 }) {
  const base = await sharp(composta).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = base.info;
  const bl = await sharp(blank).removeAlpha().resize(W, H).raw().toBuffer({ resolveWithObject: true });

  const pts = polilinha.map((p) => [(p[0] / 100) * W, (p[1] / 100) * H]);
  const primeiro = pts[0], ultimo = pts[pts.length - 1];
  const poly = [[primeiro[0], 0], ...pts, [ultimo[0], 0]];
  const d = poly.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + " Z";

  // mascara branca = area do capuz (restaurar blank), com feather por blur
  const svg = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">` +
    `<path d="${d}" fill="#ffffff"/></svg>`,
  );
  const mask = await sharp(svg).blur(featherPx).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const outBuf = Buffer.from(base.data);
  let restaurados = 0;
  for (let i = 0, o = 0; i < W * H; i += 1, o += 3) {
    const m = mask.data[i * 4] / 255; // canal R da mascara borrada
    if (m > 0.003) {
      outBuf[o] = Math.round(m * bl.data[o] + (1 - m) * base.data[o]);
      outBuf[o + 1] = Math.round(m * bl.data[o + 1] + (1 - m) * base.data[o + 1]);
      outBuf[o + 2] = Math.round(m * bl.data[o + 2] + (1 - m) * base.data[o + 2]);
      if (m > 0.5) restaurados += 1;
    }
  }
  await sharp(outBuf, { raw: { width: W, height: H, channels: 3 } }).png().toFile(out);
  return { out, restaurados_pct: +((100 * restaurados) / (W * H)).toFixed(2) };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const polilinha = arg("--poligono").trim().split(/\s+/).map((p) => p.split(",").map(Number));
  const r = await ocluir({
    composta: arg("--composta"), blank: arg("--blank"), polilinha,
    out: arg("--out"), featherPx: Number(arg("--feather", "3")),
  });
  console.log(JSON.stringify(r));
}
