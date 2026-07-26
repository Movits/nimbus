// LANDMARKS DA PECA EM BRANCO, DETECTADOS.
//
// Por que este modulo existe, e por que ele e o item mais importante do
// pipeline de producao.
//
// A composicao deterministica poe a arte no tamanho certo "por construcao". Mas
// "por construcao" so vale a partir dos landmarks: a escala impressa e
//
//     escala ∝ 1 / (barra − gola)
//
// e ate agora esses dois numeros eram lidos A OLHO sobre uma grade. Num moletom
// canguru o vao gola->barra da uns 53 pontos percentuais, entao **1,5 pp de erro
// na leitura da gola vira 2,8% de erro de escala** — da mesma ordem da
// tolerancia inteira de 5%. Era um numero estimado entrando numa conta que se
// apresenta como medida, que e exatamente a classe de erro que derrubou as duas
// auditorias de escala anteriores.
//
// A peca EM BRANCO e o caso facil que nunca existiu antes: cor solida, sem tinta
// cobrindo a gola, sem estampa disputando com a barra. Nas fotos publicadas a
// estampa atrapalhava as duas pontas; aqui nao ha estampa.
//
// O que continua sendo limite, e nao vira promessa: em peca com capuz a gola
// esta OCLUIDA de verdade, e nenhum processamento inventa o que a foto nao tem.
// Nesse caso o detector cai para ombro + offset da convencao e DECLARA o modo,
// para que a incerteza apareca na faixa reportada em vez de sumir.
//
// ============================================================================
// ESTADO MEDIDO EM 26/07: ESTE MODULO **NAO** PASSA NO CRITERIO DE ACEITE.
// Nao use os landmarks daqui para publicar veredito nem para compor sem
// conferencia. O numero abaixo e o resultado, nao uma estimativa.
//
// Conjunto de teste: as 42 anotacoes humanas das fotos publicadas
// (`hem_center` e `collar_center`, com sigma declarado por ponto). E verdade
// conhecida de verdade, com dois anotadores independentes por foto.
//
//   BARRA  vies −2,17 pp · desvio 9,03 pp · |erro| medio 4,63 pp
//          dentro de 1 pp: 24/41 · dentro de 2 pp: 28/41
//   GOLA   vies +1,62 pp · desvio 7,61 pp · |erro| medio 5,38 pp
//          dentro de 2 pp: 22/41 · dentro de 3 pp: 23/41
//
// O criterio declarado era 1 pp na barra. Passam 24 de 41.
//
// TRES METODOS FORAM TENTADOS E MEDIDOS, nenhum abandonado em silencio:
//
//  1. Crescimento de regiao por cor. Falhou em tres modos distintos e
//     VISIVEIS: peca clara funde com parede clara (a cobertura salta de 23%
//     para 57% entre tolerancia 18 e 22), peca preta funde com calca preta
//     (a barra deixa de existir como borda), e cobertura com buracos. Varrendo
//     a tolerancia de 14 a 40 a cobertura cresce sem plato — sinal de que
//     falta informacao, nao calibragem.
//  2. O mesmo, com BARREIRA DE GRADIENTE sobre a imagem borrada. Melhorou, mas
//     duas das seis cenas continuaram vazando.
//  3. Ponto de mudanca 1D na coluna central (o codigo de referencia ficou em
//     `hem-test.mjs`, no scratchpad). E o melhor dos tres e produziu os numeros
//     acima. As falhas sao concentradas e explicadas: em peca preta o detector
//     trava na borda inferior da ESTAMPA, que e um degrau muito maior que a
//     barra. Variante "ultimo degrau em vez do mais forte" levou 28/41 para
//     31/41 dentro de 2 pp mas quase DOBROU o desvio (9,0 -> 16,3 pp): troca de
//     erro, nao ganho.
//
// RESSALVA QUE IMPORTA PARA QUEM CONTINUAR: este teste roda sobre fotos COM
// ESTAMPA, e o modo de falha dominante — travar na borda da estampa — NAO PODE
// acontecer numa peca em branco, que e o uso pretendido. Ou seja o numero acima
// e um PIOR CASO, e provavelmente pessimista para o caso real. Mas isso e
// hipotese, nao medicao: no conjunto de pecas em branco so existe UM ponto de
// verdade conhecida (352618878, onde a barra automatica deu 86,13 contra 85,5
// da leitura manual, 0,6 pp), e um ponto nao valida nada.
//
// O caminho para fechar isso, em ordem de custo: (a) anotar a mao 8 a 10 pecas
// em branco e repetir esta mesma medicao no dominio certo; (b) se ainda nao
// passar, usar recorte de sujeito por modelo (`remove_background`) para eliminar
// o fundo antes de segmentar, que ataca 2 dos 3 modos de falha de uma vez.
// ============================================================================

import sharp from "sharp";
import { gradientMagnitude } from "./register-art.mjs";

/**
 * Borra por media de caixa. Serve para o gradiente ver CONTORNO e nao textura:
 * malha de moletom tem gradiente alto pixel a pixel, e sem borrar a barreira
 * fecharia dentro da propria peca.
 */
function borrar(data, W, H, C, r = 3) {
  const out = new Float32Array(W * H * 3);
  const soma = new Float32Array((W + 1) * (H + 1) * 3);
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const i = (y * W + x) * C, s = ((y + 1) * (W + 1) + (x + 1)) * 3;
      const a = ((y + 1) * (W + 1) + x) * 3, b = (y * (W + 1) + (x + 1)) * 3, c = (y * (W + 1) + x) * 3;
      for (let k = 0; k < 3; k += 1) soma[s + k] = data[i + k] + soma[a + k] + soma[b + k] - soma[c + k];
    }
  }
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const y0 = Math.max(0, y - r), y1 = Math.min(H - 1, y + r);
      const x0 = Math.max(0, x - r), x1 = Math.min(W - 1, x + r);
      const n = (y1 - y0 + 1) * (x1 - x0 + 1);
      const A = ((y1 + 1) * (W + 1) + (x1 + 1)) * 3, B = (y0 * (W + 1) + (x1 + 1)) * 3;
      const Cc = ((y1 + 1) * (W + 1) + x0) * 3, D = (y0 * (W + 1) + x0) * 3;
      const o = (y * W + x) * 3;
      for (let k = 0; k < 3; k += 1) out[o + k] = (soma[A + k] - soma[B + k] - soma[Cc + k] + soma[D + k]) / n;
    }
  }
  return out;
}

/** Distancia de cor com peso maior na crominancia, que sobrevive a sombra. */
function dist(r1, g1, b1, r2, g2, b2) {
  const dl = 0.299 * (r1 - r2) + 0.587 * (g1 - g2) + 0.114 * (b1 - b2);
  const dr = r1 - r2 - dl, dg = g1 - g2 - dl, db = b1 - b2 - dl;
  return Math.hypot(dl * 0.6, dr, dg, db);
}

/**
 * Mascara da peca por crescimento de regiao a partir de uma semente no dorso.
 *
 * Crescimento e nao limiar global porque o fundo pode ter exatamente a cor da
 * peca — parede clara com camiseta branca e o caso ruim, e acontece em varias
 * cenas STREET. Conectividade resolve o que cor sozinha nao resolve.
 */
export function garmentMask(data, W, H, C, opts = {}) {
  const tol = opts.tol ?? 34;
  const sx = Math.round((opts.seedX ?? 0.5) * W);
  // BARREIRA DE GRADIENTE. Cor sozinha nao separa camiseta branca de parede
  // clara, e medindo isso ficou evidente: varrendo a tolerancia de 14 a 40 a
  // cobertura cresce sem plato nenhum, e numa das cenas salta de 23% para 57%
  // entre 18 e 22. Nao existe limiar certo — falta informacao, nao calibragem.
  // O contorno da peca, porem, tem borda mesmo quando as cores quase empatam.
  // Entao o crescimento passa a ser proibido de ATRAVESSAR crista de gradiente,
  // calculada sobre a imagem BORRADA para nao confundir textura com contorno.
  const suave = borrar(data, W, H, C, opts.blur ?? 3);
  const grad = gradientMagnitude(suave, W, H, 3);
  let acc = 0;
  for (let i = 0; i < W * H; i += 1) acc += grad[i];
  const gradMax = opts.gradMax ?? Math.max(6, (opts.gradK ?? 3.0) * (acc / (W * H)));
  const sy = Math.round((opts.seedY ?? 0.55) * H);
  // semente = mediana de uma janelinha, para nao ancorar num pixel de ruido
  const amostras = [];
  for (let y = sy - 12; y <= sy + 12; y += 3) {
    for (let x = sx - 12; x <= sx + 12; x += 3) {
      if (y < 0 || x < 0 || y >= H || x >= W) continue;
      const i = (y * W + x) * C;
      amostras.push([data[i], data[i + 1], data[i + 2]]);
    }
  }
  amostras.sort((a, b) => (0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2]) - (0.299 * b[0] + 0.587 * b[1] + 0.114 * b[2]));
  const [R0, G0, B0] = amostras[Math.floor(amostras.length / 2)];

  const mask = new Uint8Array(W * H);
  const pilha = [sy * W + sx];
  mask[sy * W + sx] = 1;
  while (pilha.length) {
    const p = pilha.pop();
    const y = (p / W) | 0, x = p - y * W;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const q = ny * W + nx;
      if (mask[q]) continue;
      if (grad[q] > gradMax) continue; // crista de contorno: nao atravessa
      const i = q * C;
      if (dist(data[i], data[i + 1], data[i + 2], R0, G0, B0) > tol) continue;
      mask[q] = 1;
      pilha.push(q);
    }
  }
  return { mask, seed: [R0, G0, B0], gradMax: +gradMax.toFixed(2) };
}

/** Fecha buracos pequenos (dobra, sombra forte) por dilatacao + erosao. */
function fechar(mask, W, H, r = 3) {
  const dil = new Uint8Array(W * H), out = new Uint8Array(W * H);
  const passo = (src, dst, querTodos) => {
    for (let y = 0; y < H; y += 1) {
      for (let x = 0; x < W; x += 1) {
        let acc = querTodos ? 1 : 0;
        for (let dy = -r; dy <= r && (querTodos ? acc : !acc); dy += 1) {
          for (let dx = -r; dx <= r && (querTodos ? acc : !acc); dx += 1) {
            const yy = y + dy, xx = x + dx;
            const v = yy < 0 || xx < 0 || yy >= H || xx >= W ? 0 : src[yy * W + xx];
            if (querTodos) acc = acc && v; else acc = acc || v;
          }
        }
        dst[y * W + x] = acc ? 1 : 0;
      }
    }
  };
  passo(mask, dil, false);
  passo(dil, out, true);
  return out;
}

/** Perfil por linha: extremos e o segmento que contem a coluna central. */
export function perfil(mask, W, H) {
  const linhas = [];
  for (let y = 0; y < H; y += 1) {
    let x0 = -1, x1 = -1, n = 0;
    for (let x = 0; x < W; x += 1) {
      if (!mask[y * W + x]) continue;
      if (x0 < 0) x0 = x;
      x1 = x; n += 1;
    }
    linhas.push({ y, x0, x1, n, largura: x1 < 0 ? 0 : x1 - x0 + 1 });
  }
  return linhas;
}

/**
 * Detecta gola, ombro, barra e centro do dorso numa foto de peca em branco.
 *
 * @param {string} src caminho da imagem
 * @param {object} [opts]
 * @param {boolean} [opts.capuz] a peca tem capuz (gola fica ocluida)
 * @param {number} [opts.alturaArte] fracao da imagem onde a arte fica, para o centro
 * @returns {Promise<object>}
 */
export async function detectar(src, opts = {}) {
  const r = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = r.info;
  const { mask: bruta, seed } = garmentMask(r.data, W, H, C, opts);
  const mask = fechar(bruta, W, H, 3);
  const linhas = perfil(mask, W, H);

  const larguraMax = Math.max(...linhas.map((l) => l.largura));
  if (larguraMax < 0.15 * W) {
    return { ok: false, motivo: `mascara degenerada (largura maxima ${larguraMax}px de ${W}) — provavel fundo com a cor da peca`, seed };
  }

  // BARRA: ultima linha, de cima para baixo, em que a coluna central ainda
  // pertence a peca. A barra e o landmark mais confiavel do conjunto (sigma
  // 1,2 nas anotacoes reais contra 3,0 da gola), e aqui ela e quase exata
  // porque abaixo dela ha calca ou fundo, nunca mais tecido da mesma cor.
  const cx0 = Math.round(0.46 * W), cx1 = Math.round(0.54 * W);
  let barraY = -1;
  for (let y = H - 1; y >= 0; y -= 1) {
    let n = 0;
    for (let x = cx0; x <= cx1; x += 1) if (mask[y * W + x]) n += 1;
    if (n > 0.6 * (cx1 - cx0 + 1)) { barraY = y; break; }
  }

  // OMBRO: maior salto de largura descendo do topo da mascara. Numa peca sem
  // capuz o salto e gola->ombro. Com capuz, o capuz ja e largo e o salto real
  // e ombro->manga, entao a busca comeca abaixo do capuz.
  const topo = linhas.findIndex((l) => l.largura > 0.08 * larguraMax);
  const inicio = topo + Math.round((opts.capuz ? 0.10 : 0.02) * H);
  let ombroY = -1, maiorSalto = 0;
  const jan = Math.max(3, Math.round(0.012 * H));
  for (let y = inicio; y < H * 0.6; y += 1) {
    const a = linhas[y - jan]?.largura ?? 0, b = linhas[y + jan]?.largura ?? 0;
    const salto = b - a;
    if (salto > maiorSalto) { maiorSalto = salto; ombroY = y; }
  }

  // GOLA: sem capuz, a base do decote e a primeira linha em que a coluna
  // central vira tecido descendo do topo. Com capuz nao existe leitura: cai
  // para ombro + offset e o modo fica DECLARADO.
  let golaY = -1, modoGola = "decote";
  if (!opts.capuz) {
    for (let y = topo; y < H * 0.6; y += 1) {
      let n = 0;
      for (let x = cx0; x <= cx1; x += 1) if (mask[y * W + x]) n += 1;
      if (n > 0.8 * (cx1 - cx0 + 1)) { golaY = y; break; }
    }
  }
  if (golaY < 0) {
    modoGola = opts.capuz ? "ombro+offset (capuz oclui a gola)" : "ombro+offset (decote nao detectado)";
    golaY = ombroY > 0 ? ombroY + Math.round((opts.offsetOmbroGola ?? 0.012) * H) : -1;
  }

  // CENTRO DO DORSO na altura da arte. Limite conhecido e herdado da auditoria:
  // o contorno externo nessa altura costuma ser a MANGA, nao o tronco, entao o
  // ponto medio da mascara e enviesado quando o braco esta colado. Reporta-se
  // a faixa, nao so o ponto.
  const yArte = Math.round((opts.alturaArte ?? 0.5) * H);
  const lArte = linhas[Math.min(H - 1, Math.max(0, yArte))];
  const centroFrac = lArte && lArte.largura > 0 ? (lArte.x0 + lArte.x1) / 2 / W : 0.5;

  const pp = (y) => +((100 * y) / H).toFixed(2);
  return {
    ok: barraY > 0 && golaY > 0,
    motivo: barraY > 0 && golaY > 0 ? null : "barra ou gola nao detectadas",
    imagem: { w: W, h: H },
    gola: { frac: +(golaY / H).toFixed(4), pct: pp(golaY), modo: modoGola },
    ombro: { frac: +(ombroY / H).toFixed(4), pct: pp(ombroY), salto_px: maiorSalto },
    barra: { frac: +(barraY / H).toFixed(4), pct: pp(barraY) },
    centro: { frac: +centroFrac.toFixed(4), pct: +(100 * centroFrac).toFixed(2), aviso: "ponto medio da mascara; se o braco estiver colado ao tronco isto inclui a manga" },
    vao_pp: +(pp(barraY) - pp(golaY)).toFixed(2),
    cobertura_pct: +((100 * mask.reduce((a, b) => a + b, 0)) / (W * H)).toFixed(1),
    seed_rgb: seed,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (n, d = null) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
  const r = await detectar(arg("--foto"), {
    capuz: process.argv.includes("--capuz"),
    tol: Number(arg("--tol", "34")),
    alturaArte: Number(arg("--altura-arte", "0.5")),
  });
  console.log(JSON.stringify(r, null, 2));
}
