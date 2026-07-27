// ADOTA no arquivo de producao os placements relidos pelo medidor consertado.
//
// Existe como script, e nao como edicao a mao, porque a leitura vai mudar de
// novo: o medidor ainda inclui a borda antialiasada da peca na caixa de tinta
// (ver `docs/verdades/limites-conhecidos.md`), e quando isso for corrigido com
// `register-art` os numeros se movem outra vez. Reaplicar tem que ser barato.
//
// O que ele NAO faz: nao inventa valor. Produto sem leitura confiavel mantem o
// numero antigo e ganha `leitura_2026_07_27: "<motivo>"`, para que quem
// consumir saiba que aquele placement vem da medicao velha, que tinha o defeito
// da margem manga a manga.
//
// A regua e a mesma de sempre, a arte como regua dentro do mockup:
//   placement_cm = placement_frac / altura_frac x altura_oficial_cm
//
// Uso: node scripts/geometry/adotar-placement.mjs [--aplicar]
//   sem --aplicar, so mostra o diff.

import fs from "node:fs";

const PROD = "nuvemshop/auditoria/2026-07-26-datum-mockups/placement-por-produto.json";
const NOVO = "nuvemshop/auditoria/2026-07-26-datum-mockups/horizontal-oficial.json";
const aplicar = process.argv.includes("--aplicar");

const prod = JSON.parse(fs.readFileSync(PROD, "utf8"));
const novo = new Map(JSON.parse(fs.readFileSync(NOVO, "utf8")).map((x) => [x.product_id, x]));

const linhas = [];
let mudados = 0, iguais = 0, semLeitura = 0;

for (const item of prod.itens) {
  const n = novo.get(item.product_id);
  if (!n || n.erro) {
    semLeitura += 1;
    item.leitura_2026_07_27 = n?.erro ?? "produto ausente da releitura";
    linhas.push([item.product_id, item.garment, item.placement_cm, null, "SEM LEITURA", item.leitura_2026_07_27]);
    continue;
  }
  // A altura da arte no mockup e o denominador da regua; sem ela nao da para
  // converter fracao em cm.
  if (!(n.altura_frac > 0) || !(n.altura_oficial_cm > 0)) {
    semLeitura += 1;
    item.leitura_2026_07_27 = "altura da arte nao medida";
    linhas.push([item.product_id, item.garment, item.placement_cm, null, "SEM ALTURA", ""]);
    continue;
  }

  const cm = +((n.placement_frac / n.altura_frac) * n.altura_oficial_cm).toFixed(2);
  const delta = +(cm - item.placement_cm).toFixed(2);

  if (Math.abs(delta) < 0.05) {
    iguais += 1;
    item.leitura_2026_07_27 = "confirmado";
    linhas.push([item.product_id, item.garment, item.placement_cm, cm, "IGUAL", ""]);
    continue;
  }

  mudados += 1;
  // Historico factual nao se apaga: o valor de 26/07 fica registrado ao lado.
  item.placement_cm_2026_07_26 = item.placement_cm;
  item.placement_frac_2026_07_26 = item.placement_frac;
  item.placement_cm = cm;
  item.placement_frac = n.placement_frac;
  item.altura_frac = n.altura_frac;
  item.tinta_topo_px = n.tinta_topo_px;
  item.tinta_base_px = n.tinta_base_px;
  item.mockup = n.mockup;
  item.leitura_2026_07_27 = "corrigido";
  // De onde saiu a caixa. `registro` casa com o PNG oficial da arte e e o bom;
  // `limiar` e a deteccao por cor, que ainda inclui a borda da peca e perde
  // tinta de baixo contraste. No 352722232 ela corta a aureola dourada. Fica
  // gravado para que ninguem trate os dois como a mesma qualidade de medida.
  item.fonte_caixa = n.fonte_caixa ?? null;
  item.score_registro = n.score_registro ?? null;
  if (n.fonte_caixa === "limiar") item.confianca = "baixa (caixa por limiar; registro nao casou)";
  linhas.push([item.product_id, item.garment, item.placement_cm_2026_07_26, cm, delta > 0 ? "DESCEU" : "SUBIU", `${delta > 0 ? "+" : ""}${delta} cm`]);
}

prod.revisao_2026_07_27 = {
  motivo: "medidor de mockup consertado em quatro pontos: (1) a margem que da a cor do tecido saia da "
    + "largura MANGA A MANGA e caia fora da peca nas linhas do tronco, entao a referencia virava a cor dos "
    + "ombros e a caixa abria ate a barra; (2) produto de estampa frontal era medido com o template de "
    + "costas e saia com placement negativo; (3) a caixa passou a vir do REGISTRO com o PNG oficial da arte "
    + "em vez de limiar de cor, que incluia a borda antialiasada da peca e perdia tinta de baixo contraste; "
    + "(4) a peca passou a vir deste arquivo e nao do CSV de 22/07, que e anterior a reclassificacao do "
    + "352727892 e escolhia o template errado (13,8 cm de erro). Ver docs/verdades/limites-conhecidos.md.",
  regua: "placement_cm = placement_frac / altura_frac x altura_oficial_cm",
  corrigidos: mudados, confirmados: iguais, sem_leitura: semLeitura,
  ressalva: "itens com `fonte_caixa: limiar` nao casaram no registro e mantem a deteccao por cor, que e "
    + "menos precisa; no 352722232 ela corta a aureola. Estao marcados com confianca baixa.",
};

const larg = (s, n2) => String(s ?? "").padEnd(n2);
console.log("produto    peca                          antes   depois   delta");
for (const l of linhas.filter((x) => x[4] === "DESCEU" || x[4] === "SUBIU").sort((a, b) => Math.abs(Number(String(b[5]).replace(" cm", ""))) - Math.abs(Number(String(a[5]).replace(" cm", ""))))) {
  console.log(`${l[0]}  ${larg(l[1], 28)} ${String(l[2]).padStart(6)}  ${String(l[3]).padStart(6)}   ${l[5]}`);
}
console.log("\nsem leitura (mantem o valor de 26/07):");
for (const l of linhas.filter((x) => x[4].startsWith("SEM"))) console.log(`  ${l[0]} ${larg(l[1], 28)} ${String(l[2]).padStart(6)}  ${l[5]}`);
console.log(`\ncorrigidos ${mudados} | confirmados ${iguais} | sem leitura ${semLeitura}`);

if (aplicar) {
  fs.writeFileSync(PROD, `${JSON.stringify(prod, null, 1)}\n`);
  console.log(`\nAPLICADO em ${PROD}`);
} else {
  console.log("\n(simulacao; rode com --aplicar para gravar)");
}
