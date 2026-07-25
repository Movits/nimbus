// Gerador de VERDADE CONHECIDA para validar o medidor.
//
// Modela o dorso como um cilindro vertical de raio R, com a arte impressa na
// superficie (portanto ENROLADA, nao plana), e projeta tudo por uma camera
// pinhole com guinada, inclinacao e rolagem conhecidas.
//
// A saida sao exatamente os landmarks que o medidor consome — cantos da arte,
// gola, barra, costuras laterais — de um caso onde a resposta e conhecida por
// construcao. Se o medidor nao recupera a escala injetada, o medidor esta
// errado; nao ha ambiguidade de anotacao no meio.

const rad = (deg) => (deg * Math.PI) / 180;

/** Angulo do vinco manga/tronco a partir do centro das costas. */
const CREASE_ANGLE_DEG = 75;

/**
 * Projeta um ponto 3D do referencial da peca para pixels.
 * Eixos da peca: X lateral, Y para baixo (gola=0), Z na direcao da camera.
 */
function project(p, cam) {
  let [x, y, z] = p;
  const cy1 = Math.cos(rad(cam.yaw));
  const sy1 = Math.sin(rad(cam.yaw));
  [x, z] = [x * cy1 + z * sy1, -x * sy1 + z * cy1];
  const cp = Math.cos(rad(cam.pitch));
  const sp = Math.sin(rad(cam.pitch));
  [y, z] = [y * cp - z * sp, y * sp + z * cp];
  const cr = Math.cos(rad(cam.roll));
  const sr = Math.sin(rad(cam.roll));
  [x, y] = [x * cr - y * sr, x * sr + y * cr];
  // PROFUNDIDADE ATE A CAMERA. Z aponta PARA a camera, entao z maior significa
  // MAIS PERTO e a distancia e D - z.
  //
  // Isto estava escrito como `z + distance_cm`, o que punha o centro das costas
  // no ponto MAIS LONGE e as laterais mais perto — ou seja, modelava um dorso
  // CONCAVO. Numa pessoa fotografada de costas o centro das costas e o ponto
  // mais proximo e as laterais fogem. O erro inverteu o sinal de todo efeito
  // que depende de profundidade: a borda lateral da arte projetava 2,2% MAIOR
  // que a coluna central, quando na realidade projeta menor.
  const zc = cam.distance_cm - z;
  if (zc <= 1) throw new Error("ponto atras da camera");
  return [cam.cx + (cam.f * x) / zc, cam.cy + (cam.f * y) / zc];
}

/**
 * Ponto na superficie do cilindro: s = arco lateral em cm, y = altura em cm.
 * `axisX` desloca lateralmente o eixo do tronco naquela altura (contraposto).
 */
function onCylinder(s, y, R, axisX = () => 0) {
  const phi = s / R;
  return [R * Math.sin(phi) + axisX(y), y, R * Math.cos(phi)];
}

/**
 * Cena sintetica.
 * @param {object} o
 * @param {number} o.garmentLength_cm comprimento real da peca (gola->barra)
 * @param {number} o.radius_cm raio do dorso
 * @param {number} o.artW_cm largura OFICIAL da arte
 * @param {number} o.artH_cm altura OFICIAL da arte
 * @param {number} [o.scale] fator aplicado a arte impressa (1 = correta)
 * @param {number} [o.offsetX_cm] deslocamento lateral da arte (0 = centrada)
 * @param {number} [o.collarToTop_cm] distancia da gola ao topo da arte
 * @param {number} [o.artRotation_deg] rotacao da arte na superficie
 * @param {number} [o.bow_cm] curvatura lateral do tronco (contraposto): zero na
 *   gola e na barra, maxima no meio. E o que faz a RETA gola->barra deixar de
 *   passar pelo centro do tronco na altura da estampa.
 * @param {number} [o.hipShift_cm] deslocamento lateral do quadril, linear com a
 *   altura. Nao engana nenhum dos dois estimadores (ambos acompanham), esta aqui
 *   para provar isso.
 * @param {object} [o.camera]
 */
export function synthLandmarks(o) {
  const R = o.radius_cm;
  const cam = {
    yaw: 0,
    pitch: 0,
    roll: 0,
    f: 3000,
    distance_cm: 250,
    cx: 800,
    cy: 800,
    ...(o.camera ?? {}),
  };
  const scale = o.scale ?? 1;
  const offsetX = o.offsetX_cm ?? 0;
  const dCollar = o.collarToTop_cm ?? 8;
  const psi = rad(o.artRotation_deg ?? 0);

  const w = o.artW_cm * scale;
  const h = o.artH_cm * scale;
  const cs = offsetX; // centro da arte, em arco
  const cyArt = dCollar + h / 2;

  // Eixo do tronco. O termo em seno e o CONTRAPOSTO: some na gola e na barra,
  // e maximo no meio, exatamente onde fica a estampa. E a unica deformacao que
  // separa os dois estimadores de centro, entao sem ela a validacao ficava
  // viciada a favor da corda gola->barra.
  const L = o.garmentLength_cm;
  const bow = o.bow_cm ?? 0;
  const hip = o.hipShift_cm ?? 0;
  const axisX = (y) => hip * (y / L) + bow * Math.sin((Math.PI * y) / L);

  // Cantos no plano desenrolado (arco, altura), com rotacao propria da arte.
  const corner = (dx, dy) => {
    const s = cs + dx * Math.cos(psi) - dy * Math.sin(psi);
    const y = cyArt + dx * Math.sin(psi) + dy * Math.cos(psi);
    return onCylinder(s, y, R, axisX);
  };

  const art = {
    tl: project(corner(-w / 2, -h / 2), cam),
    tr: project(corner(+w / 2, -h / 2), cam),
    br: project(corner(+w / 2, +h / 2), cam),
    bl: project(corner(-w / 2, +h / 2), cam),
    // Pontos medios VERDADEIROS das arestas (projecao do meio 3D, nao o meio
    // dos cantos projetados). Anotar estes 4 pontos a mais e o que remove o
    // vies de perspectiva na altura da arte — ver validation-report.
    mt: project(corner(0, -h / 2), cam),
    mb: project(corner(0, +h / 2), cam),
    ml: project(corner(-w / 2, 0), cam),
    mr: project(corner(+w / 2, 0), cam),
  };

  return {
    truth: {
      garmentLength_cm: o.garmentLength_cm,
      scale,
      offsetX_cm: offsetX,
      collarToTop_cm: dCollar,
      artRotation_deg: o.artRotation_deg ?? 0,
      radius_cm: R,
      bow_cm: bow,
      hipShift_cm: hip,
      camera: cam,
    },
    landmarks: {
      art,
      collar: { center: project(onCylinder(0, 0, R, axisX), cam) },
      hem: { center: project(onCylinder(0, L, R, axisX), cam) },
      // As laterais ficam no VINCO manga/tronco, ~75 graus do centro das
      // costas — nao na tangente da silhueta (90 graus). E o que o protocolo
      // manda anotar, e a diferenca importa: na tangente os dois lados estao
      // na profundidade extrema e a guinada os separa ao maximo.
      side: {
        left: project(onCylinder((-CREASE_ANGLE_DEG * Math.PI) / 180 * R, cyArt, R, axisX), cam),
        right: project(onCylinder((CREASE_ANGLE_DEG * Math.PI) / 180 * R, cyArt, R, axisX), cam),
      },
    },
  };
}
