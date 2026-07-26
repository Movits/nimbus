import { pathToFileURL } from "node:url";
// DETECTOR DE BARRA para PECA EM BRANCO: acha os degraus de cor mais fortes
// na banda central do quarto inferior da imagem e lista os candidatos, do
// mais baixo para o mais alto. A borda real do tecido e normalmente o degrau
// forte MAIS BAIXO; pesponto e dobra da bainha aparecem 1-3 pp acima dela e
// foram exatamente o que enganou a leitura visual duas vezes (352407196:
// 92,9 lida vs 94,9 real; 352718999: 93,6 lida vs ~97,0 real).
//
// Uso: node scripts/geometry/detect-hem.mjs <blank.png> [--faixa 0.44,0.56] [--de 0.80] [--ate 0.995]

import sharp from "sharp";

const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};

export async function detectarBarra(src, { faixa = [0.44, 0.56], de = 0.8, ate = 0.995 } = {}) {
  const r = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = r.info;
  const x0 = Math.round(faixa[0] * W), x1 = Math.round(faixa[1] * W);
  const perf = [];
  for (let y = 0; y < H; y += 1) {
    let R = 0, G = 0, B = 0, n = 0;
    for (let x = x0; x <= x1; x += 1) {
      const o = (y * W + x) * 3;
      R += r.data[o]; G += r.data[o + 1]; B += r.data[o + 2]; n += 1;
    }
    perf.push([R / n, G / n, B / n]);
  }
  const jan = Math.max(4, Math.round(0.012 * H));
  const degraus = [];
  for (let y = Math.round(de * H); y < Math.min(H - jan - 1, Math.round(ate * H)); y += 1) {
    const a = [0, 0, 0], b = [0, 0, 0];
    for (let k = 1; k <= jan; k += 1) {
      for (let c = 0; c < 3; c += 1) { a[c] += perf[y - k][c]; b[c] += perf[y + k][c]; }
    }
    let d = 0;
    for (let c = 0; c < 3; c += 1) d += ((a[c] - b[c]) / jan) ** 2;
    degraus.push({ y, forca: Math.sqrt(d) });
  }
  // maximos locais com supressao de vizinhanca (janela)
  const picos = [];
  for (const p of degraus.sort((u, v) => v.forca - u.forca)) {
    if (picos.length >= 4) break;
    if (picos.every((q) => Math.abs(q.y - p.y) > jan * 2)) picos.push(p);
  }
  picos.sort((u, v) => v.y - u.y); // do mais baixo (maior y) para cima
  return {
    candidatos: picos.map((p) => ({ y_pct: +((100 * p.y) / H).toFixed(2), forca: +p.forca.toFixed(1) })),
    sugestao_borda_pct: picos.length ? +((100 * picos[0].y) / H).toFixed(2) : null,
    nota: "sugestao = degrau forte mais baixo; conferir se nao e sombra do chao/calca",
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const faixa = (arg("--faixa", "0.44,0.56")).split(",").map(Number);
  const r = await detectarBarra(process.argv[2], {
    faixa, de: Number(arg("--de", "0.80")), ate: Number(arg("--ate", "0.995")),
  });
  console.log(JSON.stringify(r, null, 2));
}
