import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Clouds, Cloud, useScroll } from '@react-three/drei'
import { peak } from '../data/content'
import { fade } from './util'
import { useReducedMotion } from '../hooks/useReducedMotion'

// Nuvens PROCEDURAIS (transparência real, sem depender de PNG achatado).
// Aparecem nas seções "céu" (hero, manifesto, coleção, footer) e somem nas
// seções de cena fechada (Cristo, Pampulha, Dom Bosco) pra não poluir.
export default function ParallaxLayers() {
  const root = useRef<THREE.Group>(null!)
  const scroll = useScroll()
  const reduced = useReducedMotion()

  useFrame((state) => {
    if (!root.current) return
    const o = scroll.offset
    const sky = Math.min(1, fade(o, peak(0)) + fade(o, peak(1)) + fade(o, peak(5)) + fade(o, peak(6)))

    root.current.visible = sky > 0.02
    root.current.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      const mat = mesh.material as THREE.Material | undefined
      if (mat && 'opacity' in mat) {
        mat.transparent = true
        mat.depthTest = false
        mat.depthWrite = false
        ;(mat as THREE.MeshBasicMaterial).opacity = 0.55 * sky
        mesh.renderOrder = 15
      }
    })

    // parallax sutil pelo mouse (desktop)
    const tx = reduced ? 0 : state.pointer.x * 0.4
    const ty = reduced ? 0 : state.pointer.y * 0.2
    root.current.position.x = THREE.MathUtils.lerp(root.current.position.x, tx, 0.05)
    root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, ty, 0.05)
  })

  return (
    <group ref={root}>
      <Clouds material={THREE.MeshBasicMaterial} limit={300}>
        <Cloud seed={2} segments={26} bounds={[13, 2.4, 2]} volume={7} color="#ffffff" speed={0.15} position={[0, -2.3, 1]} />
        <Cloud seed={5} segments={18} bounds={[9, 2, 2]} volume={5} color="#eaf2fb" speed={0.1} position={[3.2, 2.3, 0]} />
        <Cloud seed={8} segments={16} bounds={[8, 2, 2]} volume={4} color="#ffffff" speed={0.12} position={[-4, 1.7, 2]} />
      </Clouds>
    </group>
  )
}
