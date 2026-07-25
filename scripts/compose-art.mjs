// COMPOSICAO DETERMINISTICA: aplica a arte oficial sobre uma foto ja gerada,
// no tamanho e na posicao calculados dos cm oficiais.
//
// Por que existe. Duas tentativas de pedir a escala certa a IA por prompt nao
// moveram a estampa um pixel: com uma foto de referencia no pedido, o modelo
// otimiza por semelhanca e copia o tamanho junto, ignorando tanto a trava em
// porcentagem quanto a ancora anatomica. O protocolo do projeto manda, depois
// de duas falhas equivalentes, mudar de METODO e nao de prompt.
//
// Aqui a escala deixa de ser pedida e passa a ser CONSTRUIDA: gera-se a peca em
// branco e a arte entra por malha cilindrica, no tamanho que os cm mandam. O
// medidor vira teste de regressao, nao loteria.
//
// Uso:
//   node scripts/compose-art.mjs --foto branco.png --arte arte.png \
//     --gola 0.36 --barra 0.88 --centro 0.51 \
//     --arte-cm 35.2x28.8 --peca "Moletom Canguru" --out final.png

import fs from "node:fs";
import sharp from "sharp";
import { compositeArt, artMesh } from "./geometry/render.mjs";
import { getGarmentSpec } from "./geometry/garment-specs.mjs";
import { CANONICAL_SIZE } from "./geometry/measure.mjs";

const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};

/**
 * Tira o tecido de tras da arte recortada de uma foto, por luminancia.
 * Tinta clara sobre tecido escuro vira alpha; a cor da tinta e preservada.
 * Numa arte vinda de arquivo oficial com transparencia isto e desnecessario.
 */
export async function chaveiaPorLuminancia(src, { piso = 45, teto = 150 } = {}) {
  const r = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = r.info;
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0, o = 0, p = 0; i < W * H; i += 1, o += 4, p += C) {
    const lum = 0.299 * r.data[p] + 0.587 * r.data[p + 1] + 0.114 * r.data[p + 2];
    const a = Math.max(0, Math.min(1, (lum - piso) / (teto - piso)));
    out[o] = r.data[p]; out[o + 1] = r.data[p + 1]; out[o + 2] = r.data[p + 2];
    out[o + 3] = Math.round(255 * a);
  }
  return { data: out, width: W, height: H, channels: 4 };
}

/**
 * Calcula os parametros de camera que fazem a arte cair exatamente no alvo.
 *
 * O alvo vem da composicao: a arte ocupa `alt`% do vao gola->barra, comecando
 * `sup`% abaixo da gola. Aqui isso vira pixels na imagem, e dai sai a distancia
 * focal que a malha precisa.
 */
export function planejar({ golaFrac, barraFrac, centroFrac, imgW, imgH, artW_cm, artH_cm, peca }) {
  const spec = getGarmentSpec(peca);
  if (!spec.hasTable) throw new Error(`sem tabela de medidas para "${peca}"`);
  const L = spec.sizes.find((s) => s.size === CANONICAL_SIZE).length_cm;
  const larguraPlana = spec.sizes.find((s) => s.size === CANONICAL_SIZE).width_cm;
  // largura plana = meia circunferencia => R = largura/pi
  const R = larguraPlana / Math.PI;

  const golaPx = golaFrac * imgH;
  const barraPx = barraFrac * imgH;
  const pecaPx = barraPx - golaPx;
  const pxPorCm = pecaPx / L;

  const collarToTop_cm = 8; // suposicao declarada: a YouDraw nao publica placement
  const alturaAlvoPx = artH_cm * pxPorCm;
  const topoAlvoPx = golaPx + collarToTop_cm * pxPorCm;
  const centroArtePx = topoAlvoPx + alturaAlvoPx / 2;

  const D = 250;
  const f = (alturaAlvoPx * (D - R)) / artH_cm;
  const cy = centroArtePx - ((collarToTop_cm + artH_cm / 2) * f) / (D - R);

  return {
    params: {
      artW_cm, artH_cm, radius_cm: R, collarToTop_cm, garmentLength_cm: L,
      camera: { yaw: 0, pitch: 0, roll: 0, f, distance_cm: D, cx: centroFrac * imgW, cy },
      grid: 64,
    },
    alvo: {
      topo_pct: +((100 * topoAlvoPx) / imgH).toFixed(2),
      base_pct: +((100 * (topoAlvoPx + alturaAlvoPx)) / imgH).toFixed(2),
      altura_pontos: +((100 * alturaAlvoPx) / imgH).toFixed(2),
      raio_cm: +R.toFixed(1),
      arco_meio_rad: +(artW_cm / 2 / R).toFixed(3),
      peca_G_cm: L,
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const foto = arg("--foto");
  const [w, h] = arg("--arte-cm").split("x").map(Number);
  const meta = await sharp(foto).metadata();
  const plano = planejar({
    golaFrac: Number(arg("--gola")), barraFrac: Number(arg("--barra")),
    centroFrac: Number(arg("--centro", "0.5")),
    imgW: meta.width, imgH: meta.height, artW_cm: w, artH_cm: h, peca: arg("--peca"),
  });
  console.log(JSON.stringify(plano.alvo, null, 2));

  const arte = await chaveiaPorLuminancia(arg("--arte"));
  const base = await sharp(foto).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const bg = { data: base.data, width: base.info.width, height: base.info.height, channels: 3 };
  // opacidade < 1: tinta sobre malha nunca cobre o tecido por completo, e e o
  // que faz a estampa acompanhar a dobra em vez de parecer adesivo
  // referencia de sombreamento: luminancia mediana do tecido na regiao da arte,
  // medida antes de compor. E o "tecido neutro" contra o qual dobra e realce
  // sao julgados.
  // PLACA DE SOMBRA: luminancia do tecido ANTES de qualquer tinta, suavizada
  // por media de caixa. Suave porque a granulacao do tecido nao e sombra, e
  // multiplicar a tinta por granulacao produz franja em vez de volume.
  const plate = new Float32Array(bg.width * bg.height);
  for (let i = 0, o = 0; i < bg.width * bg.height; i += 1, o += 3) {
    plate[i] = 0.299 * bg.data[o] + 0.587 * bg.data[o + 1] + 0.114 * bg.data[o + 2];
  }
  const RB = 9;
  const suave = new Float32Array(plate.length);
  for (let y = 0; y < bg.height; y += 1) {
    for (let x = 0; x < bg.width; x += 1) {
      let s = 0, n = 0;
      for (let dy = -RB; dy <= RB; dy += 3) for (let dx = -RB; dx <= RB; dx += 3) {
        const yy = y + dy, xx = x + dx;
        if (yy < 0 || xx < 0 || yy >= bg.height || xx >= bg.width) continue;
        s += plate[yy * bg.width + xx]; n += 1;
      }
      suave[y * bg.width + x] = s / n;
    }
  }

  const amostra = [];
  for (let y = Math.round(0.42 * bg.height); y < Math.round(0.64 * bg.height); y += 3)
    for (let x = Math.round(0.42 * bg.width); x < Math.round(0.66 * bg.width); x += 3) {
      const o = (y * bg.width + x) * 3;
      amostra.push(0.299 * bg.data[o] + 0.587 * bg.data[o + 1] + 0.114 * bg.data[o + 2]);
    }
  amostra.sort((a, b) => a - b);
  const ref = Math.max(8, amostra[Math.floor(amostra.length / 2)]);
  console.log(`luminancia mediana do tecido: ${ref.toFixed(1)}`);
  compositeArt(bg, arte, plano.params, Number(arg("--opacidade", "0.93")),
    { plate: suave, ref, min: Number(arg("--sombra-min", "0.75")), max: Number(arg("--sombra-max", "1.25")) });
  await sharp(bg.data, { raw: { width: bg.width, height: bg.height, channels: 3 } })
    .png().toFile(arg("--out"));

  const { cols, rows, pts } = artMesh(plano.params);
  const i = Math.floor((cols - 1) / 2);
  const topo = pts[i], base2 = pts[(rows - 1) * cols + i];
  console.log(`\ncoluna central projetada: ${(100 * topo[1] / bg.height).toFixed(2)}% a ${(100 * base2[1] / bg.height).toFixed(2)}%`);
  console.log(`saida: ${arg("--out")}`);
}
