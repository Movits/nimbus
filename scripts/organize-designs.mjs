// Organiza TODAS as artes: renomeia os originais (originais/), recorta o fundo
// (auto-detecta VERDE=chroma key OU XADREZ=flood-fill+componentes), redimensiona
// pra 300 DPI (long edge ~3500px) e salva em prontos/{costas,peito}.
// Prévia de conferência (magenta) vai pra scripts/_verif (temporária).
// Uso: node scripts/organize-designs.mjs
import sharp from 'sharp'
import { readdirSync, mkdirSync, copyFileSync } from 'node:fs'
import { join, extname } from 'node:path'

const SRC = 'designs/_mestres/_originais'
const ORIG = 'designs/originais'
const OUT = 'designs/prontos'
const VERIF = 'scripts/_verif'
const DPI = 300
const LONG = 3500

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b
const sat = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b)
const isGreen = (r, g, b) => g > 80 && g > r * 1.25 && g > b * 1.25

function greenKey(d, w, h) {
  for (let p = 0; p < w * h; p++) {
    const i = p * 4, r = d[i], g = d[i + 1], b = d[i + 2]
    if (isGreen(r, g, b)) d[i + 3] = 0
    else if (g > ((r + b) / 2) * 1.15) d[i + 1] = Math.round((r + b) / 2)
  }
}

function checkerKey(d, w, h) {
  const N = w * h
  const bgCand = new Uint8Array(N), grayMask = new Uint8Array(N)
  for (let p = 0; p < N; p++) {
    const i = p * 4, r = d[i], g = d[i + 1], b = d[i + 2]
    const L = lum(r, g, b), S = sat(r, g, b)
    if (L >= 175 && S <= 40) bgCand[p] = 1
    if (S <= 16 && L >= 150 && L <= 244) grayMask[p] = 1
  }
  const cleared = new Uint8Array(N), stack = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const p = y * w + x
    if (!cleared[p] && bgCand[p]) { cleared[p] = 1; stack.push(p) }
  }
  const drain = () => {
    while (stack.length) { const p = stack.pop(); const x = p % w, y = (p - x) / w; push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1) }
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

// [match(file) → bool, nome, pasta, fundo]
const MAP = [
  [(f) => f.includes('2d970291'), 'G1-nimbus-tag-roxo', 'costas', 'green'],
  [(f) => f.includes('90ef05bb'), 'G1-nimbus-tag-azul', 'costas', 'green'],
  [(f) => f.includes('6330b561'), 'G2-anjo-stencil', 'costas', 'green'],
  [(f) => f.includes('90167416'), 'G2-anjo-livro-stencil', 'costas', 'green'],
  [(f) => f.includes('95529e5b'), 'G3-acima-de-tudo-tags', 'costas', 'green'],
  [(f) => f.includes('e78bef00'), 'G3-acima-de-tudo-azul', 'costas', 'green'],
  [(f) => f.includes('f7e77dc9'), 'G4-cristo-stencil-branco', 'costas', 'green'],
  [(f) => f.includes('4bf469c6'), 'G4-cristo-stencil-ouro', 'costas', 'green'],
  [(f) => f.includes('63d795ac'), 'G5-icone-nuvem-spray', 'peito', 'green'],
  [(f) => f.includes('be86b511'), 'nimbus-spray-puffy', 'peito', 'green'],
  [(f) => f.includes('4ddce655'), 'B1-nimbus-blackletter', 'costas', 'green'],
  [(f) => f.includes('6cd7738f'), 'B2-salmo19', 'costas', 'green'],
  [(f) => f.includes('5e719de4'), 'B3-cruz-crest', 'costas', 'green'],
  [(f) => f.includes('1108a9fd'), 'B4-acima-de-tudo-gotico-branco', 'peito', 'green'],
  [(f) => f.includes('ed2ce85f'), 'B4-acima-de-tudo-gotico-preto', 'peito', 'green'],
  [(f) => f.includes('97962761'), 'B5-aparecida-halftone', 'costas', 'green'],
  // antigas (fundo xadrez)
  [(f) => f.startsWith('EST-01'), 'catedral-nuvem', 'costas', 'checker'],
  [(f) => f.startsWith('EST-02') && f.includes('v1'), 'logo-icone-nuvem-v1', 'peito', 'checker'],
  [(f) => f.startsWith('EST-02') && f.includes('v2'), 'logo-icone-nuvem-v2', 'peito', 'checker'],
  [(f) => f.startsWith('EST-03'), 'sagrado-coracao-azul', 'peito', 'checker'],
  [(f) => f.startsWith('EST-04'), 'cristo-crest-azul', 'costas', 'checker'],
]

for (const d of [ORIG, join(OUT, 'costas'), join(OUT, 'peito'), VERIF]) mkdirSync(d, { recursive: true })

const files = readdirSync(SRC)
for (const [match, name, dest, bg] of MAP) {
  const file = files.find(match)
  if (!file) { console.log('FALTA:', name); continue }
  const src = join(SRC, file)
  copyFileSync(src, join(ORIG, name + extname(file))) // original renomeado (backup)

  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h } = info
  if (bg === 'green') greenKey(data, w, h)
  else checkerKey(data, w, h)

  const raw = { raw: { width: w, height: h, channels: 4 } }
  const scale = LONG / Math.max(w, h)
  let pipe = sharp(data, raw)
  if (scale > 1) pipe = pipe.resize({ width: Math.round(w * scale), height: Math.round(h * scale), kernel: 'lanczos3' })
  await pipe.png().withMetadata({ density: DPI }).toFile(join(OUT, dest, name + '.png'))
  await sharp(data, raw).flatten({ background: '#ff00ff' }).resize({ width: 700 }).png().toFile(join(VERIF, name + '.png'))
  console.log(`OK ${dest}/${name}.png  [${bg}]  ${w}x${h}`)
}
console.log('\noriginais/ (renomeados) + prontos/ gerados. Confira scripts/_verif e depois apague.')
