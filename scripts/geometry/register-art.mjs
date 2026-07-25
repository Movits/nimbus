// REGISTRO DA ARTE: acha a arte conhecida dentro da foto, em vez de pedir a
// alguem que desenhe uma caixa em volta dela.
//
// Por que isto existe. A margem publicada do medidor para arte de silhueta
// livre e de 8 pp, e a causa nao e projecao: e DESACORDO ENTRE ANOTADORES sobre
// onde a tinta difusa termina. Nas anotacoes reais aparece literalmente escrito
// — "existe um anel claro que pode ser tinta ou vinco do moletom", "o contorno
// preto externo e indistinguivel do tecido preto", "dois picos empatados dentro
// de 0,05 pp". Quando dois anotadores escolhem ELEMENTOS diferentes como
// extremo, o erro nao e ruido de ponteiro, e um degrau.
//
// O registro nao tem essa duvida: ele sabe qual e a arte inteira, porque a arte
// e a entrada. Ele procura ONDE ela esta, nao O QUE ela e.
//
// Metodo: correlacao cruzada normalizada sobre MAGNITUDE DE GRADIENTE, em
// piramide grosso-para-fino. Gradiente porque a arte impressa muda de cor com o
// tecido, a iluminacao e a compressao, mas as bordas ficam onde estao.

/** Magnitude de gradiente de uma imagem RGB crua, em Float32 normalizado. */
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

/** Reduz por media de blocos inteiros. Mantem a escala relativa entre niveis. */
export function downsample(src, W, H, f) {
  const w = Math.floor(W / f), h = Math.floor(H / f);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      let s = 0;
      for (let j = 0; j < f; j += 1) for (let i = 0; i < f; i += 1) s += src[(y * f + j) * W + (x * f + i)];
      out[y * w + x] = s / (f * f);
    }
  }
  return { data: out, width: w, height: h };
}

/** Amostra bilinear com transformacao inversa: (x,y) da cena -> template. */
function sampleAffine(tpl, TW, TH, u, v) {
  if (u < 0 || v < 0 || u > TW - 1.001 || v > TH - 1.001) return null;
  const x0 = Math.floor(u), y0 = Math.floor(v);
  const fx = u - x0, fy = v - y0;
  return (
    tpl[y0 * TW + x0] * (1 - fx) * (1 - fy) +
    tpl[y0 * TW + x0 + 1] * fx * (1 - fy) +
    tpl[(y0 + 1) * TW + x0] * (1 - fx) * fy +
    tpl[(y0 + 1) * TW + x0 + 1] * fx * fy
  );
}

/**
 * Correlacao normalizada entre a cena e o template posto em (cx,cy) com escala
 * (sx,sy) e rotacao theta. Percorre o TEMPLATE, que e menor, e amostra a cena.
 */
function score(scene, SW, SH, tpl, TW, TH, cx, cy, sx, sy, theta, step) {
  const c = Math.cos(theta), s = Math.sin(theta);
  let n = 0, sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
  for (let ty = 0; ty < TH; ty += step) {
    for (let tx = 0; tx < TW; tx += step) {
      const dx = (tx - TW / 2) * sx, dy = (ty - TH / 2) * sy;
      const X = cx + dx * c - dy * s, Y = cy + dx * s + dy * c;
      if (X < 0 || Y < 0 || X >= SW - 1 || Y >= SH - 1) return -1;
      const a = tpl[ty * TW + tx];
      const b = sampleAffine(scene, SW, SH, X, Y);
      if (b === null) return -1;
      n += 1; sa += a; sb += b; saa += a * a; sbb += b * b; sab += a * b;
    }
  }
  if (n < 40) return -1;
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
 * @param {[number,number]} [opts.scaleRange] fracao da altura da cena que a
 *   arte pode ocupar. Amplo de proposito: estreitar aqui seria assumir a
 *   resposta.
 * @returns {{cx:number,cy:number,height_px:number,width_px:number,
 *   rotation_deg:number,score:number}|null}
 */
export function registerArt(sceneImg, artImg, opts = {}) {
  const [loFrac, hiFrac] = opts.scaleRange ?? [0.15, 0.85];
  const SW = sceneImg.width, SH = sceneImg.height;
  const sceneG = gradientMagnitude(sceneImg.data, SW, SH, sceneImg.channels);
  const tplG = gradientMagnitude(artImg.data, artImg.width, artImg.height, artImg.channels);

  // Nivel grosso: escala e translacao numa grade rala.
  const f = Math.max(1, Math.round(Math.max(SW, SH) / 256));
  const sc = downsample(sceneG, SW, SH, f);
  const tf = Math.max(1, Math.round(Math.max(artImg.width, artImg.height) / 96));
  const tp = downsample(tplG, artImg.width, artImg.height, tf);

  let best = null;
  const hCoarse = sc.height;
  for (let k = 0; k <= 22; k += 1) {
    const frac = loFrac + ((hiFrac - loFrac) * k) / 22;
    const sy = (frac * hCoarse) / tp.height;
    const sx = sy; // grosso assume isotropia; o refino solta
    for (let cy = 0; cy < sc.height; cy += 3) {
      for (let cx = 0; cx < sc.width; cx += 3) {
        const v = score(sc.data, sc.width, sc.height, tp.data, tp.width, tp.height, cx, cy, sx, sy, 0, 2);
        if (v > 0 && (!best || v > best.v)) best = { v, cx, cy, sx, sy, th: 0 };
      }
    }
  }
  if (!best) return null;

  // Refino no nivel cheio: escala em x e y separadas, rotacao, translacao.
  let cur = { v: -1, cx: best.cx * f, cy: best.cy * f, sx: (best.sx * f) / tf, sy: (best.sy * f) / tf, th: 0 };
  let dPos = 3 * f, dS = 0.10, dTh = (5 * Math.PI) / 180;
  for (let it = 0; it < 7; it += 1) {
    let improved = null;
    for (const dx of [-dPos, 0, dPos]) for (const dy of [-dPos, 0, dPos])
      for (const ax of [1 - dS, 1, 1 + dS]) for (const ay of [1 - dS, 1, 1 + dS])
        for (const dt of [-dTh, 0, dTh]) {
          const cand = { cx: cur.cx + dx, cy: cur.cy + dy, sx: cur.sx * ax, sy: cur.sy * ay, th: cur.th + dt };
          const v = score(sceneG, SW, SH, tplG, artImg.width, artImg.height,
            cand.cx, cand.cy, cand.sx, cand.sy, cand.th, 2);
          if (v > cur.v && (!improved || v > improved.v)) improved = { ...cand, v };
        }
    if (improved) cur = improved; else { dPos /= 2; dS /= 2; dTh /= 2; }
    if (dPos < 0.25) break;
  }

  return {
    cx: cur.cx,
    cy: cur.cy,
    width_px: cur.sx * artImg.width,
    height_px: cur.sy * artImg.height,
    rotation_deg: (cur.th * 180) / Math.PI,
    score: cur.v,
  };
}
