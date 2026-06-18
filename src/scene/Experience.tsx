import { Suspense, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'
import Backgrounds from './Backgrounds'
import ParallaxLayers from './ParallaxLayers'
import Overlay from '../sections/Overlay'
import { PAGES, peak } from '../data/content'
import { fade } from './util'
import { scrollEl } from './scroll'
import { useIsMobile } from '../hooks/useIsMobile'

/** Expõe o elemento de scroll do drei pra navegação externa (topbar/CTAs). */
function ScrollBridge() {
  const data = useScroll()
  useEffect(() => {
    scrollEl.current = data.el as HTMLElement
    return () => {
      scrollEl.current = null
    }
  }, [data])
  return null
}

/** Interpola a cor de fundo da cena pro azul profundo na seção "O Drop" (Dom Bosco). */
function Backdrop() {
  const data = useScroll()
  const { scene } = useThree()
  const sky = useMemo(() => new THREE.Color('#dcebfa'), [])
  const blue = useMemo(() => new THREE.Color('#0b2360'), [])
  const tmp = useMemo(() => new THREE.Color('#dcebfa'), [])
  useFrame(() => {
    const t = fade(data.offset, peak(4))
    tmp.copy(sky).lerp(blue, t)
    scene.background = tmp
  })
  return null
}

export default function Experience() {
  const mobile = useIsMobile()
  return (
    <Canvas
      className="canvas"
      dpr={[1, mobile ? 1.5 : 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 5], fov: 50 }}
    >
      <color attach="background" args={['#dcebfa']} />
      <Suspense fallback={null}>
        <ScrollControls pages={PAGES} damping={0.18}>
          <ScrollBridge />
          <Backdrop />
          <Backgrounds />
          <ParallaxLayers />
          <Scroll html style={{ width: '100%' }}>
            <Overlay />
          </Scroll>
        </ScrollControls>
      </Suspense>
    </Canvas>
  )
}
