// Modelo de corpo mais honesto que o cilindro circular, para testar os
// estimadores de POSICAO onde eles realmente falham.
//
// O `synth.mjs` modela o dorso como cilindro circular de raio constante. Isso
// basta para escala (o eixo vertical e imune a quase tudo), mas nao basta para
// posicao, porque os tres regimes que derrubam um estimador de centro nao
// existem la:
//
//   ELIPTICIDADE  tronco humano nao e circular; e mais largo que fundo. A razao
//                 profundidade/largura tipica fica entre 0,55 e 0,80.
//   TORCAO        contraposto gira o quadril para um lado e os ombros para o
//                 outro, entao a guinada varia com a altura. `synth.mjs` so sabe
//                 TRANSLADAR o eixo (bow/hipShift), nunca gira-lo.
//   AFUNILAMENTO  a barra e mais estreita que o peito, principalmente com
//                 ribana.
//
// Sem esses tres, qualquer estimador de centro parece bom. Este modulo existe
// para que a escolha entre "vinco manga/tronco" e "silhueta" seja decidida por
// medicao e nao por preferencia.

const rad = (deg) => (deg * Math.PI) / 180;

/**
 * Seccao transversal eliptica na altura y.
 * @returns {{a:number,b:number,yawAt:number,axisX:number}} semi-eixo lateral,
 *   semi-eixo de profundidade, guinada local e deslocamento lateral do eixo.
 */
function sectionAt(y, o) {
  const t = y / o.length_cm;
  const shrink = 1 - (o.taper ?? 0) * t;
  const a = o.halfWidth_cm * shrink;
  const b = a * (o.depthRatio ?? 1);
  // Torcao: guinada varia linearmente com a altura, centrada no meio do tronco
  // para que "guinada da camera" continue significando a pose media.
  const yawAt = o.yaw_deg + (o.twist_deg ?? 0) * (t - 0.5);
  const axisX = (o.bow_cm ?? 0) * Math.sin(Math.PI * t) + (o.hipShift_cm ?? 0) * t;
  return { a, b, yawAt, axisX };
}

/** Ponto da superficie no parametro angular `u` (0 = centro das costas). */
function surfacePoint(u, y, o) {
  const { a, b, yawAt, axisX } = sectionAt(y, o);
  const x0 = a * Math.sin(u);
  const z0 = b * Math.cos(u);
  const c = Math.cos(rad(yawAt));
  const s = Math.sin(rad(yawAt));
  return [x0 * c + z0 * s + axisX, y, -x0 * s + z0 * c];
}

/** Projeta para pixels. Z aponta PARA a camera, entao a distancia e D - z. */
export function projectPoint(p, cam) {
  const zc = cam.distance_cm - p[2];
  if (zc <= 1) throw new Error("ponto atras da camera");
  return [cam.cx + (cam.f * p[0]) / zc, cam.cy + (cam.f * p[1]) / zc];
}

/**
 * Comprimento de arco do centro das costas ate o parametro `u`, na altura y.
 * Precisa ser numerico porque a elipse nao tem forma fechada elementar.
 */
function arcLength(u, y, o, steps = 400) {
  const { a, b } = sectionAt(y, o);
  const sign = Math.sign(u) || 1;
  const n = Math.max(2, Math.round((Math.abs(u) / (Math.PI / 2)) * steps) + 2);
  const du = Math.abs(u) / (n - 1);
  let acc = 0;
  for (let i = 0; i < n - 1; i += 1) {
    const u1 = i * du;
    const u2 = (i + 1) * du;
    const d1 = Math.hypot(a * Math.cos(u1), b * Math.sin(u1));
    const d2 = Math.hypot(a * Math.cos(u2), b * Math.sin(u2));
    acc += ((d1 + d2) / 2) * du;
  }
  return sign * acc;
}

/** Inverte `arcLength`: acha o parametro `u` que fica a `s` cm de arco. */
function paramAtArc(s, y, o) {
  let lo = -Math.PI / 2;
  let hi = Math.PI / 2;
  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2;
    if (arcLength(mid, y, o) < s) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Ponto da superficie a `s` cm de arco do centro das costas, na altura y. */
export function atArc(s, y, o) {
  return surfacePoint(paramAtArc(s, y, o), y, o);
}

/**
 * Pontos de TANGENCIA DA SILHUETA na altura y: os dois extremos horizontais da
 * projecao. Achados por varredura, porque com elipse mais torcao nao ha forma
 * fechada util.
 *
 * Esta e a alternativa ao vinco manga/tronco. Para seccao CIRCULAR o ponto
 * medio das duas tangentes e exatamente a projecao do eixo, para qualquer
 * guinada — o circulo e invariante a rotacao em torno do proprio eixo. Para
 * seccao eliptica isso deixa de ser exato, e o quanto deixa e o que esta
 * medicao existe para descobrir.
 */
export function silhouetteAt(y, o, cam, steps = 2000) {
  let best = null;
  let worst = null;
  for (let i = 0; i <= steps; i += 1) {
    const u = -Math.PI + (2 * Math.PI * i) / steps;
    let px;
    try {
      px = projectPoint(surfacePoint(u, y, o), cam);
    } catch {
      continue;
    }
    if (!best || px[0] > best[0]) best = px;
    if (!worst || px[0] < worst[0]) worst = px;
  }
  return { left: worst, right: best };
}

/** Projecao do EIXO do tronco na altura y: a verdade que se quer recuperar. */
export function axisAt(y, o, cam) {
  const { yawAt, axisX } = sectionAt(y, o);
  void yawAt;
  return projectPoint([axisX, y, 0], cam);
}

export const defaultCamera = {
  f: 3000,
  distance_cm: 250,
  cx: 800,
  cy: 800,
};
