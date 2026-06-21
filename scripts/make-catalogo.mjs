// Gera um contact-sheet ROTULADO das estampas prontas, por coleção, em designs/_catalogo/
// (pra comparar a olho com o histórico do Higgsfield). Uso: node scripts/make-catalogo.mjs
import sharp from 'sharp'
import { readdirSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const OUT = 'designs/prontos'
const DST = 'designs/_catalogo'
mkdirSync(DST, { recursive: true })
const COLS = 5, T = 300, PAD = 8, LBL = 34, BG = '#9aa0aa' // cinza médio: artes claras E escuras aparecem

function list(col) {
  const out = []
  for (const sub of ['costas', 'peito']) {
    const d = join(OUT, col, sub)
    if (existsSync(d)) for (const f of readdirSync(d).filter((f) => f.endsWith('.png')).sort()) out.push([join(d, f), f.replace('.png', '')])
  }
  const root = join(OUT, col)
  if (existsSync(root)) for (const f of readdirSync(root).filter((f) => f.endsWith('.png')).sort()) out.push([join(root, f), f.replace('.png', '')])
  return out
}

async function sheet(name, items) {
  const rows = Math.ceil(items.length / COLS)
  const W = COLS * (T + PAD) + PAD, H = rows * (T + LBL + PAD) + PAD + 36
  const comp = [{ input: Buffer.from(`<svg width="${W}" height="32"><text x="8" y="24" font-size="22" fill="#fff" font-family="monospace">${name} (${items.length})</text></svg>`), left: 0, top: 4 }]
  for (let i = 0; i < items.length; i++) {
    const x = PAD + (i % COLS) * (T + PAD), y = 36 + PAD + ((i / COLS) | 0) * (T + LBL + PAD)
    const thumb = await sharp(items[i][0]).flatten({ background: BG }).resize({ width: T, height: T, fit: 'contain', background: BG }).png().toBuffer()
    comp.push({ input: thumb, left: x, top: y })
    comp.push({ input: Buffer.from(`<svg width="${T}" height="${LBL}"><rect width="100%" height="100%" fill="#1b2030"/><text x="5" y="22" font-size="15" fill="#7fd" font-family="monospace">${items[i][1]}</text></svg>`), left: x, top: y + T })
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: '#111' } }).composite(comp).png().toFile(join(DST, `cat-${name}.png`))
  console.log(`${DST}/cat-${name}.png : ${items.length}`)
}

await sheet('STREET', list('STREET'))
await sheet('RELIQUIA', list('RELIQUIA'))
await sheet('NUVEM-marca', list('NUVEM').concat(list('_marca')))
