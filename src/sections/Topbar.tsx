import { useEffect, useState } from 'react'
import { ASSETS, SECTION } from '../data/content'
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
        <button onClick={() => scrollToSection(SECTION.manifesto)}>Manifesto</button>
        <button onClick={() => scrollToSection(SECTION.design)}>Design</button>
        <button className="topbar__cta" onClick={() => scrollToSection(SECTION.collection)}>
          Coleção
        </button>
      </nav>
    </header>
  )
}
