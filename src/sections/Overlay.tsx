import type { ReactNode } from 'react'
import { ASSETS, COPY, PRODUCTS, SECTION } from '../data/content'
import { scrollToSection } from '../scene/scroll'
import { useInView } from '../hooks/useInView'

/** Wrapper de seção (100vh) que dispara os reveals quando entra na tela. */
function Section({
  className = '',
  align = 'center',
  children,
}: {
  className?: string
  align?: 'center' | 'left' | 'right'
  children: ReactNode
}) {
  const { ref, inView } = useInView<HTMLElement>()
  return (
    <section ref={ref} className={`section section--${align} ${className} ${inView ? 'in' : ''}`}>
      <div className="section__inner">{children}</div>
    </section>
  )
}

export default function Overlay() {
  return (
    <main className="overlay">
      {/* §1 HERO */}
      <Section className="hero" align="center">
        <p className="reveal kicker">{COPY.hero.kicker}</p>
        <h1 className="reveal display">{COPY.hero.title}</h1>
        <p className="reveal lede">{COPY.hero.sub}</p>
        <button className="reveal btn btn--primary" onClick={() => scrollToSection(SECTION.collection)}>
          {COPY.hero.cta}
        </button>
        <div className="reveal scroll-hint">role ↓</div>
      </Section>

      {/* §2 MANIFESTO */}
      <Section className="manifesto" align="center">
        <h2 className="reveal display display--md">{COPY.manifesto.title}</h2>
        <p className="reveal lede">{COPY.manifesto.body}</p>
      </Section>

      {/* §3 FÉ — Cristo Redentor (texto à esquerda) */}
      <Section className="faith" align="left">
        <p className="reveal kicker">{COPY.faith.kicker}</p>
        <h2 className="reveal display display--md">{COPY.faith.title}</h2>
        <p className="reveal lede">{COPY.faith.body}</p>
      </Section>

      {/* §4 DESIGN — Pampulha (texto à esquerda) */}
      <Section className="design" align="left">
        <p className="reveal kicker">{COPY.design.kicker}</p>
        <h2 className="reveal display display--md">{COPY.design.title}</h2>
        <p className="reveal lede">{COPY.design.body}</p>
      </Section>

      {/* §5 O DROP — Dom Bosco (azul profundo) */}
      <Section className="drop dark" align="center">
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
      <Section className="collection" align="center">
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

      {/* §7 FOOTER */}
      <Section className="footer" align="center">
        <img className="reveal footer__logo" src={ASSETS.wordmark} alt="NIMBUS" />
        <h2 className="reveal display display--md footer__tagline">{COPY.footer.tagline}</h2>
        <form className="reveal signup" onSubmit={(e) => e.preventDefault()}>
          <input type="email" required placeholder={COPY.footer.placeholder} aria-label="email" />
          <button className="btn btn--primary" type="submit">
            {COPY.footer.cta}
          </button>
        </form>
        <div className="reveal footer__meta">
          <span>{COPY.footer.madein}</span>
          <span>Instagram · TikTok</span>
          <span>{COPY.footer.rights}</span>
        </div>
      </Section>
    </main>
  )
}
