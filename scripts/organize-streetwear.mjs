// Organiza a leva streetwear aprovada: recorta o FUNDO VERDE (chroma key), tira o
// "despill" verde, redimensiona pro tamanho de impressão (300 DPI) e salva com nomes
// limpos em designs/prontos/{costas,peito}. Emite prévia magenta em prontos/_debug.
// Uso: node scripts/organize-streetwear.mjs
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const SRC = 'designs/_mestres/_originais'
const OUT = 'designs/prontos'
const DPI = 300
const cm = (v) => Math.round((v / 2.54) * DPI)
const TARGET = { costas: cm(33), peito: cm(9) }
const isGreen = (r, g, b) => g > 80 && g > r * 1.25 && g > b * 1.25

const items = [
  ['hf_20260621_034848_2d970291-f2f6-43a8-a7f0-dc325ee4f69d.png', 'G1-nimbus-tag-roxo', 'costas'],
  ['hf_20260621_034848_90ef05bb-f3be-4b83-91d2-67ae7a9767b2.png', 'G1-nimbus-tag-azul', 'costas'],
  ['hf_20260621_035311_6330b561-05d7-43cc-9c1e-a2398aae3bec.png', 'G2-anjo-stencil', 'costas'],
  ['hf_20260621_041737_90167416-5719-4d97-a610-965001a30479.png', 'G2-anjo-livro-stencil', 'costas'],
  ['hf_20260621_035323_95529e5b-1923-4628-b418-c0daad3bf42b.png', 'G3-acima-de-tudo-tags', 'costas'],
  ['hf_20260621_035323_e78bef00-f286-4c8f-b71b-752bd1f629cb.png', 'G3-acima-de-tudo-azul', 'costas'],
  ['hf_20260621_035425_f7e77dc9-3b0f-4d8a-82be-c636f805ab67.png', 'G4-cristo-stencil-branco', 'costas'],
  ['hf_20260621_035425_4bf469c6-9880-4200-bf7e-7696a063dc70.png', 'G4-cristo-stencil-ouro', 'costas'],
  ['hf_20260621_035727_63d795ac-4401-414c-ad0f-974d87743296.jpeg', 'G5-icone-nuvem-spray', 'peito'],
  ['hf_20260621_035801_be86b511-8002-4251-8f3b-8be49638a5d0.jpeg', 'nimbus-spray-puffy', 'peito'],
  ['hf_20260621_035825_4ddce655-7599-476f-8893-4c7cc2c93dd4.jpeg', 'B1-nimbus-blackletter', 'costas'],
  ['hf_20260621_035839_6cd7738f-a728-4123-8b70-02728da220cf.jpeg', 'B2-salmo19', 'costas'],
  ['hf_20260621_035908_5e719de4-aa7a-4c1b-af06-ff016df456e7.jpeg', 'B3-cruz-crest', 'costas'],
  ['hf_20260621_041438_1108a9fd-46c4-48dc-bcfd-acc95564117f.png', 'B4-acima-de-tudo-gotico-branco', 'peito'],
  ['hf_20260621_041444_ed2ce85f-e821-4e4f-8372-74d76fc3d120.png', 'B4-acima-de-tudo-gotico-preto', 'peito'],
  ['hf_20260621_040210_97962761-e5bf-41b6-987b-9047e0a967f7.jpeg', 'B5-aparecida-halftone', 'costas'],
]

mkdirSync(join(OUT, 'costas'), { recursive: true })
mkdirSync(join(OUT, 'peito'), { recursive: true })
mkdirSync(join(OUT, '_debug'), { recursive: true })

for (const [file, name, dest] of items) {
  const { data, info } = await sharp(join(SRC, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels } = info
  let cleared = 0
  for (let p = 0; p < w * h; p++) {
    const i = p * channels
    const r = data[i], g = data[i + 1], b = data[i + 2]
    if (isGreen(r, g, b)) { data[i + 3] = 0; cleared++ }
    else if (g > ((r + b) / 2) * 1.15) data[i + 1] = Math.round((r + b) / 2) // despill verde
  }
  const target = TARGET[dest]
  const raw = { raw: { width: w, height: h, channels: 4 } }
  let out = sharp(data, raw)
  if (w < target) out = out.resize({ width: target, kernel: 'lanczos3' })
  await out.png().withMetadata({ density: DPI }).toFile(join(OUT, dest, name + '.png'))
  await sharp(data, raw).flatten({ background: '#ff00ff' }).resize({ width: 700 }).png().toFile(join(OUT, '_debug', name + '.png'))
  console.log(`OK ${dest}/${name}.png  (${w}x${h}, ${(100 * cleared / (w * h)).toFixed(0)}% verde removido)`)
}
console.log('\nProntos em', OUT)
