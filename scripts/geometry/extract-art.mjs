import { pathToFileURL, fileURLToPath } from "node:url";
// EXTRACAO DA ARTE COM AUTO-VALIDACAO.
//
// Nasceu de um erro do piloto de 25/07 e existe para que ele nao se repita.
//
// O QUE DEU ERRADO. Para compor a arte no tamanho certo e preciso um recorte
// que contenha a arte E NADA ALEM DELA: os cm oficiais descrevem a caixa da
// tinta, entao qualquer margem de tecido no recorte faz os cm serem aplicados
// ao recorte e nao a arte. No piloto isso produziu uma foto 18% PIOR que a
// original — e que parecia melhor a olho. Foram tres recortes errados antes de
// acertar.
//
// O QUE CONSERTA. A arte tem razao largura/altura CONHECIDA, dos cm oficiais.
// Um recorte so pode estar certo se a razao dele bater com a oficial. Isso
// transforma "recortar no olho" numa BUSCA COM CRITERIO: varre-se limiar e
// janela, e escolhe-se o candidato cuja razao mais se aproxima da oficial.
// Se nenhum candidato chegar perto, o produto e RECUSADO em vez de medido
// errado — que e a diferenca entre um pipeline que escala e um que espalha
// erro por 49 produtos.
//
// Limiar e escolhido pelo VALE do histograma, nao por constante: tinta clara
// sobre tecido escuro e um problema bimodal, e o vale entre os dois modos e
// onde o corte pertence. Constante fixa quebrou em tecido off-white.

import sharp from "sharp";

/** Vale do histograma de luminancia entre os dois modos dominantes. */
export function limiarPorVale(lums, bins = 48) {
  const h = new Array(bins).fill(0);
  for (const l of lums) h[Math.min(bins - 1, Math.floor((l / 256) * bins))] += 1;
  // suaviza para o vale nao cair em ruido
  const s = h.map((_, i) => (h[i - 1] ?? 0) + h[i] + (h[i + 1] ?? 0));
  let pico1 = 0;
  for (let i = 1; i < bins; i += 1) if (s[i] > s[pico1]) pico1 = i;
  let pico2 = -1;
  for (let i = 0; i < bins; i += 1) {
    if (Math.abs(i - pico1) < bins / 8) continue;
    if (pico2 < 0 || s[i] > s[pico2]) pico2 = i;
  }
  if (pico2 < 0) return null;
  const [a, b] = [Math.min(pico1, pico2), Math.max(pico1, pico2)];
  let vale = a;
  for (let i = a; i <= b; i += 1) if (s[i] < s[vale]) vale = i;
  return ((vale + 0.5) * 256) / bins;
}

/**
 * Acha a caixa da tinta numa janela, com um limiar dado.
 * @returns {{x0,x1,y0,y1,n,encosta:string[]}|null}
 */
function caixaDeTinta(data, W, H, C, lim, claro = true) {
  let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1, n = 0;
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const i = (y * W + x) * C;
      const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (claro ? l > lim : l < lim) {
        n += 1;
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (n === 0) return null;
  const encosta = [];
  if (y0 === 0) encosta.push("topo");
  if (x0 === 0) encosta.push("esq");
  if (x1 === W - 1) encosta.push("dir");
  if (y1 === H - 1) encosta.push("base");
  return { x0, x1, y0, y1, n, encosta };
}

/**
 * Extrai a arte de uma foto, validando pela razao oficial.
 *
 * @param {string} foto caminho
 * @param {{w:number,h:number}} artCm dimensoes oficiais, para a razao
 * @param {object} [opts]
 * @param {number} [opts.tolRazao] desvio maximo aceito na razao (padrao 0,06)
 * @returns {Promise<{ok:boolean,motivo?:string,caixa?:object,razao?:number,
 *   desvioRazao?:number,limiar?:number,janela?:object}>}
 */
export async function extrairArte(foto, artCm, opts = {}) {
  const tol = opts.tolRazao ?? 0.06;
  const razaoOficial = artCm.w / artCm.h;
  const meta = await sharp(foto).metadata();
  const W0 = meta.width, H0 = meta.height;

  // Janelas candidatas: varias larguras e alturas em torno do dorso. Nenhuma
  // e "a certa" a priori — quem decide e a razao.
  const janelas = [];
  for (const cx of [0.46, 0.49, 0.52, 0.55, 0.58]) {
    for (const semiW of [0.11, 0.13, 0.15, 0.17, 0.20]) {
      for (const y0 of [0.30, 0.33, 0.36, 0.39]) {
        for (const y1 of [0.56, 0.59, 0.62, 0.66]) {
          janelas.push({ x0: cx - semiW, x1: cx + semiW, y0, y1 });
        }
      }
    }
  }

  let melhor = null;
  for (const J of janelas) {
    if (J.x0 < 0.02 || J.x1 > 0.98 || J.y1 - J.y0 < 0.15) continue;
    const L = Math.round(J.x0 * W0), T = Math.round(J.y0 * H0);
    const Wc = Math.round((J.x1 - J.x0) * W0), Hc = Math.round((J.y1 - J.y0) * H0);
    let raw;
    try {
      raw = await sharp(foto).extract({ left: L, top: T, width: Wc, height: Hc })
        .removeAlpha().raw().toBuffer({ resolveWithObject: true });
    } catch { continue; }
    const { width: W, height: H, channels: C } = raw.info;
    const lums = [];
    for (let i = 0; i < W * H; i += 7) {
      const p = i * C;
      lums.push(0.299 * raw.data[p] + 0.587 * raw.data[p + 1] + 0.114 * raw.data[p + 2]);
    }
    const lim = limiarPorVale(lums);
    if (lim === null) continue;
    // tinta clara sobre tecido escuro, e o contrario: os dois casos existem
    for (const claro of [true, false]) {
      const cx2 = caixaDeTinta(raw.data, W, H, C, lim, claro);
      if (!cx2 || cx2.encosta.length) continue; // encostou = janela cortou a arte
      const w = cx2.x1 - cx2.x0 + 1, h = cx2.y1 - cx2.y0 + 1;
      if (w < 30 || h < 30) continue;
      const razao = w / h;
      const desvio = Math.abs(razao / razaoOficial - 1);
      if (!melhor || desvio < melhor.desvioRazao) {
        melhor = {
          desvioRazao: desvio, razao, limiar: lim, claro,
          janela: J,
          caixa: { left: L + cx2.x0, top: T + cx2.y0, width: w, height: h },
          fracoes: {
            x0: (L + cx2.x0) / W0, x1: (L + cx2.x1) / W0,
            y0: (T + cx2.y0) / H0, y1: (T + cx2.y1) / H0,
            altura_pontos: (100 * h) / H0,
          },
        };
      }
    }
  }

  if (!melhor) return { ok: false, motivo: "nenhuma janela produziu caixa limpa" };
  if (melhor.desvioRazao > tol) {
    return {
      ok: false,
      motivo: `melhor razao ${melhor.razao.toFixed(3)} contra oficial ${razaoOficial.toFixed(3)} (desvio ${(100 * melhor.desvioRazao).toFixed(1)}%) — acima da tolerancia de ${(100 * tol).toFixed(0)}%`,
      ...melhor,
    };
  }
  return { ok: true, ...melhor };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const foto = process.argv[2];
  const [w, h] = process.argv[3].split("x").map(Number);
  const r = await extrairArte(foto, { w, h });
  console.log(JSON.stringify(r, null, 2));
  if (r.ok && process.argv[4]) {
    await sharp(foto).extract(r.caixa).png().toFile(process.argv[4]);
    console.log("gravado:", process.argv[4]);
  }
}
