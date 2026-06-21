// Recorta o fundo (auto-detecta VERDE=chroma key ou XADREZ=flood-fill+componentes),
// redimensiona pra 300 DPI (long edge ~3500px) e organiza as artes POR COLEÇÃO em
// designs/prontos/<COLECAO>/{costas,peito}. Lê de designs/originais/ (renomeadas).
// Uso: node scripts/organize-designs.mjs
import sharp from 'sharp'
import { readdirSync, mkdirSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'designs/originais'
const OUT = 'designs/prontos'
const DPI = 300
const LONG = 3500

const isGreen = (r, g, b) => g > 80 && g > r * 1.25 && g > b * 1.25
// magenta/pink (#FF00FF) — usado em artes com verde na própria estampa (ex.: coleção PADROEIRA)
const isMagenta = (r, g, b) => r > 110 && b > 110 && g < r * 0.65 && g < b * 0.65

function detectBg(d, w, h) {
  const pts = [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1], [w >> 1, 0], [w >> 1, h - 1], [0, h >> 1], [w - 1, h >> 1]]
  let green = 0, mag = 0
  for (const [x, y] of pts) {
    const i = (y * w + x) * 4, r = d[i], g = d[i + 1], b = d[i + 2]
    if (isGreen(r, g, b)) green++
    else if (isMagenta(r, g, b)) mag++
  }
  if (green >= 5) return 'green'
  if (mag >= 5) return 'magenta'
  return 'checker'
}
function greenKey(d, w, h) {
  for (let p = 0; p < w * h; p++) {
    const i = p * 4, r = d[i], g = d[i + 1], b = d[i + 2]
    if (isGreen(r, g, b)) d[i + 3] = 0
    else if (g > ((r + b) / 2) * 1.15) d[i + 1] = Math.round((r + b) / 2)
  }
}
function magentaKey(d, w, h) {
  for (let p = 0; p < w * h; p++) {
    const i = p * 4, r = d[i], g = d[i + 1], b = d[i + 2]
    if (isMagenta(r, g, b)) d[i + 3] = 0
    else if (r > g * 1.2 && b > g * 1.2) { d[i] = Math.min(r, Math.round(g * 1.3)); d[i + 2] = Math.min(b, Math.round(g * 1.3)) } // despill magenta leve
  }
}
// Xadrez do Higgsfield = dois cinzas NEUTROS (R=G=B), ~234 e ~254. O branco da arte é levemente
// quente (R>B). Removemos só o cinza neutro claro conectado à borda (flood-fill) — o branco/quente
// da arte forma barreira e fica intacto. (Não removemos pockets enclausurados, pra não comer arte.)
function checkerKey(d, w, h) {
  const N = w * h
  const isChecker = (p) => {
    const i = p * 4, r = d[i], g = d[i + 1], b = d[i + 2]
    const neutral = Math.abs(r - g) <= 3 && Math.abs(g - b) <= 3 && Math.abs(r - b) <= 4
    return neutral && (r + g + b) / 3 >= 224
  }
  const cleared = new Uint8Array(N), st = []
  const push = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const p = y * w + x; if (!cleared[p] && isChecker(p)) { cleared[p] = 1; st.push(p) } }
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1) }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y) }
  while (st.length) { const p = st.pop(); const x = p % w, y = (p - x) / w; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1) }
  // despeckle: limpa pixels claros isolados cercados pela área já removida (ruído do xadrez),
  // sem tocar na arte (pixel da arte tem vizinhos de arte, não de fundo). 2 passadas p/ clusters.
  for (let pass = 0; pass < 2; pass++) {
    const add = []
    for (let p = 0; p < N; p++) {
      if (cleared[p]) continue
      const i = p * 4
      if ((d[i] + d[i + 1] + d[i + 2]) / 3 < 200) continue
      const x = p % w, y = (p - x) / w
      if (x <= 0 || y <= 0 || x >= w - 1 || y >= h - 1) { add.push(p); continue }
      let c = 0
      if (cleared[p - 1]) c++; if (cleared[p + 1]) c++; if (cleared[p - w]) c++; if (cleared[p + w]) c++
      if (cleared[p - w - 1]) c++; if (cleared[p - w + 1]) c++; if (cleared[p + w - 1]) c++; if (cleared[p + w + 1]) c++
      if (c >= 6) add.push(p)
    }
    if (!add.length) break
    for (const p of add) cleared[p] = 1
  }
  for (let p = 0; p < N; p++) if (cleared[p]) d[p * 4 + 3] = 0
}

// coleção pelo código/nome do arquivo
function collectionOf(name) {
  if (/^G\d/.test(name)) return 'STREET'
  if (/^[BH]\d/.test(name)) return 'RELIQUIA'
  if (/^Y\d/.test(name)) return 'GLORIA'
  if (/^S\d/.test(name)) return 'PADROEIRA'
  if (name.startsWith('logo-icone-nuvem')) return '_marca'
  if (name === 'nimbus-spray-puffy') return 'STREET'
  if (['catedral-nuvem', 'cristo-crest-azul', 'sagrado-coracao-azul'].includes(name)) return 'NUVEM'
  return 'OUTROS'
}
const PEITO = new Set([
  'G5-icone-nuvem-spray', 'nimbus-spray-puffy',
  'B4-acima-de-tudo-gotico-branco', 'B4-acima-de-tudo-gotico-preto', 'sagrado-coracao-azul',
])

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true })

const files = readdirSync(SRC).filter((f) => /\.(png|jpe?g)$/i.test(f))
for (const file of files) {
  const name = file.replace(/\.(png|jpe?g)$/i, '')
  const col = collectionOf(name)
  const placement = col === '_marca' ? '' : (PEITO.has(name) ? 'peito' : 'costas')
  const destDir = placement ? join(OUT, col, placement) : join(OUT, col)
  mkdirSync(destDir, { recursive: true })

  const { data, info } = await sharp(join(SRC, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  const bg = detectBg(data, w, h)
  if (bg === 'green') greenKey(data, w, h)
  else if (bg === 'magenta') magentaKey(data, w, h)
  else checkerKey(data, w, h)

  const raw = { raw: { width: w, height: h, channels: 4 } }
  const scale = LONG / Math.max(w, h)
  let pipe = sharp(data, raw)
  if (scale > 1) pipe = pipe.resize({ width: Math.round(w * scale), height: Math.round(h * scale), kernel: 'lanczos3' })
  await pipe.png().withMetadata({ density: DPI }).toFile(join(destDir, name + '.png'))
  console.log(`OK ${col}${placement ? '/' + placement : ''}/${name}.png  [${bg}]`)
}
// pasta de mockups por coleção (prontas pra preencher depois)
for (const c of ['STREET', 'RELIQUIA', 'GLORIA', 'PADROEIRA', 'NUVEM']) mkdirSync(join(OUT, c, 'mockups'), { recursive: true })
console.log('\nReorganizado por coleção em', OUT)
