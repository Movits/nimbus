import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { ASSETS } from '../data/content'
import { coverSize } from './util'
import { weightAt } from './scrollStore'
import { useIsMobile } from '../hooks/useIsMobile'

/** Plano de fundo full-viewport cuja opacidade = peso da seção (crossfade). */
function Background({ url, index, order }: { url: string; index: number; order: number }) {
  const texture = useTexture(url)
  const { width, height } = useThree((s) => s.viewport)
  const mat = useRef<THREE.MeshBasicMaterial>(null!)
  const mesh = useRef<THREE.Mesh>(null!)

  const aspect = texture.image ? texture.image.width / texture.image.height : 16 / 9
  const [w, h] = coverSize(width, height, aspect)

  useFrame(() => {
    const op = weightAt(index)
    mat.current.opacity = op
    const s = 1.06 - 0.06 * op // leve "ken burns"
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
  const cristo = mobile ? ASSETS.cristoMobile : ASSETS.cristo
  const pampulha = mobile ? ASSETS.pampulhaMobile : ASSETS.pampulha
  // cena por seção: hero, manifesto(céu), fé(cristo), design(pampulha), impacto(céu), footer(céu)
  const scenes = [hero, ASSETS.ceu, cristo, pampulha, ASSETS.ceu, ASSETS.ceu]
  return (
    <group>
      {scenes.map((url, i) => (
        <Background key={i} url={url} index={i} order={i} />
      ))}
    </group>
  )
}
