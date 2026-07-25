// VALIDACAO DO MEDIDOR CONTRA VERDADE CONHECIDA.
//
// Roda o medidor sobre cenas sinteticas onde a escala e a posicao da estampa
// sao conhecidas por construcao, e mede quanto ele recupera. O resultado
// desta rodada E a margem de erro publicada do metodo — nao um numero
// escolhido a dedo. Foi assim que "±3-5 pontos" virou ficcao antes.
//
// Uso: node scripts/geometry/validate.mjs [--json caminho]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { synthLandmarks } from "./synth.mjs";
import { measurePrint, CANONICAL_SIZE } from "./measure.mjs";
import { getGarmentSpec } from "./garment-specs.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));

// Cenarios reais do catalogo: peca, arte tipica e raio de dorso plausivel.
const SCENARIOS = [
  { garment: "Camiseta Premium", artW: 33.8, artH: 40.0, radius: 17 },
  { garment: "Camiseta Oversized Premium", artW: 30.6, artH: 40.0, radius: 19 },
  { garment: "Moletom Canguru", artW: 31.0, artH: 40.0, radius: 20 },
];

const YAWS = [0, 10, 20, 30, 40];
const PITCHES = [-10, 0, 10];
const ROLLS = [-5, 0, 5];
const SCALES = [0.7, 0.8, 0.9, 0.95, 1.0, 1.05, 1.1, 1.2, 1.3];
const OFFSETS = [0, 2, 4];
const ART_ROTATIONS = [0, 3];

function stats(values) {
  if (values.length === 0) return { n: 0 };
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, n - 1));
  const sorted = [...values].sort((a, b) => a - b);
  const p95 = sorted[Math.min(n - 1, Math.floor(0.95 * n))];
  return {
    n,
    bias: round(mean, 2),
    sd: round(sd, 2),
    absMax: round(Math.max(...values.map(Math.abs)), 2),
    p95abs: round(Math.abs(p95), 2),
  };
}

const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

function run() {
  const rows = [];

  for (const sc of SCENARIOS) {
    const spec = getGarmentSpec(sc.garment);
    const canonical = spec.sizes.find((s) => s.size === CANONICAL_SIZE);
    if (!canonical) throw new Error(`sem tamanho canonico ${CANONICAL_SIZE} em ${sc.garment}`);

    for (const yaw of YAWS)
      for (const pitch of PITCHES)
        for (const roll of ROLLS)
          for (const scale of SCALES)
            for (const offsetX of OFFSETS)
              for (const artRot of ART_ROTATIONS) {
                const scene = synthLandmarks({
                  garmentLength_cm: canonical.length_cm,
                  radius_cm: sc.radius,
                  artW_cm: sc.artW,
                  artH_cm: sc.artH,
                  scale,
                  offsetX_cm: offsetX,
                  collarToTop_cm: 8,
                  artRotation_deg: artRot,
                  camera: { yaw, pitch, roll },
                });

                for (const annot of ["4pt", "8pt"]) {
                const artInput = annot === "8pt"
                  ? scene.landmarks.art
                  : { tl: scene.landmarks.art.tl, tr: scene.landmarks.art.tr,
                      br: scene.landmarks.art.br, bl: scene.landmarks.art.bl };
                let result;
                try {
                  result = measurePrint({
                    art: artInput,
                    artSize: { w_cm: sc.artW, h_cm: sc.artH },
                    garment: sc.garment,
                    collar: scene.landmarks.collar,
                    hem: scene.landmarks.hem,
                    side: scene.landmarks.side,
                  });
                } catch (err) {
                  rows.push({ annot, scenario: sc.garment, yaw, pitch, roll, scale, offsetX, artRot, error: String(err.message) });
                  continue;
                }

                // Verdade: a estampa esta (scale-1)*100 % maior que o oficial.
                const truthScalePct = (scale - 1) * 100;
                const scaleErr =
                  result.scale.deltaCanonicalPct === null
                    ? null
                    : result.scale.deltaCanonicalPct - truthScalePct;
                const offsetErr =
                  result.position.offsetX_cm === null
                    ? null
                    : Math.abs(result.position.offsetX_cm) - offsetX;

                rows.push({
                  annot,
                  scenario: sc.garment,
                  yaw,
                  pitch,
                  roll,
                  scale,
                  offsetX,
                  artRot,
                  alphaPct: result.anisotropy.alphaPct,
                  alphaExcess: result.anisotropy.alphaExcessPct,
                  regime: result.anisotropy.regime,
                  scaleErrPct: scaleErr === null ? null : round(scaleErr, 2),
                  offsetErrCm: offsetErr === null ? null : round(offsetErr, 2),
                  rotationErrDeg:
                    result.position.rotation_deg === null ? null : round(result.position.rotation_deg, 2),
                  verdict: result.verdict,
                  scaleVerdict: result.scale.verdict,
                });
                }
              }
  }

  // Classe "mensuravel": o medidor declara que o eixo vertical vale.
  const byAnnot = (a) => rows.filter(
    (r) => r.annot === a && !r.error && r.scaleErrPct !== null && r.regime !== "vertical_comprimido",
  );
  const measurable = byAnnot("8pt");
  const frontalish = measurable.filter((r) => Math.abs(r.yaw) <= 20 && Math.abs(r.pitch) <= 10);

  const report = {
    generatedAt: new Date().toISOString(),
    method: "nimbus.medidor/1",
    grid: {
      scenarios: SCENARIOS.map((s) => s.garment),
      yaws: YAWS,
      pitches: PITCHES,
      rolls: ROLLS,
      scales: SCALES,
      offsets: OFFSETS,
      artRotations: ART_ROTATIONS,
      total: rows.length,
    },
    scaleError_pp: {
      all: stats(measurable.map((r) => r.scaleErrPct)),
      frontalish: stats(frontalish.map((r) => r.scaleErrPct)),
      byYaw: Object.fromEntries(
        YAWS.map((y) => [y, stats(measurable.filter((r) => r.yaw === y).map((r) => r.scaleErrPct))]),
      ),
      byPitch: Object.fromEntries(
        PITCHES.map((p) => [
          p,
          stats(measurable.filter((r) => r.pitch === p).map((r) => r.scaleErrPct)),
        ]),
      ),
    },
    offsetError_cm: {
      all: stats(measurable.filter((r) => r.offsetErrCm !== null).map((r) => r.offsetErrCm)),
      frontalish: stats(frontalish.filter((r) => r.offsetErrCm !== null).map((r) => r.offsetErrCm)),
    },
    alphaDetector: {
      // o flag tem que acender em pose forte e ficar quieto de frente
      firesAtYaw30plus: fraction(rows, (r) => r.annot === "8pt" && r.yaw >= 30 && r.scale === 1.0, (r) => Math.abs(r.alphaExcess) > 6),
      firesAtYaw0: fraction(rows, (r) => r.annot === "8pt" && r.yaw === 0 && r.scale === 1.0, (r) => Math.abs(r.alphaExcess) > 6),
    },
    annotationModes: {
      "4pt": stats(byAnnot("4pt").map((r) => r.scaleErrPct)),
      "8pt": stats(byAnnot("8pt").map((r) => r.scaleErrPct)),
    },
    offsetByYaw: Object.fromEntries(
      YAWS.map((y) => [y, stats(measurable.filter((r) => r.yaw === y && r.offsetErrCm !== null).map((r) => r.offsetErrCm))]),
    ),
    verdictBreakdown: countBy(rows.filter((r) => r.annot === "8pt" && !r.error).map((r) => r.scaleVerdict)),
    errors: rows.filter((r) => r.error).length,
  };

  // Margem publicada = |vies| + 2 sigma na classe frontal-ish, arredondada
  // para cima. E o numero que passa a valer como tolerancia minima.
  const f = report.scaleError_pp.frontalish;
  report.publishedMargin_pp = Math.ceil(Math.abs(f.bias) + 2 * f.sd);
  const o = report.offsetError_cm.frontalish;
  report.publishedOffsetMargin_cm = round(Math.abs(o.bias) + 2 * o.sd, 2);

  report.criteria = {
    scaleBiasAbs_le_3pp: Math.abs(f.bias) <= 3,
    scaleSd_le_4pp: f.sd <= 4,
    offsetBiasAbs_le_0_5cm: Math.abs(o.bias) <= 0.5,
    offsetSd_le_1cm: o.sd <= 1,
    alphaFiresAtYaw30_ge_0_9: report.alphaDetector.firesAtYaw30plus >= 0.9,
    alphaQuietAtYaw0_le_0_1: report.alphaDetector.firesAtYaw0 <= 0.1,
  };
  report.passed = Object.values(report.criteria).every(Boolean);

  return { report, rows };
}

function fraction(rows, filterFn, predFn) {
  const subset = rows.filter((r) => !r.error && filterFn(r));
  if (subset.length === 0) return null;
  return round(subset.filter(predFn).length / subset.length, 3);
}

function countBy(values) {
  const out = {};
  for (const v of values) out[v] = (out[v] ?? 0) + 1;
  return out;
}

const { report, rows } = run();
const outArg = process.argv.indexOf("--json");
const outPath =
  outArg > -1 ? process.argv[outArg + 1] : path.join(HERE, "validation-report.json");
fs.writeFileSync(outPath, JSON.stringify({ report, sample: rows.slice(0, 40) }, null, 2));

console.log(JSON.stringify(report, null, 2));
console.log(`\ncasos: ${rows.length} | relatorio: ${outPath}`);
console.log(report.passed ? "\nVALIDACAO: PASSOU" : "\nVALIDACAO: NAO PASSOU");
process.exitCode = report.passed ? 0 : 1;
