// Gera o logo + banners v3 da loja Nuvemshop a partir dos assets JA PUBLICOS de public/img.
// (Nenhuma arte de produto entra aqui — só o mundo céu/Cristo/Pampulha/concreto do site.)
// v3: hero curto (não copia a landing), tiles das 3 coleções, impacto fotográfico (sem cartoon).
// Texto dos tiles usa Fraunces/Inter — precisa das fontes no fontconfig do sistema pra renderizar.
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

// scrim navy + tipografia dos tiles de coleção (kicker + título Fraunces + traço ouro + descritor)
function tileTextSvg(w, h, { kicker, title, desc }) {
  return Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <linearGradient id="s" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#0b2360" stop-opacity="0.82"/>
        <stop offset="0.45" stop-color="#0b2360" stop-opacity="0.32"/>
        <stop offset="0.75" stop-color="#0b2360" stop-opacity="0"/>
      </linearGradient>
      <rect width="100%" height="100%" fill="url(#s)"/>
      <text x="64" y="${h - 210}" font-family="Inter" font-weight="600" font-size="26" letter-spacing="7" fill="#dcebfa">${kicker}</text>
      <text x="60" y="${h - 120}" font-family="Fraunces" font-weight="700" font-size="96" fill="#ffffff">${title}</text>
      <rect x="64" y="${h - 88}" width="46" height="4" rx="2" fill="#e9c46a"/>
      <text x="64" y="${h - 44}" font-family="Inter" font-weight="500" font-size="30" fill="#eaf3fd">${desc}</text>
    </svg>`,
  )
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

// logo do header (PNG, o editor do Morelia não aceita webp em alguns campos)
await sharp(`${IMG}/wordmark-nimbus.webp`).resize({ width: 600 }).png().toFile(`${OUT}/logo-nimbus.png`)
console.log('ok', `${OUT}/logo-nimbus.png`)

// HERO v3 — curto (cabe na tela com o header) e SEM a composição da landing:
// faixa do meio do céu (azul + topo das nuvens), texto do tema entra à esquerda.
await banner({ src: `${IMG}/bg-ceu.webp`, dest: `${OUT}/banner-hero-desktop.jpg`, w: 1920, h: 620, position: 'centre', grad: 'left' })
await banner({ src: `${IMG}/bg-ceu.webp`, dest: `${OUT}/banner-hero-mobile.jpg`, w: 900, h: 1000, position: 'centre', grad: 'bottom' })

// TILES das coleções (900x1100): base fotográfica + scrim navy + tipografia
await banner({
  src: `${IMG}/store-backdrop.webp`, dest: `${OUT}/tile-street.jpg`, w: 900, h: 1100, position: 'centre',
  overlays: [{ input: tileTextSvg(900, 1100, { kicker: 'COLEÇÃO', title: 'STREET', desc: 'Graffiti e spray, fé de rua' }), top: 0, left: 0 }],
})
await banner({
  src: `${IMG}/bg-cristo.webp`, dest: `${OUT}/tile-reliquia.jpg`, w: 900, h: 1100, position: 'right',
  overlays: [{ input: tileTextSvg(900, 1100, { kicker: 'COLEÇÃO', title: 'RELÍQUIA', desc: 'Gótico, vintage e barroco' }), top: 0, left: 0 }],
})
await banner({
  src: `${IMG}/bg-ceu.webp`, dest: `${OUT}/tile-nuvem.jpg`, w: 900, h: 1100, position: 'left bottom',
  overlays: [{ input: tileTextSvg(900, 1100, { kicker: 'COLEÇÃO', title: 'NUVEM', desc: 'O céu em traço leve' }), top: 0, left: 0 }],
})

// IMPACTO v3 — fotográfico (nuvens reais, sem ícone cartoon); texto do tema à esquerda
await banner({ src: `${IMG}/bg-ceu.webp`, dest: `${OUT}/banner-impacto.jpg`, w: 1600, h: 600, position: 'bottom', grad: 'left' })

// FÉ — Cristo à direita da cena original; texto à esquerda (proporção mais baixa no v3)
await banner({ src: `${IMG}/bg-cristo.webp`, dest: `${OUT}/banner-fe.jpg`, w: 1600, h: 560, position: 'right', grad: 'left' })

// DESIGN (Pampulha) — reserva editorial (página Sobre / banner extra), mesma proporção
await banner({ src: `${IMG}/bg-pampulha.webp`, dest: `${OUT}/banner-design.jpg`, w: 1600, h: 560, grad: 'left' })
