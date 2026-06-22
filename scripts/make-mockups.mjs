// Popula designs/prontos/<COLECAO>/mockups/ com cada arte renomeada pro NOME DO PRODUTO
// (de produtos-nomes.md) e gera uma folha-catálogo rotulada em designs/_catalogo/.
// Uso: node scripts/make-mockups.mjs   (substitui o make-catalogo.mjs; idempotente)
import sharp from 'sharp'
import { readdirSync, mkdirSync, copyFileSync, rmSync, existsSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DESC } from './descricoes.mjs'

const OUT = 'designs/prontos'
const CAT = 'designs/_catalogo'

// código (nome do arquivo da arte) → Nome do Produto (colorway vira sufixo)
const NAME = {
  'G1-nimbus-tag-roxo': 'Wildstyle (roxo)', 'G1-nimbus-tag-azul': 'Wildstyle (azul)',
  'G2-anjo-stencil': 'Querubim Spray', 'G2-anjo-livro-stencil': 'Anjo da Guarda',
  'G3-acima-de-tudo-tags': 'Acima de Tudo (tags)', 'G3-acima-de-tudo-laranja': 'Acima de Tudo (laranja)',
  'G4-cristo-stencil-ouro': 'Redentor Spray (ouro)', 'G4-cristo-stencil-branco': 'Redentor Spray (branco)',
  'G5-icone-nuvem-spray': 'Selo Nuvem', 'G5-icone-nuvem-spray-branco': 'Selo Nuvem (branco)',
  'G6-sao-miguel-stencil': 'Arcanjo Spray', 'G6-sao-miguel-stencil-preto': 'Arcanjo Spray (preto)', 'G6-sao-miguel-stencil-branco': 'Arcanjo Spray (branco)',
  'G7-sagrado-coracao-stencil-ouro': 'Sagrado Coração Spray (ouro)', 'G7-sagrado-coracao-stencil-preto': 'Sagrado Coração Spray (preto)',
  'G8-pomba-stencil-branco': 'Espírito Santo (branco)', 'G8-pomba-stencil-preto': 'Espírito Santo (preto)',
  'G9-fe-tag-v1': 'Fé (1)', 'G9-fe-tag-v2': 'Fé (2)', 'G9-fe-tag-v3': 'Fé (3)',
  'G10-aparecida-stencil-v1': 'Aparecida Spray (1)', 'G10-aparecida-stencil-v2': 'Aparecida Spray (2)', 'G10-aparecida-stencil-v3': 'Aparecida Spray (3)', 'G10-aparecida-stencil-branco': 'Aparecida Spray (branco)', 'G10-aparecida-stencil-branco-teste': 'Aparecida Spray (branco teste)',
  'G11-terco-stencil': 'Terço',
  'B1-nimbus-blackletter': 'Relíquia', 'B2-salmo19': 'Salmo 19', 'B3-cruz-crest': 'Brasão',
  'B4-acima-de-tudo-gotico-branco': 'Acima de Tudo Gótico (branco)', 'B4-acima-de-tudo-gotico-preto': 'Acima de Tudo Gótico (preto)',
  'B5-aparecida-halftone': 'Padroeira', 'B7-fe-acima-de-tudo': 'Fé Acima de Tudo',
  'B8-deus-e-fiel': 'Deus é Fiel', 'B9-monograma-nmb': 'Monograma NMB',
  'H1-cristo-redentor-halftone': 'Cristo Vintage',
  'H2-sao-miguel-halftone-v1': 'São Miguel Vintage (1)', 'H2-sao-miguel-halftone-v2': 'São Miguel Vintage (2)',
  'H3-sagrado-coracao-halftone-v1': 'Sagrado Coração Vintage (1)', 'H3-sagrado-coracao-halftone-v2': 'Sagrado Coração Vintage (2)',
  'H4-sao-jorge-halftone': 'São Jorge Vintage',
  'S1-aparecida-barroca': 'Aparecida Ouro', 'S2-cristo-barroco': 'Redentor Ouro',
  'S3-azulejo-cruz-v1': 'Azulejo (1)', 'S3-azulejo-cruz-v2': 'Azulejo (2)',
  'S4-sagrado-coracao-barroco-v1': 'Sagrado Coração Ouro (1)', 'S4-sagrado-coracao-barroco-v2': 'Sagrado Coração Ouro (2)',
  'S5-nimbus-barroco': 'NIMBUS Ouro', 'S6-sao-jorge-barroco-v1': 'São Jorge Ouro (1)', 'S6-sao-jorge-barroco-v2': 'São Jorge Ouro (2)',
  'catedral-nuvem': 'Catedral', 'cristo-crest-nuvem': 'Cristo nos Céus', 'cristo-nuvem': 'Redentor Celeste',
  'sagrado-coracao-nuvem': 'Coração Celeste', 'pomba-nuvem': 'Espírito', 'igreja-nuvem': 'Capela',
  'acima-de-tudo-nuvem': 'Acima de Tudo Céu', 'sao-miguel-nuvem': 'São Miguel Celeste',
  'logo-icone-nuvem-v1': 'Ícone (1)', 'logo-icone-nuvem-v2': 'Ícone (2)', 'logo-wordmark-nuvem': 'Wordmark',
}
const HEROES = new Set(['Wildstyle', 'Redentor Spray', 'Fé', 'Aparecida Spray', 'Arcanjo Spray', 'Relíquia',
  'Padroeira', 'Cristo Vintage', 'São Jorge Vintage', 'Salmo 19', 'Catedral', 'Cristo nos Céus', 'São Jorge Ouro'])
const isPeito = (s) => /icone|terco|monograma|gotico|sagrado-coracao/.test(s)
const base = (name) => name.replace(/\s*\(.*\)$/, '')

function srcArts(col) {
  const out = []
  for (const sub of ['costas', 'peito']) {
    const d = join(OUT, col, sub)
    if (existsSync(d)) for (const f of readdirSync(d).filter((f) => f.endsWith('.png'))) out.push([join(d, f), f.replace('.png', '')])
  }
  const root = join(OUT, col)
  if (existsSync(root)) for (const f of readdirSync(root).filter((f) => f.endsWith('.png'))) out.push([join(root, f), f.replace('.png', '')])
  return out
}

// 1) popular mockups/: 1 pasta por produto com os prints da peça (peito + costas)
// emblema de peito por coleção
const CHEST = {
  STREET: { src: join(OUT, 'STREET', 'peito', 'G5-icone-nuvem-spray.png'), label: 'Selo Nuvem' },
  RELIQUIA: { src: join(OUT, 'RELIQUIA', 'peito', 'B9-monograma-nmb.png'), label: 'Monograma NMB' },
  NUVEM: { src: join(OUT, '_marca', 'logo-icone-nuvem-v1.png'), label: 'Ícone NIMBUS' },
}
// produtos que JÁ são print de peito → entram sozinhos (1 imagem), sem emblema extra
const PEITO_ONLY = new Set([
  'G5-icone-nuvem-spray', 'G5-icone-nuvem-spray-branco', 'G11-terco-stencil', 'B9-monograma-nmb',
  'B4-acima-de-tudo-gotico-branco', 'B4-acima-de-tudo-gotico-preto',
  'logo-icone-nuvem-v1', 'logo-icone-nuvem-v2', 'logo-wordmark-nuvem',
])
// designs que também vão na Ecobag (Ícone/Wordmark já são Ecobag por serem logo-*)
const ECOBAG = new Set(['Catedral', 'Wildstyle'])
// nome da pasta = "<Produto> [<peças>] [<posição>]"
const pecasDe = (stem, produto) => {
  if (/^logo-/.test(stem)) return 'Ecobag'
  let p = HEROES.has(produto) ? 'Camiseta+Oversized+Moletom+Blusão' : 'Camiseta+Oversized'
  if (ECOBAG.has(produto)) p += '+Ecobag'
  return p
}
const folderDe = (stem, name) => {
  const produto = base(name)
  const posicao = PEITO_ONLY.has(stem) ? 'só frente' : 'frente e verso'
  return `${produto} [${pecasDe(stem, produto)}] [${posicao}]`
}
for (const col of ['STREET', 'RELIQUIA', 'NUVEM', '_marca']) {
  const mk = join(OUT, col, 'mockups')
  if (existsSync(mk)) rmSync(mk, { recursive: true, force: true })
  mkdirSync(mk, { recursive: true })
  for (const [src, stem] of srcArts(col)) {
    const name = NAME[stem]
    if (!name) { console.log('SEM NOME no mapa:', stem); continue }
    const dir = join(mk, folderDe(stem, name)) // pasta = "Produto [peças] [posição]"
    mkdirSync(dir, { recursive: true })
    if (PEITO_ONLY.has(stem)) {
      copyFileSync(src, join(dir, name + '.png')) // é o próprio print de peito
    } else {
      copyFileSync(src, join(dir, `costas - ${name}.png`)) // gráfico das costas (1 por colorway)
      const chest = CHEST[col]
      if (chest && existsSync(chest.src)) copyFileSync(chest.src, join(dir, `peito - ${chest.label}.png`))
    }
    const desc = DESC[base(name)] // descrição de venda na pasta
    if (desc) writeFileSync(join(dir, 'descrição.txt'), desc + '\n', 'utf8')
    else console.log('SEM DESC:', base(name))
  }
}
console.log('mockups/ populados: 1 pasta por produto (peito + costas)')

// 2) folha-catálogo rotulada (nome do produto + peça + ⭐hero)
mkdirSync(CAT, { recursive: true })
const COLS = 5, T = 300, PAD = 8, LBL = 50, BG = '#9aa0aa'
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
async function sheet(title, cols) {
  const items = []
  for (const col of cols) for (const [src, stem] of srcArts(col)) items.push({ src, name: NAME[stem] || stem, peca: isPeito(stem) ? 'peito' : 'costas', hero: HEROES.has(base(NAME[stem] || '')) })
  items.sort((a, b) => a.name.localeCompare(b.name))
  const rows = Math.ceil(items.length / COLS)
  const W = COLS * (T + PAD) + PAD, H = rows * (T + LBL + PAD) + PAD + 36
  const comp = [{ input: Buffer.from(`<svg width="${W}" height="32"><text x="8" y="24" font-size="22" fill="#111" font-family="monospace">${esc(title)} (${items.length})</text></svg>`), left: 0, top: 4 }]
  for (let i = 0; i < items.length; i++) {
    const x = PAD + (i % COLS) * (T + PAD), y = 36 + PAD + ((i / COLS) | 0) * (T + LBL + PAD)
    const thumb = await sharp(items[i].src).flatten({ background: BG }).resize({ width: T, height: T, fit: 'contain', background: BG }).png().toBuffer()
    comp.push({ input: thumb, left: x, top: y })
    const star = items[i].hero ? '★ ' : ''
    const lbl = `<svg width="${T}" height="${LBL}"><rect width="100%" height="100%" fill="#1b2030"/>` +
      `<text x="6" y="20" font-size="16" fill="#ffd86b" font-family="monospace">${esc(star + items[i].name)}</text>` +
      `<text x="6" y="40" font-size="13" fill="#8fa" font-family="monospace">${items[i].peca}</text></svg>`
    comp.push({ input: Buffer.from(lbl), left: x, top: y + T })
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: '#777' } }).composite(comp).png().toFile(join(CAT, `cat-${title}.png`))
  console.log(`${CAT}/cat-${title}.png : ${items.length}`)
}
await sheet('STREET', ['STREET'])
await sheet('RELIQUIA', ['RELIQUIA'])
await sheet('NUVEM-marca', ['NUVEM', '_marca'])
