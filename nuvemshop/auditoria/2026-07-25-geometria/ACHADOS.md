# Achados da auditoria geométrica (em andamento, 25/07)

Método e precisão: `scripts/geometry/README.md`. Protocolo de anotação:
`scripts/geometry/PROTOCOLO-ANOTACAO.md`. Tabela completa em `medicoes.csv`,
gerada por `node scripts/measure-all-annotated.mjs <dir-de-anotacoes> --out medicoes.csv`.

**Estado em 25/07 (tarde): 14 fotos medidas de 42 disponíveis.** Escala: 6 OK,
1 reprovada, 7 inconclusivas. Posição: 14 inconclusivas — ver o item 4 dos
padrões, é limite do método e não falta de dado.

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
- **352618878 e 352618935 São Jorge Vintage (Blusão e Camiseta Premium)**: medidas em 25/07.
  A Camiseta Premium (branca e preta) fica em 73,5 e 72,7 cm, dentro de 70,5-85 — **escala OK**,
  e as duas anotações da mesma arte batem entre si (altura 43,85 contra 43,93 na escala da imagem).
  O Blusão 352618878 dá 76,5 cm implícitos, mas o capuz cobre a gola E o topo da arte, então o
  número é limite inferior de altura e limite alto de comprimento ao mesmo tempo: sem veredito.
- **352702020 Salmo 19 (branca v4i e preta)** e **352619175 Salmo 19 | Moletom**: a Camiseta
  Premium mede −1,0% e −1,3% vs G — **escala OK nas duas cores**, com a maior confiança de todo o
  lote (90 na branca). O Moletom 352619175 dá −19,9% mas com anisotropia +8,4%, que condena o
  próprio eixo vertical: inconclusivo, precisa de reanotação.

## Padrões que já aparecem

1. **O capuz é o inimigo da medição.** Em toda foto de Moletom Canguru com capuz caído a gola some,
   e a incerteza resultante engole o veredito. Fotos futuras de canguru precisam mostrar a gola, ou
   a peça precisa de outro ponto de referência confiável.
2. **A silhueta engana o olho.** Em todas as fotos o centro da arte coincide com o centro do tronco
   medido pelos vincos, mas o centro da silhueta com mangas fica vários pontos à direita. É por
   isso que uma estampa centrada parece deslocada.
3. **O eixo vertical aguenta pose.** Guinada de até 40 graus não moveu o veredito de escala.
4. **A posição, em centímetros, não é mensurável numa foto de peça vestida.** Isso foi
   estabelecido no teste de verdade conhecida, não por desistência: três efeitos independentes
   (contraposto contra guinada, compressão do deslocamento, tamanho vestido) somam uma faixa de
   ~4 cm de largura mínima. O medidor confirma centralização abaixo de ~2 cm e reprova acima de
   ~7 cm; entre os dois ele declara que não sabe. Nas 14 fotos medidas, nenhuma caiu fora dessa
   zona cega, e por isso todas saíram inconclusivas na posição.

   O diagnóstico perceptual (deslocamento como % da largura do tronco visível) está no CSV e serve
   para triagem humana. Os maiores: **352728357 com 12,4%**, **352718787 com −8,7%** e
   **352725749 com 8,4%**. Não são vereditos — em duas dessas a pose tem guinada forte, que sozinha
   produz esse efeito. São as fotos a olhar primeiro numa conferência visual.

   O caminho para resolver de verdade não é mais cálculo: é anotar as laterais do tronco em duas
   alturas (cancela o contraposto por diferença) ou medir posição no mockup plano da YouDraw.
