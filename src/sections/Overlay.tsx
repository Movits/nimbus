import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ASSETS, COPY, CTA_URL, IMPACT_PROJECTS, MARCA, SECTION, SELOS, registraAviso, type ImpactProject } from '../data/content'
import { registerSection } from '../scene/scrollStore'
import { useInView } from '../hooks/useInView'
import ImpactProjectModal from '../components/ImpactProjectModal'

/** Seção (min 100vh) que registra seu elemento no store e dispara os reveals. */
function Section({
  index,
  className = '',
  align = 'center',
  antes,
  depois,
  children,
}: {
  index: number
  className?: string
  align?: 'center' | 'left' | 'right'
  /** o que entra na seção antes e depois do bloco de texto (o monumento, no celular) */
  antes?: ReactNode
  depois?: ReactNode
  children: ReactNode
}) {
  const { ref, inView } = useInView<HTMLElement>()
  const elRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    registerSection(index, elRef.current)
    return () => registerSection(index, null)
  }, [index])

  return (
    <section
      id={`sec-${index}`}
      ref={(node) => {
        elRef.current = node
        ref.current = node
      }}
      className={`section section--${align} ${className} ${inView ? 'in' : ''}`}
    >
      {antes}
      <div className="section__inner">{children}</div>
      {depois}
    </section>
  )
}

/** O monumento da seção como imagem do FLUXO da página. Só aparece no celular
 *  (o CSS o esconde acima de 768px, onde a cena 3D mostra o mesmo monumento
 *  parado atrás do texto). No celular o cartão de texto ocupa a largura toda:
 *  com o monumento parado atrás, o cartão passava por cima dele ao rolar e
 *  entre uma seção e outra ficavam telas inteiras só de céu (os seis
 *  compradores da revisão de 12/11/2026 apontaram as duas coisas). No fluxo, o
 *  monumento fica sempre logo acima do cartão dele e rola junto. */
function Monumento({ nome, src, alt, w, h }: { nome: string; src: string; alt: string; w: number; h: number }) {
  return (
    <div className={`monumento monumento--${nome}`}>
      <img src={src} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
    </div>
  )
}

export default function Overlay() {
  const [selectedProject, setSelectedProject] = useState<ImpactProject | null>(null)
  const closeProject = useCallback(() => setSelectedProject(null), [])

  return (
    <>
      <main className="overlay">
      {/* §1 HERO — logo grande + subtítulo + CTA (alinhado ao topo, catedral à mostra) */}
      <Section
        index={SECTION.hero}
        className="hero"
        align="center"
        depois={<Monumento nome="capa" src={ASSETS.heroMobile} alt="Catedral de Brasília entre as nuvens" w={768} h={1376} />}
      >
        <h1 className="hero__title">
          <img className="reveal hero__logo" src={ASSETS.wordmark} alt="NIMBUS" />
        </h1>
        <p className="reveal hero__subtitle">{COPY.hero.subtitle}</p>
        <p className="reveal hero__offer">{COPY.hero.offer}</p>
        <a className="reveal btn btn--primary" href={CTA_URL} onClick={() => registraAviso('landing_capa')}>
          {COPY.hero.cta}
        </a>
        <p className="reveal note hero__nota">{COPY.hero.nota}</p>
      </Section>

      {/* §2 MANIFESTO */}
      <Section index={SECTION.manifesto} className="manifesto" align="center">
        <p className="reveal kicker">{COPY.manifesto.kicker}</p>
        <h2 className="reveal display">{COPY.manifesto.title}</h2>
        <p className="reveal lede">{COPY.manifesto.body}</p>
        <a className="reveal textlink" href="/loja/manifesto/">
          {COPY.manifesto.link}
        </a>
      </Section>

      {/* §3 FÉ — Cristo Redentor */}
      <Section
        index={SECTION.faith}
        className="faith"
        align="left"
        antes={<Monumento nome="cristo" src={ASSETS.cristoMobile} alt="Cristo Redentor acima das nuvens" w={603} h={1072} />}
      >
        <p className="reveal kicker">{COPY.faith.kicker}</p>
        <h2 className="reveal display">{COPY.faith.title}</h2>
        <p className="reveal lede">{COPY.faith.body}</p>
      </Section>

      {/* §4 DESIGN — Pampulha */}
      <Section
        index={SECTION.design}
        className="design"
        align="left"
        antes={<Monumento nome="pampulha" src={ASSETS.pampulhaMobile} alt="Igreja da Pampulha, com o painel de azulejos, entre as nuvens" w={603} h={1072} />}
      >
        <p className="reveal kicker">{COPY.design.kicker}</p>
        <h2 className="reveal display">{COPY.design.title}</h2>
        <p className="reveal lede">{COPY.design.body}</p>
        <a className="reveal textlink" href="/gravuras/">
          {COPY.design.link}
        </a>
      </Section>

      {/* §5 IMPACTO — 10% do lucro pro projeto que o cliente escolher */}
      <Section index={SECTION.impact} className="impact" align="center">
        <p className="reveal kicker">{COPY.impact.kicker}</p>
        <h2 className="reveal display">{COPY.impact.title}</h2>
        <p className="reveal lede">{COPY.impact.body}</p>
        <a className="reveal textlink" href="/loja/impacto/">
          {COPY.impact.link}
        </a>
        <div className="impact__grid">
          {IMPACT_PROJECTS.map((p, i) => (
            <article
              className="reveal vidro impact__card"
              key={p.id}
              style={{ ['--i' as string]: i }}
            >
              <h3 className="impact__name">{p.name}</h3>
              <p className="impact__desc">{p.desc}</p>
              {/* O botão estica sobre o card inteiro (.impact__cardCta::after), então o card todo
                  clica sem engolir o heading e a descrição da árvore de acessibilidade. */}
              <button
                className="impact__cardCta"
                type="button"
                onClick={() => setSelectedProject(p)}
                aria-haspopup="dialog"
              >
                Conhecer projeto
                <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
                  <path d="M5 12h14M14 7l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </article>
          ))}
        </div>
        <p className="reveal note impact__outro">{COPY.impact.outroNote}</p>
      </Section>

      {/* §6 FECHO: o convite que encerra a página e o rodapé único, os mesmos da
          vitrine (classes de public/css/marca.css, palavras de marca.json). A
          marca grande que fechava a página saiu em 12/11/2026: no fim da rolagem
          eram três marcas na mesma tela (topo, assinatura e rodapé) e o topo
          cortava a auréola da grande. */}
      <Section index={SECTION.footer} className="footer" align="center">
        <div className="reveal fecho fecho--centro">
          <h2 className="fecho__frase">{COPY.fecho.frase}</h2>
          <a className="btn btn--primary" href={CTA_URL} onClick={() => registraAviso('landing_fim')}>
            {COPY.fecho.cta}
          </a>
          <p className="note">
            {MARCA.aviso.nota} {MARCA.aviso.outroCaminho.split(MARCA.aviso.email)[0]}
            <a href={`mailto:${MARCA.aviso.email}`}>{MARCA.aviso.email}</a>
            {MARCA.aviso.outroCaminho.split(MARCA.aviso.email)[1]}
          </p>
        </div>
        <div className="reveal footer__bottom">
          <ul className="selos">
            {SELOS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <footer className="rodape">
            <div className="rodape__grade">
              <div className="rodape__sobre">
                <a className="rodape__marca" href="/" aria-label="NIMBUS, página inicial">
                  <img src={ASSETS.wordmark} alt="NIMBUS" width={1000} height={320} loading="lazy" />
                </a>
                <p className="rodape__lema">{MARCA.lema}</p>
              </div>
              {MARCA.rodape.map((coluna) => (
                <div key={coluna.titulo}>
                  <h2>{coluna.titulo}</h2>
                  {coluna.links.map((l) => {
                    const fora = l.href.startsWith('http')
                    const href = l.href.startsWith('https://loja.nimbuswear.com.br/') ? `${l.href}?ref=landing` : l.href
                    return (
                      <a key={l.rotulo} href={href} rel={fora ? 'noopener' : undefined}>
                        {l.rotulo}
                      </a>
                    )
                  })}
                </div>
              ))}
            </div>
            <p className="rodape__legal">{MARCA.legal}</p>
          </footer>
        </div>
      </Section>
      </main>
      {selectedProject && <ImpactProjectModal project={selectedProject} onClose={closeProject} />}
    </>
  )
}
