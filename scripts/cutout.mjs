// Pipeline de assets do NIMBUS:
//  - recorta o fundo "xadrez" (gravado nos pixels) dos logos -> transparência real
//  - redimensiona e converte tudo pra WebP (qualidade alta, peso baixo)
//  - saída SÓ otimizada em public/img (os PNGs gigantes ficam fora do repo)
//
// Fontes: C:/Users/rober/Downloads/Nimbus-Higgsfield  ·  Uso: npm run assets
import { PNG } from 'pngjs'
import sharp from 'sharp'
import { readFileSync, readdirSync, rmSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'C:/Users/rober/Downloads/Nimbus-Higgsfield'
const OUT = 'public/img'

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b
const sat = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b)

// Recorta o xadrez do fundo e devolve um bitmap RGBA cru.
// Estratégia que PRESERVA o detalhe das letras:
//  1) flood-fill a partir das bordas -> limpa o fundo externo.
//  2) limpa só o MIOLO DA AURÉOLA semeando o flood-fill a partir de pixels
//     vizinhos ao dourado (a auréola é a única coisa cercada por dourado;
//     as letras são cercadas por azul-marinho, então não são tocadas).
function cutout(inPath) {
  const png = PNG.sync.read(readFileSync(inPath))
  const { width: w, height: h, data: d } = png
  const N = w * h
  const at = (x, y) => (y * w + x) * 4

  const bgCand = new Uint8Array(N) // claro e pouco saturado (xadrez/branco/AA)
  const grayMask = new Uint8Array(N) // cinza neutro (quadrado escuro do xadrez)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = at(x, y)
      const r = d[i], g = d[i + 1], b = d[i + 2]
      const L = lum(r, g, b), S = sat(r, g, b)
      if (L >= 175 && S <= 40) bgCand[y * w + x] = 1
      if (S <= 16 && L >= 150 && L <= 244) grayMask[y * w + x] = 1
    }
  }

  const cleared = new Uint8Array(N)
  const stack = []
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const p = y * w + x
    if (!cleared[p] && bgCand[p]) {
      cleared[p] = 1
      stack.push(p)
    }
  }
  const drain = () => {
    while (stack.length) {
      const p = stack.pop()
      const x = p % w, y = (p - x) / w
      push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1)
    }
  }

  // 1) bordas -> fundo externo
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1) }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y) }
  drain()

  // 2) componentes fechados (não tocados pelas bordas) que contêm xadrez (cinza)
  //    são limpos por completo: miolo da auréola e buracos das letras. As letras
  //    (branco + azul-claro, SEM cinza neutro) e o anel dourado (não é bgCand)
  //    ficam intactos.
  const seen = new Uint8Array(N)
  for (let start = 0; start < N; start++) {
    if (cleared[start] || !bgCand[start] || seen[start]) continue
    const comp = []
    let grayCount = 0
    seen[start] = 1
    const q = [start]
    for (let qi = 0; qi < q.length; qi++) {
      const p = q[qi]
      comp.push(p)
      if (grayMask[p]) grayCount++
      const x = p % w, y = (p - x) / w
      if (x + 1 < w && !seen[p + 1] && !cleared[p + 1] && bgCand[p + 1]) { seen[p + 1] = 1; q.push(p + 1) }
      if (x - 1 >= 0 && !seen[p - 1] && !cleared[p - 1] && bgCand[p - 1]) { seen[p - 1] = 1; q.push(p - 1) }
      if (y + 1 < h && !seen[p + w] && !cleared[p + w] && bgCand[p + w]) { seen[p + w] = 1; q.push(p + w) }
      if (y - 1 >= 0 && !seen[p - w] && !cleared[p - w] && bgCand[p - w]) { seen[p - w] = 1; q.push(p - w) }
    }
    if (grayCount / comp.length > 0.06) {
      for (const p of comp) cleared[p] = 1
    }
  }

  for (let p = 0; p < N; p++) if (cleared[p]) d[p * 4 + 3] = 0

  let transp = 0
  for (let p = 0; p < N; p++) if (d[p * 4 + 3] === 0) transp++
  console.log(`  recorte ${inPath.split(/[\\/]/).pop()}: ${(100 * transp / N).toFixed(1)}% transparente`)
  return { data: d, width: w, height: h }
}

const files = readdirSync(SRC)
const find = (pred) => {
  const f = files.find(pred)
  if (!f) throw new Error('arquivo não encontrado em ' + SRC + ' (' + pred + ')')
  return join(SRC, f)
}

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })
for (const f of readdirSync(OUT)) rmSync(join(OUT, f))

// --- Fundos (foto): resize + WebP qualidade alta ---
const BG = [
  { pick: (f) => f.startsWith('HERO-01'), out: 'hero-desktop.webp', width: 2000, q: 84 },
  { pick: (f) => f.startsWith('HERO-02'), out: 'hero-mobile.webp', width: 1080, q: 82 },
  { pick: (f) => f.startsWith('BG-01') && f.includes('v1'), out: 'bg-ceu.webp', width: 1920, q: 82 },
  { pick: (f) => f.startsWith('BG-02'), out: 'bg-cristo.webp', width: 1920, q: 82 },
  { pick: (f) => f.startsWith('BG-03'), out: 'bg-pampulha.webp', width: 1920, q: 82 },
  { pick: (f) => f.startsWith('STORE-01'), out: 'store-backdrop.webp', width: 1920, q: 82 },
]
for (const b of BG) {
  await sharp(find(b.pick))
    .resize({ width: b.width, withoutEnlargement: true })
    .webp({ quality: b.q })
    .toFile(join(OUT, b.out))
  console.log(`OK ${b.out}`)
}

// --- Logo wordmark (com alpha): recorte -> trim -> WebP nítido ---
{
  const { data, width, height } = cutout(find((f) => f.startsWith('EMBLEM-A') && f.includes('v1')))
  const raw = { raw: { width, height, channels: 4 } }
  await sharp(Buffer.from(data), raw)
    .trim()
    .resize({ width: 1000, withoutEnlargement: true })
    .webp({ quality: 92, alphaQuality: 100 })
    .toFile(join(OUT, 'wordmark-nimbus.webp'))
  console.log('OK wordmark-nimbus.webp')
  // prévia de verificação: compõe sobre MAGENTA (transparente vira magenta)
  await sharp(Buffer.from(data), raw)
    .flatten({ background: '#ff00ff' })
    .resize({ width: 1000, withoutEnlargement: true })
    .png()
    .toFile('scripts/_debug-wordmark.png')
  console.log('OK scripts/_debug-wordmark.png (verificação)')
}

// --- Ícone (favicon): recorte -> trim -> PNG pequeno com alpha ---
{
  const { data, width, height } = cutout(find((f) => f.startsWith('EMBLEM-C')))
  await sharp(Buffer.from(data), { raw: { width, height, channels: 4 } })
    .trim()
    .resize({ width: 128 })
    .png()
    .toFile(join(OUT, 'icon-cloud.png'))
  console.log('OK icon-cloud.png')
}

console.log('\nAssets gerados em', OUT)
