// CLI do medidor: junta anotacoes, busca as dimensoes oficiais e mede.
//
// Uso:
//   node scripts/measure-print-geometry.mjs --product 352726673 --view back \
//        --annotation a.json [--annotation b.json] [--image caminho.jpg] [--out r.json]
//
// Com duas anotacoes, calcula o consenso (media ponderada por 1/sigma^2) e
// reporta a discordancia entre anotadores — que e a fonte de erro que a
// validacao sintetica NAO cobre.

import fs from "node:fs";
import path from "node:path";
import { measurePrint, DEFAULT_TOLERANCE } from "./geometry/measure.mjs";

const ROOT = process.cwd();
const CSV_PATH = path.join(
  ROOT,
  "nuvemshop/auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte.csv",
);

// Parser CSV com aspas, mesmo padrao de build-art-dimension-audit-cards.mjs
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

function getArg(name, fallback = null) {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
}
function getAll(name) {
  const out = [];
  process.argv.forEach((a, i) => {
    if (a === name) out.push(process.argv[i + 1]);
  });
  return out;
}

/** Converte coordenadas em % da imagem original para pixels. */
function toPx([xPct, yPct], size) {
  return [(xPct / 100) * size.w, (yPct / 100) * size.h];
}

/** Consenso entre anotacoes: media ponderada por 1/sigma^2 e discordancia. */
function consensus(points, sigmas) {
  if (points.length === 1) return { xy: points[0], spread: 0 };
  const weights = sigmas.map((s) => 1 / Math.max(0.05, s) ** 2);
  const total = weights.reduce((a, b) => a + b, 0);
  const xy = [
    points.reduce((acc, p, i) => acc + p[0] * weights[i], 0) / total,
    points.reduce((acc, p, i) => acc + p[1] * weights[i], 0) / total,
  ];
  const spread = Math.max(
    ...points.map((p) => Math.hypot(p[0] - xy[0], p[1] - xy[1])),
  );
  return { xy, spread };
}

const productId = getArg("--product");
const view = getArg("--view", "back");
const annotationPaths = getAll("--annotation");
const outPath = getArg("--out");
if (!productId || annotationPaths.length === 0) {
  console.error(
    "uso: node scripts/measure-print-geometry.mjs --product <id> [--view back|front] --annotation a.json [--annotation b.json] [--out r.json]",
  );
  process.exit(2);
}

const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
const row = rows.find((r) => r.product_id === String(productId));
if (!row) throw new Error(`produto ${productId} nao esta no CSV de dimensoes`);

const w_cm = Number(view === "front" ? row.front_w_cm : row.back_w_cm);
const h_cm = Number(view === "front" ? row.front_h_cm : row.back_h_cm);
if (!(w_cm > 0) || !(h_cm > 0)) {
  throw new Error(
    `produto ${productId} nao tem arte oficial registrada na vista "${view}" (o CSV traz frente ${row.front_w_cm}x${row.front_h_cm}, costas ${row.back_w_cm || "vazio"}x${row.back_h_cm || "vazio"})`,
  );
}

const annotations = annotationPaths.map((p) => JSON.parse(fs.readFileSync(p, "utf8")));
const size = annotations[0].imageSize ?? { w: 1600, h: 1600 };

// Consenso ponto a ponto
const ART_KEYS = ["tl", "tr", "br", "bl", "mt", "mb", "ml", "mr"];
const art = {};
const disagreement = {};
for (const key of ART_KEYS) {
  const pts = annotations.map((a) => a.art?.[key]).filter(Boolean);
  if (pts.length === 0) continue;
  const sig = annotations.map((a) => a.art?.sigma_pct ?? 1);
  const c = consensus(pts, sig.slice(0, pts.length));
  art[key] = toPx(c.xy, size);
  disagreement[`art.${key}`] = Number(c.spread.toFixed(2));
}

// Extremos de tinta da arte irregular. Ficam FORA do consenso de `art` porque
// nao sao vertices de uma caixa: sao o pixel de tinta mais alto e o mais baixo,
// que em spray/stencil caem em posicoes laterais diferentes. E essa separacao
// lateral que encolhe a altura medida, e o medidor so consegue corrigi-la
// quando o anotador declara ONDE cada extremo esta.
function mergeExtreme(name) {
  const pts = annotations.map((a) => a[name]).filter(Boolean).map((e) => (Array.isArray(e) ? e : e.xy)).filter(Boolean);
  if (pts.length === 0) return null;
  const sig = annotations.map((a) => a.art?.sigma_pct ?? 1).slice(0, pts.length);
  const c = consensus(pts, sig);
  disagreement[name] = Number(c.spread.toFixed(2));
  return toPx(c.xy, size);
}

function mergeNamed(name) {
  const entries = annotations.map((a) => a[name]).filter((e) => e?.xy);
  if (entries.length === 0) return { value: null, status: "missing" };
  const blocking = entries.filter((e) => e.status && e.status !== "ok");
  const c = consensus(
    entries.map((e) => e.xy),
    entries.map((e) => e.sigma_pct ?? 1),
  );
  disagreement[name] = Number(c.spread.toFixed(2));
  // sigma declarado pelo anotador, em % da imagem -> px (usa a maior dimensao)
  const sigmaPct = Math.max(...entries.map((e) => e.sigma_pct ?? 1));
  const sigma_px = (sigmaPct / 100) * Math.max(size.w, size.h);
  return {
    value: { center: toPx(c.xy, size), sigma_px },
    status: blocking.length ? blocking.map((e) => e.status).join("|") : "ok",
  };
}

const collar = mergeNamed("collar_center");
const hem = mergeNamed("hem_center");
const sideL = mergeNamed("side_left");
const sideR = mergeNamed("side_right");
const silL = mergeNamed("silhouette_left");
const silR = mergeNamed("silhouette_right");

const flags = [...new Set(annotations.flatMap((a) => a.flags ?? []))];
if (collar.status !== "ok" && collar.status !== "missing") flags.push(`collar:${collar.status}`);
if (hem.status !== "ok" && hem.status !== "missing") flags.push(`hem:${hem.status}`);

const result = measurePrint(
  {
    art: {
      ...art,
      topExtreme: mergeExtreme("top_extreme"),
      bottomExtreme: mergeExtreme("bottom_extreme"),
      sigma_px: (Math.max(...annotations.map((a) => a.art?.sigma_pct ?? 0.5)) / 100) * Math.max(size.w, size.h),
    },
    artSize: { w_cm, h_cm },
    garment: row.garment,
    // A vista muda o significado da regua gola->barra: ver o bloco de vereditos
    // em geometry/measure.mjs.
    view,
    collar: collar.value,
    hem: hem.value,
    side:
      sideL.value && sideR.value
        ? {
            left: sideL.value.center,
            right: sideR.value.center,
            // O sigma declarado pelo anotador nas laterais entra na faixa de
            // posicao. Lateral "inferida" nao pode sustentar veredito duro.
            left_sigma_px: sideL.value.sigma_px,
            right_sigma_px: sideR.value.sigma_px,
          }
        : undefined,
    silhouette:
      silL.value && silR.value
        ? { left: silL.value.center, right: silR.value.center }
        : undefined,
    // Arte irregular (spray, stencil, ilustracao livre) nao tem aresta: os
    // pontos medios seguem o contorno do desenho, nao a borda da caixa. Os cm
    // oficiais descrevem a CAIXA ENVOLVENTE, entao a medicao usa a caixa.
    artShape: flags.some((f) => /irregular|no_drawn_frame|silhouette/i.test(f))
      ? "irregular"
      : "rect_frame",
    mode: ART_KEYS.every((k) => art[k]) ? "corners" : "bbox",
    flags,
  },
  DEFAULT_TOLERANCE,
);

const payload = {
  product_id: productId,
  title: row.title,
  garment: row.garment,
  view,
  image: getArg("--image", annotations[0].photo ?? null),
  annotators: annotations.map((a) => a.annotator ?? "?"),
  interAnnotator_pctSpread: disagreement,
  official_cm: { w: w_cm, h: h_cm },
  ...result,
};

if (outPath) fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
console.log(JSON.stringify(payload, null, 2));
