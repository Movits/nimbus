// REGISTRO DA ARTE: acha a arte conhecida dentro da foto, em vez de pedir a
// alguem que desenhe uma caixa em volta dela.
//
// Por que isto existe. A margem publicada do medidor para arte de silhueta
// livre e de 8 pp, e a causa nao e projecao: e DESACORDO ENTRE ANOTADORES sobre
// onde a tinta difusa termina. Nas anotacoes reais aparece literalmente escrito
// — "existe um anel claro que pode ser tinta ou vinco do moletom", "o contorno
// preto externo e indistinguivel do tecido preto", "dois picos empatados dentro
// de 0,05 pp", "se so tinta escura contar, o topo cai e a altura encolhe ~3,5%".
// Quando dois anotadores escolhem ELEMENTOS diferentes como extremo, o erro nao
// e ruido de ponteiro: e um degrau, e nenhuma media conserta.
//
// O registro nao tem essa duvida. Ele sabe qual e a arte inteira, porque a arte
// e a ENTRADA: ele procura ONDE ela esta, nao O QUE ela e.
//
// Metodo: correlacao cruzada normalizada sobre MAGNITUDE DE GRADIENTE, em
// piramide de tres niveis. Gradiente porque a arte impressa muda de cor com o
// tecido, com a luz e com a compressao, mas as bordas ficam onde estao.

/** Magnitude de gradiente de imagem RGB crua. */
export function gradientMagnitude(data, W, H, C) {
  const g = new Float32Array(W * H);
  const lum = (i) => 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  for (let y = 1; y < H - 1; y += 1) {
    for (let x = 1; x < W - 1; x += 1) {
      const i = (y * W + x) * C;
      const gx = lum(i + C) - lum(i - C);
      const gy = lum(i + W * C) - lum(i - W * C);
      g[y * W + x] = Math.hypot(gx, gy);
    }
  }
  return g;
}

/** Reduz para uma largura alvo por media de blocos. */
function pyr(src, W, H, targetMax) {
  const f = Math.max(1, Math.round(Math.max(W, H) / targetMax));
  if (f === 1) return { data: src, width: W, height: H, factor: 1 };
  const w = Math.floor(W / f), h = Math.floor(H / f);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let s = 0;
      for (let j = 0; j < f; j += 1) for (let i = 0; i < f; i += 1) s += src[(y * f + j) * W + (x * f + i)];
      out[y * w + x] = s / (f * f);
    }
  }
  return { data: out, width: w, height: h, factor: f };
}

/**
 * MODELO DE ENROLAMENTO, dentro do registro.
 *
 * Ajustar uma SIMILARIDADE a uma arte enrolada num cilindro deixa residuo que
 * cresce com o quanto a arte enrola. Medido: o erro do registro vai de -0,79 pp
 * com a arte a 0,85x para -2,49 pp a 1,2x, e o desvio de 2,10 para 3,43. Nao e
 * ruido, e o modelo errado.
 *
 * Dois parametros descrevem o que a projecao faz com a arte:
 *   alpha  meio-arco que a arte ocupa no dorso, em radianos (alpha = W/2R)
 *   rho    R/D, o quanto a profundidade varia entre o centro e a borda
 *
 * Para u em [-0.5, 0.5] ao longo da largura da arte:
 *   x na tela          ~ sin(2*alpha*u) / (1 - rho*cos(2*alpha*u))
 *   ampliacao vertical = (1 - rho) / (1 - rho*cos(2*alpha*u))
 *
 * Com alpha -> 0 os dois viram identidade, entao a similaridade e o caso
 * particular: nada se perde quando a arte e pequena.
 */
function wrapMaps(alpha, rho) {
  if (!(alpha > 1e-4)) return { X: (u) => u, M: () => 1 };
  const den = (u) => 1 - rho * Math.cos(2 * alpha * u);
  const meia = Math.sin(alpha) / den(0.5);
  const d0 = den(0);
  return { X: (u) => Math.sin(2 * alpha * u) / den(u) / (2 * meia), M: (u) => d0 / den(u) };
}

function bilinear(img, W, H, u, v) {
  if (u < 0 || v < 0 || u > W - 1.001 || v > H - 1.001) return null;
  const x0 = u | 0, y0 = v | 0;
  const fx = u - x0, fy = v - y0;
  const i = y0 * W + x0;
  return (
    img[i] * (1 - fx) * (1 - fy) + img[i + 1] * fx * (1 - fy) +
    img[i + W] * (1 - fx) * fy + img[i + W + 1] * fx * fy
  );
}

/**
 * Correlacao normalizada do template posto em (cx,cy) com escalas (sx,sy) e
 * rotacao. Percorre o TEMPLATE (menor) e amostra a cena.
 * `need` e a fracao minima de amostras que precisa cair dentro da cena: abaixo
 * disso o candidato e descartado em vez de pontuar alto por sair do quadro.
 */
function ncc(scene, SW, SH, tpl, TW, TH, cx, cy, sx, sy, th, step, need = 0.9, wrap = null) {
  const c = Math.cos(th), s = Math.sin(th);
  // Nomes distintos dos X/Y da projecao logo abaixo: `const X = cx + ...` no
  // corpo do laco criava zona morta temporal e derrubava a funcao inteira.
  const mapX = wrap ? wrap.X : (u) => u;
  const magY = wrap ? wrap.M : () => 1;
  let n = 0, fora = 0, sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
  for (let ty = 0; ty < TH; ty += step) {
    for (let tx = 0; tx < TW; tx += step) {
      const u = tx / TW - 0.5;
      const dx = mapX(u) * TW * sx, dy = (ty - TH / 2) * sy * magY(u);
      const X = cx + dx * c - dy * s, Y = cy + dx * s + dy * c;
      const b = bilinear(scene, SW, SH, X, Y);
      if (b === null) { fora += 1; continue; }
      const a = tpl[ty * TW + tx];
      n += 1; sa += a; sb += b; saa += a * a; sbb += b * b; sab += a * b;
    }
  }
  if (n < 30 || n / (n + fora) < need) return -1;
  const num = sab - (sa * sb) / n;
  const den = Math.sqrt(Math.max(1e-9, (saa - (sa * sa) / n) * (sbb - (sb * sb) / n)));
  return num / den;
}

/**
 * Acha a arte na cena.
 *
 * @param {{data:Buffer,width:number,height:number,channels:number}} sceneImg
 * @param {{data:Buffer,width:number,height:number,channels:number}} artImg
 * @param {object} [opts]
 * @param {[number,number]} [opts.scaleRange] fracao da ALTURA da cena que a
 *   arte pode ocupar. Amplo de proposito: estreitar aqui seria assumir parte
 *   da resposta que se quer medir.
 * @returns {{cx:number,cy:number,width_px:number,height_px:number,
 *   rotation_deg:number,score:number}|null}
 */
export function registerArt(sceneImg, artImg, opts = {}) {
  const [loFrac, hiFrac] = opts.scaleRange ?? [0.15, 0.9];
  const SW = sceneImg.width, SH = sceneImg.height;
  // `channels` ausente fazia `lum()` ler data[i+undefined] e devolver NaN em
  // todo pixel. O NCC virava NaN, e como NaN nao e maior que nada a busca
  // simplesmente nao achava nada — falha silenciosa que parece "nao encontrou".
  // Exigir explicitamente e mais barato que depurar de novo.
  for (const [nome, img] of [["cena", sceneImg], ["arte", artImg]]) {
    if (!img?.data || !img.width || !img.height) throw new Error(`registerArt: ${nome} sem data/width/height`);
    if (!Number.isInteger(img.channels) || img.channels < 3) {
      throw new Error(`registerArt: ${nome} sem "channels" valido (recebido ${img.channels}). Passe 3 para RGB ou 4 para RGBA.`);
    }
    if (img.data.length < img.width * img.height * img.channels) {
      throw new Error(`registerArt: ${nome} com buffer menor que width*height*channels`);
    }
  }
  const sceneG = gradientMagnitude(sceneImg.data, SW, SH, sceneImg.channels);
  const tplG = gradientMagnitude(artImg.data, artImg.width, artImg.height, artImg.channels);

  // Tres niveis. O grosso decide escala e posicao; os finos so refinam, o que
  // mantem o custo linear em vez de quadratico na resolucao.
  const niveis = [
    { cena: 128, tpl: 44, step: 1, dPos: 2, dS: 0.09, dTh: 4, iters: 6 },
    { cena: 320, tpl: 96, step: 2, dPos: 2, dS: 0.05, dTh: 2.5, iters: 6 },
    { cena: 720, tpl: 190, step: 3, dPos: 1.5, dS: 0.02, dTh: 1.2, iters: 7 },
  ];

  // --------------------------------------------- nivel grosso: busca completa
  const n0 = niveis[0];
  const S0 = pyr(sceneG, SW, SH, n0.cena);
  const T0 = pyr(tplG, artImg.width, artImg.height, n0.tpl);
  let best = null;
  const NS = 20;
  for (let k = 0; k <= NS; k += 1) {
    const frac = loFrac + ((hiFrac - loFrac) * k) / NS;
    const sy = (frac * S0.height) / T0.height;
    const halfW = (T0.width * sy) / 2, halfH = (T0.height * sy) / 2;
    // So posicoes onde o template cabe: fora daqui o NCC pontua lixo.
    for (let cy = halfH; cy <= S0.height - halfH; cy += 2) {
      for (let cx = halfW; cx <= S0.width - halfW; cx += 2) {
        const v = ncc(S0.data, S0.width, S0.height, T0.data, T0.width, T0.height, cx, cy, sy, sy, 0, n0.step);
        if (v > 0 && (!best || v > best.v)) best = { v, cx, cy, sx: sy, sy, th: 0 };
      }
    }
  }
  if (!best) return null;

  // Estado em coordenadas da CENA ORIGINAL, para atravessar os niveis.
  let cur = {
    cx: best.cx * S0.factor,
    cy: best.cy * S0.factor,
    // escala que leva o template ORIGINAL ate a cena original
    sx: (best.sx * S0.factor) / T0.factor,
    sy: (best.sy * S0.factor) / T0.factor,
    th: 0,
    v: best.v,
  };

  // ------------------------------------------- niveis finos: descida local
  for (const nv of niveis) {
    const S = pyr(sceneG, SW, SH, nv.cena);
    const T = pyr(tplG, artImg.width, artImg.height, nv.tpl);
    const toLvl = (st) => ({
      cx: st.cx / S.factor, cy: st.cy / S.factor,
      sx: (st.sx * T.factor) / S.factor, sy: (st.sy * T.factor) / S.factor, th: st.th,
    });
    let L = toLvl(cur);
    L.v = ncc(S.data, S.width, S.height, T.data, T.width, T.height, L.cx, L.cy, L.sx, L.sy, L.th, nv.step);
    let dPos = nv.dPos, dS = nv.dS, dTh = (nv.dTh * Math.PI) / 180;
    for (let it = 0; it < nv.iters; it += 1) {
      let melhor = null;
      for (const dx of [-dPos, 0, dPos]) for (const dy of [-dPos, 0, dPos])
        for (const ax of [1 - dS, 1, 1 + dS]) for (const ay of [1 - dS, 1, 1 + dS])
          for (const dt of [-dTh, 0, dTh]) {
            if (!dx && !dy && ax === 1 && ay === 1 && !dt) continue;
            const cand = { cx: L.cx + dx, cy: L.cy + dy, sx: L.sx * ax, sy: L.sy * ay, th: L.th + dt };
            const v = ncc(S.data, S.width, S.height, T.data, T.width, T.height,
              cand.cx, cand.cy, cand.sx, cand.sy, cand.th, nv.step);
            if (v > L.v && (!melhor || v > melhor.v)) melhor = { ...cand, v };
          }
      if (melhor) L = melhor; else { dPos /= 2; dS /= 2; dTh /= 2; }
      if (dPos < 0.2) break;
    }
    cur = {
      cx: L.cx * S.factor, cy: L.cy * S.factor,
      sx: (L.sx * S.factor) / T.factor, sy: (L.sy * S.factor) / T.factor,
      th: L.th, v: L.v,
    };
  }

  // ------------------------------------- estagio final: enrolamento no modelo
  //
  // MEDIDO E DESLIGADO POR PADRAO. A hipotese era que o residuo do registro
  // vinha de ajustar uma similaridade a uma superficie curva, e que modelar o
  // enrolamento derrubaria o desvio. Rodado sobre as mesmas 270 cenas:
  //
  //   sem enrolamento  vies -1,51  desvio 2,64  margem 7 pp
  //   com enrolamento  vies -1,47  desvio 2,63  margem 7 pp
  //
  // Nao mudou nada, e custa 3,5x mais tempo. Fica atras de `opts.wrap` para
  // quem quiser retentar, e o numero fica escrito para ninguem refazer a mesma
  // tentativa achando que e nova.
  //
  // Registro de um erro meu no caminho: antes de rodar a grade inteira eu
  // testei tres casos isolados e vi melhora grande (-2,49 -> +1,49 pp na escala
  // 1,2x). Era comparacao invalida — eu punha um caso unico contra a MEDIA de
  // um conjunto diferente de condicoes. Na comparacao pareada, o ganho some.
  if (!opts.wrap) {
    return {
      cx: cur.cx,
      cy: cur.cy,
      width_px: cur.sx * artImg.width,
      height_px: cur.sy * artImg.height,
      rotation_deg: (cur.th * 180) / Math.PI,
      score: cur.v,
    };
  }
  const nvF = niveis[niveis.length - 1];
  const SF = pyr(sceneG, SW, SH, nvF.cena);
  const TF = pyr(tplG, artImg.width, artImg.height, nvF.tpl);
  let G = {
    cx: cur.cx / SF.factor, cy: cur.cy / SF.factor,
    sx: (cur.sx * TF.factor) / SF.factor, sy: (cur.sy * TF.factor) / SF.factor, th: cur.th,
  };
  let alpha = 0.4, rho = 0.08;
  const av = (g, a, r) => ncc(SF.data, SF.width, SF.height, TF.data, TF.width, TF.height,
    g.cx, g.cy, g.sx, g.sy, g.th, nvF.step, 0.9, wrapMaps(a, r));
  let vBest = av(G, alpha, rho);
  for (let rodada = 0; rodada < 4; rodada += 1) {
    let dA = 0.3 / (rodada + 1), dR = 0.04 / (rodada + 1);
    for (let it = 0; it < 5; it += 1) {
      let m = null;
      for (const da of [-dA, 0, dA]) for (const dr of [-dR, 0, dR]) {
        if (!da && !dr) continue;
        const a = Math.min(1.1, Math.max(0, alpha + da));
        const r = Math.min(0.16, Math.max(0.02, rho + dr));
        const v = av(G, a, r);
        if (v > vBest && (!m || v > m.v)) m = { a, r, v };
      }
      if (m) { alpha = m.a; rho = m.r; vBest = m.v; } else { dA /= 2; dR /= 2; }
    }
    let dPos = 1.5 / (rodada + 1), dS = 0.02 / (rodada + 1), dTh = ((1.2 / (rodada + 1)) * Math.PI) / 180;
    for (let it = 0; it < 5; it += 1) {
      let m = null;
      for (const dx of [-dPos, 0, dPos]) for (const dy of [-dPos, 0, dPos])
        for (const ax of [1 - dS, 1, 1 + dS]) for (const ay of [1 - dS, 1, 1 + dS])
          for (const dt of [-dTh, 0, dTh]) {
            if (!dx && !dy && ax === 1 && ay === 1 && !dt) continue;
            const cand = { cx: G.cx + dx, cy: G.cy + dy, sx: G.sx * ax, sy: G.sy * ay, th: G.th + dt };
            const v = av(cand, alpha, rho);
            if (v > vBest && (!m || v > m.v)) m = { ...cand, v };
          }
      if (m) { G = { cx: m.cx, cy: m.cy, sx: m.sx, sy: m.sy, th: m.th }; vBest = m.v; }
      else { dPos /= 2; dS /= 2; dTh /= 2; }
    }
  }
  cur = {
    cx: G.cx * SF.factor, cy: G.cy * SF.factor,
    sx: (G.sx * SF.factor) / TF.factor, sy: (G.sy * SF.factor) / TF.factor,
    th: G.th, v: vBest,
  };

  return {
    cx: cur.cx,
    cy: cur.cy,
    width_px: cur.sx * artImg.width,
    // Altura da COLUNA CENTRAL, onde M(0)=1. E ela que corresponde a altura
    // oficial em cm: os cm sao medida plana e a regua vertical da peca tambem
    // corre pelo meridiano central.
    height_px: cur.sy * artImg.height,
    rotation_deg: (cur.th * 180) / Math.PI,
    wrap: { alpha: +alpha.toFixed(3), rho: +rho.toFixed(3) },
    score: cur.v,
  };
}
