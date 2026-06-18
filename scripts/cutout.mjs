// Recorta o fundo "xadrez" (gravado nos pixels) dos logos do Higgsfield e gera
// PNG com transparência real. Também copia a arte do Dom Bosco v2.
//
// Estratégia:
//  1) flood-fill a partir das bordas removendo pixels claros (xadrez/branco),
//     parando no contorno azul-marinho das letras → limpa o fundo externo.
//  2) limpa o xadrez ENCRAVADO (miolo da auréola fechada, furos das letras):
//     remove cinzas neutros e brancos colados neles. As letras (branco + azul
//     claro, sem cinza neutro) são preservadas.
//
// Uso: npm run assets
import { PNG } from 'pngjs'
import { readFileSync, writeFileSync, readdirSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'C:/Users/rober/Downloads/Nimbus-Higgsfield'
const OUT = 'public/img'

const lum = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b
const sat = (r, g, b) => Math.max(r, g, b) - Math.min(r, g, b)

function cutout(inPath, outPath) {
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
      if (S <= 14 && L >= 178 && L <= 232) grayMask[y * w + x] = 1
    }
  }

  // 1) flood-fill a partir das bordas
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
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1) }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y) }
  while (stack.length) {
    const p = stack.pop()
    const x = p % w, y = (p - x) / w
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1)
  }

  // 2a) xadrez encravado: cinza neutro vira transparente
  for (let p = 0; p < N; p++) if (!cleared[p] && grayMask[p]) cleared[p] = 1

  // 2b) brancos colados a cinza neutro (quadrados claros do xadrez encravado)
  const R = 5
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x
      if (cleared[p]) continue
      const i = at(x, y)
      const r = d[i], g = d[i + 1], b = d[i + 2]
      if (lum(r, g, b) >= 244 && sat(r, g, b) <= 14) {
        let near = false
        for (let dy = -R; dy <= R && !near; dy++) {
          for (let dx = -R; dx <= R; dx++) {
            const nx = x + dx, ny = y + dy
            if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
            if (grayMask[ny * w + nx]) { near = true; break }
          }
        }
        if (near) cleared[p] = 1
      }
    }
  }

  for (let p = 0; p < N; p++) if (cleared[p]) d[p * 4 + 3] = 0

  writeFileSync(outPath, PNG.sync.write(png))
  let transp = 0
  for (let p = 0; p < N; p++) if (d[p * 4 + 3] === 0) transp++
  console.log(`OK ${outPath}  ${w}x${h}  transparente=${(100 * transp / N).toFixed(1)}%`)
}

const files = readdirSync(SRC)
const find = (pred) => {
  const f = files.find(pred)
  if (!f) throw new Error('arquivo não encontrado em ' + SRC)
  return join(SRC, f)
}

// logo v1 (auréola fechada) + ícone → recorte transparente
cutout(find((f) => f.startsWith('EMBLEM-A') && f.includes('v1')), join(OUT, 'wordmark-nimbus.png'))
cutout(find((f) => f.startsWith('EMBLEM-C')), join(OUT, 'icon-cloud.png'))

// Dom Bosco v2 (vitral com flores brancas) → só copia
copyFileSync(find((f) => f.startsWith('BG-04') && f.includes('v2')), join(OUT, 'bg-dombosco.png'))
console.log('OK bg-dombosco.png <= BG-04 v2')
