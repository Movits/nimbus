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

// TAMANHO MAXIMO DE IMPRESSAO por posicao, em cm (largura x altura).
//
// Antes aqui havia um alvo unico de 33 cm de LARGURA para toda arte de costas.
// Dois problemas: (1) o catalogo vai de 23,8 a 35,2 cm de largura, entao o
// Salmo 19 (35,2 cm) ficava ABAIXO de 300 DPI no tamanho real de impressao;
// (2) so a largura era conferida, entao uma arte alta passava batida — as
// costas chegam a 40 cm de altura, o que exige mais pixel que os 33 cm de
// largura exigiam. Os numeros abaixo sao o teto real do catalogo, conferido em
// nuvemshop/auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte.csv.
//
// IMPORTANTE: o tamanho em cm do ARQUIVO nao determina o tamanho impresso. A
// YouDraw reescala a arte para a area configurada no produto (as artes do
// acervo tem 3500 px no lado maior = 29,6 cm a 300 DPI, e imprimem ate 40 cm).
// Este passo existe so para garantir RESOLUCAO suficiente no maior uso
// possivel — por isso o alvo e o teto do catalogo, e nunca se reduz imagem.
const MAX_PRINT_CM = {
  costas: { w: 35.2, h: 40.0 },
  frente: { w: 35.2, h: 35.1 },
  peito: { w: 9.4, h: 14.6 },
  manga: { w: 9, h: 9 },
  laser: { w: 15, h: 15 },
}

// O teto acima e so a rede de seguranca. O alvo BOM e o tamanho real daquela
// arte, e da para descobri-lo: a proporcao da arte identifica o produto no
// catalogo. Essa correspondencia foi conferida em 20 artes do acervo, com
// desvio abaixo de 0,7% (ver nuvemshop/auditoria/2026-07-25-geometria/
// artes-inventario.json). Usar o tamanho real evita inflar arquivo a toa: pelo
// teto, o Salmo 19 (35,2x28,8 cm) exigiria 47% mais pixel do que precisa,
// porque herdaria a altura de 40 cm de outra arte.
const CSV_PATH = 'nuvemshop/auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte.csv'

function loadCatalog() {
  let text
  try {
    text = readFileSync(CSV_PATH, 'utf8')
  } catch {
    return []
  }
  return text
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .flatMap((line) => {
      const c = [...line.matchAll(/("([^"]*)"|[^,]*)(,|$)/g)].map((m) => m[2] ?? m[1])
      const out = []
      const back = { w: Number(c[7]), h: Number(c[8]) }
      const front = { w: Number(c[5]), h: Number(c[6]) }
      if (back.w > 0 && back.h > 0) out.push({ id: c[0], title: c[1], view: 'costas', ...back })
      if (front.w > 0 && front.h > 0) out.push({ id: c[0], title: c[1], view: 'frente', ...front })
      return out
    })
}

const CATALOG = loadCatalog()

/** Acha a entrada do catalogo cuja proporcao bate com a da arte. */
function matchByAspect(aspect, folder) {
  const candidates = CATALOG.filter((e) =>
    folder === 'costas' ? e.view === 'costas' : e.view === 'frente',
  )
  let best = null
  for (const e of candidates) {
    const dev = Math.abs(aspect / (e.w / e.h) - 1)
    if (!best || dev < best.dev) best = { ...e, dev }
  }
  // 2% de folga: o ruido medido da proporcao oficial e ~1%
  return best && best.dev <= 0.02 ? best : null
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
  if (/[\\/](_inbox|_mestres)[\\/]/.test(file)) continue // triagem/backup: não mexer
  const folder = file.split(/[\\/]/).slice(-2)[0]
  if (SKIP.has(folder)) continue
  const limit = MAX_PRINT_CM[folder]

  const src = readFileSync(file) // lê em buffer antes de sobrescrever
  const meta = await sharp(src).metadata()
  let img = sharp(src)
  let finalW = meta.width || 0
  let finalH = meta.height || 0

  let alvo = null
  let origem = ''
  if (meta.width && meta.height) {
    const hit = matchByAspect(meta.width / meta.height, folder)
    if (hit) {
      alvo = { w: hit.w, h: hit.h }
      origem = `${hit.id} ${hit.title} (${hit.w}x${hit.h} cm)`
    } else if (limit) {
      alvo = limit
      origem = `teto do catalogo ${limit.w}x${limit.h} cm — proporcao nao casou com nenhum produto`
    }
  }

  if (alvo) {
    // 300 DPI no tamanho real de impressao, conferindo os DOIS eixos. So
    // amplia, nunca reduz: reduzir destruiria resolucao ja paga.
    //
    // RESSALVA HONESTA: ampliar NAO cria detalhe. As artes do acervo tem
    // 3500 px no lado maior; num print de costas de 40 cm isso e ~222 DPI
    // reais. Este passo faz o arquivo declarar 300 DPI e ter pixel suficiente
    // para o RIP nao reamostrar, mas o detalhe continua o da origem. Para
    // 300 DPI de verdade, a arte precisa ser exportada da fonte ja no tamanho
    // de impressao.
    const factor = Math.max(cm(alvo.w) / meta.width, cm(alvo.h) / meta.height)
    if (factor > 1) {
      finalW = Math.round(meta.width * factor)
      finalH = Math.round(meta.height * factor)
      img = img.resize({ width: finalW, kernel: 'lanczos3' })
    }
  }

  const out = await img.png().withMetadata({ density: DPI }).toBuffer()
  writeFileSync(file, out)
  const grew = finalW !== meta.width
  console.log(
    `OK ${file}  ${meta.width || '?'}x${meta.height || '?'}px` +
      (grew ? ` -> ${finalW}x${finalH}px` : ' (ja suficiente)') +
      ` @${DPI}dpi  [${origem || 'sem alvo'}]`,
  )
  count++
}

console.log(count ? `\n${count} arquivo(s) prontos pra impressão.` : 'Nenhum PNG em designs/ ainda — gere no Higgsfield e salve nas pastas primeiro.')
