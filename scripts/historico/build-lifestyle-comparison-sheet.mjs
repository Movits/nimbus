import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const campaignRoot =
  "C:\\Users\\rober\\Nimbus\\nuvemshop\\assets\\product-lifestyle\\2026-07-16";
const state = JSON.parse(
  fs.readFileSync(path.join(campaignRoot, "generation-state.json"), "utf8"),
);
const ids = [
  352728277,
  352728357,
  352728524,
  352721197,
  352726673,
  352720257,
  352720127,
  352718275,
  352703343,
  352702753,
  352702796,
  352619175,
  352618935,
  352723243,
];
const products = ids.map((id) => state.products[String(id)]);

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const columns = 2;
const tileWidth = 900;
const tileHeight = 440;
const headerHeight = 80;
const rows = Math.ceil(products.length / columns);
const width = columns * tileWidth;
const height = headerHeight + rows * tileHeight;
const composites = [
  {
    input: Buffer.from(`
      <svg width="${width}" height="${headerHeight}">
        <rect width="100%" height="100%" fill="#dceafa"/>
        <text x="${width / 2}" y="52" text-anchor="middle"
          font-family="Georgia, serif" font-size="34" font-weight="700"
          fill="#0b2360">MOCKUP REAL × VITRINE CORRIGIDA</text>
      </svg>
    `),
    left: 0,
    top: 0,
  },
];

for (let index = 0; index < products.length; index += 1) {
  const product = products[index];
  const column = index % columns;
  const row = Math.floor(index / columns);
  const left = column * tileWidth;
  const top = headerHeight + row * tileHeight;
  const reference = await sharp(product.hero)
    .resize(360, 360, { fit: "contain", background: "#f7f7f7" })
    .jpeg({ quality: 90 })
    .toBuffer();
  const lifestyle = await sharp(product.output)
    .resize(360, 360, { fit: "cover", position: "centre" })
    .jpeg({ quality: 90 })
    .toBuffer();
  composites.push({ input: reference, left: left + 20, top: top + 54 });
  composites.push({ input: lifestyle, left: left + 400, top: top + 54 });
  composites.push({
    input: Buffer.from(`
      <svg width="${tileWidth}" height="${tileHeight}">
        <rect width="100%" height="100%" fill="none" stroke="#c9d7e6"/>
        <text x="20" y="31" font-family="Arial, sans-serif" font-size="18"
          font-weight="700" fill="#0b2360">${escapeXml(
            `${product.productId} · ${product.title}`,
          )}</text>
        <text x="200" y="433" text-anchor="middle" font-family="Arial, sans-serif"
          font-size="15" font-weight="700" fill="#294b83">MOCKUP REAL</text>
        <text x="580" y="433" text-anchor="middle" font-family="Arial, sans-serif"
          font-size="15" font-weight="700" fill="#294b83">VITRINE</text>
      </svg>
    `),
    left,
    top,
  });
}

const output = path.join(campaignRoot, "review", "corrected-comparison.jpg");
await sharp({
  create: { width, height, channels: 3, background: "#edf5fc" },
})
  .composite(composites)
  .jpeg({ quality: 92 })
  .toFile(output);
console.log(output);
