import { pathToFileURL } from "node:url";
// Largura visivel do TRONCO numa faixa de linhas, para calibrar o raio efetivo
// da malha (--torso do compor).
//
// COMO ELE DECIDE O QUE E TECIDO: pela COR DO PROPRIO TECIDO, amostrada no
// centro da peca, e nao por um criterio fixo de fundo. A versao anterior
// assumia fundo colonial quente ((R-B) < 40) e, contra o CEU AZUL CLARO da
// colecao NUVEM, classificava o fundo inteiro como tecido (devolveu 1,0 na
// producao do 352723243). Amostrar a cor do tecido e imune ao cenario.
//
// Uso: node scripts/geometry/measure-torso.mjs <img> [yfrac=0.55] [--amostra 0.42]

import sharp from "sharp";

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

export async function medirTorso(src, yfrac = 0.55, { amostraY = null, tol = null } = {}) {
  const r = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = r.info;
  const px = (x, y) => {
    const o = (y * W + x) * 3;
    return [r.data[o], r.data[o + 1], r.data[o + 2]];
  };

  // 1. cor do tecido: mediana de uma janela central um pouco ACIMA da faixa
  //    pedida (evita a estampa quando ela existe) e estreita em x.
  const ay = Math.round((amostraY ?? Math.max(0.3, yfrac - 0.12)) * H);
  const amostras = [];
  for (let y = ay - 12; y <= ay + 12; y += 2) {
    for (let x = Math.round(0.45 * W); x <= Math.round(0.55 * W); x += 2) {
      if (y < 0 || y >= H) continue;
      amostras.push(px(x, y));
    }
  }
  amostras.sort((a, b) => lum(...a) - lum(...b));
  const tecido = amostras[Math.floor(amostras.length / 2)];
  const lt = lum(...tecido);
  const T = tol ?? (lt < 90 ? 42 : 52);

  const ehTecido = (c) =>
    Math.abs(c[0] - tecido[0]) < T && Math.abs(c[1] - tecido[1]) < T && Math.abs(c[2] - tecido[2]) < T;

  const linhas = [];
  for (let dy = -8; dy <= 8; dy += 4) {
    const y = Math.round(yfrac * H) + dy;
    if (y < 0 || y >= H) continue;
    let best = 0, cur = 0, x0 = 0, bx0 = 0, bx1 = 0;
    for (let x = 0; x < W; x += 1) {
      if (ehTecido(px(x, y))) {
        if (cur === 0) x0 = x;
        cur += 1;
        if (cur > best) { best = cur; bx0 = x0; bx1 = x; }
      } else if (cur > 0 && x + 3 < W) {
        if ([1, 2, 3].some((k) => ehTecido(px(x + k, y)))) { cur += 1; continue; }
        cur = 0;
      } else cur = 0;
    }
    linhas.push({ y, px: best, frac: +(best / W).toFixed(4), x0: +((100 * bx0) / W).toFixed(1), x1: +((100 * bx1) / W).toFixed(1) });
  }
  const fracs = linhas.map((l) => l.frac).sort((a, b) => a - b);
  const mediana = fracs[Math.floor(fracs.length / 2)];
  return {
    cor_tecido: tecido, luminancia_tecido: +lt.toFixed(1), tolerancia: T,
    linhas, medianaFrac: mediana,
    suspeito: mediana > 0.92 || mediana < 0.15,
    nota: mediana > 0.92
      ? "SUSPEITO: quase a linha inteira virou tecido — cor do tecido parecida com a do fundo; medir a olho no zoom"
      : null,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const i = process.argv.indexOf("--amostra");
  const r = await medirTorso(process.argv[2], Number(process.argv[3] ?? 0.55), {
    amostraY: i > -1 ? Number(process.argv[i + 1]) : null,
  });
  console.log(JSON.stringify(r, null, 1));
}
