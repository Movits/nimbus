// Deriva a trava de composicao do prompt a partir das dimensoes OFICIAIS em cm
// e da tabela de medidas da YouDraw. Substitui a estimativa visual que
// alimentava `compositionLock()` em generate-lifestyle-v3.mjs.
//
// Uso:
//   node scripts/derive-composicao.mjs --product 352726673 [--view back] [--size G]
//   node scripts/derive-composicao.mjs --all --out nuvemshop/auditoria/2026-07-25-geometria/composicao.json
//
// ===================== POR QUE `larg` FOI REMOVIDO =====================
// A trava antiga pedia "a arte ocupa X por cento da largura ombro-a-ombro".
// Nenhum dos dois numeros existe:
//
//   1. Nao ha medida de ombro-a-ombro na tabela da YouDraw. So existe largura
//      do TORAX, que e outra coisa.
//   2. Mesmo com ela, a largura APARENTE da arte numa peca vestida depende do
//      raio do dorso: a arte enrola e as laterais fogem da camera. Converter
//      largura plana em largura aparente exige um raio que nao se mede na
//      foto. Foi exatamente essa conversao que virou o "fator de caimento
//      1,52" — medido num produto, aplicado a todos.
//
// Manter um `larg` derivado de palpite dentro de um arquivo que se chama
// "derivado das dimensoes oficiais" seria pior que nao ter: daria autoridade a
// um numero inventado. As tres faixas verticais (sup/alt/inf) bastam, e sao
// exatas — o eixo vertical e imune ao enrolamento e a guinada.

import fs from "node:fs";
import path from "node:path";
import { getGarmentSpec } from "./geometry/garment-specs.mjs";
import { CANONICAL_SIZE } from "./geometry/measure.mjs";

const ROOT = process.cwd();
const CSV_PATH = path.join(
  ROOT,
  "nuvemshop/auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte.csv",
);

// A unica lacuna real: nao existe placement oficial da YouDraw em cm abaixo da
// gola. Ate o dono confirmar, usa-se a folga observada de forma consistente nas
// fotos aprovadas, e o valor fica DECLARADO como suposicao, nao escondido.
const COLLAR_TO_ART_CM = 8;
const COLLAR_TO_ART_SOURCE =
  "suposicao (8 cm): a YouDraw nao publica placement oficial. Confirmar e trocar aqui.";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  const [headers, ...records] = rows.filter((entry) => entry.some(Boolean));
  const clean = headers.map((h) => h.replace(/^﻿/, "").trim());
  return records.map((record) =>
    Object.fromEntries(clean.map((header, index) => [header, record[index] ?? ""])),
  );
}

/**
 * Converte as dimensoes oficiais de uma arte nas tres faixas verticais que o
 * prompt entende, para um tamanho de peca declarado.
 *
 * @returns {{sup:number,alt:number,inf:number}|null} percentuais do comprimento
 *   gola->barra: faixa vazia acima, altura da arte, faixa vazia abaixo.
 */
export function deriveComposicao({ garment, artH_cm, size = CANONICAL_SIZE, collarToArt_cm = COLLAR_TO_ART_CM }) {
  const spec = getGarmentSpec(garment);
  if (!spec.hasTable) return null;
  const entry = spec.sizes.find((s) => s.size === size);
  if (!entry) return null;
  const L = entry.length_cm;
  const sup = (collarToArt_cm / L) * 100;
  const alt = (artH_cm / L) * 100;
  const inf = 100 - sup - alt;
  return {
    sup: Math.round(sup * 10) / 10,
    alt: Math.round(alt * 10) / 10,
    inf: Math.round(inf * 10) / 10,
    garmentLength_cm: L,
    size,
  };
}

/**
 * Composicao derivada para um product_id, lendo o CSV oficial de dimensoes.
 * Exportada para que `generate-lifestyle-v3.mjs` possa CONFERIR o arquivo de
 * tarefa contra a fonte de verdade antes de gastar credito: arquivo de tarefa
 * guarda numeros da epoca em que foi escrito e envelhece em silencio.
 *
 * @returns {{sup:number,alt:number,inf:number,garmentLength_cm:number,size:string}|null}
 *   null quando o produto nao esta no CSV, nao tem arte naquela vista, ou a
 *   peca nao tem tabela de medidas publicada.
 */
export function composicaoPorProduto(productId, view = "back", size = CANONICAL_SIZE) {
  const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const row = rows.find((r) => r.product_id === String(productId));
  if (!row) return null;
  const h = Number(view === "front" ? row.front_h_cm : row.back_h_cm);
  if (!(h > 0)) return null;
  return deriveComposicao({ garment: row.garment, artH_cm: h, size });
}

function main() {
  const arg = (name, fallback = null) => {
    const i = process.argv.indexOf(name);
    return i > -1 ? process.argv[i + 1] : fallback;
  };
  const all = process.argv.includes("--all");
  const productId = arg("--product");
  const view = arg("--view", "back");
  const size = arg("--size", CANONICAL_SIZE);
  const outPath = arg("--out");

  if (!all && !productId) {
    console.error(
      "uso: node scripts/derive-composicao.mjs --product <id> [--view back|front] [--size G]\n" +
        "     node scripts/derive-composicao.mjs --all [--out arquivo.json]",
    );
    process.exit(2);
  }

  const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const targets = all ? rows : rows.filter((r) => r.product_id === String(productId));
  if (targets.length === 0) throw new Error(`produto ${productId} nao esta no CSV de dimensoes`);

  const out = [];
  for (const row of targets) {
    for (const v of all ? ["back", "front"] : [view]) {
      const h = Number(v === "front" ? row.front_h_cm : row.back_h_cm);
      const w = Number(v === "front" ? row.front_w_cm : row.back_w_cm);
      if (!(h > 0)) continue;
      const c = deriveComposicao({ garment: row.garment, artH_cm: h, size });
      out.push({
        product_id: row.product_id,
        title: row.title,
        garment: row.garment,
        view: v,
        art_cm: { w, h },
        composicao: c,
        // Sem tabela de medidas nao ha trava numerica possivel. O gerador
        // precisa saber disso em vez de receber um numero qualquer.
        motivo: c ? null : `"${row.garment}" nao tem tabela de medidas publicada`,
        placement_source: COLLAR_TO_ART_SOURCE,
      });
    }
  }

  const payload = {
    gerado_em: new Date().toISOString().slice(0, 10),
    tamanho_canonico: size,
    fonte_dimensoes: CSV_PATH,
    fonte_medidas: "scripts/build-prelaunch-matrix.mjs (via geometry/garment-specs.mjs)",
    campo_larg: "removido de proposito — ver o cabecalho de derive-composicao.mjs",
    itens: out,
  };
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);
  }
  if (all) {
    const semTabela = out.filter((o) => !o.composicao).length;
    console.log(`itens: ${out.length} | sem trava por falta de tabela: ${semTabela}`);
    if (outPath) console.log(`json: ${outPath}`);
  } else {
    console.log(JSON.stringify(payload.itens, null, 2));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
