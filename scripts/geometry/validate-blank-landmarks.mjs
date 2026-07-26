// VALIDACAO do detector de barra/gola por PONTO DE MUDANCA 1D, testado contra a verdade
// anotada por humanos nas 42 anotacoes das fotos publicadas.
//
// Ideia: em vez de segmentar a peca inteira (que falhou em 3 modos distintos),
// olhar so a coluna central e achar onde a COR MUDA DE PATAMAR. A barra e uma
// transicao peca->calca/fundo; a gola e uma transicao pele/cabelo->peca. Isso
// funciona mesmo quando peca e calca sao as duas escuras, porque o que decide e
// o DEGRAU entre duas janelas, nao o valor absoluto.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

// O diretorio precisa conter os .json de anotacao E as fotos que eles citam.
// As anotacoes das 41 fotos publicadas estao versionadas em
// nuvemshop/auditoria/2026-07-25-geometria/anotacoes/, mas as fotos nao; monte
// o diretorio de teste copiando as fotos para junto das anotacoes.
const D = process.env.ANNOT_DIR || process.argv[2];
if (!D || !fs.existsSync(D)) {
  console.error(
    "uso: node scripts/geometry/validate-blank-landmarks.mjs <dir-anotacoes-e-fotos>\n" +
    "(ou defina ANNOT_DIR). O caminho antigo era o scratchpad efemero da sessao na nuvem.",
  );
  process.exit(2);
}

/** Perfil de cor media por linha, numa faixa central. */
async function perfilCentral(src, faixa = [0.44, 0.56]) {
  const r = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = r.info;
  const x0 = Math.round(faixa[0] * W), x1 = Math.round(faixa[1] * W);
  const perf = [];
  for (let y = 0; y < H; y += 1) {
    let R = 0, G = 0, B = 0, n = 0;
    for (let x = x0; x <= x1; x += 1) {
      const i = (y * W + x) * C;
      R += r.data[i]; G += r.data[i + 1]; B += r.data[i + 2]; n += 1;
    }
    perf.push([R / n, G / n, B / n]);
  }
  return { perf, W, H };
}

/** Forca do degrau em cada linha: distancia entre a media acima e a de baixo. */
function degrau(perf, jan) {
  const n = perf.length, s = new Float64Array(n);
  for (let y = jan; y < n - jan; y += 1) {
    const a = [0, 0, 0], b = [0, 0, 0];
    for (let k = 1; k <= jan; k += 1) {
      for (let c = 0; c < 3; c += 1) { a[c] += perf[y - k][c]; b[c] += perf[y + k][c]; }
    }
    let d = 0;
    for (let c = 0; c < 3; c += 1) d += ((a[c] - b[c]) / jan) ** 2;
    s[y] = Math.sqrt(d);
  }
  return s;
}

const argmaxNaFaixa = (s, y0, y1) => {
  let best = -1, bv = -1;
  for (let y = y0; y <= y1; y += 1) if (s[y] > bv) { bv = s[y]; best = y; }
  return { y: best, v: bv };
};

const linhas = [];
for (const f of fs.readdirSync(D)) {
  if (!f.endsWith(".json") || f.includes("-result")) continue;
  const j = JSON.parse(fs.readFileSync(path.join(D, f), "utf8"));
  if (!j.art || !j.hem_center?.xy) continue;
  const foto = path.join(D, j.photo);
  if (!fs.existsSync(foto)) continue;
  const { perf, H } = await perfilCentral(foto);
  const jan = Math.max(4, Math.round(0.012 * H));
  const s = degrau(perf, jan);

  // BARRA: maior degrau na metade de baixo. A faixa plausivel vem da propria
  // geometria — nenhuma peca acaba antes de 55% nem depois de 98% da imagem.
  const barra = argmaxNaFaixa(s, Math.round(0.55 * H), Math.round(0.98 * H));
  // GOLA: maior degrau na parte de cima.
  const gola = argmaxNaFaixa(s, Math.round(0.18 * H), Math.round(0.50 * H));

  linhas.push({
    foto: j.photo,
    hem_anot: j.hem_center.xy[1], hem_auto: +((100 * barra.y) / H).toFixed(2),
    hem_sigma: j.hem_center.sigma_pct, hem_status: j.hem_center.status,
    gola_anot: j.collar_center?.xy?.[1] ?? null, gola_auto: +((100 * gola.y) / H).toFixed(2),
    gola_sigma: j.collar_center?.sigma_pct, gola_status: j.collar_center?.status,
  });
}

if (linhas.length === 0) {
  console.error(`nenhuma anotacao com foto correspondente encontrada em ${D}`);
  process.exit(2);
}

const erroHem = linhas.map((l) => l.hem_auto - l.hem_anot);
const erroGola = linhas.filter((l) => l.gola_anot != null).map((l) => l.gola_auto - l.gola_anot);
const med = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const dp = (a) => { const m = med(a); return Math.sqrt(med(a.map((v) => (v - m) ** 2))); };
const absmed = (a) => med(a.map(Math.abs));

console.log(`n = ${linhas.length}`);
console.log(`BARRA  vies ${med(erroHem).toFixed(2)} pp | desvio ${dp(erroHem).toFixed(2)} pp | |erro| medio ${absmed(erroHem).toFixed(2)} pp | dentro de 1pp: ${erroHem.filter((e) => Math.abs(e) <= 1).length}/${erroHem.length} | dentro de 2pp: ${erroHem.filter((e) => Math.abs(e) <= 2).length}/${erroHem.length}`);
console.log(`GOLA   vies ${med(erroGola).toFixed(2)} pp | desvio ${dp(erroGola).toFixed(2)} pp | |erro| medio ${absmed(erroGola).toFixed(2)} pp | dentro de 2pp: ${erroGola.filter((e) => Math.abs(e) <= 2).length}/${erroGola.length} | dentro de 3pp: ${erroGola.filter((e) => Math.abs(e) <= 3).length}/${erroGola.length}`);

console.log("\npiores casos de barra:");
linhas.map((l) => ({ ...l, e: Math.abs(l.hem_auto - l.hem_anot) })).sort((a, b) => b.e - a.e).slice(0, 8)
  .forEach((l) => console.log(`  ${l.foto.padEnd(34)} anot ${String(l.hem_anot).padStart(6)} auto ${String(l.hem_auto).padStart(6)} erro ${l.e.toFixed(1)} pp (sigma ${l.hem_sigma}, ${l.hem_status})`));

fs.writeFileSync(path.join(D, "hem-test.json"), `${JSON.stringify(linhas, null, 1)}\n`);
