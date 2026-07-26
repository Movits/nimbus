// A ESTAMPA PARECE PARTE DA ROUPA, OU PARECE COLADA?
//
// Todos os checks do gate mediam GEOMETRIA (escala, posicao, confinamento) e
// nenhum media INTEGRACAO. Uma arte pode estar no tamanho e no lugar exatos e
// ainda assim ler como PNG colado, porque o tecido tem dobras e sombra e a
// tinta nao acompanha.
//
// O que se mede: a arte composta deveria herdar a MODULACAO do tecido. Se o
// blank tem uma dobra que escurece 15 niveis naquela faixa, a tinta ali
// tambem tem que escurecer. Isso e correlacao entre:
//
//   sombra do tecido  = luminancia do BLANK na regiao da arte, sem a media
//   sombra da tinta   = luminancia da COMPOSTA na mesma regiao, sem a media
//
// Correlacao alta = a tinta segue o pano. Correlacao perto de zero = adesivo.
//
// A causa provavel de correlacao baixa e o clamp de sombra: apertar
// --sombra-min/max para 0,9-1,12 (feito para matar faixa fantasma em tecido
// escuro) limita a modulacao a +-12%, e em tecido com dobra forte isso achata
// a arte.
import sharp from "sharp";
import { pathToFileURL } from "node:url";

const LUM = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

export async function integracaoTecido({ blank, composta, limiarTinta = 38 }) {
  const [b, c] = await Promise.all([blank, composta].map(
    (p) => sharp(p).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
  ));
  const { width: W, height: H } = b.info;
  if (c.info.width !== W || c.info.height !== H) throw new Error("tamanhos diferentes");

  // pixels de tinta: onde a composta difere do blank
  const idx = [];
  for (let p = 0; p < W * H; p += 1) {
    const i = p * 3;
    const d = Math.abs(b.data[i] - c.data[i]) + Math.abs(b.data[i + 1] - c.data[i + 1]) + Math.abs(b.data[i + 2] - c.data[i + 2]);
    if (d > limiarTinta) idx.push(p);
  }
  if (idx.length < 500) return null;

  // A comparacao tem que ser LOCAL: a arte tem desenho proprio, entao a
  // luminancia bruta dela nao correlaciona com o pano. O que correlaciona e a
  // variacao de BAIXA frequencia — a sombra. Subtrai-se de cada uma a propria
  // media num bloco grande.
  const BL = 48;
  const blocos = new Map();
  for (const p of idx) {
    const k = `${Math.floor((p % W) / BL)},${Math.floor(((p / W) | 0) / BL)}`;
    if (!blocos.has(k)) blocos.set(k, []);
    blocos.get(k).push(p);
  }
  const pares = [];
  for (const [, ps] of blocos) {
    if (ps.length < 60) continue;
    let sb = 0, sc = 0;
    for (const p of ps) { sb += LUM(b.data, p * 3); sc += LUM(c.data, p * 3); }
    pares.push({ tecido: sb / ps.length, tinta: sc / ps.length, n: ps.length });
  }
  if (pares.length < 6) return null;

  const mb = pares.reduce((s, x) => s + x.tecido, 0) / pares.length;
  const mc = pares.reduce((s, x) => s + x.tinta, 0) / pares.length;
  let num = 0, db = 0, dc = 0;
  for (const x of pares) {
    const u = x.tecido - mb, v = x.tinta - mc;
    num += u * v; db += u * u; dc += v * v;
  }
  const r = db > 0 && dc > 0 ? num / Math.sqrt(db * dc) : 0;
  // amplitude: quanto a sombra do tecido chega a mexer na tinta
  const ganho = db > 0 ? num / db : 0;
  return {
    blocos: pares.length,
    correlacao: +r.toFixed(3),
    ganho: +ganho.toFixed(3),
    amplitude_tecido: +Math.sqrt(db / pares.length).toFixed(2),
    amplitude_tinta: +Math.sqrt(dc / pares.length).toFixed(2),
    // ganho perto de 1 = a tinta escurece tanto quanto o pano. Perto de 0 =
    // adesivo. O clamp de sombra limita isso por construcao.
    ok: r >= 0.5 && ganho >= 0.35,
    nota: "correlacao entre a sombra do tecido e a da tinta, em blocos de 48 px. "
      + "Baixa = a estampa nao acompanha as dobras e le como PNG colado.",
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  console.log(JSON.stringify(await integracaoTecido({ blank: arg("--blank"), composta: arg("--composta") }), null, 2));
}
