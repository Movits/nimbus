// ──────────────────────────────────────────────────────────────────────────
// NIMBUS — ponto único de edição: copy, assets e projetos da landing.
// Imagens em public/img (WebP otimizado). Mexa aqui pra trocar textos.
// ──────────────────────────────────────────────────────────────────────────

const base = import.meta.env.BASE_URL
const img = (file: string) => `${base}img/${file}`

// Loja Nuvemshop (subdomínio do mesmo domínio). CTAs de compra apontam pra cá.
export const STORE_URL = 'https://loja.nimbuswear.com.br'

export const ASSETS = {
  heroDesktop: img('hero-desktop.webp'),
  heroMobile: img('hero-mobile.webp'),
  ceu: img('bg-ceu.webp'),
  cristo: img('bg-cristo.webp'),
  cristoMobile: img('bg-cristo-mobile.webp'),
  pampulha: img('bg-pampulha.webp'),
  pampulhaMobile: img('bg-pampulha-mobile.webp'),
  wordmark: img('wordmark-nimbus.webp'),
  icon: img('favicon-512.png'),
}

// índice de cada seção na ordem do scroll (0 = topo). 6 seções.
export const SECTION = {
  hero: 0,
  manifesto: 1,
  faith: 2,
  design: 3,
  impact: 4,
  footer: 5,
} as const

export const SECTION_COUNT = 6

export const COPY = {
  hero: {
    subtitle: "Streetwear católico premium. Acima de tudo.",
    cta: 'Entrar na loja',
  },
  manifesto: {
    title: 'Entre o concreto e o céu.',
    body: "Fé tratada com reverência, roupa tratada com rigor. Design autoral, acabamento premium e produção sob demanda no Brasil, peça por peça.",
  },
  faith: {
    kicker: 'Fé',
    title: 'Fé que se veste bem.',
    body: "O Cristo de braços abertos, a Senhora Aparecida, São Miguel. Símbolos assim pedem respeito, e é com respeito que os desenhamos: sem caricatura, sem modinha, com a seriedade de quem também acredita.",
  },
  design: {
    kicker: 'Design',
    title: 'Cada peça é arquitetura.',
    body: "Nosso traço vem do concreto curvo de Niemeyer, da Pampulha à Catedral de Brasília. Cada estampa é projetada como um edifício: proporção, linha e propósito, nada por acaso.",
  },
  impact: {
    kicker: 'Impacto',
    title: "Acima de tudo, o próximo.",
    body: "10% do lucro de cada pedido vai para um projeto social. Quem escolhe é você, no checkout.",
    outroNote: "Se preferir outro projeto, escreva o nome no checkout: a NIMBUS verifica se a obra é real e apoia.",
    cta: 'Comprar e apoiar',
  },
  footer: {
    trust: ["Feito sob demanda no Brasil", "Pagamento seguro: Pix, cartão e boleto", "10% do lucro doado ao projeto que você escolhe"],
    social: 'Acompanhe o lançamento',
    madein: 'Feito no Brasil',
    rights: '© 2026 NIMBUS',
  },
}

export type ImpactProject = {
  id: string
  name: string
  image: string
  imageAlt: string
  desc: string
  area: string
  scope: string
  method: string
  website?: string
}

export const IMPACT_PROJECTS: ImpactProject[] = [
  {
    id: 'fazenda-esperanca',
    name: 'Fazenda da Esperança',
    image: img('projects/fazenda-esperanca.webp'),
    imageAlt: 'Participantes recebem certificados em uma cerimônia na Fazenda da Esperança',
    desc: 'Comunidade terapêutica católica que acolhe pessoas em processo de recuperação da dependência química.',
    area: 'Acolhimento e recuperação de dependentes químicos.',
    scope: 'Comunidades no Brasil e em outros países.',
    method: 'Vida comunitária, trabalho, convivência e espiritualidade em um percurso voluntário de acolhimento.',
    website: 'https://portalfazenda.org.br/acolhimento/',
  },
  {
    id: 'caritas-brasileira',
    name: 'Cáritas Brasileira',
    image: img('projects/caritas-brasileira.webp'),
    imageAlt: 'Mulheres reunidas em uma ação comunitária da Cáritas Brasileira',
    desc: 'Organismo da CNBB que articula uma rede de solidariedade para defender direitos e apoiar populações vulneráveis.',
    area: 'Assistência social, emergências, direitos humanos e desenvolvimento solidário.',
    scope: 'Rede nacional com ações regionais e locais em todo o Brasil.',
    method: 'Mobilização comunitária, resposta a emergências, formação e apoio a iniciativas de economia solidária.',
    website: 'https://caritas.org.br/area-de-atuacao',
  },
  {
    id: 'pequeno-cotolengo',
    name: 'Pequeno Cotolengo',
    image: img('projects/pequeno-cotolengo.webp'),
    imageAlt: 'Morador sentado diante de uma casa do Pequeno Cotolengo',
    desc: 'Obra de Dom Orione que oferece acolhimento, cuidado e qualidade de vida a pessoas com múltiplas deficiências.',
    area: 'Acolhimento e cuidado de pessoas com deficiência em situação de vulnerabilidade.',
    scope: 'Sede em Curitiba, com assistidos encaminhados de diferentes regiões do Paraná.',
    method: 'Acolhimento institucional, saúde, reabilitação, educação e assistência social.',
    website: 'https://www.pequenocotolengo.org.br/',
  },
]
