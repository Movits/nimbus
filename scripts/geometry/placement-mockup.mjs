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

// y em px de um canvas 500x500, medidos nos mockups oficiais
const TEMPLATE = {
  "Camiseta Premium": { gola: 65.5, barra: 453.5 },
  "Camiseta Oversized Premium": { gola: 26, barra: 492.5 },
  "Moletom Canguru": { gola: 136.5, barra: 475 },
  "Blusão Moletom": { gola: 62, barra: 450 },
};

const REFS = "nuvemshop/assets/product-lifestyle/2026-07-16/catalog/references";
const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

/** Caixa da tinta num mockup plano: o que difere da cor do tecido. */
async function caixaDaTinta(arquivo) {
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
  const larg = gx1 - gx0 + 1;
  const margem = Math.max(6, Math.round(0.14 * larg));
  const tecLinha = new Array(H).fill(null);
  for (let y = gy0; y <= gy1; y += 1) {
    const b = [];
    for (let x = gx0; x < gx0 + margem; x += 1) if (peca[y * W + x]) b.push(px(x, y));
    for (let x = gx1 - margem; x <= gx1; x += 1) if (peca[y * W + x]) b.push(px(x, y));
    if (b.length < 8) continue;
    b.sort((p, q) => lum(...p) - lum(...q));
    tecLinha[y] = b[Math.floor(b.length / 2)];
  }
  const validas = tecLinha.filter(Boolean);
  if (validas.length < 40) return null;
  validas.sort((a, b) => lum(...a) - lum(...b));
  const tec = validas[Math.floor(validas.length / 2)];

  // 3. tinta = na faixa central da peca E longe do tecido DAQUELA linha
  const m = new Uint8Array(W * H);
  const cx0 = gx0 + margem, cx1 = gx1 - margem;
  for (let y = gy0; y <= gy1; y += 1) {
    const ref = tecLinha[y] ?? tec;
    for (let x = cx0; x <= cx1; x += 1) {
      if (!peca[y * W + x]) continue;
      if (dist(px(x, y), ref) > 34) m[y * W + x] = 1;
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
  return n > 200 ? { x0, x1, y0, y1, n, tecido: tec } : null;
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

  const pastas = fs.readdirSync(REFS).filter((d) => fs.statSync(path.join(REFS, d)).isDirectory());
  const out = [];
  for (const pasta of pastas) {
    const id = pasta.split("-")[0];
    const mt = meta.get(id);
    if (!mt) continue;
    const tpl = TEMPLATE[mt.garment];
    if (!tpl) { out.push({ product_id: id, garment: mt.garment, erro: "sem template (Ecobag?)" }); continue; }

    // entre os mockups da pasta, o de COSTAS e o que tem MAIS tinta
    let melhor = null;
    for (const f of fs.readdirSync(path.join(REFS, pasta)).filter((f) => /\.(webp|jpe?g|png)$/i.test(f))) {
      const cx = await caixaDaTinta(path.join(REFS, pasta, f));
      if (cx && (!melhor || cx.n > melhor.cx.n)) melhor = { f, cx };
    }
    if (!melhor) { out.push({ product_id: id, garment: mt.garment, erro: "nenhuma tinta detectada" }); continue; }

    const vao = tpl.barra - tpl.gola;
    const fracPlacement = (melhor.cx.y0 - tpl.gola) / vao;
    const fracAltura = (melhor.cx.y1 - melhor.cx.y0) / vao;
    const alturaOficial = mt.back_h > 0 ? mt.back_h : mt.front_h;
    out.push({
      product_id: id, garment: mt.garment, mockup: melhor.f,
      tinta_topo_px: melhor.cx.y0, tinta_base_px: melhor.cx.y1,
      placement_frac: +fracPlacement.toFixed(4),
      altura_frac: +fracAltura.toFixed(4),
      altura_oficial_cm: alturaOficial,
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
