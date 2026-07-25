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

// A homografia saiu do caminho da medicao: ver o bloco de posicao. Ela
// continua em homography.mjs para a COMPOSICAO da arte na geracao (fase de
// gerar imagem), onde o problema e o inverso e a arte plana e conhecida.
import {
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

/**
 * Margem do METODO para posicao, em cm. Sai do teste de verdade conhecida
 * (`validate.mjs`), nao de escolha: e o maior erro residual observado quando o
 * modelo esta em contraposto E a camera em guinada, o unico regime em que os
 * dois estimadores de centro erram para o MESMO lado.
 *
 * Por que nao da para reduzir: um contraposto que desloca a estampa 1,3 cm
 * inclina a coluna central da arte em 1,5 grau. Sobre 450 px de altura isso e
 * 12 px, e o sigma declarado pelos anotadores e ~8 px por ponto. O sinal que
 * separaria "estampa deslocada" de "modelo em contraposto" esta ENTERRADO no
 * ruido de anotacao. Nenhuma esperteza de calculo tira dai um numero melhor.
 */
export const POSITION_METHOD_MARGIN_CM = 1.9;

/**
 * Fator de EXPANSAO do limite superior da posicao, tambem medido em
 * `validate.mjs`. A medicao COMPRIME deslocamento grande: um deslocamento real
 * de 3 cm e lido entre 1,9 e 2,5 cm, e um de 8 cm entre 5,1 e 6,6. A causa e a
 * mesma dos outros erros — o meio de dois pontos em profundidades diferentes
 * nao e a projecao do meio verdadeiro — e o fator ficou estavel em ~1,56 entre
 * 3 e 8 cm, entao entra arredondado para cima como termo multiplicativo.
 *
 * Ou seja: o numero medido e um PISO. O teto e ele vezes isto, mais a margem.
 */
export const POSITION_UNDERESTIMATE_FACTOR = 1.6;

/**
 * DIAGNOSTICO perceptual (nao e veredito): o deslocamento da estampa como
 * fracao da largura do tronco VISIVEL, em pixels, sem converter para cm. E o
 * que o olho compara ao dizer "esta mais para a direita".
 *
 * Foi testado como veredito e REPROVOU no teste de verdade conhecida — ver o
 * comentario no bloco de posicao. Fica so como numero de conferencia.
 */

export const DEFAULT_TOLERANCE = {
  scalePct: 8, // desvio de escala vs o tamanho canonico
  // Tolerancia de posicao ACIMA da margem do metodo, senao o veredito seria
  // ruido. O gate pega deslocamento GROSSEIRO — o tipo que se ve a olho nu,
  // que e exatamente o que o dono apontou. Centralizacao fina nao e mensuravel
  // numa foto de peca vestida, e dizer que e seria repetir o erro antigo.
  offsetCm: 3,
  rotationDeg: 3, // rotacao da arte vs eixo da peca
  alphaWarnPct: 3, // acima disso o eixo horizontal fica suspeito
  alphaInvalidPct: 6, // acima disso o eixo horizontal e invalido
  alphaVerticalPct: 4, // alpha POSITIVO acima disso condena o proprio vertical
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
  // NAO se usa homografia aqui, e a razao foi medida: retificar pelos cantos da
  // arte da uma taxa px/cm MEDIA sobre toda a largura da arte, mas a arte
  // enrola no dorso e suas bordas estao muito mais longe da camera que o centro.
  // No teste de verdade conhecida, um deslocamento real de 3 cm era lido entre
  // 1,2 e 3,3 cm conforme o tamanho da arte em relacao ao corpo — fator de 0,40
  // a 1,10. Posicao em cm por homografia planar simplesmente nao e recuperavel.
  //
  // O que funciona: medir em PIXELS e converter pela taxa VERTICAL, tomada na
  // coluna central da peca. Gola, barra e o centro da arte estao todos nessa
  // coluna, na mesma profundidade, e o eixo vertical e imune ao enrolamento.
  // A taxa sai do comprimento da peca (px) contra a tabela de medidas (cm) —
  // e a ignorancia do tamanho vestido vira uma faixa estreita, porque a faixa
  // P..EG mexe pouco num numero da ordem de 1 cm.
  let position = {
    offsetX_cm: null,
    offsetX_estimatorRange_cm: null,
    offsetX_pctOfArtWidth: null,
    collarToArtTop_cm: null,
    rotation_deg: null,
    rotationFlagged: null,
    verdict: "INCONCLUSIVO",
  };
  if (haveCollar && haveHem && spec.hasTable) {
    const collar = input.collar.center;
    const hem = input.hem.center;
    // Centro horizontal da arte tomado na MEIA-ALTURA (meio de ml..mr), que e
    // a mesma altura em que as laterais do tronco foram anotadas. Usar o meio
    // de topo-e-base parece equivalente e nao e: com o modelo em contraposto o
    // tronco curva, a estampa curva junto, e a media do topo com a base cai
    // fora da curva. No sintetico com 3 cm de contraposto isso sozinho valia
    // 15,9 px de erro contra 1,1 px medindo na meia-altura.
    const artCenter = mid(leftMid, rightMid);
    const artTopMid = topMid;

    // DOIS ESTIMADORES DE CENTRO, com falhas OPOSTAS que os landmarks que
    // coletamos nao conseguem separar:
    //
    //   corda gola->barra  exata sob guinada (gola, barra e arte estao no mesmo
    //                      cilindro e giram juntas), mas erra com o modelo em
    //                      contraposto: a reta corta a curva do tronco e acusa
    //                      deslocamento que nao existe. No Salmo 19 deu 5,1 cm.
    //   meio do tronco     imune ao contraposto (as laterais acompanham o
    //                      tronco), mas enviesado sob guinada: as duas laterais
    //                      ficam em profundidades diferentes e o meio projetado
    //                      foge do centro real. Medido no sintetico: 2,3 cm de
    //                      erro ja a 10 graus, 4,5 cm a 20.
    //
    // Escolher um dos dois seria repetir o "fator de caimento 1,52": adotar a
    // hipotese conveniente e chamar de medida. Entao nao se escolhe. Reporta-se
    // a FAIXA que os dois delimitam, e o veredito so e decisivo quando a faixa
    // INTEIRA cai de um lado do limite. E a mesma regra ja usada na escala.
    const offsetChord_px = signedDistanceToLine(artCenter, collar, hem);
    let offsetTorso_px = null;
    if (input.side?.left && input.side?.right) {
      const torsoCenter = mid(input.side.left, input.side.right);
      const axisDir = [hem[0] - collar[0], hem[1] - collar[1]];
      const refB = [torsoCenter[0] + axisDir[0], torsoCenter[1] + axisDir[1]];
      offsetTorso_px = signedDistanceToLine(artCenter, torsoCenter, refB);
    } else {
      notes.push(
        "laterais do tronco nao anotadas: so a corda gola-barra estima o centro, e ela infla o deslocamento quando o modelo esta em contraposto",
      );
    }

    // px -> cm pela coluna central. A faixa P..EG entra aqui: nao se sabe que
    // tamanho o modelo veste, entao o cm sai como faixa. Como o numero e da
    // ordem de 1 cm, a faixa inteira de tamanhos move pouco — bem diferente do
    // que acontece na escala.
    const garmentLen_px = dist(collar, hem);
    const toCm = (px) => spec.lengthRange.map((L) => (px * L) / garmentLen_px);

    const cands_px = offsetTorso_px === null ? [offsetChord_px] : [offsetChord_px, offsetTorso_px];
    const allCm = cands_px.flatMap(toCm);
    const lo = Math.min(...allCm);
    const hi = Math.max(...allCm);
    // Faixa do deslocamento ABSOLUTO, ja com as duas correcoes medidas. Se os
    // dois estimadores ficam em lados opostos do zero, o minimo e zero: a arte
    // pode estar centrada. Com a faixa contendo a verdade, os vereditos ficam
    // corretos POR CONSTRUCAO — "OK" so sai se ate o extremo pior cabe na
    // tolerancia, "REPROVADO" so sai se nem o extremo melhor cabe.
    const rawMin = lo <= 0 && hi >= 0 ? 0 : Math.min(Math.abs(lo), Math.abs(hi));
    const rawMax = Math.max(Math.abs(lo), Math.abs(hi));
    const absMin = Math.max(0, rawMin - POSITION_METHOD_MARGIN_CM);
    const absMax = rawMax * POSITION_UNDERESTIMATE_FACTOR + POSITION_METHOD_MARGIN_CM;

    const canonicalLen =
      spec.sizes.find((s) => s.size === CANONICAL_SIZE)?.length_cm ?? spec.lengthRange[1];
    const cmAtCanonical = (px) => (px * canonicalLen) / garmentLen_px;

    // CAMINHO PERCEPTUAL, em pixels, sem conversao para cm: o quanto a estampa
    // esta fora do meio do tronco VISIVEL. Escapa das tres fontes de erro do
    // caminho em cm porque nao tenta desfazer nenhuma delas — e a mesma
    // comparacao que o olho faz ao dizer "esta mais para a direita".
    let offsetVisible_pct = null;
    if (input.side?.left && input.side?.right) {
      const torsoW = dist(input.side.left, input.side.right);
      if (torsoW > 0) {
        const torsoCenter = mid(input.side.left, input.side.right);
        const axisDir = [hem[0] - collar[0], hem[1] - collar[1]];
        const d = signedDistanceToLine(artCenter, torsoCenter, [
          torsoCenter[0] + axisDir[0],
          torsoCenter[1] + axisDir[1],
        ]);
        offsetVisible_pct = round((d / torsoW) * 100, 1);
      }
    }

    const collarToTop = cmAtCanonical(projectOnAxis(artTopMid, collar, hem));
    const rotation = angleFromVertical(collar, hem);

    // NAO ha portao de pose aqui, e a razao foi descoberta no teste de verdade
    // conhecida: alpha reage tambem ao DESLOCAMENTO da arte (uma estampa 8 cm
    // fora do centro enrola de forma assimetrica e sobe o alpha ao nivel de
    // "guinada forte"). Usar alpha como portao suprimia o veredito de posicao
    // justamente nas fotos mais deslocadas — o oposto do que se quer. A faixa
    // ja se autorregula: com guinada, os dois estimadores se afastam e o
    // resultado vira INCONCLUSIVO sozinho.
    const rectifiable = true;

    // O criterio perceptual NAO vira veredito, e a razao foi medida. A ideia
    // era: em pose frontal, "% do tronco visivel" separaria estampa centrada de
    // estampa deslocada. Numa sub-grade parecia separar (centrada ate 4,5%,
    // deslocada a partir de 4,7%). Na grade COMPLETA nao separa em nenhum
    // corte de alpha — nem com |excesso| <= 1, onde uma estampa centrada ainda
    // chega a 11,7% e uma deslocada 5 cm ja aparece com 8,5%.
    //
    // A causa e que alpha nao certifica pose frontal: ele mede a razao entre os
    // eixos, e guinada (que encolhe a largura) com inclinacao (que encolhe a
    // altura) se cancelam nele. Alpha baixo pode ser pose frontal OU as duas
    // deformacoes juntas. Serve para acusar pose ruim, nao para atestar pose
    // boa — e essas duas coisas nao sao a mesma.
    //
    // O numero fica reportado como diagnostico, para conferir veredito contra
    // percepcao no olho humano. Nao decide nada sozinho.
    let posVerdict;
    if (absMax <= tolerance.offsetCm) posVerdict = "OK";
    else if (absMin > tolerance.offsetCm) posVerdict = "REPROVADO";
    else {
      posVerdict = "INCONCLUSIVO";
      notes.push(
        `deslocamento entre ${round(absMin)} e ${round(absMax)} cm: a faixa cruza o limite de ${tolerance.offsetCm} cm, entao nao da para aprovar nem reprovar${offsetVisible_pct === null ? "" : ` (diagnostico visual: ${offsetVisible_pct}% da largura do tronco)`}`,
      );
    }

    position = {
      // Ponto medio dos estimadores, so para leitura humana. O que vale e a
      // faixa corrigida em offsetAbs_range_cm.
      offsetX_cm: rectifiable ? round((lo + hi) / 2) : null,
      offsetX_estimatorRange_cm: rectifiable ? [round(lo), round(hi)] : null,
      offsetAbs_range_cm: rectifiable ? [round(absMin), round(absMax)] : null,
      offsetVisible_pctOfTorso: offsetVisible_pct,
      offsetX_pctOfArtWidth: rectifiable ? round((((lo + hi) / 2) / w_cm) * 100, 1) : null,
      offsetX_byChord_cm: round(cmAtCanonical(offsetChord_px)),
      offsetX_byTorso_cm: offsetTorso_px === null ? null : round(cmAtCanonical(offsetTorso_px)),
      estimatorSpread_cm: round(hi - lo),
      collarToArtTop_cm: round(collarToTop),
      rotation_deg: round(rotation, 1),
      rotationFlagged: Math.abs(rotation) > tolerance.rotationDeg,
      verdict: posVerdict,
    };
  } else if (haveCollar && haveHem) {
    notes.push(
      `posicao sem regua: "${input.garment}" nao tem tabela de medidas, e a conversao de pixel para centimetro depende do comprimento da peca`,
    );
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
