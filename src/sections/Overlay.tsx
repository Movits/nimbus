import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ASSETS, COPY, IMPACT_PROJECTS, SECTION, STORE_URL, type ImpactProject } from '../data/content'
import { registerSection } from '../scene/scrollStore'
import { useInView } from '../hooks/useInView'
import ImpactProjectModal from '../components/ImpactProjectModal'

/** Seção (min 100vh) que registra seu elemento no store e dispara os reveals. */
function Section({
  index,
  className = '',
  align = 'center',
  children,
}: {
  index: number
  className?: string
  align?: 'center' | 'left' | 'right'
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
      <div className="section__inner">{children}</div>
    </section>
  )
}

export default function Overlay() {
  const [selectedProject, setSelectedProject] = useState<ImpactProject | null>(null)
  const closeProject = useCallback(() => setSelectedProject(null), [])

  return (
    <>
      <main className="overlay">
      {/* §1 HERO — logo grande + subtítulo + CTA (alinhado ao topo, catedral à mostra) */}
      <Section index={SECTION.hero} className="hero" align="center">
        <img className="reveal hero__logo" src={ASSETS.wordmark} alt="NIMBUS" />
        <p className="reveal hero__subtitle">{COPY.hero.subtitle}</p>
        <a className="reveal btn btn--primary" href={STORE_URL}>
          {COPY.hero.cta}
        </a>
      </Section>

      {/* §2 MANIFESTO */}
      <Section index={SECTION.manifesto} className="manifesto" align="center">
        <h2 className="reveal display display--md">{COPY.manifesto.title}</h2>
        <p className="reveal lede">{COPY.manifesto.body}</p>
      </Section>

      {/* §3 FÉ — Cristo Redentor */}
      <Section index={SECTION.faith} className="faith" align="left">
        <p className="reveal kicker">{COPY.faith.kicker}</p>
        <h2 className="reveal display display--md">{COPY.faith.title}</h2>
        <p className="reveal lede">{COPY.faith.body}</p>
      </Section>

      {/* §4 DESIGN — Pampulha */}
      <Section index={SECTION.design} className="design" align="left">
        <p className="reveal kicker">{COPY.design.kicker}</p>
        <h2 className="reveal display display--md">{COPY.design.title}</h2>
        <p className="reveal lede">{COPY.design.body}</p>
      </Section>

      {/* §5 IMPACTO — 10% do lucro pro projeto que o cliente escolher */}
      <Section index={SECTION.impact} className="impact" align="center">
        <p className="reveal kicker">{COPY.impact.kicker}</p>
        <h2 className="reveal display display--md">{COPY.impact.title}</h2>
        <p className="reveal lede">{COPY.impact.body}</p>
        <div className="impact__grid">
          {IMPACT_PROJECTS.map((p, i) => (
            <button
              className="reveal impact__card"
              key={p.id}
              type="button"
              style={{ ['--i' as string]: i }}
              onClick={() => setSelectedProject(p)}
              aria-haspopup="dialog"
              aria-label={`Conhecer o projeto ${p.name}`}
            >
              <span className="impact__name" role="heading" aria-level={3}>{p.name}</span>
              <span className="impact__desc">{p.desc}</span>
              <span className="impact__cardCta" aria-hidden="true">
                Conhecer projeto
                <svg viewBox="0 0 24 24" width="17" height="17">
                  <path d="M5 12h14M14 7l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
          ))}
        </div>
        <p className="reveal note impact__outro">{COPY.impact.outroNote}</p>
        <a className="reveal btn btn--primary" href={STORE_URL}>
          {COPY.impact.cta}
        </a>
      </Section>

      {/* §6 FOOTER — logo grande + linha de confiança + redes */}
      <Section index={SECTION.footer} className="footer" align="center">
        <img className="reveal footer__logo" src={ASSETS.wordmark} alt="NIMBUS" />
        <div className="reveal footer__bottom">
          <ul className="footer__trust">
            {COPY.footer.trust.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
          <div className="footer__meta">
            <span>{COPY.footer.madein}</span>
            <span>Instagram · TikTok</span>
            <span>{COPY.footer.rights}</span>
          </div>
        </div>
      </Section>
      </main>
      {selectedProject && <ImpactProjectModal project={selectedProject} onClose={closeProject} />}
    </>
  )
}
