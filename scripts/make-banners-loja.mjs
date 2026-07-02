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

// overlay do hero: gradiente céu sólido no topo (área do texto) revelando as nuvens reais
// embaixo, boost branco à esquerda pro título, auréola no alto à direita
function heroOverlay(w, h, haloX, haloY, haloRx) {
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${CEU}" stop-opacity="1"/>
        <stop offset="0.42" stop-color="#e6f1fc" stop-opacity="0.97"/>
        <stop offset="0.68" stop-color="#f2f8fe" stop-opacity="0.5"/>
        <stop offset="1" stop-color="${NUVEM}" stop-opacity="0.02"/>
      </linearGradient>
      <linearGradient id="l" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${NUVEM}" stop-opacity="0.8"/>
        <stop offset="0.42" stop-color="${NUVEM}" stop-opacity="0.2"/>
        <stop offset="1" stop-color="${NUVEM}" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#v)"/>
    <rect width="100%" height="100%" fill="url(#l)"/>
    ${halo(haloX, haloY, haloRx, haloRx * 0.3)}
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

// banner Impacto (v3.1): céu desenhado + nuvens suaves desfocadas + auréola com feixe de luz
function impactoSvg(w, h) {
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${CEU}"/>
        <stop offset="1" stop-color="${NUVEM}"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.74" cy="0.32" r="0.5">
        <stop offset="0" stop-color="${OURO}" stop-opacity="0.18"/>
        <stop offset="1" stop-color="${OURO}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${OURO}" stop-opacity="0.16"/>
        <stop offset="1" stop-color="${OURO}" stop-opacity="0"/>
      </linearGradient>
      <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#glow)"/>
    <polygon points="${w * 0.74 - 55},${h * 0.38} ${w * 0.74 + 55},${h * 0.38} ${w * 0.74 + 80},${h * 0.82} ${w * 0.74 - 80},${h * 0.82}" fill="url(#beam)"/>
    <g filter="url(#soft)">
      <ellipse cx="${w * 0.7}" cy="${h * 1.02}" rx="${w * 0.42}" ry="${h * 0.3}" fill="#ffffff" opacity="0.9"/>
      <ellipse cx="${w * 0.3}" cy="${h * 1.08}" rx="${w * 0.38}" ry="${h * 0.28}" fill="#ffffff" opacity="0.7"/>
      <ellipse cx="${w * 0.92}" cy="${h * 0.98}" rx="${w * 0.22}" ry="${h * 0.2}" fill="#ffffff" opacity="0.8"/>
    </g>
    ${halo(w * 0.74, h * 0.3, 130, 40, -6)}
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

// HERO interim v3.1 — céu desenhado + nuvens reais no rodapé + auréola; esquerda limpa pro texto
await banner({
  src: `${IMG}/bg-ceu.webp`, dest: `${OUT}/banner-hero-desktop.jpg`, w: 1920, h: 620, position: 'bottom',
  overlays: [{ input: heroOverlay(1920, 620, 1580, 140, 120), top: 0, left: 0 }],
})
await banner({
  src: `${IMG}/bg-ceu.webp`, dest: `${OUT}/banner-hero-mobile.jpg`, w: 900, h: 1000, position: 'bottom',
  overlays: [{ input: heroOverlay(900, 1000, 700, 150, 90), top: 0, left: 0 }],
})

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

// IMPACTO v3.1 — peça desenhada: auréola + feixe de luz sobre nuvens suaves; texto à esquerda
await svgBanner(impactoSvg(1600, 600), `${OUT}/banner-impacto.jpg`)

// DESIGN (Pampulha) — reserva editorial (página Sobre / banner extra)
await banner({ src: `${IMG}/bg-pampulha.webp`, dest: `${OUT}/banner-design.jpg`, w: 1600, h: 560, grad: 'left' })
