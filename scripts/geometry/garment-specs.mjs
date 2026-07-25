// Tabela de medidas das pecas — FONTE UNICA DE VERDADE.
//
// Os numeros nao sao redigitados aqui: sao lidos de
// `scripts/build-prelaunch-matrix.mjs`, onde ja estavam registrados com a
// fonte ("YouDraw Central de Ajuda — Tecidos e Qualidade"). Duplicar essa
// tabela foi exatamente o tipo de erro que invalidou a medicao de 24-25/07
// (usamos 68-72 cm para Moletom Canguru quando o real e 60-70).
//
// Formato da fonte: "P 49,5x70,5; M 52,5x72; ... cm (largura x altura)"
// -> largura = torax medido PLANO (meia circunferencia), altura = comprimento total.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_FILE = path.join(HERE, "..", "build-prelaunch-matrix.mjs");

function parseNumber(value) {
  return Number.parseFloat(value.replace(",", "."));
}

function parseSpecs() {
  const text = fs.readFileSync(SOURCE_FILE, "utf8");
  const blockRe = /(["']?)([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ ]*?)\1:\s*\{[\s\S]*?measurements:\s*"([^"]*)"/g;
  const specs = new Map();
  let match;
  while ((match = blockRe.exec(text)) !== null) {
    const garment = match[2].trim();
    const raw = match[3];
    const sizes = [];
    const sizeRe = /\b([A-Z]{1,2})\s+([\d.,]+)\s*[x×]\s*([\d.,]+)/g;
    let s;
    while ((s = sizeRe.exec(raw)) !== null) {
      sizes.push({
        size: s[1],
        width_cm: parseNumber(s[2]),
        length_cm: parseNumber(s[3]),
      });
    }
    specs.set(garment, { garment, raw, sizes });
  }
  if (specs.size === 0) {
    throw new Error(
      `nao consegui extrair nenhuma tabela de medidas de ${SOURCE_FILE} — o formato do arquivo mudou`,
    );
  }
  return specs;
}

let cache = null;

/** Todas as pecas conhecidas, com as medidas por tamanho. */
export function allGarmentSpecs() {
  if (!cache) cache = parseSpecs();
  return cache;
}

/**
 * Medidas de uma peca. Devolve `null` em `sizes` quando a fonte nao publica a
 * tabela (Blusao Moletom) — nesse caso o medidor precisa dizer "sem regua",
 * nunca inventar uma faixa.
 */
export function getGarmentSpec(garment) {
  const specs = allGarmentSpecs();
  const entry = specs.get(garment);
  if (!entry) {
    const known = [...specs.keys()].join(", ");
    throw new Error(`peca desconhecida: "${garment}". Conhecidas: ${known}`);
  }
  if (entry.sizes.length === 0) {
    return {
      garment,
      hasTable: false,
      raw: entry.raw,
      lengthRange: null,
      widthRange: null,
      sizes: [],
    };
  }
  const lengths = entry.sizes.map((x) => x.length_cm);
  const widths = entry.sizes.map((x) => x.width_cm);
  return {
    garment,
    hasTable: true,
    raw: entry.raw,
    sizes: entry.sizes,
    lengthRange: [Math.min(...lengths), Math.max(...lengths)],
    widthRange: [Math.min(...widths), Math.max(...widths)],
  };
}

/**
 * Qual tamanho tem o comprimento mais proximo do valor observado.
 * Usado para reportar "a estampa implica uma peca tamanho X" e para detectar
 * incoerencia entre o eixo do comprimento e o da largura.
 */
export function nearestSizeByLength(spec, length_cm) {
  if (!spec.hasTable) return null;
  return spec.sizes.reduce((best, s) =>
    Math.abs(s.length_cm - length_cm) < Math.abs(best.length_cm - length_cm) ? s : best,
  );
}

export function nearestSizeByWidth(spec, width_cm) {
  if (!spec.hasTable) return null;
  return spec.sizes.reduce((best, s) =>
    Math.abs(s.width_cm - width_cm) < Math.abs(best.width_cm - width_cm) ? s : best,
  );
}
