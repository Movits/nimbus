import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const matrixPath = path.join(root, "nuvemshop", "auditoria", "2026-07-21", "implementacao", "matriz-produtos-conteudo-tecnico.csv");
const auditDir = path.join(root, "nuvemshop", "auditoria", "2026-07-21", "implementacao", "auditoria-imagens-2026-07-22");
const liveDir = path.join(auditDir, "live");
const refsRoot = path.join(root, "nuvemshop", "assets", "product-lifestyle", "2026-07-16", "catalog", "references");
const candidateDir = path.join(root, "nuvemshop", "assets", "product-lifestyle", "2026-07-22");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') { field += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += ch;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }
  const [headers, ...records] = rows.filter((r) => r.some(Boolean));
  return records.map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
}

function csvCell(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function xml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"); }

const replacements = {
  "352728357": { files: ["352728357-anjo-premium-imagegen-final.png"], note: "Estampa do Anjo da Guarda estava visualmente 9–11% maior; escala corrigida preservando a arte." },
  "352727892": { files: ["352727892-aparecida-spray-blusao-final.png"], note: "A capa mostrava capuz em um blusão sem capuz; peça corrigida e arte preservada." },
  "352728019": { files: ["352728019-aparecida-spray-oversized-imagegen-final.png"], note: "Estampa Aparecida Spray estava aproximadamente 45% maior que o mockup; escala corrigida." },
  "352618837": { files: ["352618837-sao-jorge-vintage-blusao-imagegen-final.png", "352618837-sao-jorge-vintage-blusao-white-imagegen-final.png"], note: "Estampa estava aproximadamente 23,5% maior; as duas cores foram corrigidas." },
  "352618903": { files: ["352618903-sao-jorge-vintage-oversized-imagegen-final.png", "352618903-sao-jorge-vintage-oversized-offwhite-imagegen-final.png"], note: "Estampa estava aproximadamente 16,7% maior; as duas cores foram corrigidas." },
  "352702858": { files: ["352702858-fe-acima-de-tudo-oversized-imagegen-final.png", "352702858-fe-acima-de-tudo-oversized-offwhite-imagegen-final.png"], note: "Estampa estava aproximadamente 24% maior; as duas cores foram corrigidas." },
  "352719728": { files: ["352719728-aparecida-barroca-blusao-imagegen-final.png"], note: "Estampa estava aproximadamente 19% maior; escala corrigida." },
  "352722685": { files: ["352722685-sao-miguel-celeste-canguru-imagegen-final.png"], note: "Estampa estava aproximadamente 19% maior; escala corrigida." },
  "352727545": { files: ["352727545-sao-miguel-vitorioso-oversized-imagegen-final.png", "352727545-sao-miguel-vitorioso-oversized-offwhite-imagegen-final.png"], note: "Estampa estava aproximadamente 20% maior; as duas cores foram corrigidas após uma segunda redução." },
};

const caveats = {
  "352407182": "Correção anterior reduziu o desvio; resta diferença histórica de cerca de 12%, sem troca automática nesta rodada.",
  "352719816": "Escala aproximadamente 11,5% menor; microtexto exige conferência em amostra física.",
  "352702796": "A capa aparenta caimento mais largo que uma Premium regular; arte está coerente.",
  "352728524": "Microtexto muito pequeno para validação absoluta em thumbnail; arte principal coerente.",
  "352726673": "Microtexto muito pequeno para validação absoluta em thumbnail; arte principal coerente.",
  "352898175": "Microtexto muito pequeno para validação absoluta em thumbnail; arte principal coerente.",
  "352721633": "Foto secundária tem pequena marca visual; capa principal aprovada.",
  "352890896": "Legenda minúscula da arte mostra leve deformação, imperceptível no card; revisar em futura rodada de alta resolução.",
  "352889132": "Microtexto pequeno; desenho e escala principal aprovados.",
};

const products = parseCsv(await fs.readFile(matrixPath, "utf8"));
const refDirs = await fs.readdir(refsRoot, { withFileTypes: true });
const rows = products.map((p) => {
  const replacement = replacements[p.product_id];
  const caveat = caveats[p.product_id];
  const status = replacement ? "SUBSTITUIÇÃO PRONTA" : caveat ? "APROVADO COM RESSALVA" : "APROVADO AO VIVO";
  const note = replacement?.note ?? caveat ?? "Capa ao vivo coerente com peça, arte e proporção dos mockups YouDraw na auditoria comparativa.";
  return {
    product_id: p.product_id,
    title: p.title,
    collection: p.collection,
    garment: p.garment,
    colors: p.public_colors,
    url: p.url,
    status,
    note,
    candidate: replacement ? replacement.files.map((file) => path.join(candidateDir, file)).join(" | ") : "",
  };
});

await fs.mkdir(auditDir, { recursive: true });
const headers = ["product_id", "title", "collection", "garment", "colors", "url", "status", "note", "candidate"];
const csv = [headers.map(csvCell).join(","), ...rows.map((r) => headers.map((h) => csvCell(r[h])).join(","))].join("\r\n") + "\r\n";
await fs.writeFile(path.join(auditDir, "auditoria-final-49-produtos-2026-07-22.csv"), `\ufeff${csv}`, "utf8");

const counts = Object.fromEntries([...new Set(rows.map((r) => r.status))].map((s) => [s, rows.filter((r) => r.status === s).length]));
const report = `# Auditoria final de imagens — NIMBUS\n\nData: 22/07/2026\n\n## Resultado\n\n- Produtos auditados no site publicado: **${rows.length}/49**\n- Produtos com substituições prontas: **${counts["SUBSTITUIÇÃO PRONTA"] ?? 0}**\n- Arquivos corrigidos prontos: **${Object.values(replacements).reduce((sum, item) => sum + item.files.length, 0)}**\n- Aprovados com ressalva não bloqueante: **${counts["APROVADO COM RESSALVA"] ?? 0}**\n- Aprovados no ar: **${counts["APROVADO AO VIVO"] ?? 0}**\n- Produtos sem galeria encontrada: **0**\n\n## Critério\n\nA capa lifestyle foi comparada aos mockups YouDraw do mesmo cadastro, observando peça correta, capuz/gola, cor, identidade da arte, posição e escala relativa da estampa. A auditoria não substitui uma prova física de impressão: microtextos e acabamento final devem ser confirmados em amostra.\n\n## Substituições prontas\n\n${rows.filter((r) => r.status === "SUBSTITUIÇÃO PRONTA").map((r) => { const files = r.candidate.split(" | ").map((file) => `\n  - Arquivo: \`${path.relative(root, file).replaceAll("\\", "/")}\``).join(""); return `- **${r.product_id} — ${r.title}**: ${r.note}${files}`; }).join("\n")}\n\n## Ressalvas não bloqueantes\n\n${rows.filter((r) => r.status === "APROVADO COM RESSALVA").map((r) => `- **${r.product_id} — ${r.title}**: ${r.note}`).join("\n")}\n\n## Observações de publicação\n\nOs treze arquivos corrigidos estão preparados localmente. Nenhuma foto importada da YouDraw deve ser removida: cada nova imagem entra somente na posição correspondente de vitrine/hover, preservando os mockups oficiais na galeria do produto.\n`;
await fs.writeFile(path.join(auditDir, "relatorio-final-2026-07-22.md"), report, "utf8");

async function fit(file, width, height) {
  return sharp(file).rotate().resize(width, height, { fit: "contain", background: "#fff" }).flatten({ background: "#fff" }).png().toBuffer();
}
function label(text, width, height, size = 24) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#eaf5ff"/><text x="18" y="${size + 12}" font-family="Arial" font-size="${size}" font-weight="700" fill="#10265e">${xml(text)}</text></svg>`);
}

const corrected = rows.filter((r) => r.status === "SUBSTITUIÇÃO PRONTA");
for (let page = 0; page < Math.ceil(corrected.length / 3); page += 1) {
  const items = corrected.slice(page * 3, page * 3 + 3);
  const width = 1800;
  const panelHeight = 650;
  const canvas = sharp({ create: { width, height: panelHeight * items.length, channels: 3, background: "#fff" } });
  const composites = [];
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    const y = i * panelHeight;
    const refDir = refDirs.find((d) => d.isDirectory() && d.name.startsWith(`${item.product_id}-`));
    const refFiles = refDir ? (await fs.readdir(path.join(refsRoot, refDir.name))).filter((f) => /^gallery-\d+\.(webp|png|jpe?g)$/i.test(f)).sort() : [];
    const refFile = refFiles.at(-1);
    composites.push({ input: label(`${item.product_id} | ${item.title}`, width, 66), left: 0, top: y });
    composites.push({ input: label("CAPA AO VIVO", 560, 42, 18), left: 20, top: y + 70 });
    composites.push({ input: await fit(path.join(liveDir, `${item.product_id}-01.webp`), 520, 500), left: 20, top: y + 112 });
    composites.push({ input: label("MOCKUP YOUDRAW", 560, 42, 18), left: 620, top: y + 70 });
    if (refFile) composites.push({ input: await fit(path.join(refsRoot, refDir.name, refFile), 520, 500), left: 620, top: y + 112 });
    composites.push({ input: label("CORREÇÃO PRONTA", 560, 42, 18), left: 1220, top: y + 70 });
    composites.push({ input: await fit(item.candidate.split(" | ")[0], 520, 500), left: 1220, top: y + 112 });
  }
  await canvas.composite(composites).png().toFile(path.join(auditDir, `comparativo-correcoes-${String(page + 1).padStart(2, "0")}.png`));
}

console.log(JSON.stringify({ total: rows.length, counts, comparisonSheets: Math.ceil(corrected.length / 3) }, null, 2));
