// Gera o logo + banners v3.1 da loja Nuvemshop.
// v3.1 (feedback 2026-07-02): sistema visual interino "céu desenhado" — gradiente céu crisp +
// motivo da AURÉOLA (anel ouro fino) — até as fotos lifestyle do Higgsfield existirem
// (prompts em nuvemshop/prompts-higgsfield-loja.md; mesmos nomes de arquivo = zero retrabalho).
// - hero: gradiente + nuvens reais só no rodapé da imagem + auréola (não copia a landing)
// - tile STREET: tipográfico (saiu o store-backdrop, rejeitado pelo dono)
// - banner Fé: Pampulha (o Cristo ficou só no tile RELÍQUIA, pra não repetir)
// - banner Impacto: auréola pairando sobre nuvens suaves (significado: a santidade do servir)
// Texto/tipografia via SVG — precisa de Fraunces/Inter no fontconfig do sistema.
// Uso: node scripts/make-banners-loja.mjs
import sharp from 'sharp'
import { mkdirSync } from 'fs'

const IMG = 'public/img'
const OUT = 'nuvemshop/assets'
mkdirSync(OUT, { recursive: true })

const NAVY = '#0b2360'
const OURO = '#e9c46a'
const CEU = '#dcebfa'
const NUVEM = '#f7fbff'

// anel de auréola (dois traços: glow suave + traço firme)
function halo(x, y, rx, ry, rot = -8, opacity = 1) {
  return `<g transform="translate(${x},${y}) rotate(${rot})" opacity="${opacity}">
    <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${OURO}" stroke-opacity="0.28" stroke-width="${Math.max(10, rx * 0.12)}"/>
    <ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${OURO}" stroke-opacity="0.9" stroke-width="${Math.max(4, rx * 0.045)}"/>
  </g>`
}

// v3.2: hero e impacto ficam VAZIOS (gradiente céu limpo, sem auréola/nuvens) até as fotos
// definitivas do Higgsfield — decisão do dono no preview v3.1.
function emptySkySvg(w, h) {
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${CEU}"/>
      <stop offset="1" stop-color="${NUVEM}"/>
    </linearGradient>
    <rect width="100%" height="100%" fill="url(#bg)"/>
  </svg>`)
}

// scrim navy + tipografia dos tiles fotográficos (Relíquia e Nuvem)
function tileTextSvg(w, h, { kicker, title, desc }) {
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <linearGradient id="s" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="${NAVY}" stop-opacity="0.82"/>
      <stop offset="0.45" stop-color="${NAVY}" stop-opacity="0.32"/>
      <stop offset="0.75" stop-color="${NAVY}" stop-opacity="0"/>
    </linearGradient>
    <rect width="100%" height="100%" fill="url(#s)"/>
    <text x="64" y="${h - 210}" font-family="Inter" font-weight="600" font-size="26" letter-spacing="7" fill="${CEU}">${kicker}</text>
    <text x="60" y="${h - 120}" font-family="Fraunces" font-weight="700" font-size="96" fill="#ffffff">${title}</text>
    <rect x="64" y="${h - 88}" width="46" height="4" rx="2" fill="${OURO}"/>
    <text x="64" y="${h - 44}" font-family="Inter" font-weight="500" font-size="30" fill="#eaf3fd">${desc}</text>
  </svg>`)
}

// tile STREET tipográfico (v3.1): entardecer urbano em gradiente + ruído + auréola-marca d'água
function tileStreetSvg(w, h) {
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#8fc1ea"/>
        <stop offset="0.45" stop-color="#3d5c96"/>
        <stop offset="1" stop-color="${NAVY}"/>
      </linearGradient>
      <filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0.07"/></feComponentTransfer></filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" filter="url(#n)"/>
    ${halo(w * 0.68, h * 0.24, 120, 38, -10, 0.8)}
    <text x="64" y="${h - 210}" font-family="Inter" font-weight="600" font-size="26" letter-spacing="7" fill="${CEU}">COLEÇÃO</text>
    <text x="60" y="${h - 120}" font-family="Fraunces" font-weight="700" font-size="96" fill="#ffffff">STREET</text>
    <rect x="64" y="${h - 88}" width="46" height="4" rx="2" fill="${OURO}"/>
    <text x="64" y="${h - 44}" font-family="Inter" font-weight="500" font-size="30" fill="#eaf3fd">Graffiti e spray, fé de rua</text>
  </svg>`)
}

// gradiente branco pra área de texto dos banners fotográficos
function gradientSvg(w, h, dir /* 'left' | 'bottom' */) {
  const coords = dir === 'left' ? 'x1="0" y1="0" x2="1" y2="0"' : 'x1="0" y1="1" x2="0" y2="0"'
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <linearGradient id="g" ${coords}>
      <stop offset="0" stop-color="${NUVEM}" stop-opacity="0.72"/>
      <stop offset="0.45" stop-color="${NUVEM}" stop-opacity="0.25"/>
      <stop offset="1" stop-color="${NUVEM}" stop-opacity="0"/>
    </linearGradient>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`)
}

async function banner({ src, dest, w, h, position = 'centre', grad = null, overlays = [] }) {
  let img = sharp(src).resize(w, h, { fit: 'cover', position })
  const comps = []
  if (grad) comps.push({ input: gradientSvg(w, h, grad), top: 0, left: 0 })
  comps.push(...overlays)
  if (comps.length) img = img.composite(comps)
  await img.jpeg({ quality: 88, progressive: true }).toFile(dest)
  console.log('ok', dest)
}

async function svgBanner(svgBuffer, dest) {
  await sharp(svgBuffer).jpeg({ quality: 90, progressive: true }).toFile(dest)
  console.log('ok', dest)
}

// logo do header (PNG, o editor do Morelia não aceita webp em alguns campos)
await sharp(`${IMG}/wordmark-nimbus.webp`).resize({ width: 600 }).png().toFile(`${OUT}/logo-nimbus.png`)
console.log('ok', `${OUT}/logo-nimbus.png`)

// HERO v3.2 — VAZIO (gradiente céu limpo) até as fotos lifestyle do Higgsfield
// (HERO-LIFE-01/02/03 em nuvemshop/prompts-higgsfield-loja.md)
await svgBanner(emptySkySvg(1920, 620), `${OUT}/banner-hero-desktop.jpg`)
await svgBanner(emptySkySvg(900, 1000), `${OUT}/banner-hero-mobile.jpg`)

// TILES das coleções (900x1100)
await svgBanner(tileStreetSvg(900, 1100), `${OUT}/tile-street.jpg`)
await banner({
  src: `${IMG}/bg-cristo.webp`, dest: `${OUT}/tile-reliquia.jpg`, w: 900, h: 1100, position: 'right',
  overlays: [{ input: tileTextSvg(900, 1100, { kicker: 'COLEÇÃO', title: 'RELÍQUIA', desc: 'Gótico, vintage e barroco' }), top: 0, left: 0 }],
})
await banner({
  src: `${IMG}/bg-ceu.webp`, dest: `${OUT}/tile-nuvem.jpg`, w: 900, h: 1100, position: 'left bottom',
  overlays: [{ input: tileTextSvg(900, 1100, { kicker: 'COLEÇÃO', title: 'NUVEM', desc: 'O céu em traço leve' }), top: 0, left: 0 }],
})

// FÉ v3.1 — Pampulha (igreja de Niemeyer; o Cristo fica só no tile RELÍQUIA); texto à esquerda
await banner({ src: `${IMG}/bg-pampulha.webp`, dest: `${OUT}/banner-fe.jpg`, w: 1600, h: 560, position: 'centre', grad: 'left' })

// IMPACTO v3.2 — VAZIO (gradiente céu limpo) até a foto definitiva do Higgsfield
// (BANNER-IMPACTO v2, mãos que se alcançam)
await svgBanner(emptySkySvg(1600, 600), `${OUT}/banner-impacto.jpg`)

// DESIGN (Pampulha) — reserva editorial (página Sobre / banner extra)
await banner({ src: `${IMG}/bg-pampulha.webp`, dest: `${OUT}/banner-design.jpg`, w: 1600, h: 560, grad: 'left' })
