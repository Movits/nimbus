// Medicao de escala e posicao de estampa em foto de peca vestida.
//
// ============================ O PRINCIPIO ============================
// Inverte-se a pergunta. Em vez de "a estampa tem o tamanho certo?" (que
// exigiria saber quantos pixels valem um centimetro na peca, que exigiria
// saber que tamanho o modelo veste), pergunta-se:
//
//     dada a arte oficial de H cm de altura, que COMPRIMENTO DE PECA esta
//     foto implica?
//
// Se a foto implica uma Camiseta Premium de 58 cm quando a tabela real diz
// 70,5-85 cm, a foto esta errada e esta errada para QUALQUER tamanho. Isso e
// um argumento de impossibilidade, nao uma estimativa — e nenhum "mas e se
// ele veste EG?" derruba.
//
// ====================== POR QUE SO O EIXO VERTICAL ======================
// Modelando o dorso como cilindro de raio R com a camera em guinada θ, a
// largura de uma arte de W cm projeta como  W · κ · cos θ , com
// κ = sin(a/R)/(a/R) ≤ 1. Ou seja:
//
//   1. o eixo horizontal SO SABE SUBESTIMAR (κ·cos θ ≤ 1 sempre);
//   2. κ depende do corpo e do caimento — importar um κ medido em outro
//      produto e importar o R errado (foi o "fator de caimento 1,52");
//   3. o eixo vertical e imune a guinada e ao enrolamento cilindrico.
//
// Por isso o vertical e primario e o horizontal entra apenas como LIMITE
// INFERIOR. "Horizontal diz menos que o vertical" e o esperado, nao uma
// contradicao.
//
// ============================== LIMITES ==============================
// - Sem tabela de medidas (Blusao Moletom) => escala INDISPONIVEL, nunca
//   estimada.
// - Landmark ausente => limite unilateral ou INCONCLUSIVO. Nunca um numero.
// - A faixa P..EG e larga (Premium ±10,3%), entao o veredito duro usa a faixa
//   inteira e o veredito de catalogo usa o tamanho canonico declarado.

import {
  solveHomography,
  applyH,
  dist,
  signedDistanceToLine,
  projectOnAxis,
  angleFromVertical,
} from "./homography.mjs";
import { getGarmentSpec, nearestSizeByLength } from "./garment-specs.mjs";

/** Area imprimivel maxima observada no catalogo oficial (CSV YouDraw). */
export const PRINT_AREA_MAX_CM = { w: 35.2, h: 40.0 };

/** Tamanho que, por convencao do projeto, toda foto lifestyle representa. */
export const CANONICAL_SIZE = "G";

export const DEFAULT_TOLERANCE = {
  scalePct: 8, // desvio de escala vs o tamanho canonico
  offsetCm: 1.5, // deslocamento lateral da estampa
  rotationDeg: 3, // rotacao da arte vs eixo da peca
  alphaWarnPct: 3, // acima disso o eixo horizontal fica suspeito
  alphaInvalidPct: 6, // acima disso o eixo horizontal e invalido
  alphaVerticalPct: 4, // alpha POSITIVO acima disso condena o proprio vertical
  positionAlphaMaxPct: 2, // posicao so e avaliada em pose quase frontal
};

const CYLINDER_MAX = Math.PI / 2; // largura plana / largura projetada, no limite cilindrico

/**
 * @param {object} input
 * @param {{tl:number[],tr:number[],br:number[],bl:number[]}} input.art cantos da arte, em pixels
 * @param {{w_cm:number,h_cm:number}} input.artSize tamanho oficial da arte
 * @param {string} input.garment nome exato da peca (chave da tabela YouDraw)
 * @param {{center:number[]}|null} input.collar base da gola (null se inanotavel)
 * @param {{center:number[]}|null} input.hem barra (null se inanotavel)
 * @param {{left:number[],right:number[]}} [input.side] costuras laterais na altura da arte
 * @param {"corners"|"bbox"} [input.mode] "bbox" = arte irregular
 * @param {string[]} [input.flags] oclusoes declaradas pelo anotador
 */
export function measurePrint(input, tolerance = DEFAULT_TOLERANCE) {
  const notes = [];
  const flags = input.flags ?? [];
  const mode = input.mode ?? "corners";
  const { w_cm, h_cm } = input.artSize;
  if (!(w_cm > 0) || !(h_cm > 0)) {
    throw new Error("artSize invalido: a arte precisa de largura e altura oficiais em cm");
  }
  const spec = getGarmentSpec(input.garment);

  // ------------------------------------------------------- medidas em pixel
  // A ALTURA da arte e medida pela LINHA CENTRAL dela (meio da aresta de cima
  // ao meio da de baixo), nunca pelas bordas laterais. Motivo, medido na
  // validacao: as bordas laterais ficam na parte curva do dorso, mais perto da
  // camera que a linha central onde estao gola e barra, e projetam ~2% maiores
  // — o que injetava um vies de +2,5 pontos na escala. A linha central esta na
  // mesma profundidade dos landmarks de referencia.
  //
  // ATENCAO ao tipo de arte. Os cm oficiais descrevem a CAIXA ENVOLVENTE da
  // tinta. Numa arte com moldura desenhada (azulejo, rococo) a aresta existe
  // de fato, e o ponto medio dela esta na linha central da peca — e ai vale a
  // regra acima. Numa arte de silhueta irregular (spray, stencil) NAO existe
  // aresta: a tinta no meio horizontal nao chega ao topo da caixa. Medir pelo
  // "ponto medio" nesse caso subestima a altura (num caso real, 16%).
  // Entao: moldura => pontos medios; irregular => extensao da caixa.
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const shape = input.artShape ?? (input.art.mt ? "rect_frame" : "irregular");
  const hasEdgeMidpoints = shape === "rect_frame" && input.art.mt && input.art.mb;

  const topMid = hasEdgeMidpoints ? input.art.mt : mid(input.art.tl, input.art.tr);
  const bottomMid = hasEdgeMidpoints ? input.art.mb : mid(input.art.bl, input.art.br);
  const leftMid =
    shape === "rect_frame" && input.art.ml ? input.art.ml : mid(input.art.tl, input.art.bl);
  const rightMid =
    shape === "rect_frame" && input.art.mr ? input.art.mr : mid(input.art.tr, input.art.br);

  const artH_px = dist(topMid, bottomMid);
  const artW_px = dist(leftMid, rightMid);
  if (!hasEdgeMidpoints) {
    notes.push(
      "arte sem moldura desenhada: altura medida pela caixa envolvente, nao pelos pontos medios — a margem do metodo aqui e +-6 pp (a de +-2 pp exige aresta real)",
    );
  }

  // ---------------------------------------------------------------- alpha
  // Detector de anisotropia: aspecto MEDIDO em pixels contra o aspecto OFICIAL
  // em cm. Mas a linha de base NAO e zero: numa peca vestida a arte esta
  // enrolada num cilindro, e so o enrolamento ja encolhe a largura por
  // kappa = sin(a/R)/(a/R), com a = W/2. Comparar alpha contra zero acusava
  // pose em 89% das fotos frontais na validacao. Entao a referencia e a FAIXA
  // de enrolamento esperada, derivada do raio plausivel do dorso — que sai da
  // propria tabela de medidas (largura plana = meia circunferencia => R = L/pi).
  const alphaPct = ((artW_px / artH_px) / (w_cm / h_cm) - 1) * 100;

  let alphaExpected = null;
  if (spec.hasTable) {
    const radii = spec.widthRange.map((flat) => flat / Math.PI);
    const kappas = radii.map((R) => {
      const a = w_cm / 2 / R;
      return Math.sin(a) / a;
    });
    alphaExpected = [
      round((Math.min(...kappas) - 1) * 100, 1),
      round((Math.max(...kappas) - 1) * 100, 1),
    ];
  }

  // Excesso de anisotropia = o que sobra depois de descontar o enrolamento.
  // Positivo => altura comprimida (inclinacao de camera ou anotacao errada).
  // Muito negativo => guinada forte alem do enrolamento.
  const alphaExcessPct =
    alphaExpected === null ? alphaPct : round(alphaPct - alphaExpected[1], 1);

  const horizontalValid = Math.abs(alphaExcessPct) <= tolerance.alphaInvalidPct;
  let alphaRegime = "frontal";
  if (alphaExcessPct > tolerance.alphaVerticalPct) alphaRegime = "vertical_comprimido";
  else if (alphaExcessPct < -tolerance.alphaInvalidPct) alphaRegime = "guinada_forte";
  else if (Math.abs(alphaExcessPct) > tolerance.alphaWarnPct) alphaRegime = "guinada_moderada";

  if (alphaRegime === "vertical_comprimido") {
    notes.push(
      `excesso de anisotropia +${alphaExcessPct}% : altura da arte comprimida (inclinacao de camera ou anotacao errada) — o eixo vertical nao e confiavel aqui`,
    );
  }

  // ------------------------------------------------------- escala (rho_v)
  const haveCollar = Boolean(input.collar?.center);
  const haveHem = Boolean(input.hem?.center);

  let rho_v = null;
  let impliedLength = null;
  let impliedBand = null;
  if (haveCollar && haveHem) {
    const garmentLen_px = dist(input.collar.center, input.hem.center);
    rho_v = artH_px / garmentLen_px;
    impliedLength = h_cm / rho_v;

    // PROPAGACAO DA INCERTEZA DO ANOTADOR.
    // Um ponto que o anotador declarou como estimativa (gola sob capuz, barra
    // preto-sobre-preto) nao pode virar veredito duro. O sigma declarado vira
    // uma faixa no comprimento implicito, e se essa faixa cruza o limite da
    // faixa fisica da peca, o veredito e INCONCLUSIVO — nao "reprovado".
    // Sem isso o medidor repetiria o pecado das auditorias anteriores: tratar
    // palpite como medida.
    const sCollar = input.collar.sigma_px ?? 0;
    const sHem = input.hem.sigma_px ?? 0;
    const sArt = input.art.sigma_px ?? 0;
    const sLen = Math.hypot(sCollar, sHem);
    const relLen = garmentLen_px > 0 ? sLen / garmentLen_px : 0;
    const relArt = artH_px > 0 ? (sArt * Math.SQRT2) / artH_px : 0;
    const rel = Math.hypot(relLen, relArt);
    if (rel > 0) {
      const half = 2 * rel * impliedLength; // ~95%
      impliedBand = [round(impliedLength - half), round(impliedLength + half)];
    }
  } else {
    notes.push(
      `sem ${!haveCollar ? "gola" : ""}${!haveCollar && !haveHem ? " e " : ""}${!haveHem ? "barra" : ""} anotada: comprimento implicito indeterminado`,
    );
  }

  // Desvio por tamanho. Positivo = estampa MAIOR que o oficial.
  let deltaBySize = null;
  let deltaCanonical = null;
  let deltaRange = null;
  let insidePhysicalRange = null;
  if (impliedLength !== null && spec.hasTable) {
    deltaBySize = spec.sizes.map((s) => ({
      size: s.size,
      length_cm: s.length_cm,
      deltaPct: round((s.length_cm / impliedLength - 1) * 100, 1),
    }));
    const canonical = deltaBySize.find((d) => d.size === CANONICAL_SIZE) ?? deltaBySize[0];
    deltaCanonical = canonical.deltaPct;
    const all = deltaBySize.map((d) => d.deltaPct);
    deltaRange = [Math.min(...all), Math.max(...all)];
    const [minLen, maxLen] = spec.lengthRange;
    insidePhysicalRange = impliedLength >= minLen && impliedLength <= maxLen;
  }

  // Teto fisico da area imprimivel: se a arte oficial ja excede, o dado esta
  // errado; se a arte IMPLICITA excede, a foto e impossivel.
  const violatesPrintArea =
    w_cm > PRINT_AREA_MAX_CM.w + 0.5 || h_cm > PRINT_AREA_MAX_CM.h + 0.5;
  if (violatesPrintArea) {
    notes.push(
      `arte oficial ${w_cm}x${h_cm} cm excede a area imprimivel maxima do catalogo (${PRINT_AREA_MAX_CM.w}x${PRINT_AREA_MAX_CM.h})`,
    );
  }

  // ------------------------------------------- limite inferior horizontal
  // delta_h so pode SUBESTIMAR o desvio real. Serve para detectar que o
  // vertical quebrou (delta_h > delta_v), nunca para medir.
  let deltaHLowerBound = null;
  if (impliedLength !== null && horizontalValid) {
    deltaHLowerBound = round((alphaPct / 100 + 1) * (deltaCanonical / 100 + 1) * 100 - 100, 1);
  }
  let axesContradiction = false;
  if (deltaHLowerBound !== null && deltaCanonical !== null) {
    // margem generosa: so acusa contradicao quando o horizontal diz MAIS
    if (deltaHLowerBound > deltaCanonical + tolerance.scalePct) {
      axesContradiction = true;
      notes.push(
        `contradicao entre eixos: horizontal (limite inferior ${deltaHLowerBound}%) acima do vertical (${deltaCanonical}%) — o eixo vertical provavelmente esta mal anotado`,
      );
    }
  }

  // ------------------------------------------------------------- posicao
  // Retificacao planar pelos cantos da arte: converte pixels em cm no plano
  // das costas. Usada so para posicao, onde a precisao e muito maior que na
  // escala (nao depende do tamanho da peca nem da distancia da camera).
  let position = {
    offsetX_cm: null,
    offsetX_pctOfArtWidth: null,
    collarToArtTop_cm: null,
    rotation_deg: null,
    rotationFlagged: null,
    verdict: "INCONCLUSIVO",
  };
  if (haveCollar && haveHem) {
    const H = solveHomography(
      [input.art.tl, input.art.tr, input.art.br, input.art.bl],
      [
        [0, 0],
        [w_cm, 0],
        [w_cm, h_cm],
        [0, h_cm],
      ],
    );
    const collar = applyH(H, input.collar.center);
    const hem = applyH(H, input.hem.center);
    const artCenter = [w_cm / 2, h_cm / 2];
    const artTopMid = [w_cm / 2, 0];

    const offsetX = signedDistanceToLine(artCenter, collar, hem);
    const collarToTop = projectOnAxis(artTopMid, collar, hem);
    const rotation = angleFromVertical(collar, hem);

    // A centralizacao e mais exigente que a escala: numa peca girada, o eixo
    // VISIVEL da peca se desloca em relacao ao eixo verdadeiro, e o erro cresce
    // rapido com a guinada (validacao: desvio 0,6 cm de frente, 1,7 cm a 20
    // graus). Entao so se reporta posicao em pose quase frontal.
    const offsetValid = Math.abs(alphaExcessPct) <= tolerance.positionAlphaMaxPct;
    position = {
      offsetX_cm: offsetValid ? round(offsetX) : null,
      offsetX_pctOfArtWidth: offsetValid ? round((offsetX / w_cm) * 100, 1) : null,
      collarToArtTop_cm: round(collarToTop),
      rotation_deg: round(rotation, 1),
      rotationFlagged: Math.abs(rotation) > tolerance.rotationDeg,
      verdict: !offsetValid
        ? "INCONCLUSIVO"
        : Math.abs(offsetX) <= tolerance.offsetCm
          ? "OK"
          : Math.abs(offsetX) <= tolerance.offsetCm * 1.5
            ? "LIMITROFE"
            : "REPROVADO",
    };
    if (!offsetValid) {
      notes.push(
        `centralizacao nao avaliada: alpha ${alphaPct.toFixed(1)}% indica pose que desloca o eixo visivel`,
      );
    }
  }

  // ------------------------------------------ cross-check de largura (faixa)
  let widthCheck = null;
  if (input.side?.left && input.side?.right && haveCollar && haveHem && impliedLength !== null) {
    const sideW_px = dist(input.side.left, input.side.right);
    const px_per_cm_v = artH_px / h_cm;
    const visibleWidth = sideW_px / px_per_cm_v;
    const flatBand = [visibleWidth, visibleWidth * CYLINDER_MAX];
    let consistent = null;
    if (spec.hasTable) {
      const [minW, maxW] = spec.widthRange;
      consistent = flatBand[1] >= minW && flatBand[0] <= maxW;
      if (!consistent) {
        notes.push(
          `largura plana implicita ${flatBand[0].toFixed(1)}-${flatBand[1].toFixed(1)} cm nao encosta na faixa real ${minW}-${maxW} cm`,
        );
      }
    }
    widthCheck = {
      visibleWidth_cm: round(visibleWidth),
      impliedFlatWidth_cm: flatBand.map((v) => round(v)),
      consistentWithTable: consistent,
    };
  }

  // ------------------------------------------------------------ vereditos
  let scaleVerdict;
  if (!spec.hasTable) {
    scaleVerdict = "INDISPONIVEL";
    notes.push(
      `"${input.garment}" nao tem tabela de medidas publicada (${spec.raw}) — escala sem regua`,
    );
  } else if (impliedLength === null || alphaRegime === "vertical_comprimido" || axesContradiction) {
    scaleVerdict = "INCONCLUSIVO";
  } else if (!insidePhysicalRange) {
    const [minLen, maxLen] = spec.lengthRange;
    const bandTouchesRange =
      impliedBand !== null && impliedBand[1] >= minLen && impliedBand[0] <= maxLen;
    if (bandTouchesRange) {
      scaleVerdict = "INCONCLUSIVO";
      notes.push(
        `comprimento implicito ${impliedLength.toFixed(1)} cm cai fora da faixa ${minLen}-${maxLen} cm, MAS a incerteza declarada pelo anotador (faixa ${impliedBand[0]}-${impliedBand[1]} cm) alcanca a faixa real — sem anotacao melhor nao da para reprovar`,
      );
    } else {
      scaleVerdict = "REPROVADO-DURO";
      notes.push(
        `comprimento implicito ${impliedLength.toFixed(1)} cm${impliedBand ? ` (faixa ${impliedBand[0]}-${impliedBand[1]})` : ""} fora da faixa fisica ${minLen}-${maxLen} cm: nenhum tamanho real explica esta geometria`,
      );
    }
  } else if (Math.abs(deltaCanonical) > tolerance.scalePct) {
    scaleVerdict = "FORA-DO-ALVO";
  } else {
    scaleVerdict = "OK";
  }

  // ----------------------------------------------------------- confianca
  let confidence = 100;
  const penalise = (points, reason) => {
    confidence -= points;
    notes.push(reason);
  };
  if (mode === "bbox") penalise(15, "arte irregular: cantos sao caixa envolvente, nao vertices");

  // As ressalvas dos anotadores sao agrupadas por CATEGORIA antes de descontar.
  // Dois anotadores independentes descrevendo o mesmo capuz nao sao dois
  // problemas — sao um problema visto duas vezes, e concordancia entre eles e
  // sinal de qualidade, nao de risco.
  const CATEGORIES = [
    [/hood|capuz/i, "gola oculta pelo capuz", 25],
    [/hair|cabelo/i, "gola oculta pelo cabelo", 25],
    [/collar/i, "gola com leitura indireta", 20],
    [/hem|barra/i, "barra com baixo contraste ou fora de quadro", 20],
    [/irregular|no_drawn_frame|silhouette/i, "arte sem aresta desenhada", 10],
    [/side|seam|lateral/i, "laterais do tronco nao visiveis", 10],
  ];
  const seen = new Set();
  for (const flag of flags) {
    const hit = CATEGORIES.find(([re]) => re.test(flag));
    const key = hit ? hit[1] : `ressalva: ${flag}`;
    if (seen.has(key)) continue;
    seen.add(key);
    penalise(hit ? hit[2] : 15, key);
  }
  if (!haveCollar) penalise(40, "gola nao anotada");
  if (!haveHem) penalise(50, "barra nao anotada");
  if (alphaRegime === "guinada_moderada") penalise(15, `pose com alpha ${alphaPct.toFixed(1)}%`);
  if (alphaRegime === "guinada_ou_enrolamento_forte")
    penalise(25, `pose 3/4 forte, alpha ${alphaPct.toFixed(1)}%`);
  if (alphaRegime === "vertical_comprimido") penalise(45, "alpha positivo alto");
  if (widthCheck?.consistentWithTable === false) penalise(15, "eixos de largura e comprimento discordam");
  confidence = Math.max(0, Math.min(100, confidence));

  // O veredito final NAO colapsa os dois eixos num rotulo so: "inconclusivo"
  // no eixo da posicao nao pode apagar um "ok" solido no eixo da escala. Cada
  // eixo responde por si, e o resumo diz os dois.
  const verdict = `escala ${scaleVerdict} / posicao ${position.verdict}`;

  return {
    method: "nimbus.medidor/1",
    mode,
    garment: input.garment,
    artSize_cm: { w: w_cm, h: h_cm },
    anisotropy: {
      alphaPct: round(alphaPct, 1),
      alphaExpectedByWrap: alphaExpected,
      alphaExcessPct,
      regime: alphaRegime,
      horizontalValid,
    },
    scale: {
      rho_v: rho_v === null ? null : round(rho_v, 4),
      impliedGarmentLength_cm: impliedLength === null ? null : round(impliedLength),
      impliedGarmentLength_band_cm: impliedBand,
      garmentLengthRange_cm: spec.lengthRange,
      insidePhysicalRange,
      canonicalSize: CANONICAL_SIZE,
      deltaCanonicalPct: deltaCanonical,
      deltaBySize,
      deltaRangePct: deltaRange,
      deltaHLowerBoundPct: deltaHLowerBound,
      axesContradiction,
      nearestSize: impliedLength !== null && spec.hasTable ? nearestSizeByLength(spec, impliedLength) : null,
      verdict: scaleVerdict,
    },
    position,
    widthCheck,
    confidence,
    verdict,
    notes,
  };
}

function round(v, decimals = 2) {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}
