import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll, useTexture } from '@react-three/drei'
import { ASSETS, peak } from '../data/content'
import { coverSize, fade } from './util'
import { useIsMobile } from '../hooks/useIsMobile'

/** Um plano de fundo full-viewport cuja opacidade faz crossfade conforme o scroll. */
function Background({ url, p, order }: { url: string; p: number; order: number }) {
  const texture = useTexture(url)
  const { width, height } = useThree((s) => s.viewport)
  const mat = useRef<THREE.MeshBasicMaterial>(null!)
  const mesh = useRef<THREE.Mesh>(null!)
  const scroll = useScroll()

  const aspect = texture.image ? texture.image.width / texture.image.height : 16 / 9
  const [w, h] = coverSize(width, height, aspect)

  useFrame(() => {
    const op = fade(scroll.offset, p)
    mat.current.opacity = op
    // leve "ken burns": dá um zoom suave enquanto a cena entra
    const s = 1.07 - 0.07 * op
    mesh.current.scale.setScalar(s)
  })

  return (
    <mesh ref={mesh} renderOrder={order}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        ref={mat}
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  )
}

export default function Backgrounds() {
  const mobile = useIsMobile()
  const hero = mobile ? ASSETS.heroMobile : ASSETS.heroDesktop
  // ordem = timeline do scroll (hero → céu → cristo → pampulha → dom bosco → loja → footer)
  const scenes = [hero, ASSETS.ceu, ASSETS.cristo, ASSETS.pampulha, ASSETS.dombosco, ASSETS.store, ASSETS.ceu]
  return (
    <group>
      {scenes.map((url, i) => (
        <Background key={i} url={url} p={peak(i)} order={i} />
      ))}
    </group>
  )
}
