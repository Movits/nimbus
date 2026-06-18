// Navegação entre seções via scroll nativo (robusto e previsível).
export function scrollToSection(i: number) {
  const el = document.getElementById(`sec-${i}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
