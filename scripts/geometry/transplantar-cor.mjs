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
//     --out <corB-alinhada.png> [--limiar 26] [--feather 1.5] [--corte-ombro]
//
// SOBRE `--corte-ombro`, e por que ele e OPT-IN.
//
// O corte existe porque as duas geracoes tambem diferem no CABELO, e essa
// diferenca encosta na peca pelo pescoco: a maior componente conexa vira um
// blob de cabeca+roupa e o transplante troca a cabeca junto (352618935, com
// fundo identico e topo divergindo 47,4).
//
// Mas ele erra na direcao oposta com a mesma facilidade: no 352721477 a gola
// fica ACIMA da linha de corte, ficou fora da mascara, e a camiseta branca
// herdou a GOLA PRETA da base, com uma linha dura no ponto do corte. Em peca
// com capuz o estrago e maior — o capuz inteiro sai da cor errada.
//
// O padrao e DESLIGADO porque as duas falhas nao sao igualmente detectaveis:
//   - cabeca trocada  -> `qa-par-hover` PEGA (a cabeca cai fora da roupa)
//   - gola/capuz da cor errada -> `qa-par-hover` NAO pega (e roupa, e a regiao
//     que o teste exclui de proposito)
// Entre duas falhas, o padrao fica na que o instrumento enxerga.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { pathToFileURL } from "node:url";

const cru = (p) => sharp(p).removeAlpha().raw().toBuffer({ resolveWithObject: true });

/** Maior componente conexa da mascara, para descartar respingo de ruido. */
function maiorComponente(m, W, H) {
  const visto = new Uint8Array(W * H);
  const fila = new Int32Array(W * H);
  let melhor = null;
  for (let s = 0; s < W * H; s += 1) {
    if (!m[s] || visto[s]) continue;
    let ini = 0, fim = 0;
    fila[fim] = s; fim += 1; visto[s] = 1;
    const membros = [];
    while (ini < fim) {
      const p = fila[ini]; ini += 1;
      membros.push(p);
      const x = p % W, y = (p / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const q = ny * W + nx;
        if (m[q] && !visto[q]) { visto[q] = 1; fila[fim] = q; fim += 1; }
      }
    }
    if (!melhor || membros.length > melhor.length) melhor = membros;
  }
  return melhor ?? [];
}

export async function transplantarCor({ base, doador, out, limiar = 26, feather = 1.5, corteOmbro = false }) {
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

  // CORTAR O QUE ESTA ACIMA DOS OMBROS.
  //
  // As duas geracoes diferem tambem no CABELO, e essa diferenca encosta na
  // peca pelo pescoco — entao a "maior componente" engole cabeca e roupa num
  // blob so, e o transplante troca a cabeca junto. Foi o que aconteceu no
  // 352618935: fundo ficou identico (0,0) e o topo divergiu 47,4.
  //
  // A peca e LARGA e a cabeca e ESTREITA. Descendo da linha mais larga da
  // mascara para cima, corta-se onde a largura cai abaixo de 45% do maximo:
  // esse degrau e o ombro.
  //
  // ⚠️ NAO SERVE PARA PECA COM CAPUZ (`corteOmbro: false`, `--sem-corte-ombro`).
  // A heuristica assume que tudo estreito acima do ombro e CABECA. Num moletom
  // canguru o CAPUZ e peca, fica acima da linha do ombro e e mais estreito que
  // o tronco — entao o corte apaga justamente o capuz. Medido no 352619175:
  // corte em 27,8% da altura, capuz do doador descartado, e a saida ficou com
  // o capuz PRETO sobre um corpo BRANCO, com uma linha horizontal dura no
  // ponto do corte. Para peca com capuz o corte tem que ser desligado; o risco
  // que ele cobre (cabelo divergente entrar na mascara) deve ser conferido
  // pela sonda de cabeca antes, e nao presumido.
  const largura = new Int32Array(H);
  let corte = 0;
  let cortados = 0;
  if (corteOmbro) {
    for (let y = 0; y < H; y += 1) {
      let x0 = -1, x1 = -1;
      for (let x = 0; x < W; x += 1) if (mascara[y * W + x]) { if (x0 < 0) x0 = x; x1 = x; }
      largura[y] = x1 < 0 ? 0 : x1 - x0 + 1;
    }
    let yMax = 0;
    for (let y = 1; y < H; y += 1) if (largura[y] > largura[yMax]) yMax = y;
    for (let y = yMax; y >= 0; y -= 1) {
      if (largura[y] < 0.45 * largura[yMax]) { corte = y; break; }
    }
    for (let y = 0; y <= corte; y += 1) {
      for (let x = 0; x < W; x += 1) if (mascara[y * W + x]) { mascara[y * W + x] = 0; cortados += 1; }
    }
  }

  // CUIDADO: sharp promove um raw de 1 canal para sRGB, e `.raw().toBuffer()`
  // devolve 3 canais. Indexar por `suave[p]` lia o byte errado e o resultado
  // saia IDENTICO a base — o transplante nao acontecia. Ler o stride real.
  const bl = await sharp(mascara, { raw: { width: W, height: H, channels: 1 } })
    .blur(Math.max(0.3, feather)).raw().toBuffer({ resolveWithObject: true });
  const passo = bl.info.channels;
  const suave = bl.data;

  const saida = Buffer.from(a.data);
  for (let p = 0; p < W * H; p += 1) {
    const w = suave[p * passo] / 255;
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
    frac_peca_pct: +((100 * (comp.length - cortados)) / (W * H)).toFixed(2),
    corte_ombro: corteOmbro,
    px_cortados_acima_do_ombro: cortados,
    linha_de_corte_pct: corteOmbro ? +((100 * corte) / H).toFixed(2) : null,
    frac_identica_a_base_pct: +((100 * iguais) / (W * H)).toFixed(2),
    limiar, feather,
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  const r = await transplantarCor({
    base: arg("--base"), doador: arg("--doador"), out: arg("--out"),
    limiar: Number(arg("--limiar", "26")), feather: Number(arg("--feather", "1.5")),
    // Peca com capuz: o capuz e peca acima da linha do ombro e o corte o come.
    corteOmbro: process.argv.includes("--corte-ombro"),
  });
  console.log(JSON.stringify(r, null, 2));
}
