// Enrola uma imagem de arte num cilindro e projeta por camera pinhole.
//
// Este modulo tem DOIS usos, e e de proposito que sejam o mesmo codigo:
//
//   1. GERAR cena sintetica de verdade conhecida, para medir o quanto um
//      estimador recupera. `synth.mjs` ja faz isso para LANDMARKS; aqui e para
//      PIXELS, que e o que o registro de imagem precisa.
//   2. COMPOR a arte oficial sobre uma foto gerada, no tamanho e posicao
//      corretos. E o caminho que torna escala e posicao certas por construcao,
//      em vez de pedir a uma IA que desenhe do tamanho certo.
//
// Usar a mesma funcao nos dois lados e o que impede o teste de validar uma
// matematica diferente da que roda em producao.
//
// Metodo: malha. A arte e subdividida numa grade, cada vertice vai para 3D na
// superficie do cilindro, projeta para tela, e cada quadrilatero e rasterizado
// como dois triangulos com mapeamento afim de textura. Mais simples e mais
// estavel que inverter a projecao em forma fechada, e e o que um compositor
// precisa de qualquer jeito.

const rad = (d) => (d * Math.PI) / 180;

/**
 * Projeta ponto do referencial da peca para pixels.
 * Identico a `synth.mjs`: X lateral, Y para baixo (gola=0), Z para a camera,
 * e a distancia e D - z porque o centro das costas e o ponto MAIS PROXIMO.
 */
export function project(p, cam) {
  let [x, y, z] = p;
  const cy1 = Math.cos(rad(cam.yaw)), sy1 = Math.sin(rad(cam.yaw));
  [x, z] = [x * cy1 + z * sy1, -x * sy1 + z * cy1];
  const cp = Math.cos(rad(cam.pitch)), sp = Math.sin(rad(cam.pitch));
  [y, z] = [y * cp - z * sp, y * sp + z * cp];
  const cr = Math.cos(rad(cam.roll)), sr = Math.sin(rad(cam.roll));
  [x, y] = [x * cr - y * sr, x * sr + y * cr];
  const zc = cam.distance_cm - z;
  if (zc <= 1) return null;
  return [cam.cx + (cam.f * x) / zc, cam.cy + (cam.f * y) / zc, zc];
}

export const defaultCamera = { yaw: 0, pitch: 0, roll: 0, f: 3000, distance_cm: 250, cx: 512, cy: 512 };

/**
 * Malha de mapeamento arte -> tela.
 *
 * @param {object} o
 * @param {number} o.artW_cm largura IMPRESSA da arte (ja com a escala aplicada)
 * @param {number} o.artH_cm altura impressa
 * @param {number} o.radius_cm raio do dorso
 * @param {number} o.collarToTop_cm gola ate o topo da arte
 * @param {number} [o.offsetX_cm] deslocamento lateral (0 = centrada)
 * @param {number} [o.artRotation_deg] rotacao da arte na superficie
 * @param {number} [o.bow_cm] contraposto: desloca o eixo, maximo no meio
 * @param {number} [o.garmentLength_cm] comprimento da peca (so para o bow)
 * @param {object} [o.camera]
 * @param {number} [o.grid] subdivisoes (padrao 48)
 * @returns {{cols:number,rows:number,pts:Array<[number,number]|null>}}
 */
export function artMesh(o) {
  const cam = { ...defaultCamera, ...(o.camera ?? {}) };
  const R = o.radius_cm;
  const n = o.grid ?? 48;
  const psi = rad(o.artRotation_deg ?? 0);
  const cs = o.offsetX_cm ?? 0;
  const cyArt = o.collarToTop_cm + o.artH_cm / 2;
  const L = o.garmentLength_cm ?? 75;
  const bow = o.bow_cm ?? 0;
  const axisX = (y) => bow * Math.sin((Math.PI * y) / L);

  const pts = [];
  for (let j = 0; j <= n; j += 1) {
    for (let i = 0; i <= n; i += 1) {
      // coordenada dentro da arte, em cm, com origem no centro
      const dx = (i / n - 0.5) * o.artW_cm;
      const dy = (j / n - 0.5) * o.artH_cm;
      // rotacao propria da arte, no plano DESENROLADO (arco x altura)
      const s = cs + dx * Math.cos(psi) - dy * Math.sin(psi);
      const y = cyArt + dx * Math.sin(psi) + dy * Math.cos(psi);
      // arco -> superficie do cilindro
      const phi = s / R;
      const p = [R * Math.sin(phi) + axisX(y), y, R * Math.cos(phi)];
      const q = project(p, cam);
      pts.push(q ? [q[0], q[1]] : null);
    }
  }
  return { cols: n + 1, rows: n + 1, pts };
}

/** Rasteriza um triangulo com mapeamento afim de textura, com alpha da arte. */
function drawTriangle(dst, W, H, A, B, C, uvA, uvB, uvC, tex, TW, TH, TC, alphaMul, shade) {
  const minX = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0])));
  const maxX = Math.min(W - 1, Math.ceil(Math.max(A[0], B[0], C[0])));
  const minY = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1])));
  const maxY = Math.min(H - 1, Math.ceil(Math.max(A[1], B[1], C[1])));
  const d = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]);
  if (Math.abs(d) < 1e-9) return;
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const px = x + 0.5, py = y + 0.5;
      const w0 = ((B[0] - px) * (C[1] - py) - (C[0] - px) * (B[1] - py)) / d;
      const w1 = ((C[0] - px) * (A[1] - py) - (A[0] - px) * (C[1] - py)) / d;
      const w2 = 1 - w0 - w1;
      if (w0 < -1e-6 || w1 < -1e-6 || w2 < -1e-6) continue;
      const u = w0 * uvA[0] + w1 * uvB[0] + w2 * uvC[0];
      const v = w0 * uvA[1] + w1 * uvB[1] + w2 * uvC[1];
      // amostragem bilinear da textura
      const tx = Math.min(TW - 1.001, Math.max(0, u * (TW - 1)));
      const ty = Math.min(TH - 1.001, Math.max(0, v * (TH - 1)));
      const x0 = Math.floor(tx), y0 = Math.floor(ty);
      const fx = tx - x0, fy = ty - y0;
      const idx = (yy, xx) => (yy * TW + xx) * TC;
      let r = 0, g = 0, b = 0, a = 0;
      for (const [yy, xx, w] of [
        [y0, x0, (1 - fx) * (1 - fy)], [y0, x0 + 1, fx * (1 - fy)],
        [y0 + 1, x0, (1 - fx) * fy], [y0 + 1, x0 + 1, fx * fy],
      ]) {
        const i = idx(yy, xx);
        r += tex[i] * w; g += tex[i + 1] * w; b += tex[i + 2] * w;
        a += (TC === 4 ? tex[i + 3] : 255) * w;
      }
      const al = (a / 255) * alphaMul;
      if (al <= 0.002) continue;
      const o = (y * W + x) * 3;
      // SOMBREAMENTO: tinta sobre malha reflete a MESMA luz que o tecido em
      // volta. Sem isto a estampa fica chapada e le como adesivo, que e
      // exatamente o defeito que o protocolo proibe. O fator vem da luminancia
      // do proprio pixel de destino, normalizada por uma referencia — entao a
      // estampa escurece na dobra e clareia no realce, de graca.
      // A luminancia vem de uma PLACA tirada antes de compor, e borrada.
      // Ler `dst` direto criava realimentacao — o pixel ja continha tinta dos
      // triangulos anteriores — e o ruido do tecido escuro virava franja
      // colorida, porque cada canal era multiplicado por um k diferente.
      let k = 1;
      if (shade) {
        const lumBg = shade.plate[y * W + x];
        k = Math.max(shade.min, Math.min(shade.max, lumBg / shade.ref));
      }
      // CLAMP OBRIGATORIO. `dst` e um Buffer de 8 bits e a atribuicao faz
      // WRAP, nao saturacao: 230 * 1,25 = 287 vira 31. Como cada canal estoura
      // em momento diferente, o resultado nao e um branco estourado e sim
      // cintilacao ciano/azul na borda das letras — que parecia defeito de
      // sombreamento e era aritmetica de inteiro.
      const cl = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
      dst[o] = cl(dst[o] * (1 - al) + r * k * al);
      dst[o + 1] = cl(dst[o + 1] * (1 - al) + g * k * al);
      dst[o + 2] = cl(dst[o + 2] * (1 - al) + b * k * al);
    }
  }
}

/**
 * Compoe a arte sobre um fundo RGB ja existente, seguindo a malha.
 *
 * @param {{data:Uint8ClampedArray|Buffer,width:number,height:number}} bg fundo RGB
 * @param {{data:Buffer,width:number,height:number,channels:number}} art textura
 * @param {object} params ver `artMesh`
 * @param {number} [alpha] opacidade global (tinta sobre tecido nunca e 1,0)
 */
export function compositeArt(bg, art, params, alpha = 1, shade = null) {
  const { cols, rows, pts } = artMesh(params);
  const { width: W, height: H } = bg;
  const dst = bg.data;
  const at = (i, j) => pts[j * cols + i];
  const uv = (i, j) => [i / (cols - 1), j / (rows - 1)];
  for (let j = 0; j < rows - 1; j += 1) {
    for (let i = 0; i < cols - 1; i += 1) {
      const p00 = at(i, j), p10 = at(i + 1, j), p01 = at(i, j + 1), p11 = at(i + 1, j + 1);
      if (!p00 || !p10 || !p01 || !p11) continue;
      const u00 = uv(i, j), u10 = uv(i + 1, j), u01 = uv(i, j + 1), u11 = uv(i + 1, j + 1);
      drawTriangle(dst, W, H, p00, p10, p11, u00, u10, u11, art.data, art.width, art.height, art.channels, alpha, shade);
      drawTriangle(dst, W, H, p00, p11, p01, u00, u11, u01, art.data, art.width, art.height, art.channels, alpha, shade);
    }
  }
  return bg;
}

/**
 * Caixa envolvente, em pixels, da arte projetada. E a VERDADE que o registro
 * tem de recuperar — vem da mesma malha que desenhou os pixels, entao nao ha
 * ambiguidade de "onde a tinta acaba".
 */
export function projectedArtBox(params) {
  const { pts } = artMesh(params);
  const ok = pts.filter(Boolean);
  if (!ok.length) return null;
  const xs = ok.map((p) => p[0]), ys = ok.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

/**
 * Desenha a arte numa CAMADA RGBA propria, em vez de direto no fundo.
 *
 * Existe porque o tecido precisa agir sobre a arte DEPOIS de ela estar
 * projetada: deslocar pela dobra e sombrear pelo vinco. Compondo direto no
 * fundo, como fazia `compositeArt`, a arte ja entrava fundida e a unica
 * interacao possivel era um multiplicador por pixel — o que produzia um
 * retangulo liso de bordas retas sobre um pano amassado, ou seja um adesivo.
 *
 * Com a camada separada, `aplicar-no-tecido.mjs` reamostra a arte pelo campo
 * de dobra antes de compor.
 */
export function renderArtLayer(layer, art, params) {
  const { cols, rows, pts } = artMesh(params);
  const { width: W, height: H } = layer;
  const at = (i, j) => pts[j * cols + i];
  const uv = (i, j) => [i / (cols - 1), j / (rows - 1)];
  for (let j = 0; j < rows - 1; j += 1) {
    for (let i = 0; i < cols - 1; i += 1) {
      const p00 = at(i, j), p10 = at(i + 1, j), p01 = at(i, j + 1), p11 = at(i + 1, j + 1);
      if (!p00 || !p10 || !p01 || !p11) continue;
      const u00 = uv(i, j), u10 = uv(i + 1, j), u01 = uv(i, j + 1), u11 = uv(i + 1, j + 1);
      drawTriangleRGBA(layer.data, W, H, p00, p10, p11, u00, u10, u11, art);
      drawTriangleRGBA(layer.data, W, H, p00, p11, p01, u00, u11, u01, art);
    }
  }
  return layer;
}

function drawTriangleRGBA(dst, W, H, A, B, C, uvA, uvB, uvC, art) {
  const { data: tex, width: TW, height: TH, channels: TC } = art;
  const minX = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0])));
  const maxX = Math.min(W - 1, Math.ceil(Math.max(A[0], B[0], C[0])));
  const minY = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1])));
  const maxY = Math.min(H - 1, Math.ceil(Math.max(A[1], B[1], C[1])));
  const d = (B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1]);
  if (Math.abs(d) < 1e-9) return;
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const px = x + 0.5, py = y + 0.5;
      const w0 = ((B[0] - px) * (C[1] - py) - (C[0] - px) * (B[1] - py)) / d;
      const w1 = ((C[0] - px) * (A[1] - py) - (A[0] - px) * (C[1] - py)) / d;
      const w2 = 1 - w0 - w1;
      if (w0 < -1e-6 || w1 < -1e-6 || w2 < -1e-6) continue;
      const u = w0 * uvA[0] + w1 * uvB[0] + w2 * uvC[0];
      const v = w0 * uvA[1] + w1 * uvB[1] + w2 * uvC[1];
      const tx = Math.min(TW - 1.001, Math.max(0, u * (TW - 1)));
      const ty = Math.min(TH - 1.001, Math.max(0, v * (TH - 1)));
      const x0 = Math.floor(tx), y0 = Math.floor(ty);
      const fx = tx - x0, fy = ty - y0;
      const idx = (yy, xx) => (yy * TW + xx) * TC;
      let r = 0, g = 0, b = 0, a = 0;
      for (const [yy, xx, w] of [
        [y0, x0, (1 - fx) * (1 - fy)], [y0, x0 + 1, fx * (1 - fy)],
        [y0 + 1, x0, (1 - fx) * fy], [y0 + 1, x0 + 1, fx * fy],
      ]) {
        const i = idx(yy, xx);
        r += tex[i] * w; g += tex[i + 1] * w; b += tex[i + 2] * w;
        a += (TC === 4 ? tex[i + 3] : 255) * w;
      }
      if (a <= 0.5) continue;
      const o = (y * W + x) * 4;
      dst[o] = r; dst[o + 1] = g; dst[o + 2] = b; dst[o + 3] = a;
    }
  }
}
