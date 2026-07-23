import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Users/rober/Nimbus";
const IMPL = path.join(ROOT, "nuvemshop/auditoria/2026-07-21/implementacao");
const REQUIRED_SOCIAL_END = "<p>Esta peça destina 10% do lucro ao projeto social da sua escolha, no checkout.</p>";

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift();
  return rows.filter((values) => values.some(Boolean)).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
  );
}

const products = parseCsv(fs.readFileSync(path.join(IMPL, "matriz-produtos-conteudo-tecnico.csv"), "utf8"));
const variants = parseCsv(fs.readFileSync(path.join(IMPL, "matriz-variantes-nuvemshop-parcial.csv"), "utf8"));
const drafts = parseCsv(fs.readFileSync(path.join(IMPL, "descricoes-e-seo-draft.csv"), "utf8"));
const images = parseCsv(fs.readFileSync(path.join(IMPL, "checklist-reauditoria-imagens.csv"), "utf8"));
const rights = parseCsv(fs.readFileSync(path.join(IMPL, "registro-direitos-ativos-draft.csv"), "utf8"));
const publicationCss = fs.readFileSync(
  path.join(ROOT, "nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css"),
  "utf8",
);
const errors = [];
const warnings = [];

if (products.length !== 49) errors.push(`Produtos esperados 49, encontrados ${products.length}.`);
if (variants.length !== 386) errors.push(`Variantes esperadas 386, encontradas ${variants.length}.`);
if (drafts.length !== 49) errors.push(`Descrições esperadas 49, encontradas ${drafts.length}.`);
if (images.length !== 49) errors.push(`Linhas de imagem esperadas 49, encontradas ${images.length}.`);

const ids = new Set(products.map((row) => row.product_id));
for (const row of drafts) {
  if (!ids.has(row.product_id)) errors.push(`Descrição órfã: ${row.product_id}.`);
  if (!row.title.includes(" | ")) errors.push(`Título fora do padrão: ${row.title}.`);
  if (!row.description_html.endsWith(REQUIRED_SOCIAL_END)) errors.push(`Frase social não encerra a descrição: ${row.product_id}.`);
  if (/troca fácil/i.test(row.description_html)) errors.push(`Expressão proibida em ${row.product_id}.`);
  if (row.meta_description.length > 160) errors.push(`Meta description >160 em ${row.product_id}.`);
  if (row.status.startsWith("PRONTO") && /PENDENTE|AGUARDA|REVISÃO TÉCNICA/i.test(row.description_html)) {
    errors.push(`Produto pronto ainda contém placeholder técnico: ${row.product_id}.`);
  }
}

const skuCount = new Map();
for (const row of variants) {
  if (!row.sku) warnings.push(`Variante sem SKU: ${row.nuvemshop_variant_id}.`);
  else skuCount.set(row.sku, (skuCount.get(row.sku) || 0) + 1);
}
for (const [sku, count] of skuCount) {
  if (count > 1) errors.push(`SKU duplicado: ${sku} (${count} vezes).`);
}

for (const row of images) {
  if (!row.reference_folder) errors.push(`Produto sem referência YouDraw local: ${row.product_id}.`);
  if (!row.local_lifestyle_files) errors.push(`Produto sem lifestyle local: ${row.product_id}.`);
  if (!row.final_status.startsWith("AGUARDA")) warnings.push(`Status visual inesperado: ${row.product_id}.`);
}

const hoverLockedIds = [...new Set(
  [...publicationCss.matchAll(/\[data-product-id="(\d+)"\]\s*\.item-image-secondary/g)].map((match) => match[1]),
)];
const shouldBeLocked = products
  .filter((row) => row.public_colors.split(" | ").filter(Boolean).length <= 1)
  .map((row) => row.product_id);
const wronglyLocked = hoverLockedIds.filter((id) => {
  const product = products.find((row) => row.product_id === id);
  return !product || product.public_colors.split(" | ").filter(Boolean).length > 1;
});
const missingHoverLock = shouldBeLocked.filter((id) => !hoverLockedIds.includes(id));
if (wronglyLocked.length) errors.push(`Produtos multicoloridos bloqueados no CSS: ${wronglyLocked.join(", ")}.`);
if (missingHoverLock.length) errors.push(`Produtos mono-cor/sem cor sem bloqueio no CSS: ${missingHoverLock.join(", ")}.`);
if ((publicationCss.match(/\{/g) || []).length !== (publicationCss.match(/\}/g) || []).length) {
  errors.push("CSS consolidado com chaves desequilibradas.");
}
if (/chunk|encheu|la de x|lá de x/i.test(publicationCss)) errors.push("Texto corrompido detectado no CSS consolidado.");

if (rights.length < 23) errors.push(`Registro de direitos incompleto: ${rights.length} linhas.`);

const policyFiles = [
  { file: "pagina-envios-e-prazos-draft.html", pendingExpected: false },
  { file: "pagina-trocas-e-devolucoes-draft.html", pendingExpected: true },
  { file: "pagina-privacidade-e-cookies-draft.html", pendingExpected: true },
  { file: "pagina-transparencia-impacto-draft.html", pendingExpected: false },
];
for (const { file, pendingExpected } of policyFiles) {
  const content = fs.readFileSync(path.join(IMPL, file), "utf8");
  if (pendingExpected && !/AGUARDA/.test(content)) warnings.push(`${file} não contém marcador de pendência; revisar antes de publicar.`);
  if (/troca fácil/i.test(content)) errors.push(`Expressão proibida em ${file}.`);
}

const report = {
  checkedAt: new Date().toISOString(),
  counts: {
    products: products.length,
    variants: variants.length,
    uniqueSkus: skuCount.size,
    descriptions: drafts.length,
    imageAuditRows: images.length,
    rightsRows: rights.length,
    readyDescriptions: drafts.filter((row) => row.status.startsWith("PRONTO")).length,
    blockedDescriptions: drafts.filter((row) => row.status.startsWith("BLOQUEADO")).length,
    hoverLockedProductIds: hoverLockedIds.length,
    expectedHoverLockedProductIds: shouldBeLocked.length,
  },
  errors,
  warnings,
  result: errors.length ? "FAIL" : "PASS",
};

fs.writeFileSync(path.join(IMPL, "qa-artefatos-pre-lancamento.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
