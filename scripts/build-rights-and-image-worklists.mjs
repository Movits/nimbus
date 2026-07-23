import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Users/rober/Nimbus";
const IMPL = path.join(ROOT, "nuvemshop/auditoria/2026-07-21/implementacao");
const PRODUCT_CSV = path.join(IMPL, "matriz-produtos-conteudo-tecnico.csv");
const REFS = path.join(ROOT, "nuvemshop/assets/product-lifestyle/2026-07-16/catalog/references");
const UPLOADS = path.join(ROOT, "nuvemshop/assets/product-lifestyle/2026-07-16/uploads");
const V4 = path.join(ROOT, "nuvemshop/assets/product-lifestyle/2026-07-16/final/v4");

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

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function writeCsv(file, rows) {
  const columns = Object.keys(rows[0]);
  fs.writeFileSync(file, `${[
    columns.map(csvCell).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
  ].join("\n")}\n`, "utf8");
}

const products = parseCsv(fs.readFileSync(PRODUCT_CSV, "utf8"));
const refDirs = fs.readdirSync(REFS, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
const uploadFiles = fs.readdirSync(UPLOADS, { withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => entry.name);
const v4Files = fs.existsSync(V4) ? fs.readdirSync(V4, { withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => entry.name) : [];

const imageRows = products.map((product) => {
  const id = String(product.product_id);
  const referenceDir = refDirs.find((name) => name.startsWith(`${id}-`)) || "";
  const references = referenceDir
    ? fs.readdirSync(path.join(REFS, referenceDir), { withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => entry.name).join(" | ")
    : "";
  const localUploads = uploadFiles.filter((name) => name.startsWith(`${id}-`)).join(" | ");
  const corrections = v4Files.filter((name) => name.startsWith(`${id}-`)).join(" | ");
  let priority = "REVISÃO 49/49";
  let note = "Comparar arte, posição e escala por cor com mockup e arquivo final YouDraw.";
  if (id === "352728357") {
    priority = "CORRIGIR CAPA";
    note = "Capa pública aparenta estampa grande e caimento oversized; avaliar 352728357-preta-v4a.png para substituição.";
  } else if (id === "352717837") {
    priority = "CONFIRMAR MANUALMENTE";
    note = "Verificador sinalizou nome antigo, mas a imagem teve aprovação visual histórica; provável falso positivo.";
  } else if (id === "352890896") {
    priority = "REVISAR DETALHE";
    note = "Histórico registra pequeno resíduo em BRASIL SACRO.";
  } else if (id === "352407182") {
    priority = "REVISAR ESCALA";
    note = "Histórico registra escala cerca de 12% maior.";
  }
  return {
    product_id: id,
    title: product.title,
    collection: product.collection,
    colors: product.public_colors,
    public_cover: product.public_cover,
    reference_folder: referenceDir,
    reference_files: references,
    local_lifestyle_files: localUploads,
    correction_candidates: corrections,
    youdraw_print_width_cm: "AGUARDA PAINEL YOUDRAW",
    youdraw_print_height_cm: "AGUARDA PAINEL YOUDRAW",
    audit_priority: priority,
    audit_note: note,
    final_status: "AGUARDA REAUDITORIA VISUAL",
  };
});

const uniqueArts = [...new Map(products.map((product) => [product.art, product])).values()]
  .sort((a, b) => a.art.localeCompare(b.art, "pt-BR"));
const rightsRows = [
  ...uniqueArts.map((product) => ({
    asset: product.art,
    type: "arte de produto",
    used_in: products.filter((item) => item.art === product.art).map((item) => item.product_id).join(" | "),
    author: "AGUARDA DECLARAÇÃO",
    creation_date: "AGUARDA DECLARAÇÃO",
    source_files: "AGUARDA LOCALIZAÇÃO",
    ai_or_third_party_tool: "AGUARDA DECLARAÇÃO",
    license_or_terms_evidence: "AGUARDA COMPROVANTE",
    approval_status: "PENDENTE",
  })),
  {
    asset: "Logo e wordmark NIMBUS",
    type: "identidade visual",
    used_in: "landing; Nuvemshop; redes; produtos",
    author: "AGUARDA DECLARAÇÃO",
    creation_date: "AGUARDA DECLARAÇÃO",
    source_files: "public/img/wordmark-nimbus.webp e arquivos-fonte a localizar",
    ai_or_third_party_tool: "AGUARDA DECLARAÇÃO",
    license_or_terms_evidence: "AGUARDA COMPROVANTE",
    approval_status: "PENDENTE",
  },
  {
    asset: "Fotos lifestyle de produto",
    type: "imagem de vitrine",
    used_in: "49 produtos Nuvemshop",
    author: "geração assistida por IA",
    creation_date: "2026-07, conferir metadados",
    source_files: "nuvemshop/assets/product-lifestyle/2026-07-16",
    ai_or_third_party_tool: "Higgsfield e/ou ferramenta declarada nos registros",
    license_or_terms_evidence: "arquivar termos do plano e recibos da geração",
    approval_status: "PENDENTE DE CONSOLIDAÇÃO",
  },
  {
    asset: "Fotos e nomes dos projetos sociais",
    type: "conteúdo institucional de terceiros",
    used_in: "landing e página Projetos Sociais",
    author: "terceiros",
    creation_date: "AGUARDA INVENTÁRIO",
    source_files: "public/img/projects e nuvemshop/pagina-projetos-sociais.html",
    ai_or_third_party_tool: "fontes oficiais dos projetos",
    license_or_terms_evidence: "AGUARDA AUTORIZAÇÃO OU BASE DE USO",
    approval_status: "PENDENTE",
  },
];

writeCsv(path.join(IMPL, "checklist-reauditoria-imagens.csv"), imageRows);
writeCsv(path.join(IMPL, "registro-direitos-ativos-draft.csv"), rightsRows);

console.log(JSON.stringify({
  imageRows: imageRows.length,
  uniqueArts: uniqueArts.length,
  rightsRows: rightsRows.length,
  missingReferenceFolders: imageRows.filter((row) => !row.reference_folder).map((row) => row.product_id),
  missingLocalLifestyle: imageRows.filter((row) => !row.local_lifestyle_files).map((row) => row.product_id),
}, null, 2));
