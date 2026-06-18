// Ponte pro elemento de scroll do drei <ScrollControls>, pra navegar a partir
// de elementos fora do Canvas (topbar, CTAs).
export const scrollEl = { current: null as HTMLElement | null }

export function scrollToSection(i: number) {
  const el = scrollEl.current
  const top = i * window.innerHeight
  if (el) el.scrollTo({ top, behavior: 'smooth' })
  else window.scrollTo({ top, behavior: 'smooth' })
}
