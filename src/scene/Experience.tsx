import { Component, Suspense, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import Backgrounds from './Backgrounds'
import ParallaxLayers from './ParallaxLayers'
import { useIsMobile } from '../hooks/useIsMobile'
import { ASSETS } from '../data/content'

// Sem WebGL (GPU bloqueada, Modo de Bloqueio do iPhone, driver velho) o erro
// do Canvas subia até a raiz e o React desmontava a página inteira: texto,
// topo e botões sumiam (teste de 20/10/2026). Agora o fundo vira a foto
// estática do hero e o resto da landing segue de pé.
function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

function StaticBackdrop() {
  const mobile = useIsMobile()
  return (
    <div
      className="canvas canvas--static"
      style={{ backgroundImage: `url(${mobile ? ASSETS.heroMobile : ASSETS.heroDesktop})` }}
      aria-hidden="true"
    />
  )
}

class CanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <StaticBackdrop /> : this.props.children
  }
}

// Canvas FIXO, tela cheia, atrás do conteúdo (CSS .canvas com pointer-events:none).
// O scroll é do documento; a cena lê os pesos das seções via scrollStore.
export default function Experience() {
  const mobile = useIsMobile()
  if (!hasWebGL()) return <StaticBackdrop />
  return (
    <CanvasBoundary>
      <Canvas
        className="canvas"
        dpr={[1, mobile ? 1.35 : 2]}
        gl={{ antialias: !mobile, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 5], fov: 50 }}
      >
        <color attach="background" args={['#dcebfa']} />
        <Suspense fallback={null}>
          <Backgrounds />
          <ParallaxLayers />
        </Suspense>
      </Canvas>
    </CanvasBoundary>
  )
}
