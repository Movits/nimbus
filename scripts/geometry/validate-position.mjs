// Decide, POR MEDICAO, qual estimador de centro do tronco usar.
//
// Candidatos:
//   vinco     meio dos dois vincos manga/tronco (~75 graus de arco). E o que o
//             protocolo pede hoje.
//   silhueta  meio dos dois pontos de tangencia da silhueta do tronco.
//   corda     a reta gola->barra, que ja e o segundo estimador do medidor.
//
// Rodado sobre o modelo de corpo de `body.mjs`, que tem elipticidade, torcao e
// afunilamento — os tres regimes que o cilindro circular do `synth.mjs` nao
// representa e nos quais um estimador ruim passa despercebido.
//
// A metrica NAO e so o vies: e o RMSE incluindo o ruido de anotacao, porque um
// estimador que remove vies mas custa mais pontos anotados pode piorar o
// resultado. Foi assim que a calibracao pela barra caiu.
//
// Uso: node scripts/geometry/validate-position.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { atArc, silhouetteAt, axisAt, projectPoint, defaultCamera } from "./body.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));

const CREASE_ARC_FRACTION = 75 / 90; // fracao do quarto de volta, ~vinco manga/tronco

// Ruido de anotacao por ponto, em pixels. O sigma tipico declarado pelos
// anotadores e 1 a 2% da imagem; com 1300 px isso da 13 a 26 px. Usa-se um
// gerador determinista para a comparacao entre estimadores ser pareada.
const NOISE_PX = [0, 8, 16];
let seed = 12345;
function rnd() {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
}
function gauss(sigma) {
  if (sigma === 0) return 0;
  const u = Math.max(1e-9, rnd());
  const v = rnd();
  return sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const GRID = {
  depthRatio: [0.55, 0.7, 0.85, 1.0],
  taper: [0, 0.12, 0.25],
  yaw_deg: [0, 3, 5, 10, 20, 30],
  twist_deg: [-15, -8, 0, 8, 15],
  bow_cm: [0, 3],
};

const GARMENTS = [
  { name: "Camiseta Premium", halfWidth_cm: 54 / 2, length_cm: 75.5 },
  { name: "Oversized", halfWidth_cm: 66 / 2, length_cm: 82 },
  { name: "Moletom Canguru", halfWidth_cm: 58 / 2, length_cm: 65 },
];

function run() {
  const rows = [];
  for (const g of GARMENTS)
    for (const depthRatio of GRID.depthRatio)
      for (const taper of GRID.taper)
        for (const yaw_deg of GRID.yaw_deg)
          for (const twist_deg of GRID.twist_deg)
            for (const bow_cm of GRID.bow_cm) {
              const o = { ...g, depthRatio, taper, yaw_deg, twist_deg, bow_cm };
              const cam = { ...defaultCamera };
              const yArt = 0.42 * g.length_cm; // meio da estampa, tipico
              let truth;
              let creaseL;
              let creaseR;
              let sil;
              let collar;
              let hem;
              try {
                truth = axisAt(yArt, o, cam);
                // arco do vinco: fracao do quarto de perimetro daquela seccao
                const quarter = Math.abs(
                  // arco ate 90 graus na altura da arte
                  (Math.PI / 2) * ((g.halfWidth_cm * (1 - taper * (yArt / g.length_cm))) * (1 + depthRatio)) / 2,
                );
                const sArc = CREASE_ARC_FRACTION * quarter;
                creaseL = projectPoint(atArc(-sArc, yArt, o), cam);
                creaseR = projectPoint(atArc(+sArc, yArt, o), cam);
                sil = silhouetteAt(yArt, o, cam);
                collar = projectPoint(atArc(0, 0, o), cam);
                hem = projectPoint(atArc(0, g.length_cm, o), cam);
              } catch {
                continue;
              }

              // px por cm no eixo vertical, para converter erro em cm
              const pxPerCm = Math.hypot(hem[0] - collar[0], hem[1] - collar[1]) / g.length_cm;

              for (const sigma of NOISE_PX) {
                const n = () => gauss(sigma);
                const midCrease = (creaseL[0] + n() + creaseR[0] + n()) / 2;
                const midSil = (sil.left[0] + n() + sil.right[0] + n()) / 2;
                // a corda gola->barra avaliada na altura da arte
                const t = yArt / g.length_cm;
                const chord = collar[0] + n() + (hem[0] + n() - collar[0]) * t;
                rows.push({
                  garment: g.name,
                  depthRatio,
                  taper,
                  yaw_deg,
                  twist_deg,
                  bow_cm,
                  sigma,
                  errCrease_cm: (midCrease - truth[0]) / pxPerCm,
                  errSil_cm: (midSil - truth[0]) / pxPerCm,
                  errChord_cm: (chord - truth[0]) / pxPerCm,
                });
              }
            }

  const stat = (vals) => {
    const n = vals.length;
    const mean = vals.reduce((a, b) => a + b, 0) / n;
    const rmse = Math.sqrt(vals.reduce((a, b) => a + b * b, 0) / n);
    const abs = vals.map(Math.abs).sort((a, b) => a - b);
    return {
      n,
      bias: round(mean),
      rmse: round(rmse),
      p95: round(abs[Math.floor(0.95 * n)]),
      max: round(abs[n - 1]),
    };
  };

  const report = { generatedAt: new Date().toISOString(), grid: GRID, garments: GARMENTS.map((g) => g.name) };

  for (const sigma of NOISE_PX) {
    const sub = rows.filter((r) => r.sigma === sigma);
    report[`sigma_${sigma}px`] = {
      vinco: stat(sub.map((r) => r.errCrease_cm)),
      silhueta: stat(sub.map((r) => r.errSil_cm)),
      corda: stat(sub.map((r) => r.errChord_cm)),
    };
  }

  // Recorte que mais importa: pose quase frontal, que e onde as fotos reais
  // estao, com ruido realista.
  const frontal = rows.filter((r) => Math.abs(r.yaw_deg) <= 10 && r.sigma === 16);
  report.frontal_sigma16 = {
    vinco: stat(frontal.map((r) => r.errCrease_cm)),
    silhueta: stat(frontal.map((r) => r.errSil_cm)),
    corda: stat(frontal.map((r) => r.errChord_cm)),
  };

  // Sensibilidade a elipticidade, sem ruido, para isolar o efeito geometrico.
  report.porElipticidade = Object.fromEntries(
    GRID.depthRatio.map((d) => {
      const sub = rows.filter((r) => r.depthRatio === d && r.sigma === 0);
      return [d, { vinco: stat(sub.map((r) => r.errCrease_cm)), silhueta: stat(sub.map((r) => r.errSil_cm)) }];
    }),
  );

  const best = report.frontal_sigma16;
  report.vencedor =
    best.silhueta.rmse < best.vinco.rmse && best.silhueta.rmse < best.corda.rmse
      ? "silhueta"
      : best.vinco.rmse < best.corda.rmse
        ? "vinco"
        : "corda";
  report.margemPublicada_cm = round(2 * Math.min(best.silhueta.rmse, best.vinco.rmse, best.corda.rmse));

  fs.writeFileSync(
    path.join(HERE, "position-estimator-report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
  console.log(`\nvencedor: ${report.vencedor} | margem 2*RMSE: ${report.margemPublicada_cm} cm`);
}

const round = (v, d = 3) => Math.round(v * 10 ** d) / 10 ** d;

run();
