# Achados da auditoria geométrica (em andamento, 25/07)

Método e precisão: `scripts/geometry/README.md`. Protocolo de anotação:
`scripts/geometry/PROTOCOLO-ANOTACAO.md`. Resultados brutos em `resultados/`.

## Defeitos confirmados

**352725749 Querubim Spray | Camiseta Oversized — estampa ~13% menor.**
A foto implica uma peça de 94,1 cm. Mesmo no cenário mais generoso da incerteza da anotação
(87,1 cm), continua acima da maior oversized que existe (86 cm). Nenhum tamanho real explica a
geometria, então é reprovação por impossibilidade física, não por estimativa.

**352407182 São Miguel Vintage | Oversized, foto Off-White — arte incompleta.**
A estampa desta foto não tem a palavra NIMBUS que aparece nas duas fotos do 352407156 (mesma
família de arte). Confirmado no arquivo original: a arte oficial tem um bloco isolado no rodapé,
separado por um vão de 39 px, ocupando 2,4% da altura; com ele o arquivo bate com os cm oficiais
(0,785 contra 0,790), sem ele iria para 0,814. Defeito de fidelidade, não de escala. O detector de
anisotropia acusou o mesmo problema de forma independente, antes de saber da observação.

## Aprovados

- **352726673 São Miguel Vitorioso | Moletom Canguru**: 66 cm implícitos, dentro de 60-70, −1,5%
  vs tamanho G.
- **352728357 Anjo da Guarda Stencil | Camiseta Premium**: 73,7 cm, dentro de 70,5-85, +2,5%.
  Vale notar que esta foto tem guinada forte (anisotropia −25,8%) e ainda assim a escala mediu bem,
  porque o eixo vertical é imune a rotação.

## Sem veredito, com o motivo

- **352718787 São Jorge Neobarroco | Moletom**: o capuz cobre a gola inteira. A faixa de incerteza
  (64,2-83,4 cm) atravessa a faixa real da peça, então o veredito depende de um ponto que ninguém
  viu. Precisa de foto com a gola visível ou de segunda anotação.
- **352618903 São Jorge Vintage | Oversized Off-White**: anisotropia +12,5%. O veredito anterior
  de "−26%, reprovado" não se sustenta — a medição dá −4,3%, mas a geometria não fecha.
- **352407156 São Miguel Vintage | Moletom (branca e preta)**: mesmo problema do capuz.
  71,5 e 72,1 cm implícitos, com faixa cruzando o limite de 70.

## Padrões que já aparecem

1. **O capuz é o inimigo da medição.** Em toda foto de Moletom Canguru com capuz caído a gola some,
   e a incerteza resultante engole o veredito. Fotos futuras de canguru precisam mostrar a gola, ou
   a peça precisa de outro ponto de referência confiável.
2. **A silhueta engana o olho.** Em todas as fotos o centro da arte coincide com o centro do tronco
   medido pelos vincos, mas o centro da silhueta com mangas fica vários pontos à direita. É por
   isso que uma estampa centrada parece deslocada.
3. **O eixo vertical aguenta pose.** Guinada de até 40 graus não moveu o veredito de escala.
