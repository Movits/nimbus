import { Loader } from '@react-three/drei'
import Experience from './scene/Experience'
import Topbar from './sections/Topbar'

export default function App() {
  return (
    <>
      <Topbar />
      <Experience />
      <Loader
        containerStyles={{ background: '#dcebfa' }}
        innerStyles={{ background: '#bcd6f0' }}
        barStyles={{ background: '#1b2733' }}
        dataStyles={{ color: '#1b2733', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', letterSpacing: '0.1em' }}
      />
    </>
  )
}
