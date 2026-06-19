// Deixa as estampas prontas pra impressão: faz upscale (se preciso) pro tamanho de
// impressão e marca 300 DPI. Roda em cima dos PNGs em designs/<item>/<posição>/.
//
// O Higgsfield só exporta por aspect ratio + qualidade (sem px/DPI). Este passo
// resolve o resto. Uso: npm run finalize
import sharp from 'sharp'
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = 'designs'
const DPI = 300
const cm = (v) => Math.round((v / 2.54) * DPI) // cm -> px @300dpi

// largura de impressão alvo por subpasta (px @300dpi)
const TARGET = {
  costas: cm(33),
  frente: cm(30),
  peito: cm(9),
  manga: cm(9),
  laser: cm(15),
}
const SKIP = new Set(['mockups', '_mestres'])

function* pngs(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) yield* pngs(p)
    else if (entry.toLowerCase().endsWith('.png')) yield p
  }
}

let count = 0
for (const file of pngs(ROOT)) {
  const folder = file.split(/[\\/]/).slice(-2)[0]
  if (SKIP.has(folder)) continue
  const target = TARGET[folder]

  const src = readFileSync(file) // lê em buffer antes de sobrescrever
  const meta = await sharp(src).metadata()
  let img = sharp(src)
  let finalW = meta.width || 0
  if (target && meta.width && meta.width < target) {
    img = img.resize({ width: target, kernel: 'lanczos3' })
    finalW = target
  }
  const out = await img.png().withMetadata({ density: DPI }).toBuffer()
  writeFileSync(file, out)
  console.log(`OK ${file}  ${meta.width || '?'}px -> ${finalW}px @${DPI}dpi`)
  count++
}

console.log(count ? `\n${count} arquivo(s) prontos pra impressão.` : 'Nenhum PNG em designs/ ainda — gere no Higgsfield e salve nas pastas primeiro.')
