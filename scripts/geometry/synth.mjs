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
  const zc = z + cam.distance_cm;
  if (zc <= 1) throw new Error("ponto atras da camera");
  return [cam.cx + (cam.f * x) / zc, cam.cy + (cam.f * y) / zc];
}

/** Ponto na superficie do cilindro: s = arco lateral em cm, y = altura em cm. */
function onCylinder(s, y, R) {
  const phi = s / R;
  return [R * Math.sin(phi), y, R * Math.cos(phi)];
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

  // Cantos no plano desenrolado (arco, altura), com rotacao propria da arte.
  const corner = (dx, dy) => {
    const s = cs + dx * Math.cos(psi) - dy * Math.sin(psi);
    const y = cyArt + dx * Math.sin(psi) + dy * Math.cos(psi);
    return onCylinder(s, y, R);
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
      camera: cam,
    },
    landmarks: {
      art,
      collar: { center: project(onCylinder(0, 0, R), cam) },
      hem: { center: project(onCylinder(0, o.garmentLength_cm, R), cam) },
      side: {
        left: project(onCylinder((-Math.PI / 2) * R, cyArt, R), cam),
        right: project(onCylinder((Math.PI / 2) * R, cyArt, R), cam),
      },
    },
  };
}
