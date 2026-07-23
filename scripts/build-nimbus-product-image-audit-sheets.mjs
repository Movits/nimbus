import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceMode = process.argv.includes("--live") ? "live" : "local";
const baseAuditDir = path.join(
  root,
  "nuvemshop",
  "auditoria",
  "2026-07-21",
  "implementacao",
  "auditoria-imagens-2026-07-22",
);
const auditDir = sourceMode === "live" ? path.join(baseAuditDir, "live-sheets") : baseAuditDir;
const productsCsv = path.join(
  root,
  "nuvemshop",
  "auditoria",
  "2026-07-21",
  "implementacao",
  "matriz-produtos-conteudo-tecnico.csv",
);
const uploadsDir = path.join(
  root,
  "nuvemshop",
  "assets",
  "product-lifestyle",
  "2026-07-16",
  "uploads",
);
const liveDir = path.join(baseAuditDir, "live");

function lifestylePathFor(productId) {
  return sourceMode === "live"
    ? path.join(liveDir, `${productId}-01.webp`)
    : path.join(uploadsDir, `${productId}-vitrine-nimbus.jpg`);
}
const referencesDir = path.join(
  root,
  "nuvemshop",
  "assets",
  "product-lifestyle",
  "2026-07-16",
  "catalog",
  "references",
);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...records] = rows.filter((item) => item.some(Boolean));
  return records.map((record) =>
    Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])),
  );
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function labelSvg(width, height, lines, options = {}) {
  const {
    background = "#eff7ff",
    color = "#10265e",
    fontSize = 28,
    padding = 28,
    lineHeight = 36,
    weight = 600,
  } = options;
  const text = lines
    .map(
      (line, index) =>
        `<text x="${padding}" y="${padding + fontSize + index * lineHeight}" ` +
        `font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="${weight}" fill="${color}">` +
        `${escapeXml(line)}</text>`,
    )
    .join("");
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">` +
      `<rect width="100%" height="100%" fill="${background}"/>${text}</svg>`,
  );
}

async function containImage(file, width, height, background = "#ffffff") {
  return sharp(file)
    .rotate()
    .resize(width, height, { fit: "contain", background })
    .flatten({ background })
    .png()
    .toBuffer();
}

async function buildProductPanel(product, referenceDirectory) {
  const panelWidth = 1800;
  const panelHeight = 690;
  const headerHeight = 116;
  const lifestyleSize = 520;
  const mockupSize = 255;
  const gap = 18;

  const lifestylePath = lifestylePathFor(product.product_id);
  const referenceFiles = (await fs.readdir(referenceDirectory))
    .filter((file) => /^gallery-\d+\.(webp|png|jpe?g)$/i.test(file))
    .sort()
    .slice(0, 4);

  const canvas = sharp({
    create: {
      width: panelWidth,
      height: panelHeight,
      channels: 3,
      background: "#ffffff",
    },
  });

  const composites = [
    {
      input: labelSvg(
        panelWidth,
        headerHeight,
        [
          `${product.product_id} | ${product.title}`,
          `${product.collection} | cores: ${product.public_colors || "não informadas"}`,
        ],
        { fontSize: 27, lineHeight: 35 },
      ),
      left: 0,
      top: 0,
    },
    {
      input: await containImage(lifestylePath, lifestyleSize, lifestyleSize),
      left: 30,
      top: headerHeight + 26,
    },
    {
      input: labelSvg(520, 34, [sourceMode === "live" ? "CAPA AO VIVO" : "CAPA LOCAL"], {
        background: "#ffffff",
        color: "#10265e",
        fontSize: 20,
        padding: 0,
        lineHeight: 24,
        weight: 700,
      }),
      left: 30,
      top: headerHeight + 4,
    },
    {
      input: labelSvg(1080, 34, ["MOCKUPS YOUDRAW / FONTE DE VERDADE VISUAL"], {
        background: "#ffffff",
        color: "#10265e",
        fontSize: 20,
        padding: 0,
        lineHeight: 24,
        weight: 700,
      }),
      left: 620,
      top: headerHeight + 4,
    },
  ];

  for (let index = 0; index < referenceFiles.length; index += 1) {
    const column = index % 2;
    const row = Math.floor(index / 2);
    composites.push({
      input: await containImage(
        path.join(referenceDirectory, referenceFiles[index]),
        mockupSize,
        mockupSize,
      ),
      left: 620 + column * (mockupSize + gap),
      top: headerHeight + 28 + row * (mockupSize + gap),
    });
  }

  const noteLines = [
    `PEÇA: ${product.garment}`,
    `BASE YOUDRAW: ${product.youdraw_product}`,
    `ARTE: ${product.art}`,
    `VARIANTES: ${product.public_variant_count}`,
    "",
    "CHECAR:",
    "1. identidade exata da arte",
    "2. escala relativa no torso",
    "3. posição frente/costas",
    "4. cor e tipo da peça",
    "5. texto, anatomia e detalhes",
  ];
  composites.push({
    input: labelSvg(585, 535, noteLines, {
      background: "#f7f9fc",
      color: "#24385f",
      fontSize: 24,
      padding: 26,
      lineHeight: 41,
      weight: 500,
    }),
    left: 1185,
    top: headerHeight + 28,
  });

  return canvas.composite(composites).png().toBuffer();
}

await fs.mkdir(auditDir, { recursive: true });

const products = parseCsv(await fs.readFile(productsCsv, "utf8"));
const referenceDirectories = await fs.readdir(referencesDir, { withFileTypes: true });
const referenceByProductId = new Map(
  referenceDirectories
    .filter((entry) => entry.isDirectory())
    .map((entry) => [entry.name.split("-")[0], path.join(referencesDir, entry.name)]),
);

const missing = [];
const panels = [];
for (const product of products) {
  const referenceDirectory = referenceByProductId.get(product.product_id);
  const lifestylePath = lifestylePathFor(product.product_id);
  if (!referenceDirectory || !(await fs.stat(lifestylePath).catch(() => null))) {
    missing.push({
      product_id: product.product_id,
      title: product.title,
      missing_reference: !referenceDirectory,
      missing_lifestyle: !(await fs.stat(lifestylePath).catch(() => null)),
    });
    continue;
  }
  panels.push({ product, image: await buildProductPanel(product, referenceDirectory) });
}

const productsPerSheet = 5;
const sheetWidth = 1800;
const sheetHeaderHeight = 105;
const panelHeight = 690;
const sheetPaths = [];

for (let start = 0; start < panels.length; start += productsPerSheet) {
  const batch = panels.slice(start, start + productsPerSheet);
  const sheetNumber = Math.floor(start / productsPerSheet) + 1;
  const sheetHeight = sheetHeaderHeight + batch.length * panelHeight;
  const canvas = sharp({
    create: {
      width: sheetWidth,
      height: sheetHeight,
      channels: 3,
      background: "#d7ecff",
    },
  });
  const composites = [
    {
      input: labelSvg(
        sheetWidth,
        sheetHeaderHeight,
        [
          `AUDITORIA VISUAL NIMBUS | ${sourceMode.toUpperCase()} | PRANCHA ${sheetNumber}`,
          `Produtos ${start + 1}–${start + batch.length} de ${panels.length}`,
        ],
        { background: "#10265e", color: "#ffffff", fontSize: 28, lineHeight: 34 },
      ),
      left: 0,
      top: 0,
    },
  ];
  batch.forEach((panel, index) => {
    composites.push({ input: panel.image, left: 0, top: sheetHeaderHeight + index * panelHeight });
  });

  const outputPath = path.join(
    auditDir,
    `prancha-${String(sheetNumber).padStart(2, "0")}.png`,
  );
  await canvas.composite(composites).png({ compressionLevel: 9 }).toFile(outputPath);
  sheetPaths.push(outputPath);
}

await fs.writeFile(
  path.join(auditDir, "manifest.json"),
  JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      source_mode: sourceMode,
      total_products_csv: products.length,
      total_panels: panels.length,
      total_sheets: sheetPaths.length,
      missing,
      sheets: sheetPaths.map((file) => path.relative(root, file).replaceAll("\\", "/")),
      products: panels.map(({ product }, index) => ({
        sheet: Math.floor(index / productsPerSheet) + 1,
        position: (index % productsPerSheet) + 1,
        product_id: product.product_id,
        title: product.title,
        collection: product.collection,
        art: product.art,
        garment: product.garment,
        colors: product.public_colors,
      })),
    },
    null,
    2,
  ),
);

console.log(
  JSON.stringify(
    {
      totalProducts: products.length,
      totalPanels: panels.length,
      totalSheets: sheetPaths.length,
      missing,
      auditDir,
    },
    null,
    2,
  ),
);
