# Correção da gola do template — 26/07/2026

## O que estava errado

A tabela `placement-por-produto.json` foi levantada por agentes que releram a
gola **em cada mockup**. Gola e barra, porém, são constantes do *template*: só
a posição da tinta muda de produto para produto. A releitura por produto
introduziu ruído, e em quatro casos marcou o **topo da ribana** (y=53 na
Camiseta Premium) em vez da **costura** (y=66), que é o marco usado no resto do
projeto.

Diferença: 2,6 pontos percentuais da altura do mockup, ou cerca de **2,5 cm de
placement** — acima da tolerância de 1,5 cm do gate.

## Como foi arbitrado

Três evidências independentes, todas apontando para o mesmo valor:

1. **Silhueta.** Onze produtos de Camiseta Premium têm silhueta idêntica
   (topo 9,2% / barra 91,0% / ombro 37% / largura 84%) e leitura de gola
   13,2–13,4%. Dois produtos com a **mesma silhueta** tinham gola anotada em
   10,6%. Template igual obriga gola igual.
2. **Inspeção visual.** Desenhando as duas linhas candidatas sobre os mockups,
   y=53 cai no talude do ombro e y=66 na base do decote.
3. **Constante do template** em `scripts/geometry/placement-mockup.mjs`
   ("verificado nos 45 produtos com mockup"), que coincide com o valor modal
   das leituras dos agentes nas quatro peças.

## Validação contra a tabela de medidas publicada

A régua-pela-arte, aplicada ao comprimento da peça, dá um autoteste:

    comprimento = (barra − gola) / (tinta_base − tinta_topo) × altura_arte_cm

| peça | tabela G | mockup implica | erro |
|---|---|---|---|
| Camiseta Premium | 75,5 cm | 74,3 cm | −1,6% |
| Moletom Canguru | 65 cm | 64,8 cm | −0,3% |
| Camiseta Oversized Premium | 82 cm | 91,0 cm | +11% |
| Blusão Moletom | *não publicada* | 78,5 cm | — |

O Oversized é o único template fora de escala. **Isso não corrompe o
placement**: se o render estica a peça, estica a tinta junto, então a razão
`(tinta_topo − gola) / span_tinta` não muda e `placement_cm` é imune. É
exatamente a propriedade que motivou a régua-pela-arte.

## Resultado

- 46 produtos tiveram o placement recalculado; **13 mudaram mais de 1,5 cm**:
  352727892, 352720257, 352702753, 352703276, 352728451, 352618903, 352407182,
  352722232, 352728524, 352702796, 352703343, 352728019, 352890896.
- O maior movimento é o 352727892 (Blusão): 2,21 → 19,30 cm. A leitura antiga
  de gola (29,4%) estava claramente errada; com a constante do template o
  comprimento implicado sai de 65,9 para 78,0 cm, alinhado aos outros quatro
  Blusões.

## Comprimento do Blusão Moletom

A YouDraw não publica tabela de medidas para essa peça. Os cinco mockups dão,
pela régua-pela-arte, 78,78 / 78,05 / 77,99 / 80,23 / 78,99 cm — mediana
**78,5 cm**, que é o valor adotado.

Ressalva registrada: o método acerta −1,6% na Camiseta Premium e −0,3% no
Moletom Canguru, mas erra +11% no Oversized. Os 78,5 cm podem carregar erro de
escala do template, e as capas de Blusão devem ser marcadas como baseadas em
suposição até a YouDraw confirmar.

## Pendência aberta

**352722232** (Sagrado Coração Spray | Camiseta Premium) continua com
comprimento implicado de 79,3 cm contra 75,5 tabelados (+5%) mesmo após a
correção da gola. O desvio restante está na leitura da **tinta**, não da gola.
Remedir antes de produzir essa capa.

## O que mudou no processo

`scripts/produce-cover.mjs compor` passa a gravar `<capa>.receita.json` ao lado
de cada capa, com todos os parâmetros usados. Sem isso não era possível
recompor uma capa sem re-derivar os landmarks à mão: quando esta correção
apareceu, havia 37 capas prontas e apenas 17 QA JSONs, com nomes
inconsistentes. As receitas antigas foram recuperadas dos diários dos
workflows (29) e do script do lote v8 (11); faltam duas
(352718275-branca-v3, 352722685-branca-v1).
