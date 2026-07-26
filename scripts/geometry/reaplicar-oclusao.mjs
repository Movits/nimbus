// REAPLICA a oclusao de capuz numa recomposicao, sem precisar do poligono.
//
// Por que existe: `compose-occlude.mjs` recebe um poligono desenhado a mao, e
// esse poligono nao fica guardado em lugar nenhum. Quando a tabela de
// placement foi corrigida em 26/07, isso impedia recompor qualquer capa de
// moletom com capuz: recompor perderia o capuz por cima da arte.
//
// A mascara e recuperavel do par que ja existe. A oclusao devolve pixels do
// BLANK por cima da composicao, entao:
//
//     capuz = pixels onde `semcapuz` difere do blank (tinta)
//             MAS `final` e igual ao blank (tinta removida)
//
// Como o blank nao muda entre recomposicoes e o capuz e do blank, a mascara
// vale igual para a composicao nova.
//
// Uso:
//   node scripts/geometry/reaplicar-oclusao.mjs \
//     --blank <blank.png> --semcapuz-antigo <v1-semcapuz.png> --final-antigo <v1.png> \
//     --semcapuz-novo <v2-semcapuz.png> --out <v2.png> [--feather 2]
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath, pathToFileURL } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

async function cru(p) {
  return sharp(p).removeAlpha().raw().toBuffer({ resolveWithObject: true });
}

export async function reaplicarOclusao({ blank, semCapuzAntigo, finalAntigo, semCapuzNovo, out, feather = 2 }) {
  const [b, sa, fa, sn] = await Promise.all([cru(blank), cru(semCapuzAntigo), cru(finalAntigo), cru(semCapuzNovo)]);
  const { width: W, height: H } = b.info;
  for (const [nome, r] of [["semcapuz antigo", sa], ["final antigo", fa], ["semcapuz novo", sn]]) {
    if (r.info.width !== W || r.info.height !== H) {
      throw new Error(`${nome} tem ${r.info.width}x${r.info.height}, blank tem ${W}x${H}`);
    }
  }

  const d = (x, y, i) => Math.abs(x.data[i] - y.data[i]) + Math.abs(x.data[i + 1] - y.data[i + 1]) + Math.abs(x.data[i + 2] - y.data[i + 2]);
  const TINTA = 24;   // diferenca minima para dizer "aqui havia tinta"
  const IGUAL = 10;   // diferenca maxima para dizer "aqui voltou a ser blank"

  const mascara = Buffer.alloc(W * H);
  let n = 0;
  for (let p = 0; p < W * H; p += 1) {
    const i = p * 3;
    if (d(sa, b, i) > TINTA && d(fa, b, i) < IGUAL) { mascara[p] = 255; n += 1; }
  }
  if (n < 50) throw new Error(`mascara de capuz vazia (${n} px): o par antigo nao parece ter oclusao`);

  // Suavizar a borda: sem isso a costura fica em degrau de 1 px.
  //
  // CUIDADO: sharp promove um raw de 1 canal para sRGB, e `.raw().toBuffer()`
  // devolve 3 CANAIS. Indexar por `suave[p]` le o byte errado — na pratica uma
  // versao esticada da mascara, comprimida no terco de cima da imagem. Como o
  // capuz FICA no terco de cima, o resultado parecia certo no olho e estava
  // errado no pixel. Ler o stride real.
  const bl = await sharp(mascara, { raw: { width: W, height: H, channels: 1 } })
    .blur(Math.max(0.4, feather)).raw().toBuffer({ resolveWithObject: true });
  const passo = bl.info.channels;
  const suave = bl.data;

  const saida = Buffer.from(sn.data);
  for (let p = 0; p < W * H; p += 1) {
    const a = suave[p * passo] / 255;
    if (a <= 0.002) continue;
    const i = p * 3;
    for (let c = 0; c < 3; c += 1) saida[i + c] = Math.round(sn.data[i + c] * (1 - a) + b.data[i + c] * a);
  }
  await sharp(saida, { raw: { width: W, height: H, channels: 3 } }).png().toFile(out);
  return { out, pixels_capuz: n, fracao_pct: +((100 * n) / (W * H)).toFixed(3), feather };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  const r = await reaplicarOclusao({
    blank: arg("--blank"), semCapuzAntigo: arg("--semcapuz-antigo"), finalAntigo: arg("--final-antigo"),
    semCapuzNovo: arg("--semcapuz-novo"), out: arg("--out"), feather: Number(arg("--feather", "2")),
  });
  console.log(JSON.stringify(r, null, 2));
}

export { RAIZ };
