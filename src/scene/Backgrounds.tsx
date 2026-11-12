import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { ASSETS, SECTION } from '../data/content'
import { coverSize } from './util'
import { weightAt } from './scrollStore'
import { useIsMobile } from '../hooks/useIsMobile'

/** Plano de fundo full-viewport. Com `index`, a opacidade é o peso da seção;
 *  sem ele, é a base que fica sempre inteira (o céu). `desce` baixa a foto,
 *  em fração da altura da tela. Quem desce deixa uma faixa da base à mostra no
 *  alto: o topo da foto ganha uma borda esfumada, para a emenda entre os dois
 *  céus não aparecer. */
function Background({ url, index, order, desce = 0 }: { url: string; index?: number; order: number; desce?: number }) {
  const texture = useTexture(url)
  const { width, height } = useThree((s) => s.viewport)
  const mat = useRef<THREE.MeshBasicMaterial>(null!)
  const mesh = useRef<THREE.Mesh>(null!)
  const penaDoTopo = useMemo(() => {
    if (desce <= 0) return null
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 256
    const g = c.getContext('2d')!
    const f = g.createLinearGradient(0, 0, 0, c.height)
    f.addColorStop(0, '#000')
    f.addColorStop(0.16, '#fff')
    f.addColorStop(1, '#fff')
    g.fillStyle = f
    g.fillRect(0, 0, c.width, c.height)
    return new THREE.CanvasTexture(c)
  }, [desce])

  const aspect = texture.image ? texture.image.width / texture.image.height : 16 / 9
  const [w, h] = coverSize(width, height, aspect)

  useFrame(() => {
    const op = index === undefined ? 1 : weightAt(index)
    mat.current.opacity = op
    const s = 1.06 - 0.06 * op // leve "ken burns"
    mesh.current.scale.setScalar(s)
  })

  return (
    <mesh ref={mesh} renderOrder={order} position-y={-desce * height}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        ref={mat}
        map={texture}
        alphaMap={penaDoTopo ?? undefined}
        transparent
        opacity={0}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  )
}

/** O céu da base desenhado DE NOVO, só na parte de baixo da tela, por cima da
 *  cena da seção "index". Existe por causa da Pampulha: a foto traz a igreja
 *  com um reflexo espelhado no meio do céu, que lê como prédio falso flutuando
 *  (a revisão de 11/11/2026 apontou, e o dono já tinha reprovado arquitetura
 *  inventada nas nuvens). Com o mar de nuvens por cima da metade de baixo, o
 *  reflexo some e a igreja passa a sair das nuvens, como a Catedral da capa.
 *  "de" e "ate" são frações da altura da tela, contadas do alto: acima de
 *  "de" nada é coberto, abaixo de "ate" tudo é. A escala fica em 1, igual à
 *  da base, para as nuvens de cima coincidirem com as de baixo.
 *  "remendo" cobre também um retângulo de bordas esfumadas, em frações da
 *  FOTO: [esquerda, direita, alto]; para baixo ele emenda na faixa de nuvens.
 *  No computador ele esconde o campanário, que fica atrás do cartão de texto e
 *  deixava só um toco para fora, por cima do cartão. É um retângulo e não a
 *  faixa esquerda inteira porque o céu da foto é mais leitoso que o da base:
 *  a faixa desenhava uma emenda vertical no alto da tela. */
const PENA = 0.035 // largura da borda esfumada do remendo
function MarDeNuvens({ index, order, de, ate, remendo }: { index: number; order: number; de: number; ate: number; remendo?: [number, number, number] }) {
  const texture = useTexture(ASSETS.ceu)
  const { width, height } = useThree((s) => s.viewport)
  const mat = useRef<THREE.MeshBasicMaterial>(null!)
  const [esq, dir, alto] = remendo ?? [0, 0, 0]
  const mascara = useMemo(() => {
    const N = 256
    const tela = () => {
      const c = document.createElement('canvas')
      c.width = N
      c.height = N
      return c
    }
    // degradê preto/branco: preto até "a", branco de "b" até "c", preto de "d" em diante
    const degrade = (g: CanvasRenderingContext2D, x: number, y: number, a: number, b: number, c: number, d: number) => {
      const f = g.createLinearGradient(0, 0, x, y)
      f.addColorStop(0, a > 0 ? '#000' : '#fff')
      if (a > 0) f.addColorStop(a, '#000')
      f.addColorStop(b, '#fff')
      f.addColorStop(c, '#fff')
      if (d < 1) f.addColorStop(d, '#000')
      f.addColorStop(1, d < 1 ? '#000' : '#fff')
      g.fillStyle = f
      g.fillRect(0, 0, N, N)
    }
    const c = tela()
    const g = c.getContext('2d')!
    degrade(g, 0, N, de, ate, 1, 1) // a faixa de nuvens de baixo
    if (dir > 0) {
      // o remendo: o degradê horizontal multiplicado pelo vertical dá um retângulo esfumado
      const p = tela()
      const q = p.getContext('2d')!
      degrade(q, N, 0, Math.max(0, esq - PENA), esq, dir, Math.min(1, dir + PENA))
      q.globalCompositeOperation = 'multiply'
      degrade(q, 0, N, Math.max(0, alto - PENA), alto, 1, 1)
      // "lighten" fica com o mais claro dos dois: a faixa de baixo e o remendo se somam
      g.globalCompositeOperation = 'lighten'
      g.drawImage(p, 0, 0)
    }
    return new THREE.CanvasTexture(c)
  }, [de, ate, esq, dir, alto])

  const aspect = texture.image ? texture.image.width / texture.image.height : 16 / 9
  const [w, h] = coverSize(width, height, aspect)

  useFrame(() => {
    mat.current.opacity = weightAt(index)
  })

  return (
    <mesh renderOrder={order}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial
        ref={mat}
        map={texture}
        alphaMap={mascara}
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
  // O céu é a base, sempre inteiro. Cada monumento aparece e some SOBRE ele:
  // some para o céu, nunca para dentro do monumento seguinte (antes os seis
  // planos se cruzavam e um ficava de fantasma atrás do outro). Manifesto,
  // impacto e fecho não têm plano próprio: são o próprio céu.
  // O terceiro número desce o plano, em fração da altura. A cruz do alto da
  // Catedral caía em cima do texto da capa; 14% abaixo, ela começa depois da
  // linha que explica o botão.
  // No CELULAR a cena é só o céu: os monumentos são imagens do fluxo da página
  // (Monumento, em sections/Overlay.tsx), acima do cartão de cada seção.
  // Parados atrás do texto, o cartão passava por cima deles ao rolar.
  const cenas: [string, number, number][] = mobile
    ? []
    : [
        [ASSETS.heroDesktop, SECTION.hero, 0.14],
        [ASSETS.cristo, SECTION.faith, 0],
        [ASSETS.pampulha, SECTION.design, 0],
      ]
  return (
    <group>
      <Background url={ASSETS.ceu} order={-1} />
      {cenas.map(([url, index, desce]) => (
        <Background key={index} url={url} index={index} order={index} desce={desce} />
      ))}
      {/* A linha d'água da foto da Pampulha fica a 59% da altura: as nuvens fecham
          ANTES dela (0,585), senão a base da igreja aparece como um corte reto de
          régua. O campanário vai de 27% a 31% da largura da foto, a viga dele até
          38%, e a igreja começa em 37%. */}
      {!mobile && (
        <MarDeNuvens index={SECTION.design} order={SECTION.design + 0.5} de={0.53} ate={0.585} remendo={[0.262, 0.352, 0.25]} />
      )}
    </group>
  )
}
