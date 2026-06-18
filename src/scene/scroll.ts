// Ponte pro elemento de scroll do drei <ScrollControls>, pra navegar a partir
// de elementos fora do Canvas (topbar, CTAs).
export const scrollEl = { current: null as HTMLElement | null }

export function scrollToSection(i: number) {
  const el = scrollEl.current
  // posição real da seção (robusto mesmo com alturas variáveis)
  const target = document.getElementById(`sec-${i}`) as HTMLElement | null
  if (el && target) {
    el.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
    return
  }
  const fallback = i * window.innerHeight
  if (el) el.scrollTo({ top: fallback, behavior: 'smooth' })
  else window.scrollTo({ top: fallback, behavior: 'smooth' })
}
