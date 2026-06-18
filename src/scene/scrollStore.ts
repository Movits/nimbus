// Store leve que liga o scroll nativo do documento à cena R3F (canvas fixo).
// Calcula um "peso" por seção (1 = centralizada na tela, 0 = a um viewport de
// distância) usando getBoundingClientRect — robusto com alturas variáveis.

export const weights: number[] = []
export const pointer = { x: 0, y: 0 }

const sections: (HTMLElement | null)[] = []

export function registerSection(index: number, el: HTMLElement | null) {
  sections[index] = el
  recompute()
}

export function weightAt(i: number) {
  return weights[i] ?? 0
}

export function recompute() {
  const vh = window.innerHeight || 1
  const center = vh / 2
  for (let i = 0; i < sections.length; i++) {
    const el = sections[i]
    if (!el) {
      weights[i] = 0
      continue
    }
    const r = el.getBoundingClientRect()
    const c = r.top + r.height / 2
    const d = Math.abs(c - center) / vh
    weights[i] = Math.max(0, 1 - d)
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', recompute, { passive: true })
  window.addEventListener('resize', recompute)
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
    },
    { passive: true },
  )
}
