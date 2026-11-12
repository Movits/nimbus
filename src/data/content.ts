// ──────────────────────────────────────────────────────────────────────────
// NIMBUS — ponto único de edição: copy, assets e projetos da landing.
// Imagens em public/img (WebP otimizado). Mexa aqui pra trocar textos.
// ──────────────────────────────────────────────────────────────────────────

import marca from './marca.json'

const base = import.meta.env.BASE_URL
const img = (file: string) => `${base}img/${file}`

// A loja é a vitrine própria em /loja/ (decisão do dono, 30/07). A Nuvemshop
// (loja.nimbuswear.com.br) é só o motor de carrinho e checkout; nenhum CTA da
// landing aponta mais direto pra ela.
export const STORE_URL = '/loja/'
// Palavras e destinos que a landing e a vitrine repetem IGUAIS (rótulo e
// destino do aviso, frase do estado da loja, selos, navegação, rodapé, linha
// legal): um arquivo só, lido também por scripts/vitrine/build-paginas.mjs.
export const MARCA = marca
// O terceiro selo depende de a loja estar aberta: fechada, selo de checkout
// promete uma compra que não existe. A vitrine faz a mesma conta no molde.
export const SELOS = [...marca.selos, marca.lojaAberta ? marca.seloDoEstado.aberta : marca.seloDoEstado.fechada]
// Os CTAs da landing levavam à oferta de Natal (/natal/, 26/10/2026); a página
// saiu em 28/10/2026, a pedido do dono. Enquanto nenhuma peça está à venda, o
// botão é o aviso de abertura por e-mail, já com a mensagem pronta.
export const CTA_URL = `mailto:${marca.aviso.email}?subject=${encodeURIComponent(marca.aviso.assunto)}&body=${encodeURIComponent(marca.aviso.corpo)}`

// Clique no aviso = intenção medida (generate_lead no tracking-plan.md). O
// envio do e-mail em si acontece no programa de e-mail do visitante.
export function registraAviso(origem: string) {
  const w = window as unknown as { gtag?: (...args: unknown[]) => void }
  if (typeof w.gtag === 'function') w.gtag('event', 'generate_lead', { lead_source: origem, method: 'mailto' })
}

export const ASSETS = {
  heroDesktop: img('hero-desktop.webp'),
  heroMobile: img('hero-mobile.webp'),
  ceu: img('bg-ceu.webp'),
  cristo: img('bg-cristo.webp'),
  cristoMobile: img('bg-cristo-mobile.webp'),
  pampulha: img('bg-pampulha.webp'),
  pampulhaMobile: img('bg-pampulha-mobile.webp'),
  wordmark: img('wordmark-nimbus.webp'),
  // textura das nuvens 3D auto-hospedada: o padrão do drei baixa de um CDN de
  // terceiros (rawcdn.githack.com) a cada visita, lento e fora do nosso cache
  cloudTexture: img('drei-cloud.png'),
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
    offer: marca.estado,
    cta: marca.aviso.rotulo,
    nota: marca.aviso.nota,
  },
  manifesto: {
    kicker: 'Manifesto',
    title: 'Entre o concreto e o céu.',
    body: "Fé tratada com reverência, roupa tratada com rigor. Design autoral, acabamento premium e produção no Brasil, peça por peça.",
    link: 'Ler o manifesto',
  },
  faith: {
    kicker: 'Fé',
    title: 'Fé que se veste bem.',
    body: "O Cristo de braços abertos, Nossa Senhora Aparecida, São Miguel. Símbolos assim pedem respeito, e é com respeito que os desenhamos: sem caricatura, sem modinha, com a seriedade de quem também acredita.",
  },
  design: {
    kicker: 'Design',
    title: 'Cada peça é arquitetura.',
    body: "Nosso traço vem do concreto curvo de Niemeyer, da Pampulha à Catedral de Brasília. Cada estampa é projetada como um edifício: proporção, linha e propósito, nada por acaso.",
    link: 'Ver as gravuras',
  },
  impact: {
    kicker: 'Impacto',
    title: "Acima de tudo, o próximo.",
    // Com a loja fechada o repasse é dito no futuro: no presente, a landing
    // prometia compra e comprovante que ainda não existem (revisão de 12/11/2026).
    body: marca.lojaAberta
      ? "10% do lucro de cada pedido vai para um projeto social. Quem escolhe é você, a cada compra. O repasse é mensal e o comprovante fica publicado."
      : "Quando a loja abrir, 10% do lucro de cada pedido vai para um projeto social. Quem escolhe é você, a cada compra. O repasse será mensal e o comprovante ficará publicado aqui no site.",
    outroNote: "Os três projetos acima são sugestões nossas, de instituições que admiramos, sem parceria com a NIMBUS: o repasse é uma doação em nome dos clientes. Se preferir outro projeto, é só dizer qual no pedido: a NIMBUS verifica se ele é real e apoia.",
    link: 'Como funciona o repasse',
  },
  // o convite que encerra a página, igual ao fecho da home da vitrine
  fecho: {
    frase: marca.aviso.fecho,
    cta: marca.aviso.rotulo,
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
