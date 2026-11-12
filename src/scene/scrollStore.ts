// Store leve que liga o scroll nativo do documento à cena R3F (canvas fixo).
// Calcula um "peso" por seção usando getBoundingClientRect, robusto com alturas
// variáveis: 1 enquanto a seção ocupa o centro da tela, 0 a meio viewport dali.
//
// Até 11/11/2026 o peso caía em linha reta ao longo de um viewport INTEIRO e era
// medido pelo centro da seção. Dois defeitos saíam disso: o monumento da seção
// anterior ficava de fantasma atrás do título da seguinte (a Pampulha a 30%
// atrás de "Acima de tudo, o próximo."), e seção mais alta que a tela (o
// impacto, com os cards) nunca chegava a peso 1, então o próprio fundo dela
// ficava lavado. Agora a seção alta vale 1 em toda a sua extensão, e o peso tem
// um PATAMAR e uma QUEDA: vale 1 enquanto o centro da seção está a até PATAMAR
// do centro da tela, e chega a 0 em PATAMAR + QUEDA. As seções com monumento
// têm 84vh, então os centros de duas vizinhas ficam a 0,84 de distância e o
// meio do caminho é 0,42: com 0,16 + 0,26 os dois monumentos valem 0 ali, e
// um some para o céu antes de o outro nascer. Com a queda em linha reta até
// 0,67 (primeira versão de 11/11) os dois ficavam a 30% no meio do caminho, e
// a Pampulha ainda aparecia atrás de "Acima de tudo, o próximo.".
const PATAMAR = 0.16
const QUEDA = 0.26
// (No celular a cena não tem monumento: eles são imagens do fluxo da página.)
// A capa não tem monumento vizinho com quem disputar a tela: a Catedral fica
// inteira até o texto do manifesto chegar perto da coroa dela (0,3 de tela
// rolada) e some rápido dali em diante. Sumindo antes, ficava meia tela de céu
// vazio debaixo do botão; sumindo depois, ficava de fantasma atrás do manifesto.
const PATAMAR_CAPA = 0.3
const QUEDA_CAPA = 0.18

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
    // folga da seção mais alta que a tela: dentro dela a distância é zero
    const folga = Math.max(0, r.height / 2 - vh / 2)
    const d = Math.max(0, Math.abs(c - center) - folga) / vh
    const capa = i === 0
    const patamar = capa ? PATAMAR_CAPA : PATAMAR
    const queda = capa ? QUEDA_CAPA : QUEDA
    const w = Math.min(1, Math.max(0, 1 - (d - patamar) / queda))
    weights[i] = w * w * (3 - 2 * w)
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
