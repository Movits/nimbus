// Tiles das 3 coleções pra home da loja (módulo de banners lado a lado do Morelia).
// Imagem retrato + gradiente navy embaixo (legibilidade do título que o tema põe por cima).
// Uso: node scripts/make-tiles-loja.mjs
import sharp from 'sharp'
import { mkdirSync } from 'fs'

const IMG = 'public/img'
const OUT = 'nuvemshop/assets'
mkdirSync(OUT, { recursive: true })

const W = 900
const H = 1100

// gradiente navy subindo do rodapé (pro título branco do tema ficar legível)
const grad = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
     <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
       <stop offset="0" stop-color="#0b2360" stop-opacity="0.62"/>
       <stop offset="0.45" stop-color="#0b2360" stop-opacity="0.12"/>
       <stop offset="1" stop-color="#0b2360" stop-opacity="0"/>
     </linearGradient>
     <rect width="100%" height="100%" fill="url(#g)"/>
   </svg>`,
)

async function tile(src, dest, position) {
  await sharp(src)
    .resize(W, H, { fit: 'cover', position })
    .composite([{ input: grad, top: 0, left: 0 }])
    .jpeg({ quality: 86, progressive: true })
    .toFile(dest)
  console.log('ok', dest)
}

await tile(`${IMG}/bg-pampulha.webp`, `${OUT}/tile-street.jpg`, 'centre')
await tile(`${IMG}/bg-cristo.webp`, `${OUT}/tile-reliquia.jpg`, 'right')
await tile(`${IMG}/bg-ceu.webp`, `${OUT}/tile-nuvem.jpg`, 'centre')
