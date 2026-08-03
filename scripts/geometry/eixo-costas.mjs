// APOSENTADO em 03/08/2026. O ESTADO registrava a suspeita "consertar ou
// aposentar": este medidor leu o tronco pela metade em peça preta e nenhum
// script o importa. O eixo se mede por leitura visual dos vincos de cava
// (docs/verdades/limites-conhecidos.md). Guardado como referência do método.
//
// ONDE FICA O EIXO DO PAINEL DAS COSTAS.
//
// A estampa tem que ficar centrada NO PAINEL, nao no meio da imagem nem no
// meio da silhueta. Silhueta inclui manga e braco, e em pose 3/4 ela e
// assimetrica — usar o meio dela joga a arte para o lado, que foi a
// reclamacao do dono nas 77 capas ("a arte esta na direita, torta, nao e fiel
// ao produto").
//
// O gate tinha um check de centro, mas eu o rebaixei para informativo
// justamente porque ele usava a silhueta e dava alarme falso. Rebaixar o check
// em vez de consertar a medida foi o erro: o alarme era verdadeiro em varias
// capas e passou a ser ignorado por todos os agentes.
//
// Aqui o eixo sai do TRONCO, medido na faixa de altura da propria arte,
// pegando a corrida contigua de tecido que contem o centro do corpo e parando
// nos vincos de cava — nao nas bordas externas das mangas.
import sharp from "sharp";

const LUM = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

/**
 * @param blank  foto da peca sem estampa
 * @param faixa  {y0, y1} em fracao da altura: onde a arte cai
 * @returns {{eixo_pct, esquerda_pct, direita_pct, largura_pct, linhas}}
 */
export async function eixoDoPainel(blank, { y0 = 0.4, y1 = 0.7 } = {}) {
  const r = await sharp(blank).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = r.info;
  const lum = new Float32Array(W * H);
  for (let p = 0; p < W * H; p += 1) lum[p] = LUM(r.data, p * 3);

  const linhas = [];
  const yi = Math.max(1, Math.round(y0 * H)), yf = Math.min(H - 2, Math.round(y1 * H));
  for (let y = yi; y <= yf; y += Math.max(1, Math.round((yf - yi) / 40))) {
    // tom do tecido: mediana da faixa central da linha
    const meio = [];
    for (let x = Math.round(0.35 * W); x < Math.round(0.65 * W); x += 1) meio.push(lum[y * W + x]);
    meio.sort((a, b) => a - b);
    const tom = meio[Math.floor(meio.length / 2)];
    // tolerancia proporcional ao tom: em peca preta a variacao absoluta e menor
    const tol = Math.max(14, tom * 0.42);
    const ehTecido = (x) => Math.abs(lum[y * W + x] - tom) <= tol;
    // corrida contigua que contem o centro
    const cx = Math.round(0.5 * W);
    if (!ehTecido(cx)) continue;
    let e = cx, d = cx;
    while (e > 1 && ehTecido(e - 1)) e -= 1;
    while (d < W - 2 && ehTecido(d + 1)) d += 1;
    if (d - e < 0.12 * W) continue;
    linhas.push({ y: y / H, e: e / W, d: d / W, meio: (e + d) / (2 * W) });
  }
  if (linhas.length < 4) return null;
  const med = (v) => { const s = v.slice().sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
  const eixo = med(linhas.map((l) => l.meio));
  return {
    eixo_pct: +(100 * eixo).toFixed(2),
    esquerda_pct: +(100 * med(linhas.map((l) => l.e))).toFixed(2),
    direita_pct: +(100 * med(linhas.map((l) => l.d))).toFixed(2),
    largura_pct: +(100 * (med(linhas.map((l) => l.d)) - med(linhas.map((l) => l.e)))).toFixed(2),
    linhas: linhas.length,
  };
}

/**
 * A arte esta centrada no painel?
 *
 * Tolerancia em FRACAO DA LARGURA DO PAINEL, nao da imagem: 4% da largura do
 * tronco e o quanto o olho aceita antes de ler "torta".
 */
export function avaliarCentro({ eixo_pct, largura_pct }, centroArte_pct, { tolFracao = 0.04 } = {}) {
  const desvio = centroArte_pct - eixo_pct;
  const tol = largura_pct * tolFracao;
  return {
    eixo_painel_pct: eixo_pct,
    centro_arte_pct: +centroArte_pct.toFixed(2),
    desvio_pp: +desvio.toFixed(2),
    desvio_em_larguras_pct: +((100 * desvio) / largura_pct).toFixed(1),
    tolerancia_pp: +tol.toFixed(2),
    ok: Math.abs(desvio) <= tol,
    nota: "eixo medido no TRONCO na altura da arte, parando nos vincos de cava. "
      + "Silhueta inteira inclui manga e braco e em pose 3/4 joga o eixo para o lado.",
  };
}
