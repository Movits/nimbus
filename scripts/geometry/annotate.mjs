import { pathToFileURL, fileURLToPath } from "node:url";
// Prepara uma foto para anotacao de landmarks por um agente com visao.
//
// Gera uma folha com grade fina em coordenadas da IMAGEM ORIGINAL (linhas a
// cada 2%, rotulos a cada 10%), opcionalmente recortada numa janela para dar
// zoom. O anotador le as coordenadas na grade e devolve o JSON de anotacao.
//
// Fluxo em duas passadas:
//   1. `--full`  : folha inteira, o anotador marca as regioes grosseiramente
//   2. `--zoom x0,x1,y0,y1` : recorte ampliado da regiao, para precisao de px
//
// Uso:
//   node scripts/geometry/annotate.mjs <imagem> <saida.jpg> [--zoom x0,x1,y0,y1] [--width 1300]

import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(path.join(process.cwd(), "package.json"));
const sharp = require("sharp");

const args = process.argv.slice(2);
const input = args[0];
const output = args[1];
if (!input || !output) {
  console.error("uso: node scripts/geometry/annotate.mjs <imagem> <saida.jpg> [--zoom x0,x1,y0,y1] [--width N]");
  process.exit(2);
}
const zoomArg = getArg("--zoom");
const width = Number(getArg("--width") ?? 1300);
const [x0, x1, y0, y1] = zoomArg ? zoomArg.split(",").map(Number) : [0, 1, 0, 1];

function getArg(name) {
  const i = args.indexOf(name);
  return i > -1 ? args[i + 1] : null;
}

export async function makeAnnotationSheet(input, output, window = [0, 1, 0, 1], outWidth = 1300) {
  const [wx0, wx1, wy0, wy1] = window;
  const meta = await sharp(input).metadata();
  const L = Math.round(wx0 * meta.width);
  const T = Math.round(wy0 * meta.height);
  const W = Math.round((wx1 - wx0) * meta.width);
  const H = Math.round((wy1 - wy0) * meta.height);

  const buf = await sharp(input)
    .extract({ left: L, top: T, width: W, height: H })
    .resize({ width: outWidth })
    .toBuffer();
  const d = await sharp(buf).metadata();
  const sx = d.width / W;
  const sy = d.height / H;

  const lines = [];
  // Passo da grade: 2% da imagem original, ou 0,5% quando o zoom e forte.
  const step = wx1 - wx0 < 0.35 ? 0.5 : 2;
  for (let p = 0; p <= 100; p += step) {
    const gx = ((p / 100) * meta.width - L) * sx;
    const gy = ((p / 100) * meta.height - T) * sy;
    const major = Math.abs(p % 10) < 1e-9;
    const mid = Math.abs(p % 5) < 1e-9;
    const strokeW = major ? 1.7 : mid ? 1.0 : 0.5;
    const opacity = major ? 0.8 : mid ? 0.5 : 0.28;
    if (gx >= 0 && gx <= d.width) {
      lines.push(
        `<line x1="${gx.toFixed(1)}" y1="0" x2="${gx.toFixed(1)}" y2="${d.height}" stroke="#00e5ff" stroke-width="${strokeW}" opacity="${opacity}"/>`,
      );
      if (major)
        lines.push(
          `<text x="${(gx + 3).toFixed(1)}" y="15" font-size="14" font-family="monospace" fill="#ff00aa" font-weight="bold">${p}</text>`,
        );
    }
    if (gy >= 0 && gy <= d.height) {
      lines.push(
        `<line x1="0" y1="${gy.toFixed(1)}" x2="${d.width}" y2="${gy.toFixed(1)}" stroke="#00e5ff" stroke-width="${strokeW}" opacity="${opacity}"/>`,
      );
      if (major)
        lines.push(
          `<text x="3" y="${(gy - 4).toFixed(1)}" font-size="14" font-family="monospace" fill="#ff00aa" font-weight="bold">${p}</text>`,
        );
    }
  }

  const caption = `${path.basename(input)}  |  janela x ${(wx0 * 100).toFixed(0)}-${(wx1 * 100).toFixed(0)}%  y ${(wy0 * 100).toFixed(0)}-${(wy1 * 100).toFixed(0)}%  |  rotulos = % da imagem ORIGINAL`;
  lines.push(
    `<rect x="0" y="${d.height - 22}" width="${d.width}" height="22" fill="#0b2360" opacity="0.9"/>`,
    `<text x="6" y="${d.height - 7}" font-size="13" font-family="monospace" fill="#ffffff">${caption.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`,
  );

  await sharp(buf)
    .composite([
      { input: Buffer.from(`<svg width="${d.width}" height="${d.height}">${lines.join("")}</svg>`) },
    ])
    .jpeg({ quality: 90 })
    .toFile(output);

  return { output, originalSize: { w: meta.width, h: meta.height }, window };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const info = await makeAnnotationSheet(input, output, [x0, x1, y0, y1], width);
  console.log(JSON.stringify(info));
}
