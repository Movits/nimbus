// dimensiona um plano pra "cobrir" a viewport (estilo background-size: cover)
export function coverSize(vw: number, vh: number, aspect: number): [number, number] {
  return vw / vh > aspect ? [vw, vw / aspect] : [vh * aspect, vh]
}
