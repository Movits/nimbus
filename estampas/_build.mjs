// NIMBUS — gerador de estampas (vetor) + previews PNG.
// Autora SVGs print-ready (fundo transparente) e renderiza previews com resvg.
// Uso: node estampas/_build.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const OUT = new URL('.', import.meta.url).pathname
mkdirSync(OUT + 'previews', { recursive: true })

// ── Paletas (2 colorways) ───────────────────────────────────────────────────
// claro  = pra peça clara (areia/branco): traço azul-jóia + dourado terroso
// escuro = pra peça escura (azul-profundo/preto): traço branco-nuvem + dourado luminoso
const PAL = {
  claro: { line: '#0B2360', accent: '#B98722', soft: '#5C8DC6', sw: '#EFEAE0' },
  escuro: { line: '#F7FBFF', accent: '#EFCB72', soft: '#A6CDEE', sw: '#0B2360' },
}

// ── Helpers de desenho ───────────────────────────────────────────────────────
const R = (n) => Math.round(n * 100) / 100

// nuvem fofa (unit ~ 100x62, base em y=58); escala/translada via transform
function cloudPath() {
  return 'M14,58 C2,58 0,40 14,38 C9,20 33,12 45,26 C53,8 84,10 84,32 C100,30 101,56 86,58 Z'
}
function cloud(cx, cy, w, fill, stroke, sw) {
  const s = w / 100
  return `<g transform="translate(${R(cx - 50 * s)},${R(cy - 30 * s)}) scale(${R(s)})">`
    + `<path d="${cloudPath()}" fill="${fill}" stroke="${stroke}" stroke-width="${R(sw / s)}" stroke-linejoin="round"/></g>`
}

// auréola em perspectiva (elipse fina)
function halo(cx, cy, rx, ry, color, sw) {
  return `<ellipse cx="${R(cx)}" cy="${R(cy)}" rx="${R(rx)}" ry="${R(ry)}" fill="none" stroke="${color}" stroke-width="${sw}"/>`
}

// faísca de 4 pontas
function spark(cx, cy, r, color) {
  const p = (x, y) => `${R(cx + x * r)},${R(cy + y * r)}`
  return `<path d="M ${p(0, -1)} C ${p(0.12, -0.32)} ${p(0.32, -0.12)} ${p(1, 0)} `
    + `C ${p(0.32, 0.12)} ${p(0.12, 0.32)} ${p(0, 1)} `
    + `C ${p(-0.12, 0.32)} ${p(-0.32, 0.12)} ${p(-1, 0)} `
    + `C ${p(-0.32, -0.12)} ${p(-0.12, -0.32)} ${p(0, -1)} Z" fill="${color}"/>`
}

// raios (sunburst / godrays) — leques de linhas finas
function rays(cx, cy, count, r0, r1, a0, a1, color, sw) {
  let s = ''
  for (let i = 0; i < count; i++) {
    const a = a0 + (a1 - a0) * (i / (count - 1))
    const dx = Math.cos(a), dy = Math.sin(a)
    s += `<line x1="${R(cx + dx * r0)}" y1="${R(cy + dy * r0)}" x2="${R(cx + dx * r1)}" y2="${R(cy + dy * r1)}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round"/>`
  }
  return s
}

const TXT = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

// ── Designs ───────────────────────────────────────────────────────────────────
// cada um: { id, name, vb:[w,h], draw(p, variant) -> markup }
const DESIGNS = []

// 1) WORDMARK ------------------------------------------------------------------
DESIGNS.push({
  id: 'wordmark', name: 'Wordmark NIMBUS', vb: [1200, 540], variants: ['stack', 'line'],
  draw(p, v = 'stack') {
    const cx = 600
    const haloY = v === 'stack' ? 120 : 150
    let s = ''
    // auréola + nuvenzinha
    s += halo(cx, haloY, 120, 30, p.accent, 9)
    s += cloud(cx, haloY + 22, 120, 'none', p.line, 8)
    // wordmark
    s += `<text x="${cx}" y="${v === 'stack' ? 360 : 380}" text-anchor="middle" `
      + `font-family="Fraunces" font-weight="600" font-size="220" letter-spacing="10" fill="${p.line}">NIMBUS</text>`
    // subtítulo
    s += `<text x="${cx}" y="${v === 'stack' ? 450 : 470}" text-anchor="middle" `
      + `font-family="Archivo" font-weight="600" font-size="46" letter-spacing="22" fill="${p.accent}">STREETWEAR · BRASIL</text>`
    return s
  },
})

// 2) ÍCONE NUVEM + AURÉOLA ------------------------------------------------------
DESIGNS.push({
  id: 'icone', name: 'Ícone nuvem + auréola', vb: [600, 600],
  draw(p) {
    let s = ''
    s += halo(300, 175, 150, 40, p.accent, 14)
    s += cloud(300, 330, 360, 'none', p.line, 16)
    s += spark(150, 150, 16, p.accent)
    s += spark(470, 210, 12, p.accent)
    return s
  },
})

// 3) SELO CIRCULAR --------------------------------------------------------------
DESIGNS.push({
  id: 'selo', name: 'Selo NIMBUS · BRASIL · 2026', vb: [640, 640], variants: ['duplo', 'simples'],
  draw(p, v = 'duplo') {
    const cx = 320, cy = 320
    let s = ''
    s += `<circle cx="${cx}" cy="${cy}" r="300" fill="none" stroke="${p.line}" stroke-width="8"/>`
    if (v === 'duplo') s += `<circle cx="${cx}" cy="${cy}" r="282" fill="none" stroke="${p.line}" stroke-width="3"/>`
    // texto no anel (topo) + (base, espelhado)
    const rT = 256
    s += `<defs>`
      + `<path id="ringTop" d="M ${cx - rT},${cy} A ${rT},${rT} 0 0 1 ${cx + rT},${cy}"/>`
      + `<path id="ringBot" d="M ${cx - rT},${cy} A ${rT},${rT} 0 0 0 ${cx + rT},${cy}"/>`
      + `</defs>`
    s += `<text font-family="Archivo" font-weight="700" font-size="60" letter-spacing="14" fill="${p.line}">`
      + `<textPath href="#ringTop" startOffset="50%" text-anchor="middle">NIMBUS · BRASIL ·</textPath></text>`
    s += `<text font-family="Archivo" font-weight="700" font-size="60" letter-spacing="14" fill="${p.line}">`
      + `<textPath href="#ringBot" startOffset="50%" text-anchor="middle">· EST. 2026 ·</textPath></text>`
    // miolo: nuvem + auréola
    s += halo(cx, cy - 40, 86, 22, p.accent, 9)
    s += cloud(cx, cy + 36, 230, 'none', p.line, 12)
    return s
  },
})

// 4) CATEDRAL DE BRASÍLIA -------------------------------------------------------
DESIGNS.push({
  id: 'catedral', name: 'Catedral de Brasília', vb: [900, 1040], variants: ['raios', 'limpa'],
  draw(p, v = 'raios') {
    const cx = 450, baseY = 820, topY = 250, waistY = 560
    let s = ''
    // godrays atrás
    if (v === 'raios') s += rays(cx, topY - 10, 13, 60, 360, Math.PI * 1.18, Math.PI * 1.82, p.accent, 4)
    // auréola + cruz no topo
    s += halo(cx, topY - 70, 95, 24, p.accent, 9)
    s += `<line x1="${cx}" y1="${topY - 120}" x2="${cx}" y2="${topY - 40}" stroke="${p.accent}" stroke-width="8" stroke-linecap="round"/>`
    s += `<line x1="${cx - 26}" y1="${topY - 96}" x2="${cx + 26}" y2="${topY - 96}" stroke="${p.accent}" stroke-width="8" stroke-linecap="round"/>`
    // ribs (crown hyperboloide)
    const n = 11
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1)) * 2 - 1
      const topX = cx + t * 340
      const waistX = cx + t * 60
      const baseX = cx + t * 150
      s += `<path d="M ${R(baseX)},${baseY} C ${R(baseX)},${(baseY + waistY) / 2} ${R(waistX)},${waistY + 70} ${R(waistX)},${waistY} `
        + `C ${R(waistX)},${waistY - 190} ${R(topX)},${topY + 210} ${R(topX)},${topY}" `
        + `fill="none" stroke="${p.line}" stroke-width="9" stroke-linecap="round"/>`
    }
    // anel do topo (coroa) e base
    s += `<ellipse cx="${cx}" cy="${topY}" rx="340" ry="40" fill="none" stroke="${p.line}" stroke-width="9"/>`
    s += `<ellipse cx="${cx}" cy="${baseY}" rx="150" ry="22" fill="none" stroke="${p.line}" stroke-width="9"/>`
    // banco de nuvens na base
    s += cloud(cx - 150, baseY + 30, 240, 'none', p.line, 9)
    s += cloud(cx + 150, baseY + 30, 240, 'none', p.line, 9)
    s += cloud(cx, baseY + 60, 300, 'none', p.line, 9)
    return s
  },
})

// 5) CRISTO REDENTOR ------------------------------------------------------------
DESIGNS.push({
  id: 'redentor', name: 'Cristo Redentor', vb: [900, 1040], variants: ['raios', 'limpa'],
  draw(p, v = 'raios') {
    const cx = 450
    let s = ''
    // sunburst atrás
    if (v === 'raios') s += rays(cx, 360, 28, 120, 470, Math.PI * 1.06, Math.PI * 1.94, p.accent, 4)
    // halo atrás da cabeça
    s += `<circle cx="${cx}" cy="320" r="78" fill="none" stroke="${p.accent}" stroke-width="9"/>`
    // figura: cabeça + braços abertos (forma de cruz) + manto cônico
    // cabeça
    s += `<circle cx="${cx}" cy="320" r="34" fill="${p.line}"/>`
    // braços (barra horizontal levemente afilada)
    s += `<path d="M ${cx - 250},376 L ${cx + 250},376 L ${cx + 250},410 L ${cx + 34},420 L ${cx - 34},420 L ${cx - 250},410 Z" fill="${p.line}"/>`
    // manto (corpo cônico)
    s += `<path d="M ${cx - 34},412 L ${cx + 34},412 L ${cx + 132},790 C ${cx + 60},815 ${cx - 60},815 ${cx - 132},790 Z" fill="${p.line}"/>`
    // pregas do manto
    s += `<line x1="${cx}" y1="430" x2="${cx}" y2="788" stroke="${p.sw}" stroke-width="5" opacity="0.5"/>`
    // banco de nuvens nos pés
    s += cloud(cx - 130, 800, 230, 'none', p.line, 9)
    s += cloud(cx + 130, 800, 230, 'none', p.line, 9)
    s += cloud(cx, 830, 300, 'none', p.line, 9)
    return s
  },
})

// 6) VITRAL DOM BOSCO -----------------------------------------------------------
DESIGNS.push({
  id: 'vitral', name: 'Vitral Dom Bosco', vb: [760, 1040],
  draw(p) {
    const x0 = 80, y0 = 90, w = 600, h = 860, cols = 6, rows = 9
    const cw = w / cols, ch = h / rows
    const blues = ['#0B2360', '#143B86', '#2A5DA8', '#5C8DC6', '#9DC6EE']
    let s = ''
    // painéis
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // intensidade: mais claro perto do centro/topo (luz)
        const dc = Math.abs(c - (cols - 1) / 2) / ((cols - 1) / 2)
        const dr = r / (rows - 1)
        const k = Math.min(4, Math.round((dc * 2 + dr * 2)))
        const fill = blues[k]
        s += `<rect x="${R(x0 + c * cw)}" y="${R(y0 + r * ch)}" width="${R(cw)}" height="${R(ch)}" fill="${fill}"/>`
      }
    }
    // chumbo (leading)
    const lead = p.line
    for (let c = 0; c <= cols; c++) s += `<line x1="${R(x0 + c * cw)}" y1="${y0}" x2="${R(x0 + c * cw)}" y2="${y0 + h}" stroke="${lead}" stroke-width="7"/>`
    for (let r = 0; r <= rows; r++) s += `<line x1="${x0}" y1="${R(y0 + r * ch)}" x2="${x0 + w}" y2="${R(y0 + r * ch)}" stroke="${lead}" stroke-width="7"/>`
    s += `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="none" stroke="${lead}" stroke-width="12"/>`
    // cruz de luz central (dourada) + raios
    const ccx = x0 + w / 2, ccy = y0 + h / 2
    s += rays(ccx, ccy, 16, 30, 150, 0, Math.PI * 2 - Math.PI / 8, p.accent, 3)
    s += `<line x1="${ccx}" y1="${ccy - 120}" x2="${ccx}" y2="${ccy + 120}" stroke="${p.accent}" stroke-width="14" stroke-linecap="round"/>`
    s += `<line x1="${ccx - 70}" y1="${ccy - 40}" x2="${ccx + 70}" y2="${ccy - 40}" stroke="${p.accent}" stroke-width="14" stroke-linecap="round"/>`
    s += spark(ccx, ccy - 40, 26, p.accent)
    return s
  },
})

// ── Render helpers ─────────────────────────────────────────────────────────────
const fontFiles = ['/tmp/nfonts/Fraunces.ttf', '/tmp/nfonts/Archivo.ttf']
function svgDoc(d, p, variant) {
  const [w, h] = d.vb
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${d.draw(p, variant)}</svg>`
}
function toPNG(svg, width) {
  const r = new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { fontFiles, loadSystemFonts: false } })
  return r.render().asPng()
}

// largura-alvo de impressão por design (cm) → px a 300 DPI
const PRINT_CM = { wordmark: 28, icone: 12, selo: 14, catedral: 32, redentor: 32, vitral: 32 }
const cmToPx = (cm) => Math.round((cm / 2.54) * 300)

// ── Modo print: PNG transparente em 300 DPI (node estampas/_build.mjs --print) ───
if (process.argv.includes('--print')) {
  mkdirSync(OUT + 'print', { recursive: true })
  let n = 0
  for (const d of DESIGNS) {
    for (const key of Object.keys(PAL)) {
      const svg = svgDoc(d, PAL[key])
      writeFileSync(OUT + `print/${d.id}-${key}@300dpi.png`, toPNG(svg, cmToPx(PRINT_CM[d.id])))
      n++
    }
  }
  console.log('PNGs de impressão (300 DPI, transparentes) gerados:', n, '→ estampas/print/')
  process.exit(0)
}

// ── Gera arquivos ───────────────────────────────────────────────────────────────
let count = 0
for (const d of DESIGNS) {
  for (const key of Object.keys(PAL)) {
    const p = PAL[key]
    const svg = svgDoc(d, p)
    const base = `${d.id}-${key}`
    writeFileSync(OUT + base + '.svg', svg)
    writeFileSync(OUT + 'previews/' + base + '.png', toPNG(svg, d.vb[0]))
    count++
  }
  // variações extras (colorway claro) pra checar
  if (d.variants) {
    for (const variant of d.variants.slice(1)) {
      const svg = svgDoc(d, PAL.claro, variant)
      writeFileSync(OUT + `${d.id}-claro-${variant}.svg`, svg)
      writeFileSync(OUT + `previews/${d.id}-claro-${variant}.png`, toPNG(svg, d.vb[0]))
      count++
    }
  }
}
console.log('arquivos de design gerados:', count)

// ── Lookbook (1 imagem com tudo, claro|escuro em swatches) ──────────────────────
const cellW = 560, cellH = 600, pad = 40, labelH = 70
const cols = 2
const rowsN = DESIGNS.length
const LW = pad + cols * (cellW + pad)
const LH = pad + rowsN * (cellH + labelH + pad)
let lb = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LW} ${LH}" width="${LW}" height="${LH}">`
lb += `<rect width="${LW}" height="${LH}" fill="#FAF8F4"/>`
lb += `<text x="${pad}" y="${pad + 6}" font-family="Fraunces" font-size="20" fill="#0B2360" dominant-baseline="hanging">NIMBUS — cápsula de estampas (claro | escuro)</text>`
DESIGNS.forEach((d, i) => {
  const y = pad + i * (cellH + labelH + pad) + 30
  lb += `<text x="${pad}" y="${y}" font-family="Archivo" font-weight="700" font-size="26" fill="#0B2360">${i + 1}. ${TXT(d.name)}</text>`
  ;['claro', 'escuro'].forEach((key, c) => {
    const p = PAL[key]
    const x = pad + c * (cellW + pad)
    const cy = y + 20
    lb += `<rect x="${x}" y="${cy}" width="${cellW}" height="${cellH}" rx="18" fill="${p.sw}"/>`
    const [vw, vh] = d.vb
    const scale = Math.min((cellW - 80) / vw, (cellH - 80) / vh)
    const gx = x + (cellW - vw * scale) / 2
    const gy = cy + (cellH - vh * scale) / 2
    lb += `<g transform="translate(${R(gx)},${R(gy)}) scale(${R(scale)})">${d.draw(p)}</g>`
  })
})
lb += `</svg>`
writeFileSync(OUT + 'previews/_lookbook.png', toPNG(lb, LW))
console.log('lookbook gerado.')

// ── Folha de variações (colorway claro) ─────────────────────────────────────────
const VARS = [
  ['Wordmark', 'wordmark', ['stack', 'line'], ['empilhado', 'em linha']],
  ['Selo', 'selo', ['duplo', 'simples'], ['anel duplo', 'anel simples']],
  ['Catedral', 'catedral', ['raios', 'limpa'], ['com raios', 'limpa']],
  ['Cristo Redentor', 'redentor', ['raios', 'limpa'], ['com raios', 'limpa']],
]
const byId = Object.fromEntries(DESIGNS.map((d) => [d.id, d]))
let vb = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LW} ${LH}" width="${LW}" height="${LH}">`
vb += `<rect width="${LW}" height="${LH}" fill="#FAF8F4"/>`
vb += `<text x="${pad}" y="${pad + 6}" font-family="Fraunces" font-size="20" fill="#0B2360" dominant-baseline="hanging">NIMBUS — variações pra escolher (peça clara)</text>`
VARS.forEach((row, i) => {
  const [label, id, variants, vnames] = row
  const d = byId[id]
  const y = pad + i * (cellH + labelH + pad) + 30
  vb += `<text x="${pad}" y="${y}" font-family="Archivo" font-weight="700" font-size="26" fill="#0B2360">${i + 1}. ${TXT(label)}</text>`
  variants.forEach((variant, c) => {
    const x = pad + c * (cellW + pad)
    const cy = y + 20
    vb += `<rect x="${x}" y="${cy}" width="${cellW}" height="${cellH}" rx="18" fill="${PAL.claro.sw}"/>`
    vb += `<text x="${x + cellW / 2}" y="${cy + cellH - 24}" text-anchor="middle" font-family="Archivo" font-weight="600" font-size="22" fill="#0B2360">${TXT(vnames[c])}</text>`
    const [vw, vh] = d.vb
    const scale = Math.min((cellW - 80) / vw, (cellH - 130) / vh)
    const gx = x + (cellW - vw * scale) / 2
    const gy = cy + 30
    vb += `<g transform="translate(${R(gx)},${R(gy)}) scale(${R(scale)})">${d.draw(PAL.claro, variant)}</g>`
  })
})
vb += `</svg>`
writeFileSync(OUT + 'previews/_variacoes.png', toPNG(vb, LW))
console.log('folha de variações gerada.')
