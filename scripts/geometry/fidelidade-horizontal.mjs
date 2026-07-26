// A CAPA CONFERE COM O PRODUTO REAL, NA HORIZONTAL?
//
// Este era o buraco. `placement_cm` (vertical) sai do mockup oficial, mas a
// LARGURA e a POSICAO horizontal da estampa nunca foram comparadas com nada:
// o compositor nunca ve um mockup, o `escala` do gate mede so altura, e o
// `aspecto` usa NCC, que e declaradamente cego para compressao. Por isso o
// desalinhamento horizontal reaparecia capa apos capa — nao havia instrumento.
//
// A PONTE ENTRE OS DOIS MUNDOS. O mockup e a peca CHAPADA; a capa e um
// cilindro fotografado. A mesma arte aparece mais estreita na capa porque
// enrola. A conversao e fechada e nao tem parametro livre:
//
//   no mockup, arte de largura w num painel plano de largura pi*R:
//       r_plano = w / (pi*R)                    =>   w = pi*R*r_plano
//   na capa, essa arte vira corda sobre a silhueta 2R:
//       r_cilindro = 2R*sin(w/2R) / (2R) = sin(w / 2R)
//   logo
//       r_cilindro_esperado = sin(pi * r_plano / 2)
//
// `r_cilindro` medido na capa e (largura projetada da malha) / (torso em px),
// os dois em pixel da mesma imagem — o torso E a silhueta do cilindro, por
// construcao de `planejar()`.
//
// O QUE ELE NAO ENXERGA, e importa:
//   - O template do mockup NAO esta em escala com a tabela. O CONCLUSOES.md de
//     26/07 registra que a largura do template da Camiseta implica ~50 cm
//     contra 54 do G. Isso e ~7% de incerteza sistematica em `r_plano`, que
//     entra inteiro aqui. Trate desvio abaixo de ~8% como empate.
//   - Onde `largura_truncada` e true, a busca de tinta do mockup bateu na
//     margem de 14% e a largura medida e um PISO. O alvo real e maior, entao
//     "estreita demais" nesses casos e ainda mais grave, e "larga demais" nao
//     pode ser concluido.
//   - Nada aqui olha fidelidade de traco, yaw ou integracao com o tecido.
//
// Uso: node scripts/geometry/fidelidade-horizontal.mjs --receita <r.json>
//      [--produto <id>]   (default: o campo `produto` da receita)

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
if (!receitaPath) { console.error("uso: --receita <capa.receita.json> [--produto <id>]"); process.exit(1); }
const rec = JSON.parse(fs.readFileSync(receitaPath, "utf8"));
const produto = arg("--produto", rec.produto);

if (!fs.existsSync(OFICIAL)) {
  console.error(`sem ${OFICIAL}. Rode antes:\n  node scripts/geometry/placement-mockup.mjs --out ${OFICIAL}`);
  process.exit(2);
}
const oficial = JSON.parse(fs.readFileSync(OFICIAL, "utf8")).find((o) => o.product_id === produto && !o.erro);
if (!oficial) {
  console.error(`produto ${produto}: leitura do mockup reprovada na sanidade — sem referencia horizontal.`);
  process.exit(2);
}
// RECUSAR e a resposta certa aqui. `largura_rel` fica null quando a peca nao
// tem painel do corpo conferido no template (Moletom Canguru e Blusao ainda
// nao tem). Inventar a referencia para poder emitir um numero e exatamente
// como nascem os defeitos que este projeto passa a vida catalogando.
if (oficial.largura_rel == null) {
  console.error(`produto ${produto} (${oficial.garment}): sem painel do corpo conferido no template. `
    + "Meca-o e preencha TEMPLATE.corpo em scripts/geometry/placement-mockup.mjs antes de usar este check.");
  process.exit(2);
}

const [aw, ah] = String(rec.arte_cm).split("x").map(Number);
const meta = await sharp(String(rec.foto).replace(/\\/g, "/")).metadata();
const plano = planejar({
  golaFrac: rec.gola, barraFrac: rec.barra, centroFrac: rec.centro ?? 0.5,
  imgW: meta.width, imgH: meta.height, artW_cm: aw, artH_cm: ah,
  peca: rec.peca, torsoFrac: rec.torso ?? null, yawDeg: rec.yaw ?? 0, placementCm: rec.placement,
});
const par = plano.params;

// Largura projetada da arte: linha do meio da malha, que e a mais larga e a
// que o olho usa para julgar.
const { cols, rows, pts } = artMesh(par);
const j = Math.floor(rows / 2);
const xs = [];
for (let i = 0; i < cols; i += 1) { const q = pts[j * cols + i]; if (q) xs.push(q[0]); }
const larguraArtePx = Math.max(...xs) - Math.min(...xs);
const centroArtePx = (Math.max(...xs) + Math.min(...xs)) / 2;

// Silhueta do cilindro em px: 2*f*R/D. E exatamente o que `--torso` informa
// quando informado, mas recalcular pela camera cobre a receita sem torso.
const torsoPx = (2 * par.camera.f * par.radius_cm) / par.camera.distance_cm;

const rCilindro = larguraArtePx / torsoPx;
const rPlano = oficial.largura_rel;
const rEsperado = Math.sin((Math.PI * rPlano) / 2);
const desvioPct = 100 * (rCilindro / rEsperado - 1);

// Posicao horizontal: o mockup diz o quanto a arte foge do eixo da peca, em
// fracao da largura da peca. Na capa, a mesma fracao vale sobre o torso.
const desvioCapa = (centroArtePx - par.camera.cx) / torsoPx;
const desvioErroPp = 100 * (desvioCapa - oficial.desvio_rel);

// Que raio faria a largura bater. Util porque `torso` e o unico botao que
// mexe nisso: w = pi*R*r_plano tem que dar corda = r_esperado*2R, ja garantido
// pela formula; o que sobra e a arte em cm nao casar com o mockup.
const arcoNecessario = Math.asin(Math.min(0.999, rEsperado));
const raioNecessario = aw / (2 * arcoNecessario);

// ~8% de folga: e a incerteza declarada do template, nao um numero escolhido.
const FOLGA_PCT = 8;
const estreita = desvioPct < -FOLGA_PCT;
const larga = desvioPct > FOLGA_PCT && !oficial.largura_truncada;
const foraDoEixo = Math.abs(desvioErroPp) > 3;

const saida = {
  receita: receitaPath, produto, peca: rec.peca,
  mockup: oficial.mockup,
  largura: {
    r_plano_mockup: rPlano,
    r_cilindro_esperado: +rEsperado.toFixed(4),
    r_cilindro_medido: +rCilindro.toFixed(4),
    desvio_pct: +desvioPct.toFixed(2),
    truncada_no_mockup: Boolean(oficial.largura_truncada),
  },
  posicao: {
    desvio_rel_mockup: oficial.desvio_rel,
    desvio_rel_capa: +desvioCapa.toFixed(4),
    erro_pp: +desvioErroPp.toFixed(2),
  },
  raio: {
    usado_cm: +par.radius_cm.toFixed(2),
    necessario_cm: +raioNecessario.toFixed(2),
    fator: +(raioNecessario / par.radius_cm).toFixed(3),
  },
  folga_pct: FOLGA_PCT,
  nota: "folga de 8% e a incerteza declarada do template do mockup (largura implica ~50 cm contra 54 do G)",
  falhas: [
    estreita ? `estampa ${Math.abs(desvioPct).toFixed(1)}% MAIS ESTREITA que o produto real` : null,
    larga ? `estampa ${desvioPct.toFixed(1)}% MAIS LARGA que o produto real` : null,
    foraDoEixo ? `estampa ${desvioErroPp.toFixed(1)} pp fora do eixo em relacao ao produto real` : null,
  ].filter(Boolean),
};
saida.veredito = saida.falhas.length ? "REPROVADO" : "APROVADO";
console.log(JSON.stringify(saida, null, 1));
process.exit(saida.falhas.length ? 1 : 0);
