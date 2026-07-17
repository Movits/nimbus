import fs from "node:fs/promises";
import path from "node:path";

const root = "C:\\Users\\rober\\Nimbus";
const catalogPath = path.join(
  root,
  "nuvemshop",
  "assets",
  "product-lifestyle",
  "2026-07-16",
  "catalog",
  "nuvemshop-products.json",
);
const reportPath = path.join(
  root,
  "nuvemshop",
  "assets",
  "product-lifestyle",
  "2026-07-16",
  "uploads",
  "live-verification.json",
);

const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));
const products = catalog.products;
const concurrency = 3;
let cursor = 0;
const results = [];

async function verify(product) {
  let response;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    response = await fetch(product.url, {
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 NIMBUS catalog verification",
      },
    });
    if (response.status !== 429 || attempt === 4) break;
    await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const html = await response.text();
  const expectedCount = product.gallery.length + 1;
  const amountMatch = html.match(/data-product-images-amount="(\d+)"/);
  const actualCount = amountMatch ? Number(amountMatch[1]) : null;
  const vitrinePattern = new RegExp(
    `products/${product.productId}-vitrine-nimbus-[a-z0-9]+`,
    "gi",
  );
  const distinctVitrineAssets = [
    ...new Set(html.match(vitrinePattern) ?? []),
  ];
  const preloadPattern = new RegExp(
    `<link[^>]+rel="preload"[^>]+href="[^"]*${product.productId}-vitrine-nimbus`,
    "i",
  );
  const ogPattern = new RegExp(
    `<meta[^>]+property="og:image"[^>]+content="[^"]*${product.productId}-vitrine-nimbus`,
    "i",
  );

  const result = {
    productId: product.productId,
    title: product.title,
    collection: product.collection,
    url: product.url,
    expectedImageCount: expectedCount,
    actualImageCount: actualCount,
    distinctVitrineAssets,
    vitrineIsPreloadedCover: preloadPattern.test(html),
    vitrineIsOpenGraphCover: ogPattern.test(html),
  };
  result.ok = result.actualImageCount === result.expectedImageCount
    && result.distinctVitrineAssets.length === 1
    && result.vitrineIsPreloadedCover
    && result.vitrineIsOpenGraphCover;

  return result;
}

async function worker() {
  while (true) {
    const index = cursor;
    cursor += 1;
    if (index >= products.length) return;

    const product = products[index];
    try {
      results[index] = await verify(product);
    } catch (error) {
      results[index] = {
        productId: product.productId,
        title: product.title,
        collection: product.collection,
        url: product.url,
        ok: false,
        error: error.message,
      };
    }
  }
}

await Promise.all(
  Array.from({ length: concurrency }, () => worker()),
);

const failed = results.filter((result) => !result.ok);
const report = {
  verifiedAt: new Date().toISOString(),
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  results,
};

await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  total: report.total,
  passed: report.passed,
  failed: report.failed,
  reportPath,
}, null, 2));

if (failed.length > 0) {
  console.error(JSON.stringify(failed, null, 2));
  process.exitCode = 1;
}
