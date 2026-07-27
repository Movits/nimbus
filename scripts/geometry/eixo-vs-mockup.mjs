// A ESTAMPA CAI NO MESMO LUGAR DA PECA, NA CAPA E NO MOCKUP?
//
// Este script existe porque o check de posicao do `fidelidade-horizontal` e
// CEGO, e cego do jeito classico deste projeto: ele mede o centro da arte
// contra `camera.cx`, que e o eixo que a propria receita informou. Isso da
// zero por construcao — a arte esta sempre centrada no eixo que voce mandou.
// Ele nunca olha onde a estampa cai em relacao a ROUPA, entao um `centro`
// errado passa despercebido. Foi o dono que viu, no olho, que as estampas
// estavam para a direita.
//
// O que este mede, e e o que o dono descreveu: as BORDAS. Em cada lado,
//
//     esquerda = (arte_x0 - peca_x0) / largura_da_peca
//     direita  = (peca_x1 - arte_x1) / largura_da_peca
//
// e a diferenca entre esses dois numeros diz para que lado a estampa foge. No
// mockup a peca sai do painel do corpo do template; na capa, das bordas
// medidas na propria imagem, que e o unico jeito de nao voltar a comparar o
// eixo consigo mesmo.
//
// As bordas da capa NAO sao segmentadas: elas vem de `--peca-x0/--peca-x1`,
// lidos no olho com `scripts/geometry/grade.mjs`. Fundo de foto lifestyle e
// grafite e azulejo, e um segmentador ali erraria calado — que e pior do que
// pedir o numero.
//
// Uso: node scripts/geometry/eixo-vs-mockup.mjs --receita <r.json>
//        --peca-x0 <frac> --peca-x1 <frac>

import fs from "node:fs";
import sharp from "sharp";
import { planejar } from "../compose-art.mjs";
import { artMesh } from "./render.mjs";

const OFICIAL = "nuvemshop/auditoria/2026-07-26-datum-mockups/horizontal-oficial.json";
const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i === -1 ? d : process.argv[i + 1];
};

const receitaPath = arg("--receita");
const pecaX0 = Number(arg("--peca-x0"));
const pecaX1 = Number(arg("--peca-x1"));
if (!receitaPath || !(pecaX1 > pecaX0)) {
  console.error("uso: --receita <r.json> --peca-x0 <frac> --peca-x1 <frac>");
  process.exit(1);
}
const rec = JSON.parse(fs.readFileSync(receitaPath, "utf8"));
const of = JSON.parse(fs.readFileSync(OFICIAL, "utf8")).find((o) => o.product_id === rec.produto && !o.erro);
if (!of || of.corpo_x0_px == null) {
  console.error(`produto ${rec.produto}: mockup sem painel do corpo conferido`);
  process.exit(2);
}

const [aw, ah] = String(rec.arte_cm).split("x").map(Number);
const meta = await sharp(String(rec.foto).replace(/\\/g, "/")).metadata();
const plano = planejar({
  golaFrac: rec.gola, barraFrac: rec.barra, centroFrac: rec.centro ?? 0.5,
  imgW: meta.width, imgH: meta.height, artW_cm: aw, artH_cm: ah,
  peca: rec.peca, torsoFrac: rec.torso ?? null, yawDeg: rec.yaw ?? 0, placementCm: rec.placement,
});

// Bordas da arte na capa: a linha mais larga da malha projetada.
const { cols, rows, pts } = artMesh(plano.params);
const j = Math.floor(rows / 2);
const xs = [];
for (let i = 0; i < cols; i += 1) { const q = pts[j * cols + i]; if (q) xs.push(q[0]); }
const arteX0 = Math.min(...xs) / meta.width;
const arteX1 = Math.max(...xs) / meta.width;

const lado = (px0, px1, ax0, ax1) => {
  const L = px1 - px0;
  return { esq: (ax0 - px0) / L, dir: (px1 - ax1) / L, folga_arte: (ax1 - ax0) / L };
};
const capa = lado(pecaX0, pecaX1, arteX0, arteX1);
const mock = lado(of.corpo_x0_px, of.corpo_x1_px, of.tinta_x0_px, of.tinta_x1_px);

// Assimetria: positivo = mais folga a esquerda que a direita, ou seja a
// estampa esta deslocada para a DIREITA.
const assimCapa = capa.esq - capa.dir;
const assimMock = mock.esq - mock.dir;
const erroPp = 100 * (assimCapa - assimMock);

// Em cm, para o numero significar alguma coisa fora da tela. A largura da peca
// na capa e a silhueta do cilindro, 2R.
const deslocCm = (erroPp / 100) * (2 * plano.params.radius_cm) / 2;

const FOLGA_PP = 2.5;
const saida = {
  produto: rec.produto, peca: rec.peca, receita: receitaPath, mockup: of.mockup,
  mockup_folgas: { esq: +mock.esq.toFixed(4), dir: +mock.dir.toFixed(4), arte: +mock.folga_arte.toFixed(4) },
  capa_folgas: { esq: +capa.esq.toFixed(4), dir: +capa.dir.toFixed(4), arte: +capa.folga_arte.toFixed(4) },
  assimetria_mockup_pp: +(100 * assimMock).toFixed(2),
  assimetria_capa_pp: +(100 * assimCapa).toFixed(2),
  erro_pp: +erroPp.toFixed(2),
  desloca_para: erroPp > 0 ? "DIREITA" : "ESQUERDA",
  desloc_cm: +Math.abs(deslocCm).toFixed(2),
  centro_usado: rec.centro,
  centro_que_alinharia: +((rec.centro ?? 0.5) - (erroPp / 100) * (pecaX1 - pecaX0) / 2).toFixed(4),
  folga_pp: FOLGA_PP,
  nota: "assimetria = folga esquerda menos folga direita, em fracao da largura da peca; "
    + "positivo = estampa deslocada para a direita",
};
saida.veredito = Math.abs(erroPp) > FOLGA_PP ? "REPROVADO" : "APROVADO";
console.log(JSON.stringify(saida, null, 1));
process.exit(saida.veredito === "REPROVADO" ? 1 : 0);
