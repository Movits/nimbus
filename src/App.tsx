import { useEffect } from 'react'
import { Loader } from '@react-three/drei'
import Experience from './scene/Experience'
import Topbar from './sections/Topbar'
import Overlay from './sections/Overlay'
import { recompute } from './scene/scrollStore'

export default function App() {
  // recalcula os pesos depois que fontes/layout assentam
  useEffect(() => {
    recompute()
    const t = setTimeout(recompute, 300)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <Topbar />
      <Experience />
      <Overlay />
      {/* O texto da landing não espera mais as texturas: em 4G lento a tela
          ficava vazia por ~2,6 s e o loader segurava tudo até ~4,7 s (teste de
          20/10/2026). Agora o loader é só uma barra discreta embaixo. */}
      <Loader
        containerStyles={{ background: 'transparent', pointerEvents: 'none', alignItems: 'flex-end', paddingBottom: '1.5rem' }}
        innerStyles={{ background: '#bcd6f0' }}
        barStyles={{ background: '#1b2733' }}
        dataStyles={{ color: '#1b2733', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', letterSpacing: '0.1em' }}
        dataInterpolation={(p) => `Carregando ${p.toFixed(0)}%`}
      />
    </>
  )
}
