import { pathToFileURL, fileURLToPath } from "node:url";
// PRODUCAO DE CAPA CORRIGIDA, EM DUAS ETAPAS SEPARADAS.
//
// Este script substitui o caminho "peca a IA que desenhe a estampa do tamanho
// certo", que falhou duas vezes seguidas no piloto de 25/07 sem mover a escala
// um pixel: com uma foto de referencia no pedido, o modelo otimiza por
// semelhanca e copia o tamanho errado junto.
//
// A separacao e a ideia inteira:
//
//   ETAPA 1 (`blank`) — a IA gera pessoa, peca, cenario e luz SEM ESTAMPA
//     NENHUMA. Nao ha o que ela possa errar de escala, porque nao ha estampa.
//   ETAPA 2 (`compor`) — a arte oficial entra por malha cilindrica, no tamanho
//     que os cm da YouDraw mandam. Escala e posicao ficam certas POR
//     CONSTRUCAO, e o medidor vira teste de regressao em vez de loteria.
//
// Entre as duas etapas ficam os landmarks (gola, barra, centro das costas), que
// hoje sao lidos por um agente com visao sobre o overlay que `grade` gera. E o
// unico passo humano que sobra, e ele e sobre a peca em branco — que e muito
// mais facil de ler que uma peca estampada, porque nao ha tinta cobrindo a
// gola nem disputando com a barra.
//
// Uso:
//   node scripts/produce-cover.mjs blank  --produto 352619175 --cor preta \
//     --cena /tmp/fotos/<publicada>.webp --out /tmp/prod/352619175-preta-blank.png
//   node scripts/produce-cover.mjs grade  --foto <blank.png> --out <grade.png>
//   node scripts/produce-cover.mjs compor --produto 352619175 \
//     --foto <blank.png> --arte /tmp/artes/<oficial>.png \
//     --gola 0.36 --barra 0.88 --centro 0.51 --out <final.png>

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import { compositeArt, artMesh, projectedArtBox, renderArtLayer } from "./geometry/render.mjs";
import { aplicarNoTecido, camadaVazia, ocluirCamada } from "./geometry/aplicar-no-tecido.mjs";
import { planejar } from "./compose-art.mjs";

const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Poligono de oclusao vindo da linha de comando: "x1,y1 x2,y2 ..." em FRACAO
 * da imagem.
 *
 * Ate 26/07 a flag `--oclusao` era lida SO para escrever na receita e nunca
 * chegava a `compor()`. O efeito e pior que ignorar: a capa saia com a arte
 * desenhada POR CIMA do capuz, e a receita ao lado dela afirmava que a oclusao
 * tinha sido aplicada. Quem conferisse pela receita nao encontrava o defeito.
 */
export function parsePoligono(s) {
  if (!s) return null;
  const pts = s.trim().split(/\s+/).map((par) => {
    const [x, y] = par.split(",").map(Number);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error(`ponto invalido em --oclusao: "${par}" (esperado x,y em fracao 0..1)`);
    }
    return [x, y];
  });
  if (pts.length < 3) throw new Error(`--oclusao precisa de 3+ pontos, recebeu ${pts.length}`);
  return pts;
}

/* ------------------------------------------------------------------ */
/* ETAPA 1 — peca em branco                                            */
/* ------------------------------------------------------------------ */

const GARMENT_LOCK = {
  "Moletom Canguru":
    "GARMENT LOCK — this is a PULLOVER KANGAROO HOODIE: a HOOD gathered against the nape and falling over the upper back, LONG sleeves with ribbed cuffs at the wrists, and a ribbed hem band. Never render it without a hood, as a crewneck, with a zipper, or with short sleeves.",
  "Camiseta Premium":
    "GARMENT LOCK — this is a REGULAR-FIT SHORT-SLEEVE T-SHIRT. Sleeves end at mid-bicep, forearms and elbows completely BARE. No hood, no zipper.",
  "Camiseta Oversized Premium":
    "GARMENT LOCK — this is an OVERSIZED BOXY SHORT-SLEEVE T-SHIRT. The shoulder seam drops onto the upper arm; sleeves are wide but SHORT, ending above the elbow, forearms BARE.",
  "Blusao Moletom":
    "GARMENT LOCK — this is a CREWNECK SWEATSHIRT: ribbed round collar, NO hood, NO zipper, long sleeves with ribbed cuffs and a ribbed hem band.",
};

/**
 * Busca a trava IGNORANDO ACENTO.
 *
 * A chave estava escrita "Blusao Moletom" enquanto o catalogo inteiro usa
 * "Blusão Moletom". A consulta direta devolvia undefined, `.filter(Boolean)`
 * engolia a linha e o prompt ia SEM a trava — ou seja, nada impedia a IA de
 * pendurar um capuz num Blusao. Falha silenciosa, e o Blusao e justamente a
 * peca que se define por NAO ter capuz.
 */
const semAcento = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const LOCK_POR_CHAVE_SIMPLES = new Map(
  Object.entries(GARMENT_LOCK).map(([k, v]) => [semAcento(k), v]),
);
export function garmentLock(garment) {
  const lock = LOCK_POR_CHAVE_SIMPLES.get(semAcento(garment));
  if (!lock) {
    // Alto, nao silencioso: sem trava a IA escolhe a peca sozinha.
    throw new Error(
      `sem GARMENT LOCK para "${garment}". Conhecidas: ${Object.keys(GARMENT_LOCK).join(", ")}. `
      + "Gerar sem a trava deixa a IA livre para trocar a peca.",
    );
  }
  return lock;
}

const CENA = {
  RELIQUIA:
    "Portuguese-tiled cloister with blue-and-white azulejos, weathered limestone columns and warm daylight raking across the stone floor",
  // O texto dizia "white modernist concrete architecture" enquanto as capas
  // publicadas da colecao STREET, que entram como REFERENCE 1, mostram um beco
  // de grafite. Cada agente resolvia a contradicao de um jeito e a colecao saiu
  // com o cenario MISTURADO. Decisao do dono em 26/07: unificar no beco de
  // grafite, que e o que esta no ar e o que combina com as artes de spray.
  STREET: "narrow urban alley with weathered concrete walls covered in colourful graffiti and spray-painted tags, hard daylight raking down the passage",
  NUVEM: "soft high-key sky-lit space, pale walls, diffuse cloudlike light",
};

/**
 * Prompt da peca em branco.
 *
 * Duas travas importam aqui, e as duas nasceram de defeito observado:
 *
 * 1. "NO PRINT" precisa ser dito de varias formas. Com a foto publicada como
 *    referencia, o modelo tende a reproduzir a estampa junto com o resto — foi
 *    o que aconteceu nas duas primeiras tentativas do piloto. Repetir a
 *    proibicao em termos diferentes (sem estampa, sem grafico, sem texto,
 *    costas lisas) e o que fez a peca sair limpa.
 * 2. O ENQUADRAMENTO e requisito de medicao, nao de estetica: sem a barra no
 *    quadro e sem ombro ou gola legivel, a regua vertical nao fecha e a
 *    composicao nao tem onde ancorar.
 */
/**
 * `extra` acrescenta uma trava especifica do produto no fim do prompt.
 *
 * Nasceu do 352727892: o GARMENT_LOCK do Moletom Canguru pede o capuz "falling
 * over the upper back", e o blank saiu com o drape descendo ate 45,8% da
 * altura. Com o placement oficial (4,32 cm) a arte comeca em 35,0%, entao o
 * capuz cobria os 29% de cima da estampa — a coroa inteira de Nossa Senhora
 * Aparecida. Oclusao correta fisicamente, capa inutil comercialmente. O mockup
 * oficial mostra o capuz assentado ACIMA da estampa, que e o alvo.
 */
export function promptBlank({ garment, color, colecao, extra = "", vista = "costas" }) {
  // Sete produtos do catalogo tem a estampa NA FRENTE (Acima de Tudo Gotico,
  // Monograma NIMBUS e a Ecobag). Sem esta variante o prompt pedia "rear view"
  // e "the back of the garment is empty", que para eles gera a foto errada.
  const frente = vista === "frente";
  const lado = frente ? "front" : "back";
  return [
    `Create one square photorealistic ecommerce lifestyle photograph, ${frente ? "front view" : "rear view"}, of a person wearing a plain ${color} ${garment}.`,
    `REFERENCE 1 is the approved photograph of this exact product. Keep the SAME model (same person, same build, same hair), the SAME scene, the SAME framing, the SAME light and a natural pose of the same family.`,
    `THE GARMENT MUST BE COMPLETELY BLANK. The ${lado} of the garment is EMPTY fabric: no print, no graphic, no artwork, no lettering, no logo, no emblem, no embroidery, no texture pattern, no watermark. Plain undecorated ${color} fabric from the collar to the hem. This is deliberate — the artwork is applied later by a separate process, and any print you draw will have to be discarded.`,
    garmentLock(garment),
    `SCENE: ${CENA[colecao] ?? CENA.RELIQUIA}.`,
    `MEASURABLE FRAMING (required): the whole garment is in frame from the top of the shoulders down to the hem, the hem is clearly visible and separated from the background, and either the shoulder line or the base of the collar is readable. The ${lado} must face the camera squarely enough that both side seams are visible.`,
    // Na frente o rosto rouba a atencao do modelo e a pose tende a fechar os
    // bracos sobre o peito, que e exatamente a area da estampa.
    frente ? "The arms hang naturally at the sides or rest low; they must NOT cross, fold over the chest, or cover any part of the torso, because that is where the artwork goes." : "",
    `Photographic quality: natural skin, real fabric drape and folds, no mannequin, no duplicate person, no added text, no watermark. Hands, when visible, have five separate fingers.`,
    extra ?? "",
    `BEFORE YOU FINISH, verify: (1) Is the back of the garment completely free of any print or lettering? (2) Are the hem and a readable top edge inside the frame? If either answer is no, fix it.`,
  ].filter(Boolean).join(" ");
}

const b64 = (p) => fs.readFileSync(p).toString("base64");
const mime = (p) => (/\.png$/i.test(p) ? "image/png" : /\.webp$/i.test(p) ? "image/webp" : "image/jpeg");

export async function gerar({ prompt, refs, out, modelo = "gemini-3-pro-image" }) {
  const KEY = process.env.GOOGLE_AI_KEY;
  if (!KEY) throw new Error("GOOGLE_AI_KEY ausente no ambiente");
  const parts = [
    ...refs.map((r) => ({ inline_data: { mime_type: mime(r), data: b64(r) } })),
    { text: prompt },
  ];
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${KEY}`,
    { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ contents: [{ parts }] }) },
  );
  const j = await r.json();
  if (j.error) throw new Error(`API ${j.error.status}: ${j.error.message}`);
  const cand = j.candidates?.[0];
  const img = cand?.content?.parts?.find((p) => p.inline_data ?? p.inlineData);
  if (!img) {
    const txt = cand?.content?.parts?.map((p) => p.text).filter(Boolean).join(" ") ?? "";
    throw new Error(`sem imagem. finishReason=${cand?.finishReason} texto="${txt.slice(0, 200)}"`);
  }
  fs.writeFileSync(out, Buffer.from((img.inline_data ?? img.inlineData).data, "base64"));
  return { out, finishReason: cand.finishReason };
}

/* ------------------------------------------------------------------ */
/* ETAPA 1.5 — grade para leitura dos landmarks                        */
/* ------------------------------------------------------------------ */

/**
 * Sobrepoe grade percentual. Linhas a cada 2%, rotuladas a cada 10%.
 * A leitura e em FRACAO DA IMAGEM, nao em pixel, para sobreviver a resize.
 */
export async function grade(src, out) {
  const m = await sharp(src).metadata();
  const { width: W, height: H } = m;
  let l = "";
  for (let p = 0; p <= 100; p += 2) {
    const forte = p % 10 === 0;
    const cor = forte ? "#ff2d55" : "#00e0ff";
    const larg = forte ? 2 : 1;
    const op = forte ? 0.95 : 0.4;
    const y = (p / 100) * H, x = (p / 100) * W;
    l += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${cor}" stroke-width="${larg}" opacity="${op}"/>`;
    l += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${cor}" stroke-width="${larg}" opacity="${op}"/>`;
    if (forte) {
      l += `<text x="4" y="${y - 4}" font-family="monospace" font-size="${Math.round(H / 42)}" fill="#ff2d55" stroke="#000" stroke-width="0.6">${p}</text>`;
      l += `<text x="${x + 4}" y="${Math.round(H / 34)}" font-family="monospace" font-size="${Math.round(H / 42)}" fill="#ff2d55" stroke="#000" stroke-width="0.6">${p}</text>`;
    }
  }
  const svg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${l}</svg>`);
  await sharp(src).composite([{ input: svg }]).png().toFile(out);
  return { out, width: W, height: H };
}

/* ------------------------------------------------------------------ */
/* ETAPA 2 — composicao                                                */
/* ------------------------------------------------------------------ */

/**
 * A arte oficial ja vem com alpha. Isso e o que torna esta etapa exata: nao ha
 * recorte, nao ha limiar, nao ha "onde a tinta acaba". A CAIXA DA TINTA sai do
 * canal alpha, e os cm oficiais descrevem exatamente essa caixa.
 *
 * O piloto errou 18% justamente aqui, aplicando os cm a um recorte com margem
 * de tecido em volta. Com alpha isso nao pode acontecer: a margem transparente
 * e removida antes de qualquer conta.
 */
export async function arteRecortadaPorAlpha(src, alvoAlturaPx = null) {
  const r = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = r.info;
  if (C !== 4) throw new Error(`arte sem canal alpha (${C} canais): ${src}`);
  let x0 = W, x1 = -1, y0 = H, y1 = -1;
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (r.data[(y * W + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error(`arte totalmente transparente: ${src}`);
  const box = { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };

  // PRE-REDUCAO ANTES DO WARP. A malha amostra a textura por bilinear, que so
  // olha 4 texels: numa minificacao de 10x (arte de 3500 px caindo em ~330 px
  // de tela) ela pula a maior parte dos pixels e o meio-tom vira MOIRE. Foi
  // visivel na primeira composicao do Sao Jorge — a trama de pontos virou
  // xadrez. Reduzir antes, com Lanczos, faz a media que a bilinear nao faz.
  // Fator 2 sobre o alvo deixa folga para as partes da malha mais proximas da
  // camera, que projetam maiores que a media.
  let pipe = sharp(src).ensureAlpha().extract(box);
  let escala = 1;
  if (alvoAlturaPx && box.height > 2 * alvoAlturaPx) {
    const h = Math.max(64, Math.round(2 * alvoAlturaPx));
    escala = h / box.height;
    pipe = pipe.resize({ height: h, kernel: "lanczos3" });
  }
  const rec = await pipe.raw().toBuffer({ resolveWithObject: true });
  return {
    data: rec.data, width: rec.info.width, height: rec.info.height, channels: 4,
    caixa: box, escala_textura: +escala.toFixed(4), sobra_pct: {
      esq: +((100 * x0) / W).toFixed(1), dir: +((100 * (W - 1 - x1)) / W).toFixed(1),
      topo: +((100 * y0) / H).toFixed(1), base: +((100 * (H - 1 - y1)) / H).toFixed(1),
    },
  };
}

/** Placa de luminancia suavizada: e ela que faz a tinta acompanhar a dobra. */
function placaDeSombra(bg) {
  const { width: W, height: H } = bg;
  const lum = new Float32Array(W * H);
  for (let i = 0, o = 0; i < W * H; i += 1, o += 3) {
    lum[i] = 0.299 * bg.data[o] + 0.587 * bg.data[o + 1] + 0.114 * bg.data[o + 2];
  }
  const R = 9, suave = new Float32Array(W * H);
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      let s = 0, n = 0;
      for (let dy = -R; dy <= R; dy += 3) for (let dx = -R; dx <= R; dx += 3) {
        const yy = y + dy, xx = x + dx;
        if (yy < 0 || xx < 0 || yy >= H || xx >= W) continue;
        s += lum[yy * W + xx]; n += 1;
      }
      suave[y * W + x] = s / n;
    }
  }
  return suave;
}

export async function compor({ foto, arte, artCm, peca, gola, barra, centro, torso = null, yaw = 0, placement = null, out, opacidade = 0.93, sombraMin = 0.6, sombraMax = 1.35, relevo = 3, sombraTecido = 0.9, oclusao = null }) {
  const meta = await sharp(foto).metadata();
  const plano = planejar({
    golaFrac: gola, barraFrac: barra, centroFrac: centro, torsoFrac: torso, yawDeg: yaw,
    placementCm: placement,
    imgW: meta.width, imgH: meta.height, artW_cm: artCm.w, artH_cm: artCm.h, peca,
  });
  const tex = await arteRecortadaPorAlpha(arte, (plano.alvo.altura_pontos / 100) * meta.height);
  const base = await sharp(foto).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const bg = { data: base.data, width: base.info.width, height: base.info.height, channels: 3 };

  const plate = placaDeSombra(bg);

  // REFERENCIA DE SOMBRA: mediana do tecido DENTRO DA CAIXA DA ARTE.
  //
  // Antes era uma janela FIXA da imagem (42-64% de altura, 42-66% de largura),
  // que so por coincidencia coincide com onde a arte cai. Quando o tecido sob
  // a estampa e mais escuro ou mais claro que essa janela, `k = lumBg/ref` sai
  // enviesado no bloco inteiro e aparece a faixa fantasma.
  //
  // Foi essa faixa que me levou a apertar o clamp para 0,9-1,12 — tratando o
  // sintoma. O clamp apertado limita a modulacao a +-12% e ACHATA a arte sobre
  // o pano: medida a correlacao entre a sombra do tecido e a da tinta, as
  // capas com clamp apertado deram -0,79 a 0,25 e as com clamp folgado deram
  // 0,85 a 0,92. Sessenta e quatro das 77 capas sairam com cara de PNG colado
  // por causa disso.
  //
  // Amostrando dentro da propria caixa, `k` fica centrado em 1 por construcao,
  // a faixa some pela raiz e o clamp volta a ser so uma trava de seguranca.
  const caixa = projectedArtBox(plano.params);
  const amostra = [];
  if (caixa) {
    const x0 = Math.max(0, Math.floor(caixa.x0)), x1 = Math.min(bg.width - 1, Math.ceil(caixa.x1));
    const y0 = Math.max(0, Math.floor(caixa.y0)), y1 = Math.min(bg.height - 1, Math.ceil(caixa.y1));
    for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) amostra.push(plate[y * bg.width + x]);
  }
  if (amostra.length < 200) {
    // sem caixa utilizavel, cai na janela antiga em vez de falhar
    for (let y = Math.round(0.42 * bg.height); y < Math.round(0.64 * bg.height); y += 3)
      for (let x = Math.round(0.42 * bg.width); x < Math.round(0.66 * bg.width); x += 3) {
        amostra.push(plate[y * bg.width + x]);
      }
  }
  amostra.sort((a, b) => a - b);
  const ref = Math.max(8, amostra[Math.floor(amostra.length / 2)]);

  // CAMINHO NOVO: a arte vai para uma CAMADA propria e so depois e aplicada no
  // tecido, deslocada pelas dobras e sombreada pelo vinco. O caminho antigo
  // (`compositeArt`, cilindro liso + multiplicador) produzia um retangulo de
  // bordas retas sobre um pano amassado — as 77 capas de 26/07 sairam com cara
  // de PNG colado e o dono reprovou o lote inteiro por isso.
  // `--sem-relevo` volta ao caminho antigo, so para comparacao.
  if (relevo > 0) {
    const layer = camadaVazia(bg.width, bg.height);
    renderArtLayer(layer, tex, plano.params);
    // OCLUSAO ANTES de aplicar: o capuz do moletom cai sobre as costas e cobre
    // o topo da estampa. Isso e o produto REAL — desenhar a arte por cima do
    // capuz fica visivelmente falso, e foi o que o dono reprovou no piloto.
    if (oclusao) ocluirCamada(layer, oclusao);
    aplicarNoTecido(bg, layer, { relevo, sombra: sombraTecido, opacidade, min: sombraMin, max: sombraMax });
  } else {
    compositeArt(bg, tex, plano.params, opacidade, { plate, ref, min: sombraMin, max: sombraMax });
  }
  await sharp(bg.data, { raw: { width: bg.width, height: bg.height, channels: 3 } }).png().toFile(out);

  const { cols, rows, pts } = artMesh(plano.params);
  const i = Math.floor((cols - 1) / 2);
  const topo = pts[i], base2 = pts[(rows - 1) * cols + i];
  return {
    out, alvo: plano.alvo, sobra_alpha_pct: tex.sobra_pct,
    razao_arte: { medida: +(tex.width / tex.height).toFixed(4), oficial: +(artCm.w / artCm.h).toFixed(4),
      desvio_pct: +(100 * ((tex.width / tex.height) / (artCm.w / artCm.h) - 1)).toFixed(2) },
    coluna_central_pct: { topo: +((100 * topo[1]) / bg.height).toFixed(2), base: +((100 * base2[1]) / bg.height).toFixed(2) },
    luminancia_tecido: +ref.toFixed(1),
  };
}

/* ------------------------------------------------------------------ */

/**
 * Le a composicao derivada do CSV oficial, TENTANDO AS DUAS VISTAS.
 *
 * O CSV separa `front_*_cm` de `back_*_cm`, e `derive-composicao` filtra por
 * vista: devolve lista VAZIA quando a arte nao existe naquela vista. Este
 * script chamava sempre sem `--view`, ou seja com o padrao `back`, entao todo
 * produto de estampa FRONTAL (Monograma NIMBUS, Acima de Tudo Gotico, Ecobag)
 * morria em `TypeError: Cannot read properties of undefined (reading
 * 'garment')` — mesmo com `--peca` e `--arte-cm` informados na linha de
 * comando, porque o default do `arg()` e avaliado antes da flag ser lida.
 *
 * Duas consequencias, as duas corrigidas aqui:
 *   1. a vista pedida e tentada primeiro, e a outra serve de reserva;
 *   2. o retorno e OPCIONAL. Quem passou peca e cm na linha de comando nao
 *      depende do CSV, e um produto ausente dele deixa de ser fatal.
 */
function composicaoDerivada(produto, vista) {
  if (!produto) return null;
  const ordem = vista === "frente" ? ["front", "back"] : ["back", "front"];
  for (const v of ordem) {
    try {
      const lista = JSON.parse(execFileSync(
        "node",
        [path.join(RAIZ, "scripts/derive-composicao.mjs"), "--product", produto, "--view", v],
        { encoding: "utf8" },
      ));
      if (lista[0]) return lista[0];
    } catch { /* produto fora do CSV: segue sem trava derivada */ }
  }
  return null;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const cmd = process.argv[2];

  if (cmd === "blank") {
    const produto = arg("--produto");
    const vista = arg("--vista", "costas");
    const comp = composicaoDerivada(produto, vista);
    const garment = arg("--peca", comp?.garment);
    if (!garment) {
      throw new Error(
        `sem peca para ${produto}: nao esta no CSV de dimensoes e --peca nao foi informado.`,
      );
    }
    const prompt = promptBlank({
      garment, color: arg("--cor", "black"),
      colecao: arg("--colecao", "RELIQUIA"), extra: arg("--extra", ""),
      vista,
    });
    const out = arg("--out", `/tmp/${produto}-blank.png`);
    fs.writeFileSync(out.replace(/\.png$/, ".prompt.txt"), `${prompt}\n`);
    const r = await gerar({ prompt, refs: [arg("--cena")].filter(Boolean), out, modelo: arg("--modelo", "gemini-3-pro-image") });
    console.log(`peca em branco: ${r.out} (${r.finishReason})`);
  } else if (cmd === "grade") {
    const r = await grade(arg("--foto"), arg("--out"));
    console.log(JSON.stringify(r));
  } else if (cmd === "compor") {
    const produto = arg("--produto");
    const comp = composicaoDerivada(produto, arg("--vista", "costas"));
    const [w, h] = (arg("--arte-cm") ?? `${comp?.art_cm?.w}x${comp?.art_cm?.h}`).split("x").map(Number);
    if (!(w > 0) || !(h > 0)) {
      throw new Error(
        `dimensoes da arte ausentes para ${produto}: informe --arte-cm LARGURAxALTURA em cm.`,
      );
    }
    // PECA: por padrao vem do CSV de 22/07 via derive-composicao. `--peca`
    // existe porque esse CSV tem erro de classificacao conhecido: o 352727892
    // esta registrado como "Blusao Moletom" mas o mockup oficial e a loja
    // mostram capuz e bolso canguru (ver
    // nuvemshop/auditoria/2026-07-26-datum-mockups/CORRECAO-GOLA-TEMPLATE.md).
    // A peca errada troca a regua: 78,4 cm do Blusao contra 65 cm do Moletom
    // Canguru G, ou seja 20% de erro de escala direto na estampa.
    // `comp` e OPCIONAL (ver composicaoDerivada): produto fora do CSV, ou com a
    // arte so na outra vista, devolve null. Sem o encadeamento opcional aqui o
    // `compor` repetia o TypeError que o `blank` ja nao da mais.
    const peca = arg("--peca", comp?.garment);
    if (!peca) {
      throw new Error(
        `sem peca para ${produto}: nao esta no CSV de dimensoes e --peca nao foi informado.`,
      );
    }

    // SUPERSAMPLING (padrao 2x): compoe em resolucao dobrada e reduz com
    // Lanczos no final. Sem isso a trama halftone vira xadrez de 1-2 px na
    // malha cilindrica — medido no painel de verificacao do 352618878 v5:
    // energia de alta frequencia 1,9-2,9x acima do esperado e meios-tons
    // clareados ~10 niveis. A pre-reducao da textura sozinha nao basta para
    // arte de meio-tom; o supersampling da a media que a bilinear nao faz.
    // `--ss 1` desliga (util para depurar).
    const ss = Math.max(1, Number(arg("--ss", "2")));
    // Um so lugar para cada default, porque a receita e o compositor liam
    // numeros DIFERENTES: a receita gravava sombra_min 0.75 / sombra_max 1.25 /
    // relevo 3 / sombra_tecido 0.9 enquanto `compor` usava 0.6 / 1.35 / 2.2 /
    // 0.55. Toda capa composta sem passar as flags ficou com receita mentindo
    // sobre os proprios parametros, e recompor pela receita nao reproduzia a
    // imagem.
    const cfg = {
      opacidade: Number(arg("--opacidade", "0.93")),
      sombraMin: Number(arg("--sombra-min", "0.6")),
      sombraMax: Number(arg("--sombra-max", "1.35")),
      relevo: process.argv.includes("--sem-relevo") ? 0 : Number(arg("--relevo", "2.2")),
      sombraTecido: Number(arg("--sombra-tecido", "0.55")),
      oclusao: parsePoligono(arg("--oclusao")),
    };
    if (cfg.oclusao && cfg.relevo <= 0) {
      // O caminho antigo (`compositeArt`) nao tem camada separada, entao nao ha
      // onde ocluir. Falhar alto: silenciar aqui recria a mentira da receita.
      throw new Error("--oclusao exige o compositor de relevo; remova --sem-relevo / --relevo 0");
    }
    const fotoOrig = arg("--foto");
    const outFinal = arg("--out");
    let foto = fotoOrig;
    let out = outFinal;
    const metaOrig = await sharp(fotoOrig).metadata();
    if (ss > 1) {
      foto = outFinal.replace(/\.png$/, `.tmp-base${ss}x.png`);
      out = outFinal.replace(/\.png$/, `.tmp-comp${ss}x.png`);
      await sharp(fotoOrig)
        .resize({ width: metaOrig.width * ss, height: metaOrig.height * ss, kernel: "lanczos3" })
        .png().toFile(foto);
    }
    const r = await compor({
      foto, arte: arg("--arte"), artCm: { w, h }, peca,
      gola: Number(arg("--gola")), barra: Number(arg("--barra")), centro: Number(arg("--centro", "0.5")),
      // largura visivel do tronco na altura da arte, em fracao da LARGURA da
      // imagem; calibra o raio efetivo da malha (ver planejar em compose-art)
      torso: arg("--torso") ? Number(arg("--torso")) : null,
      // rotacao do corpo em graus (encurtamento assimetrico); calibrar pela
      // assinatura projetiva da cena publicada quando a pose e 3/4
      yaw: Number(arg("--yaw", "0")),
      // gola -> topo da arte, em cm, MEDIDO no mockup oficial do produto
      // (placement-oficial.json). Sem isso cai nos 8 cm historicos, que a
      // medicao de 26/07 mostrou serem errados para quase todo o catalogo.
      placement: arg("--placement") ? Number(arg("--placement")) : null,
      out,
      // Em tecido escuro a placa de sombra fica ruidosa (variacoes minusculas
      // de luminancia viram razoes grandes) e pode pintar faixa fantasma na
      // tinta clara — medido no painel do 352725749 v6. Aperte o clamp quando
      // a peca for escura: --sombra-min 0.9 --sombra-max 1.12.
      // `relevo` 0 volta ao compositor antigo (cilindro liso), so para
      // comparacao. `oclusao` e o poligono do capuz.
      ...cfg,
    });
    if (ss > 1) {
      await sharp(out)
        .resize({ width: metaOrig.width, height: metaOrig.height, kernel: "lanczos3" })
        .png().toFile(outFinal);
      fs.unlinkSync(foto);
      fs.unlinkSync(out);
      r.out = outFinal;
      r.supersample = ss;
    }
    // RECEITA AO LADO DA CAPA. Sem isso nao da para recompor uma capa sem
    // re-derivar os landmarks a mao: quando a tabela de placement foi
    // corrigida em 26/07, 37 capas prontas tinham so 17 QA JSONs, com nomes
    // inconsistentes, e nenhum registro completo dos parametros usados.
    // Com a receita, recompor o catalogo inteiro vira um laco.
    const receita = {
      produto, cor_arquivo: path.basename(outFinal),
      foto: fotoOrig, arte: arg("--arte"), arte_cm: `${w}x${h}`, peca,
      gola: Number(arg("--gola")), barra: Number(arg("--barra")), centro: Number(arg("--centro", "0.5")),
      torso: arg("--torso") ? Number(arg("--torso")) : null,
      yaw: Number(arg("--yaw", "0")),
      placement: arg("--placement") ? Number(arg("--placement")) : null,
      opacidade: cfg.opacidade,
      sombra_min: cfg.sombraMin, sombra_max: cfg.sombraMax,
      relevo: cfg.relevo,
      sombra_tecido: cfg.sombraTecido,
      oclusao: arg("--oclusao") ?? null,
      oclusao_aplicada: Boolean(cfg.oclusao) && cfg.relevo > 0,
      ss, arco_meio_rad: r.alvo?.arco_meio_rad ?? null, gerado_em: new Date().toISOString(),
    };
    fs.writeFileSync(outFinal.replace(/\.png$/, ".receita.json"), `${JSON.stringify(receita, null, 1)}\n`);
    r.receita = outFinal.replace(/\.png$/, ".receita.json");
    console.log(JSON.stringify(r, null, 2));
  } else {
    console.error("comandos: blank | grade | compor");
    process.exit(2);
  }
}
