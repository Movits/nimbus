import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Backgrounds from './Backgrounds'
import ParallaxLayers from './ParallaxLayers'
import { useIsMobile } from '../hooks/useIsMobile'

// Canvas FIXO, tela cheia, atrás do conteúdo (CSS .canvas com pointer-events:none).
// O scroll é do documento; a cena lê os pesos das seções via scrollStore.
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
        <Backgrounds />
        <ParallaxLayers />
      </Suspense>
    </Canvas>
  )
}
