// ──────────────────────────────────────────────────────────────────────────
// NIMBUS — ponto único de edição: copy, assets e produtos da landing.
// Imagens em public/img (WebP otimizado). Mexa aqui pra trocar textos/preços.
// ──────────────────────────────────────────────────────────────────────────

const base = import.meta.env.BASE_URL
const img = (file: string) => `${base}img/${file}`

export const ASSETS = {
  heroDesktop: img('hero-desktop.webp'),
  heroMobile: img('hero-mobile.webp'),
  ceu: img('bg-ceu.webp'),
  cristo: img('bg-cristo.webp'),
  pampulha: img('bg-pampulha.webp'),
  store: img('store-backdrop.webp'),
  wordmark: img('wordmark-nimbus.webp'),
  icon: img('icon-cloud.png'),
}

// índice de cada seção na ordem do scroll (0 = topo). 6 seções.
export const SECTION = {
  hero: 0,
  manifesto: 1,
  faith: 2,
  design: 3,
  collection: 4,
  footer: 5,
} as const

export const SECTION_COUNT = 6

export const COPY = {
  hero: {
    subtitle: 'streetwear católico premium',
    cta: 'Ver coleção',
  },
  manifesto: {
    title: 'Entre o concreto e o céu.',
    body: 'Roupa católica bem feita: design de verdade, acabamento premium e nada de cafona.',
  },
  faith: {
    kicker: 'Fé',
    title: 'Fé que se veste bem.',
    body: 'Partimos dos ícones que formaram a gente e traduzimos em peças com capricho.',
  },
  design: {
    kicker: 'Design',
    title: 'Cada peça é arquitetura.',
    body: 'Modernismo brasileiro virou roupa: curva, concreto e luz, no espírito do Niemeyer.',
  },
  collection: {
    kicker: 'Coleção',
    title: 'Boutique nas nuvens',
    note: 'Pré-lançamento. Ainda sem estoque.',
    cta: 'Avise-me',
  },
  footer: {
    newsletter: 'Receba o lançamento em primeira mão',
    placeholder: 'seu@email.com',
    cta: 'Entrar',
    madein: 'Feito no Brasil',
    rights: '© 2026 NIMBUS',
  },
}

export const PRODUCTS = [
  { name: 'Tee Aurora', price: 'R$ 199' },
  { name: 'Hoodie Cumulus', price: 'R$ 349' },
  { name: 'Tee Redentor', price: 'R$ 219' },
  { name: 'Crewneck Niemeyer', price: 'R$ 299' },
  { name: 'Tee Vitral', price: 'R$ 209' },
  { name: 'Jaqueta Nimbus', price: 'R$ 499' },
]
