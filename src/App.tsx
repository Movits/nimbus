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
      <Loader
        containerStyles={{ background: '#dcebfa' }}
        innerStyles={{ background: '#bcd6f0' }}
        barStyles={{ background: '#1b2733' }}
        dataStyles={{ color: '#1b2733', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', letterSpacing: '0.1em' }}
      />
    </>
  )
}
