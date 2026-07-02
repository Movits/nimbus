// Gera os favicons (do ícone da _marca) e os crops mobile dos fundos da landing.
// Uso: node scripts/make-favicons-e-mobile.mjs
import sharp from 'sharp'

const ICON = 'designs/prontos/_marca/logo-icone-nuvem-v2.png'
const OUT = 'public/img'

async function favicons() {
  const sizes = [
    { size: 512, file: `${OUT}/favicon-512.png` },
    { size: 180, file: `${OUT}/favicon-180.png` },
    { size: 48, file: `${OUT}/favicon-48.png` },
    { size: 130, file: `${OUT}/favicon-nuvemshop-130.png` }, // upload manual na Nuvemshop (Layout → Favicon)
  ]
  for (const { size, file } of sizes) {
    await sharp(ICON)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(file)
    console.log('ok', file)
  }
}

// Crop retrato (9:16) puxado pro ponto de interesse — a estátua/igreja não fica no centro do frame.
async function mobileCrop(src, dest, centerXRatio) {
  const img = sharp(src)
  const { width, height } = await img.metadata()
  const cropW = Math.round(height * (9 / 16))
  const cx = Math.round(width * centerXRatio)
  const left = Math.max(0, Math.min(width - cropW, cx - Math.round(cropW / 2)))
  await img.extract({ left, top: 0, width: cropW, height }).webp({ quality: 82 }).toFile(dest)
  console.log('ok', dest, `(crop ${cropW}x${height} @ left=${left})`)
}

await favicons()
await mobileCrop(`${OUT}/bg-cristo.webp`, `${OUT}/bg-cristo-mobile.webp`, 0.72)
await mobileCrop(`${OUT}/bg-pampulha.webp`, `${OUT}/bg-pampulha-mobile.webp`, 0.55)
