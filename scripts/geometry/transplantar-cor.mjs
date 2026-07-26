// PAR DE COR PARA O HOVER: a mesma foto, só que na outra cor.
//
// O card da loja troca a capa no hover entre as cores. Para isso ler como
// TROCA DE COR e nao como outra foto, as duas imagens precisam estar alinhadas:
// mesmo modelo, mesma pose, mesmo enquadramento, mesma luz. Gerar cada cor por
// IA nao garante isso — mesmo com a primeira servindo de referencia, sempre
// sobra deslocamento.
//
// A saida: se as duas geracoes ja sao quase iguais, a diferenca entre elas E a
// peca. Entao monta-se a segunda cor como "a PRIMEIRA imagem, com os pixels da
// peca vindos da segunda". Fora da roupa o resultado fica pixel a pixel igual
// ao primeiro, e o hover troca so a cor.
//
// Uso:
//   node scripts/geometry/transplantar-cor.mjs --base <corA.png> --doador <corB.png> \
//     --out <corB-alinhada.png> [--limiar 26] [--feather 1.5] [--relatorio]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { pathToFileURL } from "node:url";

const cru = (p) => sharp(p).removeAlpha().raw().toBuffer({ resolveWithObject: true });

/** Maior componente conexa da mascara, para descartar respingo de ruido. */
function maiorComponente(m, W, H) {
  const visto = new Uint8Array(W * H);
  let melhor = null;
  const fila = new Int32Array(W * H);
  for (let s = 0; s < W * H; s += 1) {
    if (!m[s] || visto[s]) continue;
    let ini = 0, fim = 0;
    fila[fim += 1] = s; visto[s] = 1;
    const membros = [];
    while (ini < fim) {
      const p = fila[ini += 1 - 1]; ini += 1;
      membros.push(p);
      const x = p % W, y = (p / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const q = ny * W + nx;
        if (m[q] && !visto[q]) { visto[q] = 1; fila[fim += 1] = q; }
      }
    }
    if (!melhor || membros.length > melhor.length) melhor = membros;
  }
  return melhor ?? [];
}

export async function transplantarCor({ base, doador, out, limiar = 26, feather = 1.5 }) {
  const [a, b] = await Promise.all([cru(base), cru(doador)]);
  const { width: W, height: H } = a.info;
  if (b.info.width !== W || b.info.height !== H) {
    throw new Error(`tamanhos diferentes: base ${W}x${H}, doador ${b.info.width}x${b.info.height}`);
  }

  const bruta = new Uint8Array(W * H);
  let n = 0;
  for (let p = 0; p < W * H; p += 1) {
    const i = p * 3;
    const d = Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]);
    if (d > limiar) { bruta[p] = 1; n += 1; }
  }
  const fracBruta = n / (W * H);

  // A peca e uma regiao unica e grande. Ficar com a maior componente descarta
  // o halo de deslocamento nas bordas do corpo e o ruido do fundo.
  const comp = maiorComponente(bruta, W, H);
  const mascara = Buffer.alloc(W * H);
  for (const p of comp) mascara[p] = 255;

  const suave = await sharp(mascara, { raw: { width: W, height: H, channels: 1 } })
    .blur(Math.max(0.3, feather)).raw().toBuffer();

  const saida = Buffer.from(a.data);
  for (let p = 0; p < W * H; p += 1) {
    const w = suave[p] / 255;
    if (w <= 0.002) continue;
    const i = p * 3;
    for (let c = 0; c < 3; c += 1) saida[i + c] = Math.round(a.data[i + c] * (1 - w) + b.data[i + c] * w);
  }
  await sharp(saida, { raw: { width: W, height: H, channels: 3 } }).png().toFile(out);

  // Quanto do quadro ficou IDENTICO a base: e isso que o hover preserva.
  let iguais = 0;
  for (let p = 0; p < W * H; p += 1) if (suave[p] <= 0.5) iguais += 1;
  return {
    out,
    frac_diferente_bruta_pct: +(100 * fracBruta).toFixed(2),
    frac_peca_pct: +((100 * comp.length) / (W * H)).toFixed(2),
    frac_identica_a_base_pct: +((100 * iguais) / (W * H)).toFixed(2),
    limiar, feather,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  const r = await transplantarCor({
    base: arg("--base"), doador: arg("--doador"), out: arg("--out"),
    limiar: Number(arg("--limiar", "26")), feather: Number(arg("--feather", "1.5")),
  });
  console.log(JSON.stringify(r, null, 2));
}
