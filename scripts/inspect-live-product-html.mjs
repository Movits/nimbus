const url = process.argv[2];

if (!url) {
  throw new Error("Uso: node scripts/inspect-live-product-html.mjs <url>");
}

const response = await fetch(url);
const html = await response.text();
console.log(JSON.stringify({ status: response.status, length: html.length }));

for (const pattern of ["og:image", "vitrine-nimbus", "js-product-slide", "product-image", "cloudfront"]) {
  const index = html.toLowerCase().indexOf(pattern.toLowerCase());
  console.log(`\n--- ${pattern} @ ${index} ---`);
  if (index >= 0) console.log(html.slice(Math.max(0, index - 500), index + 1200));
}
