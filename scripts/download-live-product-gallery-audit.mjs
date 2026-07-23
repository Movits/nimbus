import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const csvPath = path.join(
  root,
  "nuvemshop",
  "auditoria",
  "2026-07-21",
  "implementacao",
  "matriz-produtos-conteudo-tecnico.csv",
);
const outputDir = path.join(
  root,
  "nuvemshop",
  "auditoria",
  "2026-07-21",
  "implementacao",
  "auditoria-imagens-2026-07-22",
  "live",
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
    } else if (char === '"') {
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
  const [headers, ...records] = rows.filter((entry) => entry.some(Boolean));
  return records.map((record) =>
    Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])),
  );
}

function normalizeUrl(value) {
  const raw = value.replaceAll("&amp;", "&");
  const withProtocol = raw.startsWith("//") ? `https:${raw}` : raw;
  return withProtocol.replace(/-\d+(?:-\d+)?\.(webp|jpe?g|png)(?=$|\?)/i, "-1024-1024.$1");
}

function galleryUrls(html) {
  const sectionStart = html.indexOf('data-store="product-image-');
  const sectionEnd = html.indexOf('data-store="product-info-', sectionStart);
  const section = sectionStart >= 0 ? html.slice(sectionStart, sectionEnd > sectionStart ? sectionEnd : sectionStart + 160000) : html;
  const matches = [...section.matchAll(/class="js-product-slide[^>]*[\s\S]{0,1800}?<a\s+href="([^"]+)"[^>]*data-fancybox="product-gallery"/g)];
  const urls = matches.map((match) => normalizeUrl(match[1]));
  return [...new Set(urls)];
}

async function runPool(items, concurrency, worker) {
  let next = 0;
  const results = new Array(items.length);
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (next < items.length) {
        const index = next;
        next += 1;
        results[index] = await worker(items[index], index);
      }
    }),
  );
  return results;
}

await fs.mkdir(outputDir, { recursive: true });
const products = parseCsv(await fs.readFile(csvPath, "utf8"));

const manifest = await runPool(products, 6, async (product) => {
  const response = await fetch(product.url);
  const html = await response.text();
  const urls = galleryUrls(html);
  const files = [];
  for (let index = 0; index < Math.min(urls.length, 4); index += 1) {
    const imageResponse = await fetch(urls[index]);
    if (!imageResponse.ok) continue;
    const extension = urls[index].match(/\.(webp|jpe?g|png)(?:\?|$)/i)?.[1] ?? "webp";
    const filename = `${product.product_id}-${String(index + 1).padStart(2, "0")}.${extension}`;
    await fs.writeFile(path.join(outputDir, filename), Buffer.from(await imageResponse.arrayBuffer()));
    files.push(filename);
  }
  return {
    product_id: product.product_id,
    title: product.title,
    url: product.url,
    status: response.status,
    gallery_count: urls.length,
    urls,
    files,
  };
});

await fs.writeFile(
  path.join(outputDir, "manifest.json"),
  JSON.stringify({ generated_at: new Date().toISOString(), products: manifest }, null, 2),
);

console.log(
  JSON.stringify(
    {
      products: manifest.length,
      successful: manifest.filter((item) => item.status === 200 && item.files.length).length,
      missing: manifest.filter((item) => item.status !== 200 || !item.files.length),
      outputDir,
    },
    null,
    2,
  ),
);
