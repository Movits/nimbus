import fs from "node:fs";
import path from "node:path";

const ROOT = "C:/Users/rober/Nimbus";
const CATALOG_PATH = path.join(
  ROOT,
  "nuvemshop/assets/product-lifestyle/2026-07-16/catalog/nuvemshop-products.json",
);
const OUTPUT_DIR = path.join(
  ROOT,
  "nuvemshop/auditoria/2026-07-21/implementacao",
);

const SOURCE_TECHNICAL =
  "YouDraw Central de Ajuda — Tecidos e Qualidade, consultada em 2026-07-21";

const garmentSpecs = {
  "Camiseta Premium": {
    youdrawProduct: "Camiseta Premium Unissex / Regular Premium",
    material: "100% algodão penteado, fio 30/1",
    weight: "Não informado pela fonte oficial consultada",
    fit: "Modelagem ajustada unissex",
    collar: "Ribana canelada com reforço ombro a ombro",
    print: "DTG",
    care:
      "Lavar com água fria e sabão neutro; não usar alvejante, amaciante ou secadora; secar à sombra; passar do avesso.",
    measurements: "P 49,5x70,5; M 52,5x72; G 54x75,5; GG 60,5x81,5; EG 63x85 cm (largura x altura)",
    contentGap: "",
    source: SOURCE_TECHNICAL,
  },
  "Camiseta Oversized Premium": {
    youdrawProduct: "Camiseta Oversized Premium",
    material: "100% algodão",
    weight: "240 g",
    fit: "Modelagem oversized unissex, mangas 3/4 e caimento solto",
    collar: "Gola canelada de 3 cm",
    print: "DTG",
    care:
      "Lavar com água fria e sabão neutro; não usar alvejante, amaciante ou secadora; secar à sombra; passar do avesso.",
    measurements: "P 62x78; M 64x80; G 66x82; GG 68x84; EG 70x86 cm (largura x altura)",
    contentGap: "Confirmar no painel que os produtos NIMBUS usam a versão atual de 240 g, pois há páginas antigas do marketplace citando 165 g.",
    source: SOURCE_TECHNICAL,
  },
  "Moletom Canguru": {
    youdrawProduct: "Moletom Unissex com Capuz",
    material: "50% algodão e 50% poliéster",
    weight: "300 g",
    fit: "Modelagem unissex com capuz e bolso canguru",
    collar: "Ribana 1x1: 49,7% algodão, 49,7% poliéster e 0,6% elastano",
    print: "DTF",
    care:
      "Lavar com água fria e sabão neutro; não usar alvejante, amaciante ou secadora; secar à sombra; passar do avesso.",
    measurements: "P 52x60; M 55x64; G 58x65; GG 61x65; EG 69x70 cm (largura x altura)",
    contentGap: "",
    source: SOURCE_TECHNICAL,
  },
  "Blusão Moletom": {
    youdrawProduct: "Moletom Unissex sem Capuz",
    material: "50% algodão e 50% poliéster",
    weight: "Não informado pela fonte oficial consultada",
    fit: "Modelagem unissex sem capuz",
    collar: "Gola careca",
    print: "DTF",
    care:
      "Lavar com água fria e sabão neutro; não usar alvejante, amaciante ou secadora; secar à sombra; passar do avesso.",
    measurements: "AGUARDA CONFIRMAÇÃO DA YOUDRAW",
    contentGap: "A Central de Ajuda informa material e modelagem, mas não publica a tabela de medidas do moletom sem capuz.",
    source: SOURCE_TECHNICAL,
  },
  Ecobag: {
    youdrawProduct: "Ecobag",
    material: "100% algodão",
    weight: "Não informado pela fonte oficial consultada",
    fit: "Bolsa reutilizável",
    collar: "Não se aplica",
    print: "Confirmar no painel YouDraw",
    care: "Lavável; instruções completas aguardam confirmação da YouDraw.",
    measurements: "41x35 cm; alças de 60 cm",
    contentGap: "Capacidade em litros, peso suportado e método de impressão aguardam confirmação da YouDraw.",
    source:
      "YouDraw Marketplace — coleção Ecobag, consultada em 2026-07-21",
  },
};

function decodeHtml(value = "") {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractMeta(html, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:name|property)=["']${escaped}["'][^>]+content=["']([^"']*)`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${escaped}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1]);
  }
  return "";
}

function extractVariants(html) {
  const match = html.match(/LS\.variants = (\[.*?\]);/s);
  if (!match) return [];
  return JSON.parse(match[1]);
}

function parseTitle(title) {
  const [art = "", garment = ""] = title.split("|").map((part) => part.trim());
  return { art, garment };
}

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

async function fetchText(url) {
  const response = await fetch(`${url}?nimbus_audit=${Date.now()}`, {
    headers: { "cache-control": "no-cache" },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

const catalogRaw = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const products = catalogRaw.products || catalogRaw;
const variantRows = [];
const productRows = [];
const errors = [];

for (const product of products) {
  try {
    const html = await fetchText(product.url);
    const variants = extractVariants(html);
    const { art, garment } = parseTitle(product.title);
    const spec = garmentSpecs[garment] || {
      youdrawProduct: "AGUARDA MAPEAMENTO",
      material: "AGUARDA CONFIRMAÇÃO DA YOUDRAW",
      weight: "AGUARDA CONFIRMAÇÃO DA YOUDRAW",
      fit: "AGUARDA CONFIRMAÇÃO DA YOUDRAW",
      collar: "AGUARDA CONFIRMAÇÃO DA YOUDRAW",
      print: "AGUARDA CONFIRMAÇÃO DA YOUDRAW",
      care: "AGUARDA CONFIRMAÇÃO DA YOUDRAW",
      measurements: "AGUARDA CONFIRMAÇÃO DA YOUDRAW",
      contentGap: "Tipo de peça não mapeado.",
      source: "",
    };
    const publicCover = extractMeta(html, "og:image");
    const metaDescription = extractMeta(html, "description");
    const colors = [...new Set(variants.map((variant) => variant.option1).filter(Boolean))];
    const sizes = [...new Set(variants.map((variant) => variant.option0).filter(Boolean))];

    productRows.push({
      product_id: product.productId,
      title: product.title,
      url: product.url,
      collection: product.collection,
      art,
      garment,
      youdraw_product: spec.youdrawProduct,
      public_variant_count: variants.length,
      public_colors: colors.join(" | "),
      public_sizes: sizes.join(" | "),
      public_cover: publicCover,
      meta_description: metaDescription,
      material: spec.material,
      weight: spec.weight,
      fit: spec.fit,
      collar: spec.collar,
      print: spec.print,
      care: spec.care,
      measurements: spec.measurements,
      technical_source: spec.source,
      content_gap: spec.contentGap,
      youdraw_product_id: "AGUARDA EXPORTAÇÃO DO PAINEL",
      current_image_audit: "AGUARDA REAUDITORIA VISUAL PÓS-CORREÇÕES",
    });

    for (const variant of variants) {
      variantRows.push({
        product_id: product.productId,
        product_title: product.title,
        product_url: product.url,
        collection: product.collection,
        art,
        garment,
        nuvemshop_variant_id: variant.id,
        sku: variant.sku || "",
        size: variant.option0 || "",
        color: variant.option1 || "",
        price_brl: variant.price_number ?? "",
        available: variant.available,
        visible: variant.is_visible,
        variant_image_id: variant.image || "",
        variant_image_url: variant.image_url || "",
        public_cover: publicCover,
        youdraw_product_id: "",
        youdraw_variant_id: "",
        youdraw_sku: "",
        youdraw_cost_brl: "",
        youdraw_art_size_cm: "",
        reconciliation_status: "AGUARDA EXPORTAÇÃO DA YOUDRAW",
      });
    }
  } catch (error) {
    errors.push({
      productId: product.productId,
      title: product.title,
      url: product.url,
      error: String(error),
    });
  }
  process.stdout.write(".");
}

const skuCounts = new Map();
for (const row of variantRows) {
  if (!row.sku) continue;
  skuCounts.set(row.sku, (skuCounts.get(row.sku) || 0) + 1);
}
const duplicateSkus = [...skuCounts.entries()]
  .filter(([, count]) => count > 1)
  .map(([sku, count]) => ({ sku, count }));

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function writeCsv(fileName, rows) {
  const columns = rows.length ? Object.keys(rows[0]) : [];
  const lines = [
    columns.map(csvCell).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
  ];
  fs.writeFileSync(path.join(OUTPUT_DIR, fileName), `${lines.join("\n")}\n`, "utf8");
}

writeCsv("matriz-variantes-nuvemshop-parcial.csv", variantRows);
writeCsv("matriz-produtos-conteudo-tecnico.csv", productRows);

const report = {
  generatedAt: new Date().toISOString(),
  sourceCatalog: CATALOG_PATH,
  publicProducts: productRows.length,
  publicVariants: variantRows.length,
  uniqueSkus: skuCounts.size,
  duplicateSkus,
  fetchErrors: errors,
  byGarment: Object.fromEntries(
    [...new Set(productRows.map((row) => row.garment))]
      .sort()
      .map((garment) => [
        garment,
        productRows.filter((row) => row.garment === garment).length,
      ]),
  ),
  byCollection: Object.fromEntries(
    [...new Set(productRows.map((row) => row.collection))]
      .sort()
      .map((collection) => [
        collection,
        productRows.filter((row) => row.collection === collection).length,
      ]),
  ),
  uniqueArts: new Set(productRows.map((row) => row.art)).size,
  uniqueArtsByCollection: Object.fromEntries(
    [...new Set(productRows.map((row) => row.collection))]
      .sort()
      .map((collection) => [
        collection,
        new Set(
          productRows
            .filter((row) => row.collection === collection)
            .map((row) => row.art),
        ).size,
      ]),
  ),
  byColorMode: {
    singleColor: productRows.filter((row) => row.public_colors.split(" | ").filter(Boolean).length === 1).length,
    multipleColors: productRows.filter((row) => row.public_colors.split(" | ").filter(Boolean).length > 1).length,
    noPublicColorOption: productRows.filter((row) => row.public_colors.split(" | ").filter(Boolean).length === 0).length,
  },
  unresolvedTechnicalData: productRows
    .filter((row) => row.content_gap)
    .map((row) => ({
      productId: row.product_id,
      title: row.title,
      gap: row.content_gap,
    })),
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, "resumo-matriz-publica.json"),
  `${JSON.stringify(report, null, 2)}\n`,
  "utf8",
);

console.log("");
console.log(JSON.stringify(report, null, 2));

if (errors.length) process.exitCode = 1;
