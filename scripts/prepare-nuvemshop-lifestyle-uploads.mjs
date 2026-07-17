import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const campaignRoot =
  "C:\\Users\\rober\\Nimbus\\nuvemshop\\assets\\product-lifestyle\\2026-07-16";
const state = JSON.parse(
  fs.readFileSync(path.join(campaignRoot, "generation-state.json"), "utf8"),
);
const outputDir = path.join(campaignRoot, "uploads");
fs.mkdirSync(outputDir, { recursive: true });

const products = Object.values(state.products)
  .filter((product) => product.status === "completed" && fs.existsSync(product.output))
  .sort((left, right) => left.productId - right.productId);

const manifest = [];
for (const product of products) {
  const destination = path.join(
    outputDir,
    `${product.productId}-vitrine-nimbus.jpg`,
  );
  await sharp(product.output)
    .resize(2048, 2048, { fit: "cover", position: "centre" })
    .flatten({ background: "#ffffff" })
    .jpeg({
      quality: 91,
      chromaSubsampling: "4:4:4",
      progressive: true,
      mozjpeg: true,
    })
    .withMetadata({
      density: 72,
      comment: `NIMBUS lifestyle · ${product.title}`,
    })
    .toFile(destination);

  const stats = fs.statSync(destination);
  manifest.push({
    productId: product.productId,
    title: product.title,
    collection: product.collection,
    productUrl: product.productUrl,
    adminUrl: `https://nimbus40.lojavirtualnuvem.com.br/admin/products/${product.productId}`,
    upload: destination,
    bytes: stats.size,
    megabytes: Number((stats.size / 1024 / 1024).toFixed(2)),
    sourcePng: product.output,
  });
}

fs.writeFileSync(
  path.join(outputDir, "upload-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);
const csvRows = [
  ["productId", "title", "collection", "adminUrl", "upload", "megabytes"],
  ...manifest.map((item) => [
    item.productId,
    item.title,
    item.collection,
    item.adminUrl,
    item.upload,
    item.megabytes,
  ]),
].map((row) =>
  row
    .map((value) => `"${String(value).replaceAll('"', '""')}"`)
    .join(","),
);
fs.writeFileSync(
  path.join(outputDir, "upload-manifest.csv"),
  `${csvRows.join("\r\n")}\r\n`,
  "utf8",
);

const totalBytes = manifest.reduce((sum, item) => sum + item.bytes, 0);
console.log(
  JSON.stringify(
    {
      count: manifest.length,
      totalMegabytes: Number((totalBytes / 1024 / 1024).toFixed(2)),
      averageMegabytes: Number(
        (totalBytes / manifest.length / 1024 / 1024).toFixed(2),
      ),
      largestMegabytes: Math.max(...manifest.map((item) => item.megabytes)),
      outputDir,
    },
    null,
    2,
  ),
);
