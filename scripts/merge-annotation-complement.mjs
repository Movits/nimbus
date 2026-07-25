// Funde uma rodada COMPLEMENTAR de anotacao nas anotacoes existentes.
//
// A primeira passada anotou a caixa da arte, a gola, a barra e os vincos. Ela
// nao tinha os campos que destravam duas coisas:
//
//   silhouette_left/right  pontos de tangencia da silhueta do tronco na altura
//                          do meio da estampa. Estimador de centro melhor que o
//                          vinco (exato para seccao circular, qualquer guinada).
//   top_extreme            o [x, y] do pixel de tinta mais ALTO da arte.
//   bottom_extreme         idem, o mais BAIXO.
//
// Os dois extremos existem porque em arte de spray/stencil eles caem em
// posicoes LATERAIS diferentes. Como a arte esta enrolada no dorso, extremo
// afastado do centro projeta encolhido e a altura medida sai menor do que e.
// Declarando o x de cada um, esse vies deixa de ser margem cega e vira
// correcao calculada.
//
// Uso: node scripts/merge-annotation-complement.mjs <complemento.json> <dir-de-anotacoes>
//
// O complemento e um array de objetos { photo, silhouette_left?, silhouette_right?,
// top_extreme?, bottom_extreme?, notes? }, com coordenadas em % da imagem.
// A fusao NAO sobrescreve ponto ja existente: ela so acrescenta campo ausente,
// para que uma rodada complementar nunca apague trabalho da rodada original.

import fs from "node:fs";
import path from "node:path";

const [complementPath, annotDir] = process.argv.slice(2);
if (!complementPath || !annotDir) {
  console.error("uso: node scripts/merge-annotation-complement.mjs <complemento.json> <dir-de-anotacoes>");
  process.exit(2);
}

const complement = JSON.parse(fs.readFileSync(complementPath, "utf8"));
const entries = Array.isArray(complement) ? complement : [complement];

const CAMPOS_PONTO = ["silhouette_left", "silhouette_right"];
const CAMPOS_EXTREMO = ["top_extreme", "bottom_extreme"];

/** Indexa os arquivos de anotacao pela foto que descrevem. */
const byPhoto = new Map();
for (const file of fs.readdirSync(annotDir)) {
  if (!file.endsWith(".json") || file.includes("-result")) continue;
  const full = path.join(annotDir, file);
  let a;
  try {
    a = JSON.parse(fs.readFileSync(full, "utf8"));
  } catch {
    continue;
  }
  if (!a.photo) continue;
  if (!byPhoto.has(a.photo)) byPhoto.set(a.photo, []);
  byPhoto.get(a.photo).push({ full, a });
}

let tocados = 0;
let semAlvo = 0;
const resumo = { silhueta: 0, extremos: 0, semSilhueta: [] };

for (const e of entries) {
  const alvos = byPhoto.get(e.photo);
  if (!alvos || alvos.length === 0) {
    console.warn(`sem anotacao para ${e.photo} — complemento ignorado`);
    semAlvo += 1;
    continue;
  }
  // O complemento entra em TODAS as anotacoes daquela foto: os campos novos
  // sao medidos na mesma imagem, entao valem para qualquer anotador dela.
  for (const { full, a } of alvos) {
    let mudou = false;
    for (const campo of CAMPOS_PONTO) {
      if (!e[campo] || a[campo]) continue;
      const xy = Array.isArray(e[campo]) ? e[campo] : e[campo].xy;
      if (!xy) continue;
      a[campo] = { xy, sigma_pct: e[`${campo}_sigma_pct`] ?? 1, status: "ok" };
      mudou = true;
    }
    for (const campo of CAMPOS_EXTREMO) {
      if (!e[campo] || a[campo]) continue;
      a[campo] = Array.isArray(e[campo]) ? e[campo] : e[campo].xy;
      mudou = true;
    }
    if (e.notes) {
      a.complement_notes = [...(a.complement_notes ?? []), e.notes];
      mudou = true;
    }
    if (mudou) {
      fs.writeFileSync(full, `${JSON.stringify(a, null, 2)}\n`);
      tocados += 1;
    }
  }
  if (e.silhouette_left && e.silhouette_right) resumo.silhueta += 1;
  else resumo.semSilhueta.push(e.photo);
  if (e.top_extreme && e.bottom_extreme) resumo.extremos += 1;
}

console.log(`complementos lidos: ${entries.length}`);
console.log(`arquivos de anotacao atualizados: ${tocados}${semAlvo ? ` | sem alvo: ${semAlvo}` : ""}`);
console.log(`fotos com silhueta: ${resumo.silhueta} | com extremos de tinta: ${resumo.extremos}`);
if (resumo.semSilhueta.length) {
  // Isto NAO e falha do anotador. Na maioria das fotos o contorno externo na
  // altura da estampa e a MANGA, nao o tronco: o braco fica solto ao lado do
  // corpo e cobre a borda. Sem tronco contra o fundo nao existe tangencia para
  // marcar, e inventar uma seria pior que nao ter.
  console.log(`sem silhueta (manga cobre o tronco na altura da arte): ${resumo.semSilhueta.length}`);
  for (const p of resumo.semSilhueta) console.log(`  - ${p}`);
}
