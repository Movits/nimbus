// CAPA AO LADO DO MOCKUP OFICIAL, na mesma normalizacao.
//
// Serve para o dono apontar o que esta errado quando os instrumentos dizem que
// esta certo — que e exatamente a situacao de 27/07: gate, compressao de malha
// e fidelidade horizontal aprovam as tres capas, e o olho dele reprovou.
//
// A NORMALIZACAO E EM CENTIMETROS, e chegar ate aqui custou duas versoes
// erradas — as duas fazendo uma capa correta parecer maior do que e.
//
// 1a: escalei os dois recortes para a mesma altura sem preservar aspecto. Puro
//     erro de codigo; a capa saiu esticada.
// 2a: escalei os dois para a mesma LARGURA DE CORPO, com aspecto preservado.
//     Parece certo e nao e: o recorte do mockup e a peca CHAPADA (a largura do
//     painel, 54 cm na Camiseta Premium) e o da capa e o cilindro VISIVEL
//     (a silhueta, ~41 cm com R de 20,5). Igualar os dois em pixel amplia a
//     capa em 54/41 = 1,32x, e a estampa aparece um terco maior sem estar.
//
// A escala comum tem que ser px/cm, e ha uma regua confiavel nos dois lados: a
// ARTE, que mede os mesmos `arte_cm` de altura no mockup e na capa. Dai os
// dois recortes saem numa janela em CENTIMETROS, e o que sobrar de diferenca e
// diferenca de verdade.
//
// A estampa da capa ainda aparece mais estreita que a do mockup, e isso e
// correto: no mockup a peca esta aberta e na capa ela enrola no corpo. O que
// se compara aqui e ALTURA, POSICAO e quanto da peca a estampa ocupa.
//
// Uso: node scripts/producao/capa-vs-mockup.mjs <saida.jpg> <receita.json> [...]

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { planejar } from "../compose-art.mjs";

const REFS = "nuvemshop/assets/product-lifestyle/2026-07-16/catalog/references";
const OFICIAL = "nuvemshop/auditoria/2026-07-26-datum-mockups/horizontal-oficial.json";
// gola, barra e painel do corpo no canvas 500x500 do template.
// `corpo` do Moletom e do Blusao ainda nao foi conferido no olho: aqui ele
// serve SO para enquadrar a imagem, nunca para medir, e vai marcado.
const TEMPLATE = {
  "Camiseta Premium": { gola: 65.5, barra: 453.5, corpo: [121, 379], corpoConferido: true },
  "Camiseta Oversized Premium": { gola: 26, barra: 492.5, corpo: [119, 386], corpoConferido: true },
  "Moletom Canguru": { gola: 136.5, barra: 475, corpo: [100, 395], corpoConferido: false },
  "Blusão Moletom": { gola: 62, barra: 450, corpo: [110, 390], corpoConferido: false },
};


const [, , saida, ...receitas] = process.argv;
if (!saida || !receitas.length) {
  console.error("uso: node scripts/producao/capa-vs-mockup.mjs <saida.jpg> <receita.json> [...]");
  process.exit(1);
}
const oficiais = JSON.parse(fs.readFileSync(OFICIAL, "utf8"));

// janela comum, em centimetros, centrada na arte
const JANELA_L_CM = 72, JANELA_A_CM = 62, PX_CM = 9;
const LARG = Math.round(JANELA_L_CM * PX_CM);

const pares = [];
for (const rp of receitas) {
  const rec = JSON.parse(fs.readFileSync(rp, "utf8"));
  const of = oficiais.find((o) => o.product_id === rec.produto && !o.erro);
  const tpl = TEMPLATE[rec.peca];
  if (!of || !tpl) { console.log(`${rec.produto}: sem mockup ou template`); continue; }
  const [aw, ah] = String(rec.arte_cm).split("x").map(Number);

  // --- MOCKUP: px/cm pela altura da arte registrada
  const dir = fs.readdirSync(REFS).find((d) => d.startsWith(`${rec.produto}-`));
  const mk = await sharp(`${REFS}/${dir}/${of.mockup}`).resize(500, 500, { fit: "fill" }).png().toBuffer();
  const mkPxCm = (of.tinta_base_px - of.tinta_topo_px) / ah;
  const mkCentro = { x: (of.tinta_x0_px + of.tinta_x1_px) / 2, y: (of.tinta_topo_px + of.tinta_base_px) / 2 };
  const mkCrop = await recorteCm(mk, 500, 500, mkPxCm, mkCentro);

  // --- CAPA: px/cm pela mesma arte, via a geometria da composicao
  const foto = String(rec.foto).replace(/\\/g, "/");
  const meta = await sharp(foto).metadata();
  const plano = planejar({
    golaFrac: rec.gola, barraFrac: rec.barra, centroFrac: rec.centro ?? 0.5,
    imgW: meta.width, imgH: meta.height, artW_cm: aw, artH_cm: ah,
    peca: rec.peca, torsoFrac: rec.torso ?? null, yawDeg: rec.yaw ?? 0, placementCm: rec.placement,
  });
  const capaPath = path.join(path.dirname(rp), rec.cor_arquivo);
  if (!fs.existsSync(capaPath)) { console.log(`${rec.produto}: capa ${rec.cor_arquivo} nao existe`); continue; }
  const altPx = (plano.alvo.altura_pontos / 100) * meta.height;
  const capaPxCm = altPx / ah;
  const capaCentro = {
    x: (rec.centro ?? 0.5) * meta.width,
    y: ((plano.alvo.topo_pct + plano.alvo.base_pct) / 2 / 100) * meta.height,
  };
  const capaBuf = await sharp(capaPath).png().toBuffer();
  const capaCrop = await recorteCm(capaBuf, meta.width, meta.height, capaPxCm, capaCentro);

  pares.push({ rec, of, tpl, mkCrop, capaCrop, mkPxCm: +mkPxCm.toFixed(2), capaPxCm: +capaPxCm.toFixed(2) });
}

/** Recorta uma janela de JANELA_L_CM x JANELA_A_CM centrada em `centro`. */
async function recorteCm(buf, W, H, pxCm, centro) {
  const w = Math.round(JANELA_L_CM * pxCm), h = Math.round(JANELA_A_CM * pxCm);
  const left = Math.round(centro.x - w / 2), top = Math.round(centro.y - h / 2);
  // extend cobre janela que sai da imagem, em vez de estourar
  const padL = Math.max(0, -left), padT = Math.max(0, -top);
  const padR = Math.max(0, left + w - W), padB = Math.max(0, top + h - H);
  let img = sharp(buf);
  if (padL || padT || padR || padB) {
    img = sharp(await img.extend({
      left: padL, top: padT, right: padR, bottom: padB,
      background: { r: 255, g: 255, b: 255 },
    }).png().toBuffer());
  }
  return img.extract({ left: left + padL, top: top + padT, width: w, height: h })
    .resize({ width: Math.round(JANELA_L_CM * PX_CM) }).png().toBuffer();
}

if (!pares.length) { console.error("nada a montar"); process.exit(2); }

const alturas = [];
for (const p of pares) {
  const a = await sharp(p.mkCrop).metadata();
  const b = await sharp(p.capaCrop).metadata();
  alturas.push(Math.max(a.height, b.height));
}
const TOPO = 44, GAP = 12;
const H = alturas.reduce((s, h) => s + h + TOPO + GAP, 0);
const comp = [];
let y = 0;
for (let i = 0; i < pares.length; i += 1) {
  const p = pares[i];
  const aviso = p.tpl.corpoConferido ? "" : " · painel do corpo do mockup NAO conferido (enquadramento)";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${LARG * 2 + GAP}" height="${TOPO}">
    <rect width="100%" height="100%" fill="#ffffff"/>
    <text x="4" y="16" font-family="monospace" font-size="13" fill="#111">${p.rec.produto} · ${p.rec.peca} · placement ${p.rec.placement} cm · janela ${JANELA_L_CM}x${JANELA_A_CM} cm · mockup ${p.mkPxCm} px/cm, capa ${p.capaPxCm} px/cm${aviso}</text>
    <text x="4" y="34" font-family="monospace" font-size="13" fill="#666">MOCKUP OFICIAL (peca chapada)</text>
    <text x="${LARG + GAP + 4}" y="34" font-family="monospace" font-size="13" fill="#666">MINHA CAPA (mesma janela em cm, mesma escala px/cm)</text>
  </svg>`;
  comp.push({ input: Buffer.from(svg), left: 0, top: y });
  comp.push({ input: p.mkCrop, left: 0, top: y + TOPO });
  comp.push({ input: p.capaCrop, left: LARG + GAP, top: y + TOPO });
  y += alturas[i] + TOPO + GAP;
}
await sharp({ create: { width: LARG * 2 + GAP, height: H, channels: 3, background: "#ffffff" } })
  .composite(comp).jpeg({ quality: 93 }).toFile(saida);
console.log(`${saida} — ${pares.length} par(es)`);
