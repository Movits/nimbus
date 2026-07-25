# Auditoria geométrica das capas lifestyle — 25/07

Método e precisão: `scripts/geometry/README.md`. Protocolo de anotação:
`scripts/geometry/PROTOCOLO-ANOTACAO.md`. Tabela completa: `medicoes.csv`, gerada por

```
node scripts/measure-all-annotated.mjs <dir-de-anotacoes> --out medicoes.csv
```

**41 fotos medidas**, cobrindo 31 dos 49 produtos. As 18 páginas restantes não têm cópia local da
foto publicada e ficam para a próxima rodada. Nada foi cortado em silêncio: foto não medida aparece
no CSV com o motivo.

| Escala | Nº |
|---|---|
| OK | 19 |
| Reprovado por impossibilidade física | 3 |
| Fora do alvo (tamanho G) | 3 |
| Sem veredito | 14 |
| Sem tabela de medidas (Blusão Moletom) | 2 |

Posição: **41 inconclusivas**. Não é falta de dado, é limite do método — ver a seção própria.

## Fila de correção

> [!warning] **Metade de baixo da fila está SUSPENSA (25/07, noite).**
> Uma revisão independente da matemática achou que o gerador sintético tinha o **sinal da
> profundidade invertido**: ele modelava um dorso côncavo, com as laterais mais perto da câmera em
> vez de mais longe. Corrigido, o viés do caminho de medição usado por **todas as 41 fotos** (arte
> irregular, caixa envolvente) passou de **+2,85 pp para −3,04 pp** — mesmo módulo, sinal oposto.
> Sinal negativo significa que o medidor faz a estampa parecer **menor** do que é, que é exatamente
> a assinatura da fila inteira.
>
> As três reprovações por impossibilidade física **sobrevivem** com folga: mesmo somando os 3 pp, o
> Salmo 19 continua implicando 78 cm num canguru que vai a 70, e as duas oversized continuam acima
> de 90 cm numa peça que vai a 86. Essas três seguem valendo.
>
> As três de **fora do alvo** não sobrevivem: −9,7% cairia para −6,7%, −8,5% para −5,5% e −8,1%
> para −5,1%. **Não gerar substituição para essas três** até a margem de arte irregular ser
> re-derivada. O número de −3,04 pp também não pode ser aplicado como correção direta: ele foi
> medido num sintético que só sabe gerar arte RETANGULAR anotada pelos cantos, e arte de spray tem
> os extremos de tinta bem mais perto do centro, onde o efeito é muito menor. O que falta é modelar
> tinta irregular no sintético e medir o viés de verdade.


Sinal negativo = estampa **menor** que o alvo.

| Desvio | Veredito | Peça | Evidência |
|---|---|---|---|
| −19,9% | Impossibilidade | Salmo 19 \| Moletom Canguru `[352619175]` | implica peça de 81,2 cm; o canguru real vai de 60 a 70 |
| −12,9% | Impossibilidade | Querubim Spray \| Oversized `[352725749]` | implica 94,1 cm; a oversized vai de 78 a 86 |
| −12,5% | Impossibilidade | Acima de Tudo Gótico \| Oversized `[352720257]` | implica 93,7 cm; é vista frontal e mesmo assim conclusivo (ver abaixo) |
| −9,7% | Fora do alvo | São Miguel Vintage \| Premium `[352407196]` | 83,6 cm implícitos contra 75,5 do tamanho G |
| −8,5% | Fora do alvo | Brasão NIMBUS \| Premium `[352717837]` | 82,5 cm implícitos |
| −8,1% | Fora do alvo | Espírito Santo Spray \| Premium `[352721477]` | 82,1 cm implícitos |

**Reprovação por impossibilidade** significa que nenhum tamanho real da peça explica a geometria da
foto. Não é comparação com um alvo escolhido, e nenhum "e se o modelo veste EG" derruba. **Fora do
alvo** é o desvio contra o tamanho G, que é a convenção adotada para foto lifestyle; ali o argumento
depende da convenção.

Os seis desvios são **todos negativos**. Isso é o oposto do que as duas auditorias invalidadas
diziam, e a explicação é conhecida: elas comparavam a largura entre o mockup plano e a foto vestida,
e peça vestida sempre parece mais estreita porque o tecido enrola no dorso. Isso fabricava
"estampa grande" de forma sistemática.

## Tolerância: três faixas, com piso na margem do método

Decisão do dono em 25/07: "quero que sejamos o mais fiel possível, então ±5%; se for um pouquinho
mais tudo bem". Traduzida em faixas:

| Desvio vs G | Rótulo | Ação |
|---|---|---|
| ≤ 5% | `OK` | aprovado |
| 5% a 8% | `ACEITAVEL` | fica no ar; só refaz se a peça for regerada por outro motivo |
| > 8% | `FORA-DO-ALVO` | entra na fila |
| nenhum tamanho real explica | `REPROVADO-DURO` | entra na fila |

Com uma trava que não é opcional: **o limiar efetivo de cada foto nunca fica abaixo da margem
medida do método no modo em que ela foi anotada** — 4 pp para arte com moldura desenhada, 8 pp para
arte de silhueta livre (spray, stencil, lettering). Na prática o ±5% vale hoje para as 3 fotos de
São Jorge Neobarroco; para as outras 38 o piso continua sendo 8%, porque abaixo disso o veredito
seria ruído do próprio medidor. Foi publicar dentro do ruído que derrubou as duas auditorias
anteriores, então a regra é mecânica: `validate.mjs` tem o critério `toleranceExceedsMargin` e o
portão fica vermelho se alguém apertar o limiar sem antes derrubar a margem.

Apertar de verdade exige **derrubar a margem** (mais landmarks, recorte ampliado por ponto, segunda
anotação em arte de spray), não reescrever o número.

O efeito prático de aplicar as faixas foi **uma** mudança de veredito em 41 fotos: São Jorge
Neobarroco Premium preta `[352718999]`, +6,9%, saiu de `OK` para `ACEITAVEL`. Ela é a única foto de
arte com moldura cujo desvio cai entre 5% e 8%. A fila de correção não mudou.

## Aprovados na escala

18 fotos `OK` e 1 `ACEITAVEL`. Três pares de cor fecharam juntos, o que era uma preocupação à
parte: Salmo 19 Premium (−1,0% e −1,3%), Brasão NIMBUS Oversized (−1,5% e −0,6%) e Aparecida
Barroca Oversized (−1,4% e −1,1%). Pares tão apertados em fotos independentes são evidência de que
a medição está estável, não só de que as peças estão certas.

Casos que a auditoria antiga mandava REFAZER e que a medição **aprova**: São Miguel Vitorioso
Moletom `[352726673]` (−1,5% e +6,8%), São Miguel Vitorioso Oversized `[352727545]` (−4,3%),
São Jorge Neobarroco Moletom `[352718787]` (−4,1%) e Anjo da Guarda Stencil Premium `[352728357]`
(+2,5%). Refazer essas fotos seria gastar crédito para corrigir defeito que não existe.

## Por que 14 ficaram sem veredito

| Causa | Nº |
|---|---|
| A incerteza declarada pelo anotador alcança a faixa real da peça | 11 |
| Anisotropia positiva: a altura medida da arte não fecha | 2 |
| Barra fora do quadro | 1 |

A causa dominante tem nome: **capuz e cabelo**. Em toda foto de Moletom Canguru com capuz caído a
gola desaparece, o anotador declara sigma alto, e a faixa de incerteza atravessa o limite da peça.
O veredito passaria a depender de um ponto que ninguém viu, e o medidor se recusa — foi exatamente
tratar palpite como medida que invalidou as auditorias anteriores.

**Consequência para produção:** foto de canguru precisa mostrar a base da gola. Isso vale como
requisito no prompt de geração, não como preferência.

## Posição: o que o método consegue e o que não consegue

As 41 fotos saíram inconclusivas na posição, e isso está medido, não suposto. Três efeitos físicos
independentes somam uma faixa de largura mínima de ~4 cm:

1. **Contraposto contra guinada.** A reta gola→barra é exata sob rotação de câmera mas erra com o
   quadril deslocado; o meio do tronco é imune ao contraposto mas erra 2,3 cm já a 10° de guinada.
   Quando as duas coisas acontecem juntas, os dois erram para o mesmo lado.
2. **Compressão.** Deslocamento grande é lido menor do que é: 3 cm reais leem 1,9-2,5 cm.
3. **Tamanho vestido**, que aqui pesa pouco.

Na prática: o medidor confirma centralização abaixo de ~2 cm e reprova acima de ~7 cm. Entre os
dois, declara que não sabe. Nenhuma das 41 fotos caiu fora dessa zona cega.

O diagnóstico perceptual (deslocamento como % da largura do tronco visível) está no CSV para
triagem humana. Os maiores: **São Miguel Vintage Premium com −24,9%**, **Anjo da Guarda Stencil com
12,4%** e **São Jorge Neobarroco Moletom com −8,7%**. Não são vereditos: nas três a pose tem
guinada, que sozinha produz esse efeito. São as fotos a olhar primeiro numa conferência visual.

Para resolver de verdade não adianta mais cálculo. Ou se anotam as laterais do tronco em duas
alturas (o que cancela o contraposto por diferença), ou se mede a posição no **mockup plano** da
YouDraw, onde não há enrolamento, guinada nem contraposto.

## Achados de fidelidade (não são escala)

- **São Miguel Vintage Oversized, foto Off-White `[352407182]`**: a estampa não tem a palavra
  NIMBUS que aparece nas fotos do `[352407196]`, mesma família de arte. Confirmado no arquivo
  original: a arte oficial tem um bloco isolado no rodapé, separado por um vão de 39 px; com ele o
  arquivo bate com os cm oficiais (0,785 contra 0,790), sem ele iria a 0,814. Defeito de fidelidade,
  não de escala. O detector de anisotropia acusou o mesmo problema de forma independente, antes de
  saber da observação.
- **São Jorge Vintage \| Blusão Moletom `[352618837]`**: o anotador viu um anel claro atrás do arco
  de texto que pode ser tinta ou vinco do moletom, e não incluiu na caixa. Se for tinta, a altura da
  arte cresce ~5%. Precisa de segunda anotação.
- **Suspeita descartada**: `[352703153]` é "Fé Acima de Tudo" no catálogo e a arte na foto lê
  exatamente isso. O alerta anterior de arte trocada com "Deus é Fiel" era falso.

## O que a execução ensinou sobre o próprio método

Cinco defeitos do medidor só apareceram quando ele encontrou foto real. Ficam registrados porque
cada um custou uma rodada:

1. **Retificação por homografia não serve para posição.** Ela dá uma taxa px/cm média sobre uma
   superfície curva: 3 cm reais liam entre 1,2 e 3,3 cm conforme o tamanho da arte.
2. **O modelo de enrolamento supunha corpo que preenche a peça.** Peça folgada cai quase plana nas
   costas. Com o teto errado, 7 de 23 fotos eram acusadas de "altura comprimida" com o eixo vertical
   intacto.
3. **A incerteza do anotador não chegava na posição.** Uma reprovação chegou a sair apoiada numa
   lateral que o próprio anotador declarou como inferida.
4. **Vista frontal quebra a régua**, porque o decote da frente é mais baixo que a gola das costas.
   O viés tem direção conhecida, então metade do veredito sobrevive.
5. **O protocolo se contradizia** sobre moldura desenhada contra caixa de tinta. No São Jorge
   Neobarroco o manto do cavaleiro estoura a moldura em 8,2%.

Os itens 3, 4 e 5 foram levantados pelos próprios anotadores nas notas, não por mim. Vale manter a
exigência de que eles escrevam o que foi difícil e por quê.

## Pendências

1. As 18 páginas sem cópia local da foto publicada.
2. Segunda anotação nos 11 casos em que o capuz engoliu a gola.
3. Tabela de medidas do **Blusão Moletom** na YouDraw: 2 fotos ficam sem régua.
4. Placement oficial em cm abaixo da gola, que não existe em nenhuma fonte.
