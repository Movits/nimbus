export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x))

// dimensiona um plano pra "cobrir" a viewport (estilo background-size: cover)
export function coverSize(vw: number, vh: number, aspect: number): [number, number] {
  return vw / vh > aspect ? [vw, vw / aspect] : [vh * aspect, vh]
}
