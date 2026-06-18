// ──────────────────────────────────────────────────────────────────────────
// NIMBUS — ponto único de edição: copy, assets e produtos da landing.
// Mexa aqui pra trocar textos, preços e imagens. (As imagens vivem em public/img.)
// ──────────────────────────────────────────────────────────────────────────

export const PAGES = 7 // nº de seções = nº de "páginas" de scroll

const base = import.meta.env.BASE_URL
const img = (file: string) => `${base}img/${file}`

export const ASSETS = {
  heroDesktop: img('hero-desktop.png'),
  heroMobile: img('hero-mobile.png'),
  ceu: img('bg-ceu.png'),
  cristo: img('bg-cristo.png'),
  pampulha: img('bg-pampulha.png'),
  dombosco: img('bg-dombosco.png'),
  store: img('store-backdrop.png'),
  cloud01: img('cloud-01.png'),
  cloud02: img('cloud-02.png'),
  cloud03: img('cloud-03.png'),
  godray: img('godray.png'),
  arco: img('arco.png'),
  wordmark: img('wordmark-nimbus.png'),
  icon: img('icon-cloud.png'),
}

// índice de cada seção na timeline de scroll (0 = topo)
export const SECTION = {
  hero: 0,
  manifesto: 1,
  faith: 2,
  design: 3,
  drop: 4,
  collection: 5,
  footer: 6,
} as const

// posição (0..1) onde cada seção fica "no centro" do scroll
export const peak = (i: number) => i / (PAGES - 1)

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
  drop: {
    kicker: 'Em breve',
    title: 'Primeira coleção',
    body: 'O primeiro drop está chegando. Deixe seu e-mail e seja o primeiro a saber.',
    cta: 'Quero ser avisado',
    placeholder: 'seu@email.com',
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
