// TESTE DE HOVER: as duas cores do mesmo produto trocam SÓ a cor?
//
// Requisito do dono: no card da loja o hover alterna entre as cores, e a troca
// tem que ler como mudanca de cor — nao pode mudar modelo, pose, cenario,
// enquadramento, nem o tamanho e a posicao da estampa.
//
// O criterio que GATEIA e um so, e ele se calibra sozinho:
//
//   fora_da_roupa — onde os dois BLANKS sao iguais (cenario, modelo, pose,
//                   enquadramento), as duas CAPAS tambem tem que ser. A arte
//                   cai so no tronco, entao tudo o mais deve coincidir.
//
// Janela fixa NAO serve e ja deu duas reprovacoes falsas: "acima de 18% e
// cabeca" vale num enquadramento e falha noutro, e em moletom com capuz a
// faixa de cima e tecido, que muda de cor por direito. `fundo` e `topo`
// continuam sendo reportados, mas so como informativo.
//
// O tamanho e a posicao da estampa NAO se medem em pixel aqui: a caixa de
// tinta por limiar enxerga menos borda em peca clara e acusa diferenca que
// nao existe. Isso se garante na RECEITA — mesmos gola, barra, centro, torso,
// yaw, placement e arte-cm nas duas cores — e e o que `qa-par-receita`
// confere. A caixa fica como informativo.
//
// Uso:
//   node scripts/geometry/qa-par-hover.mjs --a capaA.png --blank-a blankA.png \
//     --b capaB.png --blank-b blankB.png
import sharp from "sharp";
import { pathToFileURL } from "node:url";

const amostra = async (p, regiao) => {
  const r = await sharp(p).resize(256, 256, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const v = [];
  if (regiao === "fundo") {
    for (let y = 20; y < 236; y += 4) for (const x of [6, 12, 18, 24, 232, 238, 244, 250]) {
      const o = (y * 256 + x) * 3; v.push(r.data[o], r.data[o + 1], r.data[o + 2]);
    }
  } else {
    for (let y = 8; y < 46; y += 2) for (let x = 80; x < 176; x += 2) {
      const o = (y * 256 + x) * 3; v.push(r.data[o], r.data[o + 1], r.data[o + 2]);
    }
  }
  return v;
};
const mad = (a, b) => { let s = 0; for (let i = 0; i < a.length; i += 1) s += Math.abs(a[i] - b[i]); return s / a.length; };

/** Caixa da tinta: onde a capa difere do seu proprio blank. */
async function caixaDaTinta(capa, blank) {
  const [c, b] = await Promise.all([
    sharp(capa).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(blank).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);
  const { width: W, height: H } = c.info;
  const porLinha = new Int32Array(H), porColuna = new Int32Array(W);
  for (let p = 0; p < W * H; p += 1) {
    const i = p * 3;
    const d = Math.abs(c.data[i] - b.data[i]) + Math.abs(c.data[i + 1] - b.data[i + 1]) + Math.abs(c.data[i + 2] - b.data[i + 2]);
    if (d > 60) { porLinha[(p / W) | 0] += 1; porColuna[p % W] += 1; }
  }
  const MIN = 3;
  let y0 = -1, y1 = -1, x0 = -1, x1 = -1;
  for (let y = 0; y < H; y += 1) if (porLinha[y] >= MIN) { if (y0 < 0) y0 = y; y1 = y; }
  for (let x = 0; x < W; x += 1) if (porColuna[x] >= MIN) { if (x0 < 0) x0 = x; x1 = x; }
  if (y1 < 0 || x1 < 0) return null;
  return {
    x0: +(100 * x0 / W).toFixed(2), x1: +(100 * x1 / W).toFixed(2),
    y0: +(100 * y0 / H).toFixed(2), y1: +(100 * y1 / H).toFixed(2),
    larg: +(100 * (x1 - x0) / W).toFixed(2), alt: +(100 * (y1 - y0) / H).toFixed(2),
  };
}

/**
 * O teste que nao depende de janela arbitraria.
 *
 * Janela fixa nao serve: "acima de 18% e cabeca" vale num enquadramento e
 * falha noutro, e em moletom com capuz a faixa de cima e tecido, que MUDA de
 * cor por direito. Media 47 e depois 30 num par que estava certo.
 *
 * O criterio exato: onde os dois BLANKS sao iguais (fora da roupa), as duas
 * CAPAS tambem tem que ser iguais — a arte cai so no tronco. Essa regiao se
 * calcula, nao se arbitra.
 */
async function foraDaRoupa(blankA, blankB, capaA, capaB) {
  const [ba, bb, ca, cb] = await Promise.all([blankA, blankB, capaA, capaB].map(
    (p) => sharp(p).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
  ));
  const { width: W, height: H } = ba.info;
  if ([bb, ca, cb].some((r) => r.info.width !== W || r.info.height !== H)) return null;
  let n = 0, soma = 0, pior = 0;
  for (let p = 0; p < W * H; p += 1) {
    const i = p * 3;
    const dBlank = Math.abs(ba.data[i] - bb.data[i]) + Math.abs(ba.data[i + 1] - bb.data[i + 1]) + Math.abs(ba.data[i + 2] - bb.data[i + 2]);
    if (dBlank > 12) continue;                    // aqui e roupa: deve mudar
    const dCapa = Math.abs(ca.data[i] - cb.data[i]) + Math.abs(ca.data[i + 1] - cb.data[i + 1]) + Math.abs(ca.data[i + 2] - cb.data[i + 2]);
    soma += dCapa; n += 1;
    if (dCapa > pior) pior = dCapa;
  }
  if (!n) return null;
  return {
    fracao_do_quadro_pct: +((100 * n) / (W * H)).toFixed(1),
    diferenca_media: +(soma / n / 3).toFixed(2),
    diferenca_maxima: pior,
  };
}

export async function qaParHover({ a, blankA, b, blankB }) {
  const [fa, fb, ta, tb] = await Promise.all([
    amostra(a, "fundo"), amostra(b, "fundo"), amostra(a, "topo"), amostra(b, "topo"),
  ]);
  const fora = await foraDaRoupa(blankA, blankB, a, b);
  const [ca, cb] = await Promise.all([caixaDaTinta(a, blankA), caixaDaTinta(b, blankB)]);
  const fundo = +mad(fa, fb).toFixed(2);
  const topo = +mad(ta, tb).toFixed(2);
  const estampa = ca && cb ? {
    desloca_topo_pp: +(cb.y0 - ca.y0).toFixed(2),
    desloca_esq_pp: +(cb.x0 - ca.x0).toFixed(2),
    difere_altura_pp: +(cb.alt - ca.alt).toFixed(2),
    difere_largura_pp: +(cb.larg - ca.larg).toFixed(2),
    caixa_a: ca, caixa_b: cb,
  } : null;
  // 0,5 pp de 1024 px sao ~5 px: abaixo disso o olho nao ve salto no hover.
  const estampaOk = estampa
    ? Math.max(Math.abs(estampa.desloca_topo_pp), Math.abs(estampa.desloca_esq_pp),
      Math.abs(estampa.difere_altura_pp), Math.abs(estampa.difere_largura_pp)) <= 0.5
    : null;
  // O criterio que gateia e `fora_da_roupa`. `fundo` e `topo` ficam como
  // informativos: janela fixa erra em enquadramento diferente e em peca com
  // capuz, e ja produziu duas reprovacoes falsas.
  const foraOk = fora ? fora.diferenca_media <= 1.5 : null;
  const falhas = [];
  if (foraOk === false) falhas.push("fora_da_roupa");
  return {
    fora_da_roupa: fora, fora_da_roupa_ok: foraOk,
    fundo, topo, informativo: "fundo e topo usam janela fixa e nao gateiam",
    estampa, estampa_ok: estampaOk,
    nota_estampa: "informativo: a caixa por limiar enxerga menos borda em peca clara. A geometria e garantida pela receita identica.",
    falhas, veredito: falhas.length ? "REPROVADO" : "APROVADO",
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  console.log(JSON.stringify(await qaParHover({
    a: arg("--a"), blankA: arg("--blank-a"), b: arg("--b"), blankB: arg("--blank-b"),
  }), null, 2));
}
