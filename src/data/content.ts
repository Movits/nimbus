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
    kicker: 'streetwear católico premium',
    title: 'Vista o céu',
    sub: 'Entre o concreto branco e o azul infinito. Peças feitas pra durar — e pra elevar.',
    cta: 'Ver Coleção',
  },
  manifesto: {
    title: 'Nascemos entre o concreto e o céu.',
    body: 'NIMBUS é fé sem cafonice: design com intenção, acabamento premium e uma estética que sobe. O oposto do óbvio.',
  },
  faith: {
    kicker: 'Fé',
    title: 'O sagrado, em alta definição.',
    body: 'Inspiração nos ícones que nos formaram — reinterpretados com rigor e beleza, longe do amador.',
  },
  design: {
    kicker: 'Design',
    title: 'Cada peça é arquitetura.',
    body: 'Modernismo brasileiro: curvas, concreto, luz. Linhas limpas do Niemeyer traduzidas em roupa.',
  },
  drop: {
    kicker: 'Em breve',
    title: 'Primeira Coleção',
    body: 'O primeiro drop está chegando. Entre na lista e seja avisado antes de todo mundo.',
    cta: 'Quero ser avisado',
    placeholder: 'seu@email.com',
  },
  collection: {
    kicker: 'Coleção',
    title: 'Boutique nas nuvens',
    note: 'Pré-lançamento — sem estoque ainda.',
    cta: 'Notifique-me',
  },
  footer: {
    tagline: 'Vista o céu.',
    newsletter: 'Receba o lançamento no seu e-mail',
    placeholder: 'seu@email.com',
    cta: 'Entrar',
    madein: 'Feito no Brasil ☁',
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
