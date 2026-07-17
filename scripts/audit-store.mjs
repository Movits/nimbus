const STORE_URL = 'https://loja.nimbuswear.com.br'
const CONCURRENCY = 6

function decode(value = '') {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function extractAssignedArray(source, marker) {
  const markerIndex = source.indexOf(marker)
  if (markerIndex < 0) return null

  const start = source.indexOf('[', markerIndex + marker.length)
  if (start < 0) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let index = start; index < source.length; index += 1) {
    const character = source[index]

    if (inString) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === '"') inString = false
      continue
    }

    if (character === '"') inString = true
    else if (character === '[') depth += 1
    else if (character === ']') {
      depth -= 1
      if (depth === 0) return source.slice(start, index + 1)
    }
  }

  return null
}

function metaContent(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const expression = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`,
    'i',
  )
  return decode(html.match(expression)?.[1] ?? '')
}

async function mapPool(items, limit, task) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await task(items[index], index)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

const sitemapResponse = await fetch(`${STORE_URL}/sitemap.xml`)
if (!sitemapResponse.ok) throw new Error(`Sitemap respondeu ${sitemapResponse.status}`)
const sitemap = await sitemapResponse.text()

const products = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)]
  .map((match) => {
    const block = match[1]
    const url = decode(block.match(/<loc>(.*?)<\/loc>/)?.[1] ?? '')
    return {
      url,
      sitemapImages: [...block.matchAll(/<image:loc>(.*?)<\/image:loc>/g)].map((image) => decode(image[1])),
    }
  })
  .filter(({ url }) => /\/produtos\/[^/]+\/$/.test(url))

const audited = await mapPool(products, CONCURRENCY, async ({ url, sitemapImages }) => {
  try {
    const response = await fetch(url)
    const html = await response.text()
    const variantsSource = extractAssignedArray(html, 'LS.variants')
    const variants = variantsSource ? JSON.parse(variantsSource) : []
    const visibleVariants = variants.filter((variant) => variant.is_visible !== false)
    const colors = [...new Set(visibleVariants.map((variant) => variant.option1).filter(Boolean))]
    const sizes = [...new Set(visibleVariants.map((variant) => variant.option0).filter(Boolean))]
    const imageSignatures = Object.fromEntries(
      colors.map((color) => [
        color,
        [...new Set(
          visibleVariants
            .filter((variant) => variant.option1 === color)
            .map((variant) => variant.image_url || variant.image)
            .filter(Boolean),
        )].sort(),
      ]),
    )
    const distinctColorImageSignatures = new Set(Object.values(imageSignatures).map((images) => images.join('|')))

    return {
      url,
      status: response.status,
      title: metaContent(html, 'og:title'),
      description: metaContent(html, 'og:description'),
      productId: visibleVariants[0]?.product_id ?? null,
      price: visibleVariants[0]?.price_number ?? null,
      variants: visibleVariants.length,
      colors,
      sizes,
      galleryImages: sitemapImages.length,
      colorImagesDistinct: colors.length < 2 || distinctColorImageSignatures.size === colors.length,
      imageSignatures,
      unavailableVariants: visibleVariants.filter((variant) => !variant.available).length,
      error: null,
    }
  } catch (error) {
    return {
      url,
      status: null,
      title: '',
      description: '',
      productId: null,
      price: null,
      variants: 0,
      colors: [],
      sizes: [],
      galleryImages: sitemapImages.length,
      colorImagesDistinct: false,
      imageSignatures: {},
      unavailableVariants: 0,
      error: error instanceof Error ? error.message : String(error),
    }
  }
})

const issues = audited.filter((product) =>
  product.error
  || product.status !== 200
  || !product.title
  || !product.description
  || !product.price
  || product.variants === 0
  || product.galleryImages === 0
  || !product.colorImagesDistinct,
)

const summary = {
  checkedAt: new Date().toISOString(),
  products: audited.length,
  reachable: audited.filter((product) => product.status === 200).length,
  withImages: audited.filter((product) => product.galleryImages > 0).length,
  withDescriptions: audited.filter((product) => product.description).length,
  withValidPrice: audited.filter((product) => product.price > 0).length,
  multicolor: audited.filter((product) => product.colors.length > 1).length,
  multicolorWithDistinctImages: audited.filter(
    (product) => product.colors.length > 1 && product.colorImagesDistinct,
  ).length,
  issues: issues.length,
}

console.log(JSON.stringify({ summary, issues, products: audited }, null, 2))
