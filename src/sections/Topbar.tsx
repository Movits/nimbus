import { useEffect, useRef, useState } from 'react'
import { ASSETS, CTA_URL, MARCA, SECTION, registraAviso } from '../data/content'
import { scrollToSection } from '../scene/scroll'

// O topo é o MESMO da vitrine (header() em scripts/vitrine/build-paginas.mjs):
// mesmas classes de public/css/marca.css, mesmos nomes e a mesma ordem, vindos
// de src/data/marca.json. Aqui, Manifesto e Impacto rolam até a seção da
// própria landing (cada seção termina com o link para a página inteira); os
// outros itens são links.
export default function Topbar() {
  const [scrolled, setScrolled] = useState(false)
  const [aberto, setAberto] = useState(false)
  const menu = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // o menu do celular fecha ao tocar fora e com Esc, como na vitrine (ui.js)
  useEffect(() => {
    const fora = (ev: MouseEvent) => {
      if (menu.current?.open && !menu.current.contains(ev.target as Node)) menu.current.open = false
    }
    const tecla = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape' && menu.current?.open) {
        menu.current.open = false
        menu.current.querySelector('summary')?.focus()
      }
    }
    document.addEventListener('click', fora)
    document.addEventListener('keydown', tecla)
    return () => {
      document.removeEventListener('click', fora)
      document.removeEventListener('keydown', tecla)
    }
  }, [])

  const itens = () =>
    MARCA.nav.map((item) =>
      'secao' in item && item.secao ? (
        <button
          key={item.rotulo}
          type="button"
          onClick={() => {
            if (menu.current) menu.current.open = false
            scrollToSection(SECTION[item.secao as keyof typeof SECTION])
          }}
        >
          <span>{item.rotulo}</span>
        </button>
      ) : (
        <a key={item.rotulo} href={item.href}>
          <span>{item.rotulo}</span>
          {'nota' in item && item.nota ? <small>{item.nota}</small> : null}
        </a>
      ),
    )

  return (
    <header className={`topo ${scrolled ? 'is-scrolled' : ''} ${aberto ? 'is-aberto' : ''}`}>
      <button className="topo__logo" type="button" onClick={() => scrollToSection(SECTION.hero)} aria-label="NIMBUS, ir para o início">
        <img src={ASSETS.wordmark} alt="NIMBUS" width={1000} height={320} />
      </button>
      <nav className="topo__nav" aria-label="Principal">
        {itens()}
      </nav>
      <details className="topo__menu" ref={menu} onToggle={(ev) => setAberto(ev.currentTarget.open)}>
        <summary>Menu</summary>
        <nav className="topo__painel" aria-label="Principal">
          {itens()}
        </nav>
      </details>
      <a className="topo__cta" href={CTA_URL} onClick={() => registraAviso('landing_topo')}>
        {MARCA.aviso.rotulo}
      </a>
    </header>
  )
}
