import { useEffect, useRef, useState } from 'react'

// Marca o elemento como "visível" (uma vez) pra disparar os reveals de entrada.
// Dispara quando o ALTO do elemento passa de 88% da altura da tela, seja qual
// for a altura dele. Antes disparava com 22% do elemento à vista: numa seção
// alta do celular (os cards do impacto, a fileira de gravuras) isso eram 300px
// de seção já na tela e ainda invisível, e os compradores da revisão de
// 12/11/2026 leram como "meia tela de céu vazio, parece que não carregou".
export function useInView<T extends HTMLElement>(margem = '0px 0px -12% 0px') {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0, rootMargin: margem },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [margem])

  return { ref, inView }
}
