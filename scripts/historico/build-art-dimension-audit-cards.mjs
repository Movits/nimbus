import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const auditDir = path.join(root, "nuvemshop", "auditoria", "2026-07-22-dimensoes-arte");
const cardsDir = path.join(auditDir, "cards");
const csvPath = path.join(auditDir, "auditoria-dimensoes-arte.csv");
const liveDir = path.join(root, "nuvemshop", "auditoria", "2026-07-21", "implementacao", "auditoria-imagens-2026-07-22", "live");
const refsRoot = path.join(root, "nuvemshop", "assets", "product-lifestyle", "2026-07-16", "catalog", "references");

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
  const [headers, ...records] = rows.filter((entry) => entry.some(Boolean));
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])));
}

function xml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapText(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) { lines.push(current); current = word; }
    else current = next;
  }
  if (current) lines.push(current);
  return lines;
}

function svgText(width, height, blocks, { background = "#ffffff" } = {}) {
  let y = 0;
  const content = [];
  for (const block of blocks) {
    const size = block.size ?? 28;
    const lineHeight = block.lineHeight ?? Math.round(size * 1.3);
    const lines = Array.isArray(block.text) ? block.text : wrapText(block.text, block.maxChars ?? 38);
    y += block.before ?? 0;
    for (const line of lines) {
      y += lineHeight;
      content.push(`<text x="${block.x ?? 0}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${block.weight ?? 400}" fill="${block.color ?? "#10265e"}">${xml(line)}</text>`);
    }
    y += block.after ?? 0;
  }
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="${background}"/>${content.join("")}</svg>`);
}

async function fit(file, width, height, background = "#f7f9fc") {
  return sharp(file).rotate().resize(width, height, { fit: "contain", background }).flatten({ background }).jpeg({ quality: 88, chromaSubsampling: "4:4:4" }).toBuffer();
}

function verdictStyle(verdict) {
  if (verdict === "REFAZER") return { fill: "#9b1c1c", pale: "#fff1f1" };
  if (verdict === "REVISAR") return { fill: "#8a6200", pale: "#fff8df" };
  return { fill: "#1f5f4a", pale: "#eef9f4" };
}

await fs.mkdir(cardsDir, { recursive: true });
const products = parseCsv(await fs.readFile(csvPath, "utf8"));
const refDirs = await fs.readdir(refsRoot, { withFileTypes: true });
const refById = new Map(refDirs.filter((entry) => entry.isDirectory()).map((entry) => [entry.name.split("-")[0], path.join(refsRoot, entry.name)]));

const width = 1800;
const height = 1050;
const headerHeight = 128;
const footerHeight = 48;
const bodyTop = headerHeight + 18;
const bodyHeight = height - bodyTop - footerHeight - 18;
const modelX = 26;
const modelW = 610;
const refX = 662;
const refW = 600;
const noteX = 1288;
const noteW = 486;

for (const product of products) {
  const style = verdictStyle(product.verdict);
  const colorCount = product.colors.includes("|") ? 2 : 1;
  const modelFiles = [];
  for (let i = 1; i <= colorCount; i += 1) {
    const base = `${product.product_id}-${String(i).padStart(2, "0")}`;
    const found = ["webp", "png", "jpg", "jpeg"].map((ext) => path.join(liveDir, `${base}.${ext}`));
    const file = await Promise.any(found.map(async (candidate) => { await fs.access(candidate); return candidate; })).catch(() => null);
    if (file) modelFiles.push(file);
  }
  const refDir = refById.get(product.product_id);
  const refFiles = refDir ? (await fs.readdir(refDir)).filter((file) => /^gallery-\d+\.(webp|png|jpe?g)$/i.test(file)).sort().slice(0, 4).map((file) => path.join(refDir, file)) : [];

  const canvas = sharp({ create: { width, height, channels: 3, background: "#ffffff" } });
  const header = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${headerHeight}"><rect width="100%" height="100%" fill="#d7ecff"/><rect x="0" y="0" width="14" height="100%" fill="#e3b63f"/><text x="36" y="48" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#10265e">${xml(product.product_id)} | ${xml(product.title)}</text><text x="36" y="92" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="#40577e">${xml(product.collection)} | ${xml(product.garment)} | ${xml(product.colors)}</text><rect x="1500" y="28" rx="20" ry="20" width="252" height="64" fill="${style.fill}"/><text x="1626" y="70" text-anchor="middle" font-family="Arial, sans-serif" font-size="25" font-weight="700" fill="#ffffff">${xml(product.verdict)}</text></svg>`);
  const footer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${footerHeight}"><rect width="100%" height="100%" fill="#10265e"/><text x="28" y="31" font-family="Arial, sans-serif" font-size="18" fill="#ffffff">Auditoria visual NIMBUS | YouDraw é a fonte de verdade | Escala estimada pela proporção no painel da peça</text><text x="1770" y="31" text-anchor="end" font-family="Arial, sans-serif" font-size="18" fill="#ffffff">Confiança: ${xml(product.confidence)}</text></svg>`);
  const comps = [
    { input: header, left: 0, top: 0 },
    { input: footer, left: 0, top: height - footerHeight },
    { input: svgText(modelW, 38, [{ text: "FOTO(S) DE MODELO NA LOJA", size: 20, weight: 700, lineHeight: 24, color: "#10265e" }]), left: modelX, top: bodyTop },
    { input: svgText(refW, 38, [{ text: "MOCKUPS OFICIAIS YOUDRAW", size: 20, weight: 700, lineHeight: 24, color: "#10265e" }]), left: refX, top: bodyTop },
  ];

  const imageTop = bodyTop + 44;
  if (modelFiles.length === 1) {
    comps.push({ input: await fit(modelFiles[0], modelW, bodyHeight - 54), left: modelX, top: imageTop });
  } else {
    const eachW = Math.floor((modelW - 14) / 2);
    for (let i = 0; i < modelFiles.length; i += 1) comps.push({ input: await fit(modelFiles[i], eachW, bodyHeight - 54), left: modelX + i * (eachW + 14), top: imageTop });
  }

  if (refFiles.length <= 2) {
    const eachW = Math.floor((refW - 14) / 2);
    for (let i = 0; i < refFiles.length; i += 1) comps.push({ input: await fit(refFiles[i], eachW, bodyHeight - 54), left: refX + i * (eachW + 14), top: imageTop });
  } else {
    const eachW = Math.floor((refW - 14) / 2);
    const eachH = Math.floor((bodyHeight - 68) / 2);
    for (let i = 0; i < Math.min(refFiles.length, 4); i += 1) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      comps.push({ input: await fit(refFiles[i], eachW, eachH), left: refX + col * (eachW + 14), top: imageTop + row * (eachH + 14) });
    }
  }

  const front = `${product.front_w_cm} × ${product.front_h_cm} cm`;
  const back = product.back_w_cm ? `${product.back_w_cm} × ${product.back_h_cm} cm` : "não há arte nas costas";
  const noteBlocks = [
    { text: "DIMENSÕES OFICIAIS", size: 20, weight: 700, lineHeight: 25, color: "#10265e", after: 8 },
    { text: `Frente: ${front}`, size: 23, weight: 700, lineHeight: 29, color: "#10265e", after: 3 },
    { text: `Costas: ${back}`, size: 23, weight: 700, lineHeight: 29, color: "#10265e", after: 18 },
    { text: "LEITURA DE ESCALA", size: 19, weight: 700, lineHeight: 24, color: style.fill, after: 3 },
    { text: product.scale_assessment, maxChars: 37, size: 20, lineHeight: 26, color: "#24385f", after: 14 },
    { text: "IDENTIDADE DA ARTE", size: 19, weight: 700, lineHeight: 24, color: "#10265e", after: 3 },
    { text: product.identity_assessment, maxChars: 37, size: 19, lineHeight: 25, color: "#24385f", after: 13 },
    { text: "CONSISTÊNCIA ENTRE CORES", size: 19, weight: 700, lineHeight: 24, color: "#10265e", after: 3 },
    { text: product.color_consistency, maxChars: 37, size: 19, lineHeight: 25, color: "#24385f", after: 13 },
    { text: "AÇÃO RECOMENDADA", size: 19, weight: 700, lineHeight: 24, color: style.fill, after: 3 },
    { text: product.recommendation, maxChars: 37, size: 20, weight: 600, lineHeight: 26, color: "#24385f" },
  ];
  comps.push({ input: svgText(noteW, bodyHeight, noteBlocks, { background: style.pale }), left: noteX, top: bodyTop });

  const file = path.join(cardsDir, `${product.product_id}.jpg`);
  await canvas.composite(comps).jpeg({ quality: 90, chromaSubsampling: "4:4:4" }).toFile(file);
}

await fs.writeFile(path.join(cardsDir, "manifest.json"), JSON.stringify({ generated_at: new Date().toISOString(), total: products.length, files: products.map((product) => `${product.product_id}.jpg`) }, null, 2));
console.log(JSON.stringify({ total: products.length, cardsDir }, null, 2));
