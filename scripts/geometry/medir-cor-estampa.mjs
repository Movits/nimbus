// Medidor de cor da estampa: compara a tinta na capa composta com a arte
// oficial. Seleciona pixels saturados (a tinta) numa janela dada e reporta
// medianas de luminancia e saturacao; a razao capa/arte e o numero.
import sharp from "sharp";

const arg = (n, d = null) => { const i = process.argv.indexOf(n); return i === -1 ? d : process.argv[i + 1]; };

async function medir(file, win) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  const [fx0, fy0, fx1, fy1] = win;
  const Ls = [], Ss = [];
  for (let y = Math.round(fy0 * H); y < Math.round(fy1 * H); y++) {
    for (let x = Math.round(fx0 * W); x < Math.round(fx1 * W); x++) {
      const i = (y * W + x) * 3, r = data[i], g = data[i + 1], b = data[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const sat = mx - mn;
      if (sat > 40) { Ls.push(0.299 * r + 0.587 * g + 0.114 * b); Ss.push(sat); }
    }
  }
  const med = (a) => { a.sort((p, q) => p - q); return a.length ? a[Math.floor(a.length / 2)] : null; };
  return { n: Ls.length, L: med(Ls), S: med(Ss) };
}

const capa = await medir(arg("--capa"), arg("--janela-capa").split(",").map(Number));
const arte = await medir(arg("--arte"), (arg("--janela-arte") || "0,0,1,1").split(",").map(Number));
console.log(JSON.stringify({
  capa_px: capa.n, arte_px: arte.n,
  L_capa: capa.L?.toFixed(0), L_arte: arte.L?.toFixed(0),
  S_capa: capa.S?.toFixed(0), S_arte: arte.S?.toFixed(0),
  razao_L: +(capa.L / arte.L).toFixed(3),
  razao_S: +(capa.S / arte.S).toFixed(3),
}, null, 1));
