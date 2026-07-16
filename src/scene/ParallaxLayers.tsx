import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Clouds, Cloud } from '@react-three/drei'
import { SECTION } from '../data/content'
import { pointer, weightAt } from './scrollStore'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useIsMobile } from '../hooks/useIsMobile'

// Nuvens PROCEDURAIS (transparência real). Aparecem nas seções "céu" (hero,
// manifesto, impacto, footer) e somem nas seções de cena fechada (fé, design).
export default function ParallaxLayers() {
  const root = useRef<THREE.Group>(null!)
  const reduced = useReducedMotion()
  const mobile = useIsMobile()

  useFrame(({ clock }) => {
    if (!root.current) return
    const sky = Math.min(
      1,
      weightAt(SECTION.hero) + weightAt(SECTION.manifesto) + weightAt(SECTION.impact) + weightAt(SECTION.footer),
    )

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

    // No desktop, as nuvens acompanham discretamente o ponteiro. No celular,
    // onde nao existe hover, elas ganham uma deriva propria e bem lenta.
    const elapsed = clock.getElapsedTime()
    const tx = reduced ? 0 : mobile ? Math.sin(elapsed * 0.11) * 0.32 : pointer.x * 0.4
    const ty = reduced ? 0 : mobile ? Math.cos(elapsed * 0.08) * 0.12 : pointer.y * 0.2
    root.current.position.x = THREE.MathUtils.lerp(root.current.position.x, tx, 0.05)
    root.current.position.y = THREE.MathUtils.lerp(root.current.position.y, ty, 0.05)
  })

  return (
    <group ref={root}>
      <Clouds material={THREE.MeshBasicMaterial} limit={mobile ? 180 : 300}>
        <Cloud
          seed={2}
          segments={mobile ? 18 : 26}
          bounds={mobile ? [7.6, 2.6, 2] : [13, 2.4, 2]}
          volume={mobile ? 5.4 : 7}
          color="#ffffff"
          speed={reduced ? 0 : mobile ? 0.1 : 0.15}
          position={mobile ? [0, -2.1, 1] : [0, -2.3, 1]}
        />
        <Cloud
          seed={5}
          segments={mobile ? 12 : 18}
          bounds={mobile ? [5.6, 2.1, 2] : [9, 2, 2]}
          volume={mobile ? 3.8 : 5}
          color="#eaf2fb"
          speed={reduced ? 0 : mobile ? 0.07 : 0.1}
          position={mobile ? [1.9, 1.8, 0] : [3.2, 2.3, 0]}
        />
        <Cloud
          seed={8}
          segments={mobile ? 10 : 16}
          bounds={mobile ? [5.2, 2, 2] : [8, 2, 2]}
          volume={mobile ? 3.2 : 4}
          color="#ffffff"
          speed={reduced ? 0 : mobile ? 0.08 : 0.12}
          position={mobile ? [-2.1, 1.35, 2] : [-4, 1.7, 2]}
        />
      </Clouds>
    </group>
  )
}
