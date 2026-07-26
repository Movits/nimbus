// A TINTA APARECE NO TECIDO?
//
// Varias artes existem em duas versoes de tinta, uma para peca clara e outra
// para peca escura. O sufixo do arquivo nomeia a COR DA PECA, nao a da tinta,
// e a convencao NAO e uniforme: em `B4-acima-de-tudo-gotico-branco.png` a
// tinta e preta (para a peca off-white), enquanto em
// `G6-sao-miguel-stencil-branco.png` a tinta e clara (para a peca preta).
//
// Trocar as duas produz estampa preta sobre tecido preto, quase invisivel — e
// o gate APROVA, porque fidelidade de cor e uma limitacao declarada dele.
// Aconteceu no 352720257 e so a inspecao visual pegou.
//
// Aqui isso vira numero: luminancia mediana da TINTA contra a do TECIDO. Nao
// se confia no nome do arquivo, mede-se o pixel.
import sharp from "sharp";

const LUM = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

/**
 * Luminancias dos pixels opacos de uma arte com alpha.
 *
 * Devolve a distribuicao, nao so a mediana: numa arte de meio-tom como o Sao
 * Jorge a mediana e escura (10,6) mesmo com o cavalo creme ocupando um terco
 * da tinta. Julgar pela mediana reprovava 20 capas boas.
 */
export async function luminanciaDaTinta(arte) {
  const r = await sharp(arte).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = r.info;
  const v = [];
  for (let p = 0; p < W * H; p += 1) {
    const i = p * C;
    if (r.data[i + 3] < 160) continue;          // so tinta solida
    v.push(LUM(r.data[i], r.data[i + 1], r.data[i + 2]));
  }
  if (v.length < 500) return null;
  v.sort((a, b) => a - b);
  const q = (p) => +v[Math.floor((v.length - 1) * p)].toFixed(1);
  return { mediana: q(0.5), p05: q(0.05), p95: q(0.95), valores: v, pixels: v.length };
}

/** Luminancia do tecido, amostrada FORA da area da arte mas dentro da peca. */
export async function luminanciaDoTecido(blank, { gola, barra, centro = 0.5 } = {}) {
  const r = await sharp(blank).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = r.info;
  const y0 = Math.round((gola ?? 0.3) * H) + 4;
  const y1 = Math.round((barra ?? 0.9) * H) - 4;
  const v = [];
  for (let y = y0; y < y1; y += 2) {
    for (const f of [-0.06, -0.04, 0.04, 0.06]) {   // laterais do painel, longe da arte
      const x = Math.round((centro + f) * W);
      if (x < 0 || x >= W) continue;
      const i = (y * W + x) * 3;
      v.push(LUM(r.data[i], r.data[i + 1], r.data[i + 2]));
    }
  }
  if (!v.length) return null;
  v.sort((a, b) => a - b);
  return +v[Math.floor(v.length / 2)].toFixed(1);
}

/**
 * A tinta aparece no tecido?
 *
 * A pergunta certa nao e "a tinta media contrasta", e sim QUANTA tinta
 * contrasta. Uma arte de meio-tom sobre peca preta tem metade dos pixels quase
 * pretos — invisiveis — e ainda assim se le perfeitamente, porque a outra
 * metade e creme.
 *
 * Mede-se entao a fracao de pixels de tinta que se afastam do tecido mais que
 * `nivel`. A inversao real do 352720257 (tinta preta sobre peca preta) deixava
 * praticamente NENHUM pixel contrastando; uma arte correta deixa dezenas de
 * por cento.
 */
export function avaliar({ tinta, tecido, nivel = 40, minFracao = 0.15 }) {
  const vals = tinta.valores ?? [];
  let n = 0;
  for (const v of vals) if (Math.abs(v - tecido) > nivel) n += 1;
  const fracao = vals.length ? n / vals.length : 0;
  return {
    tecido, tinta_mediana: tinta.mediana, tinta_p05: tinta.p05, tinta_p95: tinta.p95,
    fracao_contrastante: +(100 * fracao).toFixed(1),
    ok: fracao >= minFracao,
    sentido: tinta.mediana > tecido ? "tinta clara sobre tecido escuro" : "tinta escura sobre tecido claro",
  };
}
