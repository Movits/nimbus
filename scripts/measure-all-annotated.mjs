// Roda o medidor sobre TODAS as anotacoes de um diretorio e monta o CSV da
// auditoria de geometria.
//
// Uso: node scripts/measure-all-annotated.mjs <dir-de-anotacoes> [--out arquivo.csv]
//
// Agrupa por foto (product_id + slug de cor), junta as anotacoes independentes
// da mesma foto e chama o CLI de medicao. Foto que nao pode ser medida NAO
// some: entra no CSV com o motivo, porque corte silencioso foi o que deixou as
// auditorias anteriores parecendo mais completas do que eram.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const dir = process.argv[2];
if (!dir) {
  console.error("uso: node scripts/measure-all-annotated.mjs <dir> [--out arquivo.csv]");
  process.exit(2);
}
const outArg = process.argv.indexOf("--out");
const outPath = outArg > -1 ? process.argv[outArg + 1] : null;

/** Junta as anotacoes por foto: o nome do arquivo tem prefixo de anotador. */
const byPhoto = new Map();
for (const file of fs.readdirSync(dir)) {
  if (!file.endsWith(".json") || file.includes("-result")) continue;
  let annotation;
  try {
    annotation = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  } catch {
    continue;
  }
  if (!annotation.photo || !annotation.art) continue;
  const photo = annotation.photo;
  if (!byPhoto.has(photo)) byPhoto.set(photo, { files: [], view: null });
  const entry = byPhoto.get(photo);
  entry.files.push(path.join(dir, file));
  // A VISTA vem do anotador, nao de um padrao. Nem toda capa e das costas:
  // Monograma NIMBUS e estampa de peito, e o CSV so tem dimensoes de frente
  // para ele. Medir com a vista errada procuraria uma arte que nao existe
  // naquele lado e o produto sairia como "sem medicao" por motivo falso.
  const declared =
    annotation.view ?? ((annotation.flags ?? []).some((f) => /front|frente|peito/i.test(f)) ? "front" : null);
  if (declared) entry.view = declared;
}

const COLUMNS = [
  "product_id",
  "title",
  "garment",
  "photo",
  "view",
  "annotators",
  "art_w_cm",
  "art_h_cm",
  "implied_garment_cm",
  "implied_band_cm",
  "garment_range_cm",
  "delta_G_pct",
  "delta_range_pct",
  "band_decisive",
  "alpha_excess_pct",
  "pose_regime",
  "offset_abs_band_cm",
  "offset_visible_pct_torso",
  "offset_chord_cm",
  "offset_torso_cm",
  "rotation_deg",
  "collar_to_art_top_cm",
  "inter_annotator_max_pct",
  "confidence",
  "scale_verdict",
  "position_verdict",
  "notes",
];

const rows = [];
for (const [photo, entry] of [...byPhoto.entries()].sort()) {
  const files = entry.files;
  const view = entry.view ?? "back";
  const productId = photo.match(/^(\d+)/)?.[1];
  if (!productId) {
    rows.push({ photo, scale_verdict: "SEM-MEDICAO", notes: "nome do arquivo nao traz product_id" });
    continue;
  }
  const args = ["scripts/measure-print-geometry.mjs", "--product", productId, "--view", view];
  for (const f of files) args.push("--annotation", f);
  let payload;
  try {
    payload = JSON.parse(execFileSync("node", args, { encoding: "utf8", maxBuffer: 1 << 24 }));
  } catch (err) {
    const msg = String(err.stderr || err.message).split("\n").find((l) => l.includes("Error")) ?? "falhou";
    rows.push({
      product_id: productId,
      photo,
      annotators: files.length,
      scale_verdict: "SEM-MEDICAO",
      position_verdict: "SEM-MEDICAO",
      notes: msg.replace(/^.*Error: /, ""),
    });
    continue;
  }

  const spreads = Object.values(payload.interAnnotator_pctSpread ?? {}).filter((v) => typeof v === "number");
  rows.push({
    product_id: payload.product_id,
    title: payload.title,
    garment: payload.garment,
    photo,
    view: payload.view,
    annotators: payload.annotators.join("+"),
    art_w_cm: payload.official_cm.w,
    art_h_cm: payload.official_cm.h,
    implied_garment_cm: payload.scale.impliedGarmentLength_cm,
    implied_band_cm: payload.scale.impliedGarmentLength_band_cm?.join("-") ?? "",
    garment_range_cm: payload.scale.garmentLengthRange_cm?.join("-") ?? "sem tabela",
    delta_G_pct: payload.scale.deltaCanonicalPct,
    delta_range_pct: payload.scale.deltaRangePct?.join(" a ") ?? "",
    band_decisive: payload.scale.bandDecisive === null || payload.scale.bandDecisive === undefined ? "" : payload.scale.bandDecisive ? "sim" : "nao",
    alpha_excess_pct: payload.anisotropy.alphaExcessPct,
    pose_regime: payload.anisotropy.regime,
    offset_abs_band_cm: payload.position.offsetAbs_range_cm?.join("-") ?? "",
    offset_visible_pct_torso: payload.position.offsetVisible_pctOfTorso ?? "",
    offset_chord_cm: payload.position.offsetX_byChord_cm ?? "",
    offset_torso_cm: payload.position.offsetX_byTorso_cm ?? "",
    rotation_deg: payload.position.rotation_deg ?? "",
    collar_to_art_top_cm: payload.position.collarToArtTop_cm ?? "",
    inter_annotator_max_pct: spreads.length ? Math.max(...spreads).toFixed(2) : "1 anotador",
    confidence: payload.confidence,
    scale_verdict: payload.scale.verdict,
    position_verdict: payload.position.verdict,
    notes: (payload.notes ?? []).join(" | "),
  });
}

const esc = (v) => {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = [COLUMNS.join(","), ...rows.map((r) => COLUMNS.map((c) => esc(r[c])).join(","))].join("\n");

if (outPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${csv}\n`);
}

const tally = (key) =>
  Object.entries(
    rows.reduce((acc, r) => {
      const v = r[key] ?? "?";
      acc[v] = (acc[v] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${k} ${n}`)
    .join(" | ");

console.log(`fotos medidas: ${rows.length}`);
console.log(`escala:   ${tally("scale_verdict")}`);
console.log(`posicao:  ${tally("position_verdict")}`);
if (outPath) console.log(`csv: ${outPath}`);
