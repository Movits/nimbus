// Gera o logo + banners da loja Nuvemshop a partir dos assets JA PUBLICOS de public/img.
// (Nenhuma arte de produto entra aqui — só o mundo céu/catedral/Cristo/Pampulha do site.)
// Uso: node scripts/make-banners-loja.mjs
import sharp from 'sharp'
import { mkdirSync } from 'fs'

const IMG = 'public/img'
const OUT = 'nuvemshop/assets'
mkdirSync(OUT, { recursive: true })

// gradiente branco suave (SVG) pra área do texto overlay do tema ficar legível
function gradientSvg(w, h, dir /* 'left' | 'bottom' */) {
  const coords = dir === 'left' ? 'x1="0" y1="0" x2="1" y2="0"' : 'x1="0" y1="1" x2="0" y2="0"'
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <linearGradient id="g" ${coords}>
        <stop offset="0" stop-color="#f7fbff" stop-opacity="0.72"/>
        <stop offset="0.45" stop-color="#f7fbff" stop-opacity="0.25"/>
        <stop offset="1" stop-color="#f7fbff" stop-opacity="0"/>
      </linearGradient>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`,
  )
}

async function banner({ src, dest, w, h, position = 'centre', grad = null, overlays = [] }) {
  let img = sharp(src).resize(w, h, { fit: 'cover', position })
  const comps = []
  if (grad) comps.push({ input: gradientSvg(w, h, grad), top: 0, left: 0 })
  comps.push(...overlays)
  if (comps.length) img = img.composite(comps)
  await img.jpeg({ quality: 86, progressive: true }).toFile(dest)
  console.log('ok', dest)
}

// logo do header (PNG, o editor do Morelia não aceita webp em alguns campos)
await sharp(`${IMG}/wordmark-nimbus.webp`).resize({ width: 600 }).png().toFile(`${OUT}/logo-nimbus.png`)
console.log('ok', `${OUT}/logo-nimbus.png`)

// hero da home (catedral nas nuvens, mesma cena da landing)
await banner({ src: `${IMG}/hero-desktop.webp`, dest: `${OUT}/banner-hero-desktop.jpg`, w: 1920, h: 900, grad: 'bottom' })
await banner({ src: `${IMG}/hero-mobile.webp`, dest: `${OUT}/banner-hero-mobile.jpg`, w: 900, h: 1200, grad: 'bottom' })

// impacto (céu + ícone nuvem/auréola à direita; texto do tema entra à esquerda)
const icon = await sharp(`${IMG}/favicon-512.png`).resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
await banner({
  src: `${IMG}/bg-ceu.webp`, dest: `${OUT}/banner-impacto.jpg`, w: 1600, h: 600, grad: 'left',
  overlays: [{ input: icon, top: 100, left: 1080 }],
})

// fé (Cristo à direita da cena original; texto à esquerda) e design (Pampulha)
await banner({ src: `${IMG}/bg-cristo.webp`, dest: `${OUT}/banner-fe.jpg`, w: 1600, h: 700, position: 'right', grad: 'left' })
await banner({ src: `${IMG}/bg-pampulha.webp`, dest: `${OUT}/banner-design.jpg`, w: 1600, h: 700, grad: 'left' })
