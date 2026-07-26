// COMPRESSAO CILINDRICA MEDIDA NA MALHA, nao por correlacao.
//
// Existe para resolver o alerta de `aspecto` do gate sem rebaixar o check.
//
// O problema. O gate mede compressao pelo registro NCC, e `limites-conhecidos`
// ja declara que o NCC **nao mede compressao anisotropica de forma
// confiavel, porque ajusta escala nos dois eixos**: ele reescala a arte ate
// casar, e o encurtamento que a gente quer medir some no ajuste. Resultado
// pratico no 352725852 preta: o gate esperava 6,34%, o NCC leu 1,08% e
// levantou alerta de aspecto numa capa correta.
//
// A saida NAO e ignorar o alerta — cinco dos sete defeitos catalogados
// nasceram de rebaixar check para informativo. A saida e medir a mesma
// grandeza com um instrumento que enxergue.
//
// Como este mede. A malha da composicao E a geometria: `artMesh` devolve os
// pontos da arte ja projetados em pixel. Basta comparar a largura projetada
// da linha do meio com a largura que um painel PLANO teria na mesma camera e
// na mesma distancia (phi -> 0, z = R constante). A razao entre as duas e o
// encurtamento efetivamente aplicado. Nao ha correlacao, nao ha limiar de
// tinta, nao ha ajuste de escala: e a propria malha que sera rasterizada.
//
// Como ler o resultado. O `esperado` do gate usa so a razao corda/arco
// (`sin(t)/t`), que ignora o afastamento em profundidade das bordas. A malha
// projetada inclui esse afastamento, entao ela mede **um pouco mais** que a
// formula. Medido ABAIXO do esperado e que seria defeito: significaria arte
// chapada, sem enrolar no corpo.
//
// DUAS REFERENCIAS, e a segunda e a que decide. Comparar a malha com o arco
// da PROPRIA receita nao acusa nada quando o raio esta inflado: raio maior
// abaixa o medido e o esperado juntos, e a razao passa. Foi o que aconteceu
// na primeira versao deste script — o 352725852 v1, com `torso 0.546` e raio
// 34,8 cm, passou como "ENROLA" com 3,26% de compressao. Por isso o veredito
// usa o arco da TABELA (`R = largura_plana / pi`), que nao depende do que a
// receita chutou. O arco da receita fica como diagnostico: ele separa "a
// malha nao aplicou o que pediu" de "o que foi pedido estava errado".
//
// Uso: node scripts/geometry/compressao-malha.mjs --receita <capa.receita.json>
//      node scripts/geometry/compressao-malha.mjs --peca "..." --arte-cm LxA \
//        --gola g --barra b --centro c --torso t --placement cm --img WxH [--yaw g]

import fs from "node:fs";
import { planejar } from "../compose-art.mjs";
import { artMesh } from "./render.mjs";
import { getGarmentSpec } from "./garment-specs.mjs";
import { CANONICAL_SIZE } from "./measure.mjs";

const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i === -1 ? d : process.argv[i + 1];
};

let cfg;
const receitaPath = arg("--receita");
if (receitaPath) {
  const r = JSON.parse(fs.readFileSync(receitaPath, "utf8"));
  const [w, h] = String(r.arte_cm).split("x").map(Number);
  // A receita nao guarda as dimensoes do blank; le do proprio arquivo.
  const foto = String(r.foto).replace(/\\/g, "/");
  const sharp = (await import("sharp")).default;
  const meta = await sharp(foto).metadata();
  cfg = { peca: r.peca, artW_cm: w, artH_cm: h, gola: r.gola, barra: r.barra,
    centro: r.centro ?? 0.5, torso: r.torso ?? null, placement: r.placement,
    imgW: meta.width, imgH: meta.height, yaw: r.yaw ?? 0, rotulo: receitaPath };
} else {
  const [w, h] = String(arg("--arte-cm")).split("x").map(Number);
  const [iw, ih] = String(arg("--img", "1024x1024")).split("x").map(Number);
  cfg = { peca: arg("--peca"), artW_cm: w, artH_cm: h,
    gola: Number(arg("--gola")), barra: Number(arg("--barra")),
    centro: Number(arg("--centro", "0.5")),
    torso: arg("--torso") ? Number(arg("--torso")) : null,
    placement: Number(arg("--placement")), imgW: iw, imgH: ih,
    yaw: Number(arg("--yaw", "0")), rotulo: "linha de comando" };
}

const plano = planejar({
  golaFrac: cfg.gola, barraFrac: cfg.barra, centroFrac: cfg.centro,
  imgW: cfg.imgW, imgH: cfg.imgH, artW_cm: cfg.artW_cm, artH_cm: cfg.artH_cm,
  peca: cfg.peca, torsoFrac: cfg.torso, yawDeg: cfg.yaw, placementCm: cfg.placement,
});
const par = plano.params;
const { cols, rows, pts } = artMesh(par);

// Linha do meio da malha: a mais larga, e a que o olho usa para julgar.
const j = Math.floor(rows / 2);
const xs = [];
for (let i = 0; i < cols; i += 1) {
  const q = pts[j * cols + i];
  if (q) xs.push(q[0]);
}
if (xs.length < 2) {
  console.error("malha vazia: verifique gola/barra/placement");
  process.exit(2);
}
const largReal = Math.max(...xs) - Math.min(...xs);

// Painel PLANO equivalente: mesma camera, mesma profundidade do eixo.
const largPlana = (par.camera.f * par.artW_cm) / (par.camera.distance_cm - par.radius_cm);

const medida = 100 * (1 - largReal / largPlana);
const encurtamento = (raio) => {
  const t = par.artW_cm / 2 / raio;
  return { arco: +t.toFixed(3), pct: +(100 * (1 - Math.sin(t) / t)).toFixed(2) };
};

// Diagnostico: o arco que a propria receita pediu.
const daReceita = encurtamento(par.radius_cm);

// VEREDITO: o arco que a peca de verdade tem, pela tabela. Nao depende do
// `torso` que a receita chutou, e por isso e o unico que acusa raio inflado.
const spec = getGarmentSpec(cfg.peca);
const raioTabela = spec.sizes.find((s) => s.size === CANONICAL_SIZE).width_cm / Math.PI;
const daTabela = encurtamento(raioTabela);

// Defeito e comprimir MENOS que o previsto (arte chapada sobre o corpo).
// Comprimir um pouco mais e o afastamento das bordas em profundidade, que a
// formula corda/arco nao modela. Folga de 1,5 pp para os dois lados do ruido.
const chapada = medida < daTabela.pct - 1.5;

const saida = {
  rotulo: cfg.rotulo,
  peca: cfg.peca,
  raio_receita_cm: +par.radius_cm.toFixed(2),
  raio_tabela_cm: +raioTabela.toFixed(2),
  inflacao: +(par.radius_cm / raioTabela).toFixed(3),
  largura_malha_px: +largReal.toFixed(1),
  largura_plana_px: +largPlana.toFixed(1),
  compressao_medida_pct: +medida.toFixed(2),
  // o que decide
  compressao_esperada_tabela_pct: daTabela.pct,
  arco_tabela_rad: daTabela.arco,
  // diagnostico: separa "a malha falhou" de "o pedido estava errado"
  compressao_esperada_receita_pct: daReceita.pct,
  arco_receita_rad: daReceita.arco,
  malha_cumpriu_o_pedido: medida >= daReceita.pct - 1.5,
  chapada,
  veredito: chapada ? "CHAPADA" : "ENROLA",
  instrumento: "malha projetada (artMesh), sem correlacao e sem limiar de tinta",
  nota: "veredito contra o arco da TABELA; contra o arco da receita nao acusa raio inflado, porque medido e esperado caem juntos",
};
console.log(JSON.stringify(saida, null, 1));
process.exit(chapada ? 1 : 0);
