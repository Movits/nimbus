import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const campaignRoot =
  "C:\\Users\\rober\\Nimbus\\nuvemshop\\assets\\product-lifestyle\\2026-07-16";
const state = JSON.parse(
  fs.readFileSync(path.join(campaignRoot, "generation-state.json"), "utf8"),
);
const outputDir = path.join(campaignRoot, "review");
fs.mkdirSync(outputDir, { recursive: true });

const completed = Object.values(state.products)
  .filter((product) => product.status === "completed" && fs.existsSync(product.output))
  .sort(
    (left, right) =>
      left.collection.localeCompare(right.collection, "pt-BR") ||
      left.family.localeCompare(right.family, "pt-BR") ||
      left.piece.localeCompare(right.piece, "pt-BR"),
  );

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

async function createSheet(collection, products, part) {
  const columns = 4;
  const rows = Math.ceil(products.length / columns);
  const tileWidth = 430;
  const imageHeight = 430;
  const labelHeight = 86;
  const tileHeight = imageHeight + labelHeight;
  const headerHeight = 86;
  const width = columns * tileWidth;
  const height = headerHeight + rows * tileHeight;

  const base = sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#edf5fc",
    },
  });

  const composites = [
    {
      input: Buffer.from(`
        <svg width="${width}" height="${headerHeight}">
          <rect width="100%" height="100%" fill="#dceafa"/>
          <text x="${width / 2}" y="54" text-anchor="middle"
            font-family="Georgia, serif" font-size="35" font-weight="700"
            fill="#0b2360">${escapeXml(collection)} · REVISÃO ${part}</text>
        </svg>
      `),
      top: 0,
      left: 0,
    },
  ];

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const column = index % columns;
    const row = Math.floor(index / columns);
    const left = column * tileWidth;
    const top = headerHeight + row * tileHeight;
    const image = await sharp(product.output)
      .resize(tileWidth, imageHeight, { fit: "cover", position: "centre" })
      .png()
      .toBuffer();
    composites.push({ input: image, left, top });

    const firstLine = `${product.productId} · ${product.family}`;
    const secondLine = `${product.piece} · ${product.color} · ${product.model}`;
    composites.push({
      input: Buffer.from(`
        <svg width="${tileWidth}" height="${labelHeight}">
          <rect width="100%" height="100%" fill="#ffffff"/>
          <line x1="0" y1="0" x2="${tileWidth}" y2="0" stroke="#d8e2ef"/>
          <text x="18" y="32" font-family="Arial, sans-serif" font-size="17"
            font-weight="700" fill="#0b2360">${escapeXml(firstLine)}</text>
          <text x="18" y="61" font-family="Arial, sans-serif" font-size="15"
            fill="#294b83">${escapeXml(secondLine)}</text>
        </svg>
      `),
      left,
      top: top + imageHeight,
    });
  }

  const output = path.join(
    outputDir,
    `${collection.toLowerCase()}-review-${String(part).padStart(2, "0")}.jpg`,
  );
  await base.composite(composites).jpeg({ quality: 91 }).toFile(output);
  console.log(output);
}

for (const collection of ["STREET", "RELIQUIA", "NUVEM"]) {
  const products = completed.filter((product) => product.collection === collection);
  for (let offset = 0, part = 1; offset < products.length; offset += 12, part += 1) {
    await createSheet(collection, products.slice(offset, offset + 12), part);
  }
}
