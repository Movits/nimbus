import { pathToFileURL } from "node:url";
// PLACEMENT OFICIAL POR PRODUTO, lido do mockup plano da YouDraw.
//
// Por que existe: `derive-composicao.mjs` assumia COLLAR_TO_ART_CM = 8 para
// TODO o catalogo, declarado no proprio codigo como suposicao. A medicao de
// 26/07 nos mockups oficiais mostrou que o placement varia de 3,55 cm a
// 15,26 cm — fator 4,3x — e varia tanto entre pecas da mesma arte (Sao Jorge
// Neobarroco: 15,3 na Premium, 9,5 na Oversized, 3,7 no Moletom) quanto entre
// artes da mesma peca (Premium: 8,3 / 11,8 / 15,3). Nenhum valor unico serve.
//
// O que torna isso mensuravel sem agente: GOLA E BARRA SAO CONSTANTES DO
// TEMPLATE, nao do produto (verificado nos 45 produtos com mockup). So a
// posicao da tinta muda. Entao basta achar a caixa da tinta em cada mockup.
//
// E devolvemos FRACAO, nao cm: o template Oversized nao esta em escala com a
// tabela de medidas (implica peca de 92-97 cm contra 82 tabelados), entao
// converter para cm importaria esse erro. A fracao de (gola->barra) e o que a
// composicao precisa e e imune a isso.
//
// Uso: node scripts/geometry/placement-mockup.mjs [--out arquivo.json]

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { registerArt } from "./register-art.mjs";

/**
 * Acha a arte OFICIAL dentro do mockup, por registro NCC.
 *
 * Substitui a caixa por limiar de cor, que tem dois defeitos que nao se
 * consertam calibrando limiar: ela inclui o contorno antialiasado da peca
 * (esticando a caixa ate a gola e a barra) e ela perde tinta de baixo
 * contraste (respingo fino, escorrido). Medido nos tres casos de conferencia:
 * no 352619175 o limiar dava base em y=355 e a arte acaba em 308; no
 * 352718787 o limiar esticava 58 px a mais na direita; no 352725852 o limiar
 * PERDIA os escorridos, parando em 301 onde a arte vai a 321.
 *
 * O score tambem resolve a SELECAO do mockup, que era "vence quem tem mais
 * tinta" — regra que premiava a deteccao estourada e, quando a leitura boa era
 * descartada, caia no mockup de peito. Registro casa com a arte DAQUELE
 * produto, entao a foto de peito pontua baixo por construcao.
 */
async function registrarArte(mockup, artePath, corTecido) {
  const bb = await sharp(artePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: AW, height: AH, channels: AC } = bb.info;
  let ax0 = AW, ax1 = -1, ay0 = AH, ay1 = -1;
  for (let y = 0; y < AH; y += 1) {
    for (let x = 0; x < AW; x += 1) {
      if (bb.data[(y * AW + x) * AC + 3] < 24) continue;
      if (x < ax0) ax0 = x; if (x > ax1) ax1 = x;
      if (y < ay0) ay0 = y; if (y > ay1) ay1 = y;
    }
  }
  if (ax1 < 0) return null;

  // O template vai achatado sobre a COR DO TECIDO daquele mockup: o registro
  // usa gradiente, e um fundo transparente virando preto criaria uma borda
  // artificial que nao existe na cena.
  const tmp = `${mockup}.tmp-tpl-${process.pid}.png`;
  await sharp(artePath).ensureAlpha()
    .extract({ left: ax0, top: ay0, width: ax1 - ax0 + 1, height: ay1 - ay0 + 1 })
    .flatten({ background: { r: corTecido[0], g: corTecido[1], b: corTecido[2] } })
    .png().toFile(tmp);
  const menor = async (p, max) => {
    const r = await sharp(p).resize(max, max, { fit: "inside" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    return { data: r.data, width: r.info.width, height: r.info.height, channels: 3 };
  };
  let reg = null;
  try {
    const cena = await menor(mockup, 500);
    const tpl = await menor(tmp, 300);
    reg = registerArt(cena, tpl, { scaleRange: [0.12, 0.85] });
    if (reg) {
      const esc = 500 / cena.height;
      reg.caixa = {
        x0: Math.round((reg.cx - reg.width_px / 2) * esc), x1: Math.round((reg.cx + reg.width_px / 2) * esc),
        y0: Math.round((reg.cy - reg.height_px / 2) * esc), y1: Math.round((reg.cy + reg.height_px / 2) * esc),
      };
    }
  } catch { /* arte esparsa pode nao registrar */ } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
  return reg;
}

// y em px de um canvas 500x500, medidos nos mockups oficiais.
//
// `corpo` e a MESMA ideia aplicada a horizontal: o painel do corpo, sem manga,
// em x. Ele existe porque segmentar a largura da peca imagem a imagem nao
// funciona — peca branca sobre fundo branco perde a barra, e peca preta faz a
// deteccao de tinta estourar. Como gola e barra ja sao constantes do template
// (verificado nos 45 produtos), a largura do corpo tambem e.
//
// So entram valores CONFERIDOS NO OLHO, com as linhas desenhadas sobre o
// mockup. `corpo: null` significa "ainda nao medido" e faz o horizontal ser
// omitido para aquela peca — nunca estimado. No Moletom a leitura automatica
// pegou os PUNHOS junto (57-435 contra ~100-395 no olho) e a versao por maior
// corrida contigua deu 132-359, que tambem nao bate; fica null ate ser medido
// direito.
const TEMPLATE = {
  "Camiseta Premium": { gola: 65.5, barra: 453.5, corpo: [121, 379] },
  "Camiseta Oversized Premium": { gola: 26, barra: 492.5, corpo: [119, 386] },
  "Moletom Canguru": { gola: 136.5, barra: 475, corpo: null },
  "Blusão Moletom": { gola: 62, barra: 450, corpo: null },
};

// Comprimento G em cm, so para converter a altura oficial da arte em pixels
// do template no gate de sanidade. Vem da mesma tabela de `garment-specs`.
const COMPRIMENTO_G = {
  "Camiseta Premium": 75.5,
  "Camiseta Oversized Premium": 82,
  "Moletom Canguru": 65,
  "Blusão Moletom": 78.4,
};

const REFS = "nuvemshop/assets/product-lifestyle/2026-07-16/catalog/references";
const PROD_PLACEMENT = "nuvemshop/auditoria/2026-07-26-datum-mockups/placement-por-produto.json";
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

/** produto -> PNG oficial da arte, para o registro. */
const ARTE_DO_PRODUTO = new Map(
  JSON.parse(fs.readFileSync("nuvemshop/producao/mapa-artes.json", "utf8"))
    .mapeamentos.map((m) => [m.product_id, m.arquivo_arte]),
);

/**
 * Sanidade da caixa contra a ALTURA OFICIAL DA ARTE.
 *
 * Fora da `caixaDaTinta` porque roda de novo depois do registro: a caixa muda,
 * o criterio nao.
 */
function motivosDeAltura(alturaPx, alturaOficialCm, tpl, comprimentoGcm) {
  if (!(alturaOficialCm > 0) || !comprimentoGcm) return [];
  const espPx = (alturaOficialCm / comprimentoGcm) * (tpl.barra - tpl.gola);
  const razao = alturaPx / espPx;
  if (razao < 0.65 || razao > 1.4) {
    return [`altura da tinta ${alturaPx.toFixed(0)}px contra ${espPx.toFixed(0)}px esperados `
      + `para ${alturaOficialCm} cm (razao ${razao.toFixed(2)})`];
  }
  return [];
}

/** Caixa da tinta num mockup plano: o que difere da cor do tecido. */
async function caixaDaTinta(arquivo, corpoTpl, { tplGola, tplBarra, alturaOficialCm, comprimentoGcm }) {
  const r = await sharp(arquivo).resize(500, 500, { fit: "fill" }).removeAlpha()
    .raw().toBuffer({ resolveWithObject: true });
  const W = 500, H = 500;
  const px = (x, y) => { const o = (y * W + x) * 3; return [r.data[o], r.data[o + 1], r.data[o + 2]]; };
  const dist = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));

  // 1. mascara da PECA contra o fundo. Nao da para usar tolerancia fixa contra
  //    o tecido: em peca branca o tecido (239) esta a 8 niveis do fundo (247),
  //    e qualquer tolerancia que separe os dois engole a tinta.
  const fundo = px(6, 6);
  const peca = new Uint8Array(W * H);
  let gx0 = W, gx1 = -1, gy0 = H, gy1 = -1;
  for (let y = 4; y < H - 4; y += 1) {
    for (let x = 4; x < W - 4; x += 1) {
      if (dist(px(x, y), fundo) <= 16) continue;
      peca[y * W + x] = 1;
      if (x < gx0) gx0 = x; if (x > gx1) gx1 = x; if (y < gy0) gy0 = y; if (y > gy1) gy1 = y;
    }
  }
  if (gx1 < 0) return null;

  // 2. TECIDO POR LINHA, nao cor unica. Os mockups Oversized sao renders com
  //    sombreado forte: uma cor de referencia tirada do ombro fazia a sombra
  //    do corpo inteiro passar por tinta (a caixa dava 91% da peca). A borda
  //    esquerda e direita de cada linha nunca tem estampa, entao ela da a cor
  //    do tecido NAQUELA altura, absorvendo o sombreado vertical.
  //
  // A MARGEM E POR LINHA, e essa e a correcao de 27/07.
  //
  // Antes ela saia da largura GLOBAL da peca (`gx1-gx0`), que vai de manga a
  // manga, e era aplicada como janela fixa em x. Abaixo das mangas o corpo e
  // muito mais estreito, entao essa janela caia inteira FORA da peca: no
  // 352889132 a peca vai de x=42 a x=461, a margem dava 59 px, e nas linhas
  // do tronco as janelas [42,101] e [402,461] nao tinham um unico pixel de
  // tecido. O `if (b.length < 8) continue` entao deixava a linha sem
  // referencia, e o passo 3 caia no `?? tec` global — a cor tirada dos
  // OMBROS. Num render iluminado no centro, o tronco inteiro fica a mais de
  // 34 daquela cor e vira "tinta": a caixa abria ate a barra.
  //
  // Era o mesmo erro de `torso 0.44` e o mesmo da largura de referencia do
  // horizontal — usar largura manga a manga onde se precisa da largura do
  // corpo. Terceira vez que essa confusao aparece no projeto.
  //
  // Agora cada linha mede a propria extensao e tira dela a sua margem, entao
  // a referencia existe em toda linha que tenha tecido.
  const extLinha = new Array(H).fill(null);
  for (let y = gy0; y <= gy1; y += 1) {
    let a = -1, b2 = -1;
    for (let x = gx0; x <= gx1; x += 1) {
      if (!peca[y * W + x]) continue;
      if (a < 0) a = x;
      b2 = x;
    }
    if (a >= 0 && b2 - a >= 20) extLinha[y] = [a, b2];
  }
  const margemDe = (ext) => Math.max(4, Math.round(0.14 * (ext[1] - ext[0] + 1)));
  const tecLinha = new Array(H).fill(null);
  for (let y = gy0; y <= gy1; y += 1) {
    const ext = extLinha[y];
    if (!ext) continue;
    const mg = margemDe(ext);
    const b = [];
    for (let x = ext[0]; x < ext[0] + mg; x += 1) if (peca[y * W + x]) b.push(px(x, y));
    for (let x = ext[1] - mg; x <= ext[1]; x += 1) if (peca[y * W + x]) b.push(px(x, y));
    if (b.length < 8) continue;
    b.sort((p, q) => lum(...p) - lum(...q));
    tecLinha[y] = b[Math.floor(b.length / 2)];
  }
  const validas = tecLinha.filter(Boolean);
  if (validas.length < 40) return null;
  validas.sort((a, b) => lum(...a) - lum(...b));
  const tec = validas[Math.floor(validas.length / 2)];

  // 3. tinta = na faixa central DAQUELA linha E longe do tecido DAQUELA linha.
  //    Linha sem referencia propria nao e chutada com a global: e pulada. O
  //    fallback silencioso foi metade do defeito acima.
  const m = new Uint8Array(W * H);
  let encostouNaMargem = false;
  for (let y = gy0; y <= gy1; y += 1) {
    const ext = extLinha[y];
    const ref = tecLinha[y];
    if (!ext || !ref) continue;
    const mg = margemDe(ext);
    for (let x = ext[0] + mg; x <= ext[1] - mg; x += 1) {
      if (!peca[y * W + x]) continue;
      if (dist(px(x, y), ref) > 34) {
        m[y * W + x] = 1;
        if (x <= ext[0] + mg + 1 || x >= ext[1] - mg - 1) encostouNaMargem = true;
      }
    }
  }
  // erosao: mata vinco de tecido e ruido de webp
  let x0 = W, x1 = -1, y0 = H, y1 = -1, n = 0;
  for (let y = 1; y < H - 1; y += 1) {
    for (let x = 1; x < W - 1; x += 1) {
      if (!m[y * W + x]) continue;
      let k = 0;
      for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) k += m[(y + dy) * W + x + dx];
      if (k < 7) continue;
      n += 1;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  if (n <= 200) return null;

  // ---------------------------------------------------------- HORIZONTAL
  //
  // Ate 26/07 esta funcao devolvia so `y0/y1`, e a auditoria dos 48 mockups
  // registrou exclusivamente campos verticais — o CONCLUSOES.md ate fecha com
  // "nunca usar a regua vertical para larguras". Com isso a largura e a posicao
  // horizontal da estampa nunca foram comparadas com o produto real: o
  // compositor nunca ve um mockup e o `escala` do gate mede so altura. Era o
  // buraco por onde o desalinhamento horizontal voltava capa apos capa.
  //
  // A peca e medida na MESMA BANDA de altura da tinta. Ela e mais estreita no
  // peito e mais larga na barra; comparar tinta do peito com peca da barra
  // inventaria erro.
  let bx0 = W, bx1 = -1;
  for (let y = y0; y <= y1; y += 1) {
    for (let x = gx0; x <= gx1; x += 1) {
      if (!peca[y * W + x]) continue;
      if (x < bx0) bx0 = x;
      if (x > bx1) bx1 = x;
    }
  }

  // PAINEL DO CORPO, sem manga, vindo do TEMPLATE.
  //
  // A banda acima e sleeve-to-sleeve — o MESMO erro de `torso 0.44` que
  // reprovou o lote, agora do lado da referencia. E medir o corpo por
  // segmentacao nao funciona: peca branca sobre fundo branco perde a barra,
  // peca preta faz a deteccao estourar, e no moletom os punhos entram junto.
  // Como gola e barra ja sao constantes do template, o corpo tambem e.
  const corpo = corpoTpl ? { x0: corpoTpl[0], x1: corpoTpl[1] } : null;

  // SANIDADE, contra a ALTURA OFICIAL DA ARTE — nao contra a fracao da peca.
  //
  // A primeira versao deste gate usava "caixa cobre >80% da altura da peca" e
  // "encosta na barra". Parecia razoavel e reprovou uma leitura CORRETA: o
  // 352889132 e a Aparecida com escorridos de spray, que descem quase ate a
  // barra de proposito. A caixa grande era a arte. Pior que reprovar, o
  // descarte fez a selecao cair em silencio no mockup de PEITO, e o produto
  // saiu com o placement do selo de peito (0,241) em vez do das costas.
  //
  // Gate cego derrubando leitura boa e o mesmo defeito de sempre, so que ao
  // contrario. O criterio certo nao e "que fracao da peca a tinta ocupa" — e
  // "a arte medida tem a altura que a arte oficial tem". Esse numero ja existe
  // no CSV (`back_h_cm` / `front_h_cm`) e nao depende do desenho.
  const motivos = [];
  if (alturaOficialCm > 0) {
    const vaoTpl = tplBarra - tplGola;
    const espPx = (alturaOficialCm / comprimentoGcm) * vaoTpl;
    const razao = (y1 - y0 + 1) / espPx;
    if (razao < 0.65 || razao > 1.4) {
      motivos.push(`altura da tinta ${((y1 - y0 + 1)).toFixed(0)}px contra ${espPx.toFixed(0)}px esperados `
        + `para ${alturaOficialCm} cm (razao ${razao.toFixed(2)}) — mockup errado ou deteccao estourada`);
    }
  }
  if ((x1 - x0 + 1) > 0.95 * (bx1 - bx0 + 1)) motivos.push("caixa de tinta cobre quase toda a largura");

  // A busca de tinta so olha a faixa central (`cx0..cx1`, margem de 14%).
  // Se a tinta encosta nessa borda, a caixa esta TRUNCADA e a largura medida
  // e um piso, nao a medida. Melhor declarar do que devolver numero curto.
  const truncada = encostouNaMargem;

  const largCorpo = corpo ? corpo.x1 - corpo.x0 + 1 : null;
  return {
    x0, x1, y0, y1, n, tecido: tec,
    peca_x0: gx0, peca_x1: gx1, peca_y0: gy0, peca_y1: gy1,
    banda_x0: bx0, banda_x1: bx1,
    corpo_x0: corpo?.x0 ?? null, corpo_x1: corpo?.x1 ?? null,
    // largura da estampa sobre o PAINEL DO CORPO, nao sobre manga a manga
    largura_rel: largCorpo ? +((x1 - x0 + 1) / largCorpo).toFixed(4) : null,
    desvio_rel: largCorpo ? +(((x0 + x1) / 2 - (corpo.x0 + corpo.x1) / 2) / largCorpo).toFixed(4) : null,
    truncada,
    confiavel: motivos.length === 0,
    motivos,
  };
}

async function main() {
  const inv = JSON.parse(fs.readFileSync("nuvemshop/auditoria/2026-07-25-geometria/inventario-imagens-loja.json", "utf8"));
  const csvTxt = fs.readFileSync("nuvemshop/auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte.csv", "utf8");
  const linhas = csvTxt.split("\n").filter(Boolean);
  const hdr = linhas[0].split(",").map((h) => h.replace(/^﻿/, "").trim());
  const iId = hdr.indexOf("product_id"), iG = hdr.indexOf("garment"), iBh = hdr.indexOf("back_h_cm"), iFh = hdr.indexOf("front_h_cm");
  const limpa = (s) => (s ?? "").replace(/^"|"$/g, "").trim();
  const meta = new Map();
  for (const l of linhas.slice(1)) {
    const c = l.split(",");
    meta.set(limpa(c[iId]), { garment: limpa(c[iG]), back_h: Number(limpa(c[iBh])), front_h: Number(limpa(c[iFh])) });
  }

  // A PECA VEM DO ARQUIVO DE PRODUCAO, nao do CSV.
  //
  // O CSV de 22/07 e anterior a reclassificacao de 26/07, que moveu o
  // 352727892 de Blusao para Moletom Canguru (o mockup e a loja mostram capuz
  // e bolso canguru). Usar a peca do CSV escolhe o template errado — gola 62
  // em vez de 136,5 — e o placement sai 13,8 cm fora. O arquivo de producao
  // carrega a correcao, entao ele manda; o CSV so entra como reserva.
  const pecaProducao = new Map();
  try {
    for (const it of JSON.parse(fs.readFileSync(PROD_PLACEMENT, "utf8")).itens) {
      if (it.garment) pecaProducao.set(it.product_id, it.garment);
    }
  } catch { /* primeira rodada pode nao ter o arquivo */ }

  const pastas = fs.readdirSync(REFS).filter((d) => fs.statSync(path.join(REFS, d)).isDirectory());
  const out = [];
  for (const pasta of pastas) {
    const id = pasta.split("-")[0];
    const mt = meta.get(id);
    if (!mt) continue;
    const doProd = pecaProducao.get(id);
    if (doProd && doProd !== mt.garment) {
      mt.garment_csv = mt.garment;
      mt.garment = doProd;
    }
    const tpl = TEMPLATE[mt.garment];
    if (!tpl) { out.push({ product_id: id, garment: mt.garment, erro: "sem template (Ecobag?)" }); continue; }

    // ESTAMPA FRONTAL NAO SE MEDE COM O TEMPLATE DE COSTAS.
    //
    // `gola`/`barra` do TEMPLATE sao as das costas. Rodar um produto de peito
    // por aqui devolve numero, e numero errado: o 352702753 (Monograma NMB) e
    // o 352720257 (Acima de Tudo Gotico) sao "[so frente]" e sairam com
    // placement NEGATIVO — estampa acima da gola, que nao existe. O CSV ja
    // sabe a vista (`back_h_cm` vazio), entao a exclusao e explicita.
    if (!(mt.back_h > 0)) {
      out.push({
        product_id: id, garment: mt.garment,
        erro: "estampa frontal (back_h vazio); o template de costas nao se aplica",
      });
      continue;
    }
    const alturaOficial = mt.back_h;

    // SELECAO POR SCORE DE REGISTRO, nao por quantidade de tinta.
    //
    // "vence quem tem mais tinta" premiava a deteccao estourada (a falha e
    // sempre a leitura com mais pixels) e, quando a leitura boa era
    // descartada, caia no mockup de PEITO. O registro casa com a arte DAQUELE
    // produto: a foto de peito e a leitura estourada pontuam baixo por
    // construcao, sem precisar de gate nenhum para isso.
    const arte = ARTE_DO_PRODUTO.get(id);
    let melhor = null;
    const descartados = [];
    for (const f of fs.readdirSync(path.join(REFS, pasta)).filter((f) => /\.(webp|jpe?g|png)$/i.test(f))) {
      const caminho = path.join(REFS, pasta, f);
      const cx = await caixaDaTinta(caminho, tpl.corpo,
        { tplGola: tpl.gola, tplBarra: tpl.barra, alturaOficialCm: alturaOficial, comprimentoGcm: COMPRIMENTO_G[mt.garment] });
      if (!cx) continue;

      // O registro substitui a caixa; o limiar so entrega a cor do tecido e a
      // silhueta, que ele faz bem.
      let reg = null;
      if (arte && fs.existsSync(arte)) reg = await registrarArte(caminho, arte, cx.tecido);
      if (reg && reg.score >= 0.45 && reg.caixa) {
        cx.x0 = reg.caixa.x0; cx.x1 = reg.caixa.x1;
        cx.y0 = reg.caixa.y0; cx.y1 = reg.caixa.y1;
        cx.fonte_caixa = "registro";
        cx.score = +reg.score.toFixed(3);
        cx.rotacao_deg = +reg.rotation_deg.toFixed(1);
        // RECALCULAR o horizontal. `largura_rel` e `desvio_rel` saem de x0/x1
        // dentro de `caixaDaTinta`, ou seja da caixa por LIMIAR. Trocar a caixa
        // pelo registro sem refazer essas duas deixava a referencia horizontal
        // velha — e ela e justamente o que o eixo da capa e comparado contra.
        if (cx.corpo_x0 != null) {
          const L = cx.corpo_x1 - cx.corpo_x0 + 1;
          cx.largura_rel = +((cx.x1 - cx.x0 + 1) / L).toFixed(4);
          cx.desvio_rel = +(((cx.x0 + cx.x1) / 2 - (cx.corpo_x0 + cx.corpo_x1) / 2) / L).toFixed(4);
        }
        // a sanidade de altura vale igual, e agora sobre uma caixa confiavel
        cx.motivos = motivosDeAltura(cx.y1 - cx.y0 + 1, alturaOficial, tpl, COMPRIMENTO_G[mt.garment]);
        cx.confiavel = cx.motivos.length === 0;
      } else {
        cx.fonte_caixa = "limiar";
        cx.score = reg ? +reg.score.toFixed(3) : null;
      }

      if (!cx.confiavel) { descartados.push({ mockup: f, fonte: cx.fonte_caixa, score: cx.score, motivos: cx.motivos }); continue; }
      // registro vence limiar; entre dois registros, o de maior score
      const melhorQue = !melhor
        || (cx.fonte_caixa === "registro" && melhor.cx.fonte_caixa !== "registro")
        || (cx.fonte_caixa === melhor.cx.fonte_caixa
          && (cx.fonte_caixa === "registro" ? cx.score > melhor.cx.score : cx.n > melhor.cx.n));
      if (melhorQue) melhor = { f, cx };
    }
    if (!melhor) {
      out.push({ product_id: id, garment: mt.garment, erro: "nenhuma leitura confiavel", descartados });
      continue;
    }

    const vao = tpl.barra - tpl.gola;
    const fracPlacement = (melhor.cx.y0 - tpl.gola) / vao;
    const fracAltura = (melhor.cx.y1 - melhor.cx.y0) / vao;

    // PLACEMENT NEGATIVO NAO EXISTE numa estampa de costas: seria tinta acima
    // da gola. Quando aparece, a leitura pegou o mockup de PEITO (onde o selo
    // fica alto) ou a caixa estourou para cima. Nos dois casos o numero e
    // lixo, e lixo com cara de medida foi o que colocou nove placements
    // errados em producao. Vale mais recusar.
    if (fracPlacement < 0) {
      out.push({
        product_id: id, garment: mt.garment,
        erro: `placement negativo (${fracPlacement.toFixed(4)}) em ${melhor.f}: tinta acima da gola, `
          + "mockup de peito ou caixa estourada",
        descartados,
      });
      continue;
    }
    out.push({
      product_id: id, garment: mt.garment, garment_csv: mt.garment_csv ?? null, mockup: melhor.f,
      tinta_topo_px: melhor.cx.y0, tinta_base_px: melhor.cx.y1,
      placement_frac: +fracPlacement.toFixed(4),
      altura_frac: +fracAltura.toFixed(4),
      altura_oficial_cm: alturaOficial,
      // HORIZONTAL — a metade que faltava. Adimensional de proposito: e o que
      // transfere do mockup chapado para a foto de modelo, onde a peca aparece
      // em outra escala e outro enquadramento.
      largura_rel: melhor.cx.largura_rel,
      desvio_rel: melhor.cx.desvio_rel,
      tinta_x0_px: melhor.cx.x0, tinta_x1_px: melhor.cx.x1,
      corpo_x0_px: melhor.cx.corpo_x0, corpo_x1_px: melhor.cx.corpo_x1,
      peca_banda_x0_px: melhor.cx.banda_x0, peca_banda_x1_px: melhor.cx.banda_x1,
      descartados,
      largura_truncada: melhor.cx.truncada,
      fonte_caixa: melhor.cx.fonte_caixa, score_registro: melhor.cx.score, rotacao_deg: melhor.cx.rotacao_deg ?? null,
      // contraprova: a altura da arte implicada pelo template, em cm, usando o
      // comprimento G — se destoar muito, a leitura (ou o template) esta errada
      pixels_tinta: melhor.cx.n,
    });
  }

  const i = process.argv.indexOf("--out");
  const dest = i > -1 ? process.argv[i + 1] : "nuvemshop/auditoria/2026-07-26-datum-mockups/placement-oficial.json";
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `${JSON.stringify(out, null, 1)}\n`);
  const ok = out.filter((o) => !o.erro);
  const fr = ok.map((o) => o.placement_frac).sort((a, b) => a - b);
  console.log(JSON.stringify({
    produtos: out.length, medidos: ok.length, erros: out.filter((o) => o.erro).length,
    placement_frac: { min: fr[0], p50: fr[Math.floor(fr.length / 2)], max: fr[fr.length - 1] },
    arquivo: dest,
  }, null, 1));
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();
