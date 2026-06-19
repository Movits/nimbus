// Recorta o fundo das artes geradas no Higgsfield e gera PNG com transparência real.
// Auto-detecta o tipo de fundo:
//   - VERDE sólido (chroma key)  -> recomendado: corta limpo em QUALQUER arte
//   - XADREZ achatado            -> fallback (flood-fill + componentes); pode comer
//                                   preenchimentos claros de contorno fino.
// Processa designs/_inbox/ e emite prévia sobre MAGENTA pra conferência.
// Uso: npm run cutout:inbox
import sharp from 'sharp'
import { PNG } from 'pngjs'
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const IN = 'designs/_inbox'
const OUT = join(IN, 'transparent')
const DBG = join(OUT, '_debug')

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b
const sat = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b)
const isGreen = (r, g, b) => g > 80 && g > r * 1.25 && g > b * 1.25

function detectMode(d, w, h) {
  const pts = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1], [w >> 1, 0], [w >> 1, h - 1], [0, h >> 1], [w - 1, h >> 1]]
  let green = 0
  for (const [x, y] of pts) {
    const i = (y * w + x) * 4
    if (isGreen(d[i], d[i + 1], d[i + 2])) green++
  }
  return green >= 5 ? 'green' : 'checker'
}

// Chroma key verde: remove o verde e faz "despill" (tira a franja esverdeada).
function greenKey(png) {
  const { width: w, height: h, data: d } = png
  for (let p = 0; p < w * h; p++) {
    const i = p * 4, r = d[i], g = d[i + 1], b = d[i + 2]
    if (isGreen(r, g, b)) d[i + 3] = 0
    else if (g > ((r + b) / 2) * 1.15) d[i + 1] = Math.round((r + b) / 2) // despill
  }
}

// Fallback xadrez: flood-fill das bordas + limpar componentes que contêm cinza.
function checkerKey(png) {
  const { width: w, height: h, data: d } = png
  const N = w * h
  const bgCand = new Uint8Array(N)
  const grayMask = new Uint8Array(N)
  for (let i4 = 0, p = 0; p < N; p++, i4 += 4) {
    const r = d[i4], g = d[i4 + 1], b = d[i4 + 2]
    const L = lum(r, g, b), S = sat(r, g, b)
    if (L >= 175 && S <= 40) bgCand[p] = 1
    if (S <= 16 && L >= 150 && L <= 244) grayMask[p] = 1
  }
  const cleared = new Uint8Array(N)
  const stack = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const p = y * w + x
    if (!cleared[p] && bgCand[p]) { cleared[p] = 1; stack.push(p) }
  }
  const drain = () => {
    while (stack.length) {
      const p = stack.pop(); const x = p % w, y = (p - x) / w
      push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1)
    }
  }
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1) }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y) }
  drain()
  const seen = new Uint8Array(N)
  for (let s = 0; s < N; s++) {
    if (cleared[s] || !bgCand[s] || seen[s]) continue
    const comp = []; let gray = 0; seen[s] = 1; const q = [s]
    for (let qi = 0; qi < q.length; qi++) {
      const p = q[qi]; comp.push(p); if (grayMask[p]) gray++
      const x = p % w, y = (p - x) / w
      if (x + 1 < w && !seen[p + 1] && !cleared[p + 1] && bgCand[p + 1]) { seen[p + 1] = 1; q.push(p + 1) }
      if (x - 1 >= 0 && !seen[p - 1] && !cleared[p - 1] && bgCand[p - 1]) { seen[p - 1] = 1; q.push(p - 1) }
      if (y + 1 < h && !seen[p + w] && !cleared[p + w] && bgCand[p + w]) { seen[p + w] = 1; q.push(p + w) }
      if (y - 1 >= 0 && !seen[p - w] && !cleared[p - w] && bgCand[p - w]) { seen[p - w] = 1; q.push(p - w) }
    }
    if (gray / comp.length > 0.06) for (const p of comp) cleared[p] = 1
  }
  for (let p = 0; p < N; p++) if (cleared[p]) d[p * 4 + 3] = 0
}

function cutout(srcBuf) {
  const png = PNG.sync.read(srcBuf)
  const mode = detectMode(png.data, png.width, png.height)
  if (mode === 'green') greenKey(png)
  else checkerKey(png)
  let transp = 0
  for (let p = 0; p < png.width * png.height; p++) if (png.data[p * 4 + 3] === 0) transp++
  return { buf: PNG.sync.write(png), transp: (100 * transp) / (png.width * png.height), mode }
}

if (!existsSync(IN)) { console.log('Pasta designs/_inbox/ não existe.'); process.exit(0) }
mkdirSync(OUT, { recursive: true })
mkdirSync(DBG, { recursive: true })

const files = readdirSync(IN).filter((f) => f.toLowerCase().endsWith('.png'))
if (!files.length) console.log('Nenhum PNG em designs/_inbox/.')
for (const f of files) {
  const { buf, transp, mode } = cutout(readFileSync(join(IN, f)))
  writeFileSync(join(OUT, f), buf)
  await sharp(buf).flatten({ background: '#ff00ff' }).png().toFile(join(DBG, f))
  console.log(`OK [${mode}] ${f}  ${transp.toFixed(1)}% transparente`)
}
console.log(`\n${files.length} arte(s) em ${OUT} · prévias (magenta) em ${DBG}`)
