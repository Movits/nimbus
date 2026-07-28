import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Users/rober/Nimbus";
const INPUT = path.join(
  ROOT,
  "nuvemshop/auditoria/2026-07-21/implementacao/matriz-produtos-conteudo-tecnico.csv",
);
const OUTPUT = path.join(
  ROOT,
  "nuvemshop/auditoria/2026-07-21/implementacao/descricoes-e-seo-draft.csv",
);

const concepts = {
  "Acima de Tudo Gótico":
    "A frase Acima de Tudo em letra gótica compacta, acompanhada por uma cruz. Uma declaração de fé direta, sóbria e atemporal.",
  "Acima de Tudo Grafite":
    "A frase Acima de Tudo em grafite wildstyle, com spray e respingos. A fé encontra a linguagem visual da rua em uma estampa de presença.",
  "Anjo da Guarda Stencil":
    "O Anjo da Guarda em stencil de alto contraste. Uma releitura urbana e sóbria da imagem de proteção que acompanha o cotidiano.",
  "Aparecida Barroca":
    "Nossa Senhora Aparecida em composição barroca, com filigrana dourada e referências ao azulejo. Uma homenagem reverente à Padroeira do Brasil.",
  "Aparecida Spray":
    "Nossa Senhora Aparecida em stencil de spray dourado, com cores do Brasil. Devoção brasileira traduzida para o streetwear contemporâneo.",
  "Azulejo Sagrado":
    "Azulejo em azul e branco, cruz central e filigrana dourada. Tradição luso-brasileira e arte sacra em uma composição ornamental.",
  "Brasão NIMBUS":
    "Cruz gótica ornamentada, NIMBUS e a frase Acima de Tudo formam o brasão da marca. Um emblema de fé com textura vintage.",
  "Deus é Fiel":
    "A frase Deus é Fiel em letra gótica, com cruz e acabamento vintage. Uma promessa curta e firme para carregar todos os dias.",
  "Espírito Santo Spray":
    "A pomba do Espírito Santo em stencil de spray, com asas abertas e raios. Um símbolo de paz e graça em linguagem urbana.",
  "Fé Acima de Tudo":
    "A frase Fé Acima de Tudo em letra gótica, com cruz e auréola dourada. Uma declaração simples, firme e reverente.",
  "Fé Wildstyle":
    "A palavra Fé em grafite wildstyle, com spray, cor e movimento. Curta na mensagem e marcante na presença.",
  "Monograma NIMBUS":
    "O monograma NIMBUS em letra gótica forma um emblema com cruz e auréola. Uma assinatura discreta da marca.",
  "NIMBUS Wildstyle":
    "A palavra NIMBUS em grafite wildstyle, com contorno, spray e auréola. A assinatura da marca em linguagem de rua.",
  "Querubim Spray":
    "Um querubim barroco recriado em stencil de spray. Arte sacra clássica e textura urbana no mesmo desenho.",
  "Sagrado Coração Spray":
    "O Sagrado Coração de Jesus em stencil de spray, com coroa de espinhos e chama. Uma devoção tradicional em traço streetwear.",
  "Salmo 19":
    "Os céus proclamam a glória de Deus em letra gótica e textura de pôster antigo. Palavra e estética editorial na mesma arte.",
  "São Jorge Neobarroco":
    "São Jorge e o dragão em composição neobarroca, com ornamentos e alto contraste. A imagem do santo guerreiro tratada com reverência e presença.",
  "São Jorge Vintage":
    "São Jorge vencendo o dragão em halftone e letra gótica. A imagem do santo guerreiro em uma leitura vintage de alto contraste.",
  "São Miguel Celeste":
    "São Miguel Arcanjo entre nuvens, em traço celeste e cores suaves. A proteção do arcanjo na linguagem mais leve da NIMBUS.",
  "São Miguel Vintage":
    "São Miguel Arcanjo em halftone, com letra gótica e textura vintage. Tradição e proteção em uma estampa de alto contraste.",
  "São Miguel Vitorioso":
    "São Miguel Arcanjo vencendo o mal em stencil de spray. Força, proteção e fé reunidas em uma composição urbana.",
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const headers = rows.shift();
  return rows
    .filter((values) => values.some(Boolean))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function garmentParagraph(row) {
  const weight = row.weight && !row.weight.startsWith("Não informado")
    ? `, com gramatura informada de ${row.weight}`
    : "";
  return `${row.material}${weight}. ${row.fit}. Estampa em ${row.print}. Cores disponíveis: ${row.public_colors}.`;
}

function isBlocked(row) {
  return Boolean(row.content_gap);
}

function makeDescription(row) {
  const concept = concepts[row.art] || `${row.art} em uma composição autoral da NIMBUS.`;
  const technicalBlock = isBlocked(row)
    ? `<p><strong>REVISÃO TÉCNICA PENDENTE:</strong> ${row.content_gap}</p>`
    : "";
  return [
    `<p>${concept}</p>`,
    `<h2>A peça</h2>`,
    `<p>${garmentParagraph(row)}</p>`,
    `<h2>Medidas</h2>`,
    `<p>${row.measurements}.</p>`,
    `<p>Compare as medidas com uma peça sua. Pode haver pequena variação de fabricação.</p>`,
    `<h2>Cuidados</h2>`,
    `<p>${row.care}</p>`,
    `<h2>Produção e envio</h2>`,
    `<p>Produzida sob demanda no Brasil. Prazos médios totais após a confirmação do pagamento: São Paulo, 1 a 3 dias úteis; Sudeste, 2 a 4; Sul e Centro-Oeste, 3 a 5; Norte e Nordeste, 4 a 10. O prazo do checkout para o seu CEP prevalece. O rastreio é enviado após a postagem.</p>`,
    technicalBlock,
    `<p>Esta peça destina 10% do lucro ao projeto social da sua escolha, no checkout.</p>`,
  ].filter(Boolean).join("\n");
}

function makeMetaDescription(row) {
  const copy = `${row.art} em ${row.garment.toLowerCase()} NIMBUS. ${row.fit}. Produção sob demanda no Brasil.`;
  return copy.length <= 155 ? copy : `${copy.slice(0, 152).trimEnd()}...`;
}

const inputRows = parseCsv(fs.readFileSync(INPUT, "utf8"));
const outputRows = inputRows.map((row) => ({
  product_id: row.product_id,
  title: row.title,
  url: row.url,
  collection: row.collection,
  garment: row.garment,
  status: isBlocked(row) ? "BLOQUEADO POR DADO YOUDRAW" : "PRONTO PARA REVISÃO FINAL",
  blocker: row.content_gap,
  meta_title: `${row.title} | NIMBUS`,
  meta_description: makeMetaDescription(row),
  description_html: makeDescription(row),
}));

const columns = Object.keys(outputRows[0]);
const lines = [
  columns.map(csvCell).join(","),
  ...outputRows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
];
fs.writeFileSync(OUTPUT, `${lines.join("\n")}\n`, "utf8");

const blocked = outputRows.filter((row) => row.status.startsWith("BLOQUEADO"));
console.log(JSON.stringify({
  output: OUTPUT,
  products: outputRows.length,
  readyForFinalReview: outputRows.length - blocked.length,
  blockedByYouDrawData: blocked.length,
  blockedProducts: blocked.map((row) => ({ productId: row.product_id, title: row.title, reason: row.blocker })),
}, null, 2));
