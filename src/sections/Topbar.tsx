import { useEffect, useState } from 'react'
import { ASSETS, SECTION } from '../data/content'
import { scrollEl, scrollToSection } from '../scene/scroll'

export default function Topbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // quem rola é o container do drei <ScrollControls> (não a window).
    // capturamos o evento na fase de capture e lemos o scrollTop do alvo.
    const onScroll = (e: Event) => {
      const target = e.target as HTMLElement | null
      const top = target?.scrollTop ?? scrollEl.current?.scrollTop ?? 0
      setScrolled(top > 40)
    }
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
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
