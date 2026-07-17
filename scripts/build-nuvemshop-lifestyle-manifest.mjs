import fs from "node:fs";
import path from "node:path";

const STORE = "https://loja.nimbuswear.com.br";
const OUTPUT_ROOT = path.resolve(
  "nuvemshop/assets/product-lifestyle/2026-07-16/catalog"
);
const REFERENCES_ROOT = path.join(OUTPUT_ROOT, "references");

const decodeHtml = (value = "") =>
  value
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&")
    .replaceAll("&#039;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

const absoluteUrl = (value) => {
  const clean = value.replaceAll("\\/", "/");
  if (clean.startsWith("//")) return `https:${clean}`;
  return new URL(clean, STORE).href;
};

const unique = (items) => [...new Set(items)];

async function getHtml(url) {
  const response = await fetch(url, {
    headers: { "user-agent": "NimbusCatalogAudit/1.0" },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  return response.text();
}

function productLinks(html) {
  return unique(
    [...html.matchAll(/https?:\/\/loja\.nimbuswear\.com\.br\/produtos\/(?!page\/)[^"'?<\\]+\/?/g)]
      .map((match) => match[0])
      .filter((url) => !url.includes("/produtos/page/"))
  );
}

function parseVariants(html) {
  const match = html.match(/LS\.variants\s*=\s*(\[.*?\]);/s);
  return match ? JSON.parse(match[1]) : [];
}

function parseProduct(html, url) {
  const titleMatch = html.match(
    /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i
  );
  const productMatch = html.match(/LS\.product\s*=\s*\{[\s\S]*?id\s*:\s*(\d+),/);
  const variants = parseVariants(html);
  const productId = Number(productMatch?.[1] || variants[0]?.product_id || 0);

  const breadcrumbMatch = html.match(
    /<a class="crumb" href="\/(street|reliquia|nuvem)\/"[^>]*>([^<]+)<\/a>/i
  );
  const collection = breadcrumbMatch?.[1]?.toUpperCase() || "SEM_CATEGORIA";

  const galleryStart = html.indexOf(`data-store="product-image-${productId}"`);
  const galleryEnd = html.indexOf("product-info-column", galleryStart);
  const galleryHtml =
    galleryStart >= 0
      ? html.slice(galleryStart, galleryEnd > galleryStart ? galleryEnd : undefined)
      : "";
  const gallery = unique(
    [...galleryHtml.matchAll(/<a href="([^"]+-1024-1024\.webp)"/g)].map(
      (match) => absoluteUrl(match[1])
    )
  );

  const colors = unique(
    variants.map((variant) => variant.option1).filter(Boolean)
  );
  const variantImages = unique(
    variants
      .filter((variant) => variant.image_url)
      .map((variant) => absoluteUrl(variant.image_url))
  );
  const colorImages = Object.fromEntries(
    colors.map((color) => {
      const variant = variants.find(
        (candidate) => candidate.option1 === color && candidate.image_url
      );
      return [color, variant ? absoluteUrl(variant.image_url) : null];
    })
  );

  const slug = new URL(url).pathname.split("/").filter(Boolean).at(-1);
  return {
    productId,
    slug,
    url,
    title: decodeHtml(titleMatch?.[1] || ""),
    collection,
    colors,
    colorImages,
    gallery,
    variantImages,
  };
}

async function download(url, destination) {
  if (fs.existsSync(destination)) return;
  const response = await fetch(url, {
    headers: { "user-agent": "NimbusCatalogAudit/1.0" },
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }
  fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
}

fs.mkdirSync(REFERENCES_ROOT, { recursive: true });

const urls = [];
for (let page = 1; page <= 6; page += 1) {
  const url =
    page === 1 ? `${STORE}/produtos/` : `${STORE}/produtos/?page=${page}`;
  const html = await getHtml(url);
  urls.push(...productLinks(html));
}

const products = [];
for (const url of unique(urls).sort()) {
  const html = await getHtml(url);
  const product = parseProduct(html, url);
  if (!product.productId || !product.title) continue;

  const productDirectory = path.join(
    REFERENCES_ROOT,
    `${product.productId}-${product.slug}`
  );
  fs.mkdirSync(productDirectory, { recursive: true });

  for (const [index, imageUrl] of product.gallery.entries()) {
    const destination = path.join(
      productDirectory,
      `gallery-${String(index + 1).padStart(2, "0")}.webp`
    );
    await download(imageUrl, destination);
  }

  product.referenceDirectory = path.relative(
    path.resolve("."),
    productDirectory
  );
  products.push(product);
  process.stdout.write(
    `${String(products.length).padStart(2, "0")} ${product.collection} ${product.title}\n`
  );
}

products.sort((a, b) =>
  `${a.collection}-${a.title}`.localeCompare(`${b.collection}-${b.title}`, "pt-BR")
);

const summary = {
  generatedAt: new Date().toISOString(),
  store: STORE,
  count: products.length,
  collections: Object.fromEntries(
    [...new Set(products.map((product) => product.collection))].map(
      (collection) => [
        collection,
        products.filter((product) => product.collection === collection).length,
      ]
    )
  ),
  products,
};

fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
fs.writeFileSync(
  path.join(OUTPUT_ROOT, "nuvemshop-products.json"),
  `${JSON.stringify(summary, null, 2)}\n`
);

const csvRows = [
  ["product_id", "collection", "slug", "title", "colors", "gallery_count", "url"],
  ...products.map((product) => [
    product.productId,
    product.collection,
    product.slug,
    product.title,
    product.colors.join("|"),
    product.gallery.length,
    product.url,
  ]),
];
const csv = csvRows
  .map((row) =>
    row
      .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
      .join(",")
  )
  .join("\n");
fs.writeFileSync(path.join(OUTPUT_ROOT, "nuvemshop-products.csv"), `${csv}\n`);

console.log(
  `Manifesto concluído: ${products.length} produtos (${JSON.stringify(
    summary.collections
  )})`
);
