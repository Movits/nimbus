import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useScroll, useTexture } from '@react-three/drei'
import { ASSETS, peak } from '../data/content'
import { fade } from './util'
import { useReducedMotion } from '../hooks/useReducedMotion'

type FloaterProps = {
  url: string
  x: number
  y: number
  z: number
  size: number // altura em unidades de mundo
  peaks: number[] // em quais seções fica visível
  drift?: number // amplitude do balanço horizontal
  speed?: number
  phase?: number
  parallax?: number // deslocamento vertical conforme o scroll
}

/** Cutout transparente (nuvem/godray/arco) que flutua e cria profundidade no parallax. */
function Floater({ url, x, y, z, size, peaks, drift = 0.25, speed = 0.16, phase = 0, parallax = 1.5 }: FloaterProps) {
  const texture = useTexture(url)
  const group = useRef<THREE.Group>(null!)
  const mat = useRef<THREE.MeshBasicMaterial>(null!)
  const scroll = useScroll()
  const reduced = useReducedMotion()
  const aspect = texture.image ? texture.image.width / texture.image.height : 1

  useFrame((state) => {
    let op = 0
    for (const p of peaks) op = Math.max(op, fade(scroll.offset, p))
    mat.current.opacity = op

    const t = state.clock.elapsedTime
    const dx = reduced ? 0 : Math.sin(t * speed + phase) * drift
    const dy = (scroll.offset - peaks[0]) * parallax
    group.current.position.x = x + dx
    group.current.position.y = y + dy
  })

  return (
    <group ref={group} position={[x, y, z]} renderOrder={20}>
      <mesh>
        <planeGeometry args={[size * aspect, size]} />
        <meshBasicMaterial ref={mat} map={texture} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function ParallaxLayers() {
  const root = useRef<THREE.Group>(null!)
  const reduced = useReducedMotion()

  // parallax sutil pelo mouse (desktop)
  useFrame((state) => {
    if (reduced || !root.current) return
    root.current.position.x = THREE.MathUtils.lerp(root.current.position.x, state.pointer.x * 0.25, 0.04)
    root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, state.pointer.y * 0.15, 0.04)
  })

  return (
    <group ref={root}>
      {/* nuvens do hero + manifesto */}
      <Floater url={ASSETS.cloud01} x={-2.6} y={-1.3} z={2.2} size={2.0} peaks={[peak(0), peak(1)]} phase={0} />
      <Floater url={ASSETS.cloud02} x={3.0} y={-1.7} z={2.6} size={2.6} peaks={[peak(0), peak(1)]} phase={1.6} drift={0.32} />
      <Floater url={ASSETS.cloud03} x={-3.2} y={1.7} z={1.6} size={1.5} peaks={[peak(1), peak(2)]} phase={3} />
      {/* feixe de luz no hero e no "drop" */}
      <Floater url={ASSETS.godray} x={1.6} y={2.0} z={1.2} size={5.0} peaks={[peak(0), peak(4)]} drift={0.08} speed={0.1} parallax={0.6} />
      {/* arco modernista na seção de design */}
      <Floater url={ASSETS.arco} x={2.5} y={1.3} z={1.8} size={2.2} peaks={[peak(3)]} drift={0.14} />
      {/* nuvens da coleção/footer */}
      <Floater url={ASSETS.cloud02} x={-3.0} y={-1.9} z={2.4} size={2.3} peaks={[peak(5), peak(6)]} phase={2.2} />
    </group>
  )
}
