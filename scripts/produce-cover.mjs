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
import { compositeArt, artMesh } from "./geometry/render.mjs";
import { planejar } from "./compose-art.mjs";

const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

const CENA = {
  RELIQUIA:
    "Portuguese-tiled cloister with blue-and-white azulejos, weathered limestone columns and warm daylight raking across the stone floor",
  STREET: "white modernist concrete architecture with hard sunlight and deep shadow",
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
export function promptBlank({ garment, color, colecao }) {
  return [
    `Create one square photorealistic ecommerce lifestyle photograph, rear view, of a person wearing a plain ${color} ${garment}.`,
    `REFERENCE 1 is the approved photograph of this exact product. Keep the SAME model (same person, same build, same hair), the SAME scene, the SAME framing, the SAME light and a natural pose of the same family.`,
    `THE GARMENT MUST BE COMPLETELY BLANK. The back of the garment is EMPTY fabric: no print, no graphic, no artwork, no lettering, no logo, no emblem, no embroidery, no texture pattern, no watermark. Plain undecorated ${color} fabric from the collar to the hem. This is deliberate — the artwork is applied later by a separate process, and any print you draw will have to be discarded.`,
    GARMENT_LOCK[garment] ?? "",
    `SCENE: ${CENA[colecao] ?? CENA.RELIQUIA}.`,
    `MEASURABLE FRAMING (required): the whole garment is in frame from the top of the shoulders down to the hem, the hem is clearly visible and separated from the background, and either the shoulder line or the base of the collar is readable. The back must face the camera squarely enough that both side seams are visible.`,
    `Photographic quality: natural skin, real fabric drape and folds, no mannequin, no duplicate person, no added text, no watermark. Hands, when visible, have five separate fingers.`,
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

export async function compor({ foto, arte, artCm, peca, gola, barra, centro, torso = null, yaw = 0, placement = null, out, opacidade = 0.93, sombraMin = 0.75, sombraMax = 1.25 }) {
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
  const amostra = [];
  for (let y = Math.round(0.42 * bg.height); y < Math.round(0.64 * bg.height); y += 3)
    for (let x = Math.round(0.42 * bg.width); x < Math.round(0.66 * bg.width); x += 3) {
      const o = (y * bg.width + x) * 3;
      amostra.push(0.299 * bg.data[o] + 0.587 * bg.data[o + 1] + 0.114 * bg.data[o + 2]);
    }
  amostra.sort((a, b) => a - b);
  const ref = Math.max(8, amostra[Math.floor(amostra.length / 2)]);

  compositeArt(bg, tex, plano.params, opacidade, { plate, ref, min: sombraMin, max: sombraMax });
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

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const cmd = process.argv[2];

  if (cmd === "blank") {
    const produto = arg("--produto");
    const comp = JSON.parse(execFileSync("node", [path.join(RAIZ, "scripts/derive-composicao.mjs"), "--product", produto], { encoding: "utf8" }))[0];
    const prompt = promptBlank({ garment: comp.garment, color: arg("--cor", "black"), colecao: arg("--colecao", "RELIQUIA") });
    const out = arg("--out", `/tmp/${produto}-blank.png`);
    fs.writeFileSync(out.replace(/\.png$/, ".prompt.txt"), `${prompt}\n`);
    const r = await gerar({ prompt, refs: [arg("--cena")].filter(Boolean), out, modelo: arg("--modelo", "gemini-3-pro-image") });
    console.log(`peca em branco: ${r.out} (${r.finishReason})`);
  } else if (cmd === "grade") {
    const r = await grade(arg("--foto"), arg("--out"));
    console.log(JSON.stringify(r));
  } else if (cmd === "compor") {
    const produto = arg("--produto");
    const comp = JSON.parse(execFileSync("node", [path.join(RAIZ, "scripts/derive-composicao.mjs"), "--product", produto], { encoding: "utf8" }))[0];
    const [w, h] = (arg("--arte-cm") ?? `${comp.art_cm.w}x${comp.art_cm.h}`).split("x").map(Number);

    // SUPERSAMPLING (padrao 2x): compoe em resolucao dobrada e reduz com
    // Lanczos no final. Sem isso a trama halftone vira xadrez de 1-2 px na
    // malha cilindrica — medido no painel de verificacao do 352618878 v5:
    // energia de alta frequencia 1,9-2,9x acima do esperado e meios-tons
    // clareados ~10 niveis. A pre-reducao da textura sozinha nao basta para
    // arte de meio-tom; o supersampling da a media que a bilinear nao faz.
    // `--ss 1` desliga (util para depurar).
    const ss = Math.max(1, Number(arg("--ss", "2")));
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
      foto, arte: arg("--arte"), artCm: { w, h }, peca: comp.garment,
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
      out, opacidade: Number(arg("--opacidade", "0.93")),
      // Em tecido escuro a placa de sombra fica ruidosa (variacoes minusculas
      // de luminancia viram razoes grandes) e pode pintar faixa fantasma na
      // tinta clara — medido no painel do 352725749 v6. Aperte o clamp quando
      // a peca for escura: --sombra-min 0.9 --sombra-max 1.12.
      sombraMin: Number(arg("--sombra-min", "0.75")), sombraMax: Number(arg("--sombra-max", "1.25")),
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
    console.log(JSON.stringify(r, null, 2));
  } else {
    console.error("comandos: blank | grade | compor");
    process.exit(2);
  }
}
