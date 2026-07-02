import { useEffect, useState } from 'react'
import { ASSETS, SECTION, STORE_URL } from '../data/content'
import { scrollToSection } from '../scene/scroll'

export default function Topbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`topbar ${scrolled ? 'is-scrolled' : ''}`}>
      <button className="topbar__logo" onClick={() => scrollToSection(SECTION.hero)} aria-label="NIMBUS — início">
        <img src={ASSETS.wordmark} alt="NIMBUS" />
      </button>
      <nav className="topbar__nav">
        <button className="topbar__link--sm" onClick={() => scrollToSection(SECTION.manifesto)}>
          Manifesto
        </button>
        <button className="topbar__link--sm" onClick={() => scrollToSection(SECTION.design)}>
          Design
        </button>
        <button onClick={() => scrollToSection(SECTION.impact)}>Impacto</button>
        <a className="topbar__cta" href={STORE_URL}>
          Loja
        </a>
      </nav>
    </header>
  )
}
