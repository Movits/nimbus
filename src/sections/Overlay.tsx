import type { ReactNode } from 'react'
import { ASSETS, COPY, PRODUCTS, SECTION } from '../data/content'
import { scrollToSection } from '../scene/scroll'
import { useInView } from '../hooks/useInView'

/** Wrapper de seção (100vh) que dispara os reveals quando entra na tela. */
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
  return (
    <section
      id={`sec-${index}`}
      ref={ref}
      className={`section section--${align} ${className} ${inView ? 'in' : ''}`}
    >
      <div className="section__inner">{children}</div>
    </section>
  )
}

export default function Overlay() {
  return (
    <main className="overlay">
      {/* §1 HERO — logo grande + subtítulo + CTA */}
      <Section index={SECTION.hero} className="hero" align="center">
        <img className="reveal hero__logo" src={ASSETS.wordmark} alt="NIMBUS" />
        <p className="reveal hero__subtitle">{COPY.hero.subtitle}</p>
        <button className="reveal btn btn--primary" onClick={() => scrollToSection(SECTION.collection)}>
          {COPY.hero.cta}
        </button>
      </Section>

      {/* §2 MANIFESTO */}
      <Section index={SECTION.manifesto} className="manifesto" align="center">
        <h2 className="reveal display display--md">{COPY.manifesto.title}</h2>
        <p className="reveal lede">{COPY.manifesto.body}</p>
      </Section>

      {/* §3 FÉ — Cristo Redentor (texto à esquerda) */}
      <Section index={SECTION.faith} className="faith" align="left">
        <p className="reveal kicker">{COPY.faith.kicker}</p>
        <h2 className="reveal display display--md">{COPY.faith.title}</h2>
        <p className="reveal lede">{COPY.faith.body}</p>
      </Section>

      {/* §4 DESIGN — Pampulha (texto à esquerda) */}
      <Section index={SECTION.design} className="design" align="left">
        <p className="reveal kicker">{COPY.design.kicker}</p>
        <h2 className="reveal display display--md">{COPY.design.title}</h2>
        <p className="reveal lede">{COPY.design.body}</p>
      </Section>

      {/* §5 O DROP — Dom Bosco (azul profundo) */}
      <Section index={SECTION.drop} className="drop dark" align="center">
        <p className="reveal kicker kicker--gold">{COPY.drop.kicker}</p>
        <h2 className="reveal display">{COPY.drop.title}</h2>
        <p className="reveal lede">{COPY.drop.body}</p>
        <form className="reveal signup" onSubmit={(e) => e.preventDefault()}>
          <input type="email" required placeholder={COPY.drop.placeholder} aria-label="email" />
          <button className="btn btn--gold" type="submit">
            {COPY.drop.cta}
          </button>
        </form>
      </Section>

      {/* §6 COLEÇÃO — loja placeholder */}
      <Section index={SECTION.collection} className="collection" align="center">
        <p className="reveal kicker">{COPY.collection.kicker}</p>
        <h2 className="reveal display display--md">{COPY.collection.title}</h2>
        <p className="reveal note">{COPY.collection.note}</p>
        <div className="grid">
          {PRODUCTS.map((p, i) => (
            <article className="reveal card" key={i} style={{ ['--i' as string]: i }}>
              <div className="card__media" aria-hidden="true">
                <span className="card__silhouette" />
              </div>
              <div className="card__row">
                <span className="card__name">{p.name}</span>
                <span className="card__price">{p.price}</span>
              </div>
              <button className="btn btn--ghost card__cta">{COPY.collection.cta}</button>
            </article>
          ))}
        </div>
      </Section>

      {/* §7 FOOTER — logo grande */}
      <Section index={SECTION.footer} className="footer" align="center">
        <img className="reveal footer__logo" src={ASSETS.wordmark} alt="NIMBUS" />
        <form className="reveal signup" onSubmit={(e) => e.preventDefault()}>
          <input type="email" required placeholder={COPY.footer.placeholder} aria-label="email" />
          <button className="btn btn--primary" type="submit">
            {COPY.footer.cta}
          </button>
        </form>
        <p className="reveal footer__newsletter">{COPY.footer.newsletter}</p>
        <div className="reveal footer__meta">
          <span>{COPY.footer.madein}</span>
          <span>Instagram · TikTok</span>
          <span>{COPY.footer.rights}</span>
        </div>
      </Section>
    </main>
  )
}
