import { pathToFileURL } from "node:url";
// GATE NUMERICO DE CAPA COMPOSTA � consolida em um comando os checks que os
// 11 paineis de verificacao de 26/07 produziram, um a um, cada um a partir de
// um defeito real:
//
//   barra        <- a leitura visual pegou pesponto/dobra 2x (196: -5,9%, 999: -6,5%)
//   escala       <- a regua oficial (cm + gola->barra)
//   verticais    <- por construcao, mas confirma que o render bateu o plano
//   centro       <- Brasao v1 tinha caixa no alvo e coluna 1,8pp fora
//   aspecto      <- compressao alem da fisica (Querubim 7,3%, 787 12,3%)
//   confinamento <- composicao nao pode tocar nada fora da zona da arte
//   clipping     <- clamp de sombra estourando o creme (837 v1, 999 v1)
//   moire        <- trama halftone virando xadrez sem supersampling (878 v5)
//
// A referencia de textura NAO e a capa publicada nem o mockup: e a ARTE
// OFICIAL reamostrada com Lanczos para o mesmo tamanho e composta sobre a
// luminancia mediana do tecido. Comparar contra a publicada foi o que gerou
// acusacoes falsas de "redesenho" (o redesenho estava na capa antiga).
//
// Uso:
//   node scripts/geometry/qa-capa.mjs --blank b.png --composta c.png \
//     --arte a.png --arte-cm 31.5x40 --peca "Moletom Canguru" \
//     --gola 0.29 --barra 0.893 [--tinta-clara] [--json saida.json]

import fs from "node:fs";
import sharp from "sharp";
import { detectarBarra } from "./detect-hem.mjs";
import { getGarmentSpec } from "./garment-specs.mjs";
import { CANONICAL_SIZE } from "./measure.mjs";
import { registerArt } from "./register-art.mjs";
import { luminanciaDaTinta, avaliar as avaliarContraste } from "./contraste-tinta.mjs";

const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};

const raw = async (p) => {
  const r = await sharp(p).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: r.data, width: r.info.width, height: r.info.height };
};

/** Mascara de tinta: diff forte entre composta e blank, erodida. */
function mascaraTinta(a, b, thr = 38) {
  const { width: W, height: H } = a;
  const m = new Uint8Array(W * H);
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const o = (y * W + x) * 3;
      const d = Math.max(
        Math.abs(a.data[o] - b.data[o]),
        Math.abs(a.data[o + 1] - b.data[o + 1]),
        Math.abs(a.data[o + 2] - b.data[o + 2]),
      );
      if (d > thr) m[y * W + x] = 1;
    }
  }
  const e = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y += 1) {
    for (let x = 1; x < W - 1; x += 1) {
      if (!m[y * W + x]) continue;
      let n = 0;
      for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) n += m[(y + dy) * W + x + dx];
      if (n >= 6) e[y * W + x] = 1;
    }
  }
  return { bruta: m, mask: e };
}

function momentos(mask, W, H) {
  // A CAIXA IGNORA LINHAS/COLUNAS COM POUCOS PIXELS. Com min/max absolutos,
  // TRES pixels perdidos de ringing na regiao do cabelo puxaram o topo da
  // caixa de 39,7% para 26,6% e produziram uma REPROVACAO FALSA de posicao
  // (-15 cm) numa capa que estava certa. Exigir populacao minima por linha
  // mata specks isolados sem mexer na arte de verdade.
  const MIN_POP = 3;
  const porLinha = new Int32Array(H), porColuna = new Int32Array(W);
  let sx = 0, sy = 0, sxx = 0, syy = 0, n = 0;
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
    if (!mask[y * W + x]) continue;
    porLinha[y] += 1; porColuna[x] += 1;
    sx += x; sy += y; sxx += x * x; syy += y * y; n += 1;
  }
  if (!n) return null;
  let x0 = W, x1 = -1, y0 = H, y1 = -1;
  for (let y = 0; y < H; y += 1) if (porLinha[y] >= MIN_POP) { if (y0 === H) y0 = y; y1 = y; }
  for (let x = 0; x < W; x += 1) if (porColuna[x] >= MIN_POP) { if (x0 === W) x0 = x; x1 = x; }
  if (x1 < 0 || y1 < 0) return null;
  const mx = sx / n, my = sy / n;
  return {
    n, cx: mx, cy: my,
    sx: Math.sqrt(sxx / n - mx * mx), sy: Math.sqrt(syy / n - my * my),
    x0, x1, y0, y1, w: x1 - x0 + 1, h: y1 - y0 + 1,
  };
}

/** Laplaciano medio absoluto dentro da mascara: proxy de energia de alta frequencia. */
function hf(img, mask) {
  const { width: W, height: H } = img;
  let s = 0, n = 0;
  const L = (x, y) => {
    const o = (y * W + x) * 3;
    return 0.299 * img.data[o] + 0.587 * img.data[o + 1] + 0.114 * img.data[o + 2];
  };
  for (let y = 1; y < H - 1; y += 1) for (let x = 1; x < W - 1; x += 1) {
    if (!mask[y * W + x]) continue;
    s += Math.abs(4 * L(x, y) - L(x - 1, y) - L(x + 1, y) - L(x, y - 1) - L(x, y + 1));
    n += 1;
  }
  return n ? s / n : 0;
}

export async function qa({ blank, composta, arte, arteCm, peca, gola, barra, yaw = 0, arco = null, placementCm = null }) {
  const bl = await raw(blank);
  const co = await raw(composta);
  const { width: W, height: H } = co;
  const checks = {};

  // ---- barra pelo detector (o erro que se repetiu duas vezes) ----
  const det = await detectarBarra(blank);
  const barraDet = det.sugestao_borda_pct / 100;
  // INFORMATIVO, nao gate: o detector foi validado em CAMISETA (95,02 e 97,27
  // confirmados por painel), mas em MOLETOM ele pega o contorno da calca/chao
  // abaixo da ribana (mediu 98,6 onde a barra e 89,3). Quem reprova erro de
  // regua e o check de escala pelo registro NCC, que e independente do metodo
  // de leitura da barra.
  checks.barra = {
    usada_pct: +(100 * barra).toFixed(2),
    detectada_pct: det.sugestao_borda_pct,
    delta_pp: +(100 * (barra - barraDet)).toFixed(2),
    candidatos: det.candidatos,
    ok: null,
    nota: "informativo. Confiavel em CAMISETA CLARA. Em moletom pega o contorno da calca/chao; em camiseta PRETA sobre calca PRETA o degrau mais baixo tambem e a calca — nesses casos use o 2o candidato e confirme no zoom",
  };

  // ---- mascara da tinta e momentos ----
  const { bruta, mask } = mascaraTinta(co, bl);
  const mom = momentos(mask, W, H);
  if (!mom) return { erro: "nenhuma tinta detectada no diff", checks };

  // ---- escala pela regua oficial ----
  // Instrumento: registro NCC (o mesmo dos paineis), NAO a caixa por limiar.
  // A caixa subestima arte esparsa (spray/drips somem na erosao: -8% medido no
  // Querubim que o registro poe em -0,2%). O template precisa ser ACHATADO
  // sobre o tecido: removeAlpha apaga arte cujo RGB sob o alpha nao e branco
  // (pego no Espirito Santo, onde o registro travava com score 0,28).
  const spec = getGarmentSpec(peca);
  // `estimado` cobre o Blusao Moletom, que a YouDraw nao tabela: a medida vem
  // da regua-pela-arte sobre os mockups oficiais (garment-specs.mjs).
  //
  // Sem isso o gate ficava CEGO nessa peca: escala e posicao voltavam null, e
  // como check null nao entra em `falhas`, o veredito saia APROVADO apoiado so
  // em confinamento, clipping e moire. Cinco capas de Blusao passaram assim,
  // sem a escala ter sido medida uma vez. `compose-art.mjs` ja aceitava o
  // fallback; era so o gate que nao.
  const L = (spec.hasTable || spec.estimado)
    ? spec.sizes.find((s) => s.size === CANONICAL_SIZE).length_cm
    : null;
  const LEstimado = !spec.hasTable && Boolean(spec.estimado);
  const pecaPx = (barra - gola) * H;

  // ---- referencia fiel: arte oficial reamostrada + composta sobre o tecido ----
  const ra = await sharp(arte).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: AW, height: AH } = ra.info;
  let ax0 = AW, ax1 = -1, ay0 = AH, ay1 = -1;
  for (let y = 0; y < AH; y += 1) for (let x = 0; x < AW; x += 1) {
    if (ra.data[(y * AW + x) * 4 + 3] > 8) {
      if (x < ax0) ax0 = x; if (x > ax1) ax1 = x; if (y < ay0) ay0 = y; if (y > ay1) ay1 = y;
    }
  }
  const razaoPlana = (ax1 - ax0 + 1) / (ay1 - ay0 + 1);

  // luminancia mediana do tecido na janela da arte (no BLANK, antes da tinta)
  const am = [];
  for (let y = mom.y0; y <= mom.y1; y += 2) for (let x = mom.x0; x <= mom.x1; x += 2) {
    const o = (y * W + x) * 3;
    am.push(0.299 * bl.data[o] + 0.587 * bl.data[o + 1] + 0.114 * bl.data[o + 2]);
  }
  am.sort((a, b) => a - b);
  const lumTecido = am[Math.floor(am.length / 2)];

  const fielBuf = await sharp(arte).ensureAlpha()
    .extract({ left: ax0, top: ay0, width: ax1 - ax0 + 1, height: ay1 - ay0 + 1 })
    .resize({ width: mom.w, height: mom.h, kernel: "lanczos3", fit: "fill" })
    .flatten({ background: { r: Math.round(lumTecido), g: Math.round(lumTecido), b: Math.round(lumTecido) } })
    .raw().toBuffer({ resolveWithObject: true });
  const fiel = { data: fielBuf.data, width: fielBuf.info.width, height: fielBuf.info.height };
  const fielMaskFull = new Uint8Array(fiel.width * fiel.height).fill(1);

  // registro NCC para a escala (template achatado sobre o tecido)
  const menor = async (p, max) => {
    const r = await sharp(p).resize(max, max, { fit: "inside" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    return { data: r.data, width: r.info.width, height: r.info.height, channels: 3 };
  };
  const tplPath = `${composta}.tmp-tpl.png`;
  await sharp(arte).ensureAlpha()
    .extract({ left: ax0, top: ay0, width: ax1 - ax0 + 1, height: ay1 - ay0 + 1 })
    .flatten({ background: { r: Math.round(lumTecido), g: Math.round(lumTecido), b: Math.round(lumTecido) } })
    .png().toFile(tplPath);
  let reg = null;
  try {
    const cena = await menor(composta, 900);
    const tpl = await menor(tplPath, 420);
    reg = registerArt(cena, tpl, { scaleRange: [0.12, 0.85] });
    if (reg) {
      reg.height_pct = (100 * reg.height_px) / cena.height;
      // topo da arte pelo REGISTRO, para o check de posicao (ver adiante)
      reg.topo_pct = (100 * (reg.cy - reg.height_px / 2)) / cena.height;
    }
  } catch { /* registro pode falhar em arte esparsa */ }
  fs.unlinkSync(tplPath);

  const alturaRegPct = reg && reg.score >= 0.4 ? reg.height_pct : null;
  const alturaPct = alturaRegPct ?? (100 * mom.h) / H;
  const alturaCm = L ? (alturaPct / 100) * H * (L / pecaPx) : null;
  checks.escala = L ? {
    instrumento: alturaRegPct ? `registro NCC (score ${reg.score.toFixed(3)})` : "caixa por limiar (registro falhou; tolerancia alargada)",
    altura_medida_cm: +alturaCm.toFixed(2),
    alvo_cm: arteCm.h,
    desvio_pct: +(100 * (alturaCm / arteCm.h - 1)).toFixed(2),
    ok: Math.abs(100 * (alturaCm / arteCm.h - 1)) <= (alturaRegPct ? 2.0 : 6.0),
    // A regua desta peca e estimativa, nao dado publicado: o desvio abaixo e
    // medido CONTRA ela, entao herda o risco de escala da estimativa.
    ...(LEstimado ? { regua_estimada: true, origem_regua: spec.origem_estimativa } : {}),
  } : { motivo: `"${peca}" sem tabela de medidas`, ok: null };

  // ---- aspecto: compressao horizontal vs a arte plana ----
  //
  // MEDIR PELO REGISTRO, NAO PELA CAIXA POR LIMIAR. A caixa perde as bordas
  // finas em tecido escuro e em arte de silhueta irregular (spray, stencil):
  // ela encolhe MAIS na horizontal, onde a arte tem respingo, do que na
  // vertical, e a razao sai comprimida demais. Isso produzia alerta de
  // "aspecto" em capa geometricamente correta, e como o alerta era frequente
  // os agentes passaram a descarta-lo por reflexo — que e o pior efeito
  // possivel de um alarme falso.
  //
  // E o mesmo motivo pelo qual `escala` e `posicao` ja usam o registro NCC.
  const usaRegAspecto = reg && reg.score >= 0.4 && reg.width_px > 0 && reg.height_px > 0;
  const razaoMedida = usaRegAspecto ? reg.width_px / reg.height_px : mom.w / mom.h;
  const compressao = 100 * (1 - razaoMedida / razaoPlana);
  checks.aspecto = {
    instrumento: usaRegAspecto ? `registro NCC (score ${reg.score.toFixed(3)})` : "caixa por limiar (registro falhou)",
    razao_medida: +razaoMedida.toFixed(4),
    razao_caixa: +(mom.w / mom.h).toFixed(4),
    razao_plana: +razaoPlana.toFixed(4),
    compressao_pct: +compressao.toFixed(2),
    // O esperado NAO e um numero fixo: sai da geometria. Enrolando a arte num
    // cilindro, a largura projeta por kappa = sin(t)/t, com t = meio-arco em
    // radianos (o `arco_meio_rad` que o compor imprime). Uma estampa larga de
    // costas (35 cm num painel de 54) chega a 11% SO de fisica � o limiar
    // fixo de 8% acusava isso como defeito no Sao Miguel Celeste.
    esperado_pct: arco ? +(100 * (1 - Math.sin(arco) / arco)).toFixed(2) : null,
    ok: null,
    alerta: arco
      ? Math.abs(compressao - 100 * (1 - Math.sin(arco) / arco)) > 4 + Math.abs(yaw) * 0.5
      : (compressao > (yaw ? 8 + Math.abs(yaw) * 0.5 : 8) || compressao < -2),
    nota: arco
      ? "compara com o encurtamento cilindrico previsto para este arco; folga de 4 pp"
      : "passe --arco <arco_meio_rad do compor> para o esperado sair da geometria em vez de limiar fixo",
  };

  // ---- centro vs eixo da peca (silhueta do blank na altura da arte) ----
  // Classifica tecido pela COR amostrada do proprio tecido (RGB), nao por
  // luminancia contra um fundo suposto: contra ceu claro (colecao NUVEM) o
  // criterio antigo engolia o fundo e devolvia eixo em 17% (lixo).
  const amCor = [];
  for (let y = Math.max(0, mom.y0 - 40); y < mom.y0 - 5; y += 2) {
    for (let x = Math.round(0.45 * W); x < Math.round(0.55 * W); x += 2) {
      const o = (y * W + x) * 3;
      amCor.push([bl.data[o], bl.data[o + 1], bl.data[o + 2]]);
    }
  }
  amCor.sort((a, b) => (0.299 * a[0] + 0.587 * a[1] + 0.114 * a[2]) - (0.299 * b[0] + 0.587 * b[1] + 0.114 * b[2]));
  const cT = amCor.length ? amCor[Math.floor(amCor.length / 2)] : [lumTecido, lumTecido, lumTecido];
  const TOL = lumTecido < 90 ? 42 : 52;
  const yMeio = Math.round((mom.y0 + mom.y1) / 2);
  let bx0 = -1, bx1 = -1, run = 0, bestRun = 0, rs = 0;
  for (let x = 0; x < W; x += 1) {
    const o = (yMeio * W + x) * 3;
    const dentro = Math.abs(bl.data[o] - cT[0]) < TOL && Math.abs(bl.data[o + 1] - cT[1]) < TOL && Math.abs(bl.data[o + 2] - cT[2]) < TOL;
    if (dentro) { if (run === 0) rs = x; run += 1; if (run > bestRun) { bestRun = run; bx0 = rs; bx1 = x; } }
    else run = 0;
  }
  if (bestRun > 0.9 * W) { bx0 = -1; bx1 = -1; } // fundo parecido com o tecido: nao decide
  const eixo = bx1 > 0 ? (bx0 + bx1) / 2 : null;
  // INFORMATIVO: a "silhueta" na altura da arte inclui MANGAS no moletom, o
  // que puxa o eixo (deu 6 pp num aprovado). Centro so decide contra a
  // assinatura da cena publicada.
  checks.centro = eixo ? {
    centro_arte_pct: +(100 * mom.cx / W).toFixed(2),
    eixo_silhueta_pct: +(100 * eixo / W).toFixed(2),
    desvio_pp: +(100 * (mom.cx - eixo) / W).toFixed(2),
    ok: null,
    alerta: Math.abs(100 * (mom.cx - eixo) / W) > 7,
    nota: "silhueta inclui mangas; use a capa publicada como referencia de eixo",
  } : { ok: null, motivo: "silhueta nao isolavel" };

  // ---- POSICAO VERTICAL (gola -> topo da arte) ----
  // Este check nasceu de um furo do proprio gate: ele media tamanho, forma,
  // textura e vazamento, mas NUNCA verificava a que altura a arte caiu. Por
  // isso 11 capas foram aprovadas com o placement de 8 cm que a medicao nos
  // mockups oficiais mostrou estar errado para quase todo o catalogo.
  //
  // O TOPO SAI DO REGISTRO NCC, NAO DA CAIXA POR LIMIAR. A caixa e cega para
  // tinta escura sobre tecido escuro: no 352725852 a MESMA arte, no MESMO
  // placement, deu erro de -0,04 cm na camiseta branca e +2,44 cm na preta,
  // com a caixa da preta 4,4 pontos mais curta nas DUAS pontas — o halo escuro
  // do topo e os drips da base somem no diff contra tecido preto. A escala ja
  // usava o registro por esse mesmo motivo e passou nas duas (0,15% e -0,10%).
  checks.posicao = placementCm != null && L ? (() => {
    const cmPorPxLocal = L / pecaPx;
    const esperadoPx = gola * H + (placementCm / cmPorPxLocal);
    const usaRegistro = reg && reg.score >= 0.4 && Number.isFinite(reg.topo_pct);
    const topoPx = usaRegistro ? (reg.topo_pct / 100) * H : mom.y0;
    const erroCm = (topoPx - esperadoPx) * cmPorPxLocal;
    return {
      instrumento: usaRegistro ? `registro NCC (score ${reg.score.toFixed(3)})` : "caixa por limiar (registro falhou)",
      topo_medido_pct: +((100 * topoPx) / H).toFixed(2),
      topo_caixa_pct: +((100 * mom.y0) / H).toFixed(2),
      topo_esperado_pct: +((100 * esperadoPx) / H).toFixed(2),
      placement_oficial_cm: placementCm,
      erro_cm: +erroCm.toFixed(2),
      // Sem registro a caixa e o unico instrumento, e ela subestima em tecido
      // escuro: alargar a tolerancia em vez de reprovar por cegueira do metodo.
      ok: Math.abs(erroCm) <= (usaRegistro ? 1.5 : 3.0),
      nota: usaRegistro
        ? "placement medido no mockup oficial; +- 1,5 cm"
        : "registro NCC falhou; medido pela caixa por limiar, que subestima em tecido escuro. Tolerancia alargada para 3 cm",
    };
  })() : {
    ok: null,
    nota: "sem placement oficial: passe --placement <cm> (placement-oficial.json). Sem ele a composicao usa os 8 cm historicos, que sao suposicao.",
  };

  // ---- confinamento: diff forte fora da caixa da arte ----
  // O supersampling reamostra a imagem INTEIRA, entao toda borda de alto
  // contraste da cena difere ~1 px do blank. Isso e ruido de reamostragem, nao
  // alteracao de conteudo: conta so diff FORTE (>70) fora da caixa.
  let fora = 0;
  const mg = 12;
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
    if (x >= mom.x0 - mg && x <= mom.x1 + mg && y >= mom.y0 - mg && y <= mom.y1 + mg) continue;
    const o = (y * W + x) * 3;
    const d = Math.max(
      Math.abs(co.data[o] - bl.data[o]),
      Math.abs(co.data[o + 1] - bl.data[o + 1]),
      Math.abs(co.data[o + 2] - bl.data[o + 2]),
    );
    if (d > 70) fora += 1;
  }
  checks.confinamento = {
    pixels_fora_forte: fora,
    pct_do_quadro: +(100 * fora / (W * H)).toFixed(4),
    ok: (100 * fora) / (W * H) < 0.15,
    nota: "so diff >70 fora da caixa; abaixo disso e ruido do supersampling",
  };

  // ---- clipping e moire, contra a referencia fiel ----
  const recorte = (img, m) => {
    const out = { data: Buffer.alloc(mom.w * mom.h * 3), width: mom.w, height: mom.h };
    const mk = new Uint8Array(mom.w * mom.h);
    for (let y = 0; y < mom.h; y += 1) for (let x = 0; x < mom.w; x += 1) {
      const src = ((y + mom.y0) * img.width + (x + mom.x0)) * 3;
      const dst = (y * mom.w + x) * 3;
      out.data[dst] = img.data[src]; out.data[dst + 1] = img.data[src + 1]; out.data[dst + 2] = img.data[src + 2];
      mk[y * mom.w + x] = m ? m[(y + mom.y0) * img.width + (x + mom.x0)] : 1;
    }
    return { img: out, mask: mk };
  };
  const cRec = recorte(co, mask);
  const clip = (img, m) => {
    let c = 0, n = 0;
    for (let i = 0, p = 0; i < img.width * img.height; i += 1, p += 3) {
      if (!m[i]) continue;
      n += 1;
      if (img.data[p] >= 254 || img.data[p + 1] >= 254 || img.data[p + 2] >= 254) c += 1;
    }
    return n ? (100 * c) / n : 0;
  };
  const clipC = clip(cRec.img, cRec.mask);
  const clipF = clip(fiel, fielMaskFull);
  checks.clipping = {
    composta_pct: +clipC.toFixed(2), fiel_pct: +clipF.toFixed(2),
    razao: +(clipF > 0.01 ? clipC / clipF : 0).toFixed(2),
    ok: clipF <= 0.01 ? clipC < 2 : clipC / clipF <= 2.2,
    nota: "clamp de sombra alto estoura o creme; baixar --sombra-max",
  };
  const hfC = hf(cRec.img, cRec.mask);
  const hfF = hf(fiel, fielMaskFull);
  checks.moire = {
    hf_composta: +hfC.toFixed(1), hf_fiel: +hfF.toFixed(1),
    razao: +(hfF > 0 ? hfC / hfF : 0).toFixed(2),
    ok: hfF > 0 ? hfC / hfF <= 1.35 : null,
    nota: "razao >1,35 = aliasing/moire (aumentar --ss)",
  };

  // ---- A TINTA APARECE NO TECIDO? ----
  // Varias artes tem duas versoes de tinta, e o sufixo do arquivo nomeia a cor
  // da PECA, nao a da tinta — com convencao INVERTIDA entre familias: em
  // `B4-...-branco.png` a tinta e preta, em `G6-...-branco.png` ela e clara.
  // Trocar as duas gera estampa preta sobre peca preta, e todos os outros
  // checks passam: escala, posicao, confinamento e moire nao olham cor. Foi
  // assim que o 352720257 v1 saiu invisivel e so a inspecao visual pegou.
  try {
    const t = await luminanciaDaTinta(arte);
    if (t) {
      const c = avaliarContraste({ tinta: t, tecido: lumTecido });
      checks.tinta_visivel = {
        ...c,
        nota: "fracao dos pixels de tinta que se afastam do tecido mais de 40 niveis; "
          + "a inversao real medida deu 0,2% e as capas corretas ficam acima de 44%",
      };
    }
  } catch { /* arte sem alpha ou ilegivel: o check simplesmente nao opina */ }

  const falhas = Object.entries(checks).filter(([, v]) => v.ok === false).map(([k]) => k);
  const alertas = Object.entries(checks).filter(([, v]) => v.alerta).map(([k]) => k);
  return {
    // CALIBRADO em 26/07 contra as 9 capas aprovadas por painel (todas passam,
    // escala dentro de +-0,3%) e 3 controles reprovados. O que ele PEGA:
    // erro de regua/escala, moire, clipping, composicao vazando da caixa.
    //
    // PONTOS CEGOS MEDIDOS (exigem olho ou referencia da cena):
    //  - SINAL DO YAW invertido: o controle 352717837 v1 passa aqui. Aspecto e
    //    centro sao cegos a espelhamento; so a razao DR/DL contra a capa
    //    publicada separa (1,16 vs 0,85 no caso real).
    //  - compressao sutil (6,8% vs 5,6%): separacao fraca demais para gate.
    //  - fidelidade de tracos/texto, peca, modelo, cenario: nao sao numericos.
    limitacoes: ["sinal do yaw", "compressao sutil", "fidelidade de traco e texto"],
    alertas,
    caixa_pct: {
      x0: +(100 * mom.x0 / W).toFixed(2), x1: +(100 * mom.x1 / W).toFixed(2),
      y0: +(100 * mom.y0 / H).toFixed(2), y1: +(100 * mom.y1 / H).toFixed(2),
    },
    luminancia_tecido: +lumTecido.toFixed(1),
    checks,
    falhas,
    veredito: falhas.length === 0 ? "APROVADO" : "REPROVADO",
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [w, h] = arg("--arte-cm").split("x").map(Number);
  const r = await qa({
    blank: arg("--blank"), composta: arg("--composta"), arte: arg("--arte"),
    arteCm: { w, h }, peca: arg("--peca"),
    gola: Number(arg("--gola")), barra: Number(arg("--barra")),
    yaw: Number(arg("--yaw", "0")), arco: arg("--arco") ? Number(arg("--arco")) : null, placementCm: arg("--placement") ? Number(arg("--placement")) : null,
  });
  const txt = JSON.stringify(r, null, 2);
  if (arg("--json")) fs.writeFileSync(arg("--json"), `${txt}\n`);
  console.log(txt);
  process.exit(r.veredito === "APROVADO" ? 0 : 1);
}
