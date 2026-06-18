import { PAGES } from '../data/content'

// largura (em fração de scroll) de cada janela de crossfade entre seções vizinhas
export const HALF = 1 / (PAGES - 1)

export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))

// 1 quando offset == peak, caindo linearmente até 0 a uma distância HALF.
// Vizinhos somam ~1 → crossfade limpo entre as cenas.
export const fade = (offset: number, p: number, half = HALF) =>
  clamp(1 - Math.abs(offset - p) / half, 0, 1)

// dimensiona um plano pra "cobrir" a viewport (estilo background-size: cover)
export function coverSize(vw: number, vh: number, aspect: number): [number, number] {
  return vw / vh > aspect ? [vw, vw / aspect] : [vh * aspect, vh]
}
