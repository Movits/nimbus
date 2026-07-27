// A CAPA CONFERE COM O PRODUTO REAL, NA HORIZONTAL?
//
// Este era o buraco. `placement_cm` (vertical) sai do mockup oficial, mas a
// LARGURA e a POSICAO horizontal da estampa nunca foram comparadas com nada:
// o compositor nunca ve um mockup, o `escala` do gate mede so altura, e o
// `aspecto` usa NCC, que e declaradamente cego para compressao. Por isso o
// desalinhamento horizontal reaparecia capa apos capa — nao havia instrumento.
//
// O QUE ELE VERIFICA, E O QUE NAO DA PARA VERIFICAR.
//
// VEREDITO: a POSICAO. O mockup diz o quanto a estampa foge do eixo do corpo,
// em fracao da largura do corpo. Isso e adimensional, nao depende do caimento
// nem da escala do template, e transfere direto para a capa.
//
// INFORMATIVO: a LARGURA. Ela nao tem alvo unico, e isso e conclusao e nao
// desistencia. A largura projetada depende de quao chapado o tecido cai — que
// e exatamente a incognita que `--torso` mede na foto. Os dois extremos:
//     cilindro justo:  razao = sin(w / 2*R_tabela)
//     peca chapada:    razao = w / (pi*R_tabela)
// O mockup e o caso chapado; a capa e um ponto entre os dois. Comparar a capa
// com o cilindro justo nao mede erro, mede caimento — e foi assim que uma
// versao anterior deste script pediu raio 17,3 cm num Oversized cujo raio de
// tabela e 21,0, coisa que `planejar()` nunca faz.
//
// A saida traz os dois extremos e onde a capa caiu entre eles, para quem le
// poder situar o numero em vez de receber um "-19%" sem referencia.
//
// O QUE ELE NAO ENXERGA: fidelidade de traco, sinal do yaw e integracao com o
// tecido. E ele depende de `TEMPLATE.corpo`, que so existe para Camiseta
// Premium e Oversized; nas outras pecas ele RECUSA em vez de estimar.
//
// Uso: node scripts/geometry/fidelidade-horizontal.mjs --receita <r.json>
//      [--produto <id>]   (default: o campo `produto` da receita)

import fs from "node:fs";
import sharp from "sharp";
import { planejar } from "../compose-art.mjs";
import { artMesh } from "./render.mjs";
import { getGarmentSpec } from "./garment-specs.mjs";
import { CANONICAL_SIZE } from "./measure.mjs";

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

// LARGURA ESPERADA: da TABELA, nao do mockup.
//
// A primeira versao tirava `r_plano` do mockup (largura da tinta sobre a
// largura do painel do corpo) e convertia com sin(pi*r/2). Isso importa
// inteiro o erro de escala do template, que o CONCLUSOES.md ja declarava e que
// e MUITO maior que os 8% de folga que eu tinha assumido: no Oversized o
// painel do template implica ~52 cm onde a tabela diz 66, ou seja 21%. O
// resultado era pedir raio 17,3 cm num produto cujo raio de tabela e 21,0 —
// impossivel, porque `planejar()` nunca desce abaixo da tabela. Instrumento
// pedindo o impossivel e instrumento errado, nao capa errada.
//
// A largura na verdade nao precisa do mockup: o painel plano da peca mede
// pi*R_tabela, entao a arte de `arte_cm` cm subtende arco w/R e projeta corda
//     r_esperado = sin(w / (2*R_tabela))
// e a capa, com o raio que a receita usou,
//     r_medido   = sin(w / (2*R_receita))
// Ou seja: a diferenca e SO a inflacao do raio. Inflar o raio faz a estampa
// ocupar uma fracao MENOR da peca, que e o "desalinhado" que se ve no olho.
const spec = getGarmentSpec(rec.peca);
const raioTabela = spec.sizes.find((s) => s.size === CANONICAL_SIZE).width_cm / Math.PI;
const rCilindro = larguraArtePx / torsoPx;
const rEsperado = Math.sin(aw / (2 * raioTabela));
const desvioPct = 100 * (rCilindro / rEsperado - 1);

// Posicao horizontal: o mockup diz o quanto a arte foge do eixo da peca, em
// fracao da largura da peca. Na capa, a mesma fracao vale sobre o torso.
const desvioCapa = (centroArtePx - par.camera.cx) / torsoPx;
const desvioErroPp = 100 * (desvioCapa - oficial.desvio_rel);

// Que raio faria a largura bater. Util porque `torso` e o unico botao que
// mexe nisso: w = pi*R*r_plano tem que dar corda = r_esperado*2R, ja garantido
// pela formula; o que sobra e a arte em cm nao casar com o mockup.
// Com a formula da tabela, o raio necessario E o raio da tabela por
// construcao. O que sobra de util e a INFLACAO: quanto o `torso` afastou o
// raio do da tabela, que e exatamente o quanto a estampa encolheu na peca.
const raioNecessario = raioTabela;

// A LARGURA NAO TEM VEREDITO, E ISSO E CONCLUSAO, NAO DESISTENCIA.
//
// Fui atras dela por tres caminhos e os tres caem no mesmo lugar. A largura
// projetada da estampa depende de QUAO CHAPADO o tecido cai, e isso e
// justamente o que `--torso` mede na foto. Para a mesma peca e a mesma arte:
//
//   cilindro justo (R = R_tabela):  razao = sin(w/2R)          = 0,570
//   peca totalmente chapada:        razao = w / largura_plana   = 0,386
//
// (numeros do Oversized, arte de 25,5 cm). Os dois extremos sao fisicamente
// possiveis, o mockup e o caso chapado, a capa e um ponto qualquer entre eles,
// e nao existe "esperado" sem saber o caimento — que e a incognita. Comparar
// com o cilindro justo, como esta versao fazia, nao mede erro: mede quanto o
// caimento se afasta do cilindro. Foi o que produziu o pedido impossivel de
// raio 17,3 cm num produto de raio de tabela 21,0.
//
// Entao a largura vai como INFORMATIVO, com os dois extremos ao lado para
// quem le poder situar o numero. O veredito fica com a POSICAO, que e
// adimensional, independe do caimento e o mockup mede bem.
const rChapado = aw / (Math.PI * raioTabela);
const FOLGA_PP = 3;
const foraDoEixo = Math.abs(desvioErroPp) > FOLGA_PP;

const saida = {
  receita: receitaPath, produto, peca: rec.peca,
  mockup: oficial.mockup,
  largura: {
    // informativo: os dois extremos fisicos e onde a capa caiu entre eles
    razao_se_cilindro_justo: +rEsperado.toFixed(4),
    razao_se_chapada: +rChapado.toFixed(4),
    razao_medida: +rCilindro.toFixed(4),
    posicao_entre_extremos: +((rCilindro - rChapado) / (rEsperado - rChapado)).toFixed(3),
    inflacao_do_raio: +(par.radius_cm / raioTabela).toFixed(3),
    nota: "sem veredito: a largura projetada depende do caimento, que e o que --torso mede",
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
  folga_pp: FOLGA_PP,
  nota: "veredito e so a POSICAO; a largura vai informativa porque depende do caimento, que --torso mede",
  falhas: [
    foraDoEixo ? `estampa ${desvioErroPp.toFixed(1)} pp fora do eixo em relacao ao produto real (folga ${FOLGA_PP} pp)` : null,
  ].filter(Boolean),
};
saida.veredito = saida.falhas.length ? "REPROVADO" : "APROVADO";
console.log(JSON.stringify(saida, null, 1));
process.exit(saida.falhas.length ? 1 : 0);
