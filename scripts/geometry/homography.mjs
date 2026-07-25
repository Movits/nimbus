// Algebra linear minima para retificacao planar.
// JS puro de proposito: o ambiente nao tem numpy, OpenCV nem canvas.
//
// Uma homografia 3x3 mapeia um plano em outro sob projecao em perspectiva.
// Aqui ela mapeia PIXELS DA FOTO -> CENTIMETROS NO PLANO DA ESTAMPA, usando
// como referencia os 4 cantos da arte, cujo tamanho real em cm e conhecido
// (colunas back_w_cm/back_h_cm da YouDraw). Com isso, qualquer ponto da peca
// (gola, barra, costura de ombro) vira uma coordenada em cm.

/** Resolve Ax = b por eliminacao gaussiana com pivotamento parcial. */
function solveLinear(A, b) {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let r = col + 1; r < n; r += 1) {
      if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r;
    }
    if (Math.abs(M[pivot][col]) < 1e-12) {
      throw new Error(`sistema singular na coluna ${col}: pontos colineares ou repetidos`);
    }
    [M[col], M[pivot]] = [M[pivot], M[col]];
    for (let r = 0; r < n; r += 1) {
      if (r === col) continue;
      const factor = M[r][col] / M[col][col];
      if (factor === 0) continue;
      for (let c = col; c <= n; c += 1) M[r][c] -= factor * M[col][c];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

/**
 * Homografia que leva os 4 pontos `src` nos 4 pontos `dst`.
 * Formulacao DLT com h22 = 1 (8 incognitas, 8 equacoes).
 * @param {[number,number][]} src 4 pontos de origem
 * @param {[number,number][]} dst 4 pontos de destino
 * @returns {number[][]} matriz 3x3
 */
export function solveHomography(src, dst) {
  if (src.length !== 4 || dst.length !== 4) {
    throw new Error("solveHomography exige exatamente 4 pontos em cada lado");
  }
  const A = [];
  const b = [];
  for (let i = 0; i < 4; i += 1) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    b.push(v);
  }
  const h = solveLinear(A, b);
  return [
    [h[0], h[1], h[2]],
    [h[3], h[4], h[5]],
    [h[6], h[7], 1],
  ];
}

/** Aplica a homografia a um ponto. */
export function applyH(H, [x, y]) {
  const w = H[2][0] * x + H[2][1] * y + H[2][2];
  if (Math.abs(w) < 1e-12) throw new Error("ponto no infinito (w=0) apos a homografia");
  return [
    (H[0][0] * x + H[0][1] * y + H[0][2]) / w,
    (H[1][0] * x + H[1][1] * y + H[1][2]) / w,
  ];
}

/** Inversa de uma 3x3 (adjunta / determinante). */
export function invertH(H) {
  const [[a, b, c], [d, e, f], [g, h, i]] = H;
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  if (Math.abs(det) < 1e-12) throw new Error("homografia nao inversivel");
  const adj = [
    [e * i - f * h, c * h - b * i, b * f - c * e],
    [f * g - d * i, a * i - c * g, c * d - a * f],
    [d * h - e * g, b * g - a * h, a * e - b * d],
  ];
  return adj.map((row) => row.map((v) => v / det));
}

/** Distancia euclidiana. */
export const dist = ([x1, y1], [x2, y2]) => Math.hypot(x2 - x1, y2 - y1);

/**
 * Distancia com sinal de um ponto a uma reta definida por dois pontos.
 * Sinal positivo = ponto esta a direita do vetor a->b (no sistema da imagem,
 * com y crescendo para baixo, isso corresponde ao lado direito de quem olha).
 */
export function signedDistanceToLine(point, a, b) {
  const [px, py] = point;
  const [ax, ay] = a;
  const [bx, by] = b;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) throw new Error("reta degenerada: os dois pontos coincidem");
  return ((px - ax) * dy - (py - ay) * dx) / len;
}

/** Projecao escalar de (point - a) sobre a direcao a->b, em unidades de a->b. */
export function projectOnAxis(point, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) throw new Error("eixo degenerado");
  return ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / len;
}

/** Angulo em graus entre o vetor a->b e a vertical do plano (0,1). */
export function angleFromVertical(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  return (Math.atan2(dx, dy) * 180) / Math.PI;
}
