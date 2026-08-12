---
status: concluido
atualizado: 2026-08-12
---

> [!info] Medição CONCLUÍDA: o resultado (datum gola→barra) está incorporado em docs/verdades/placement.md; este arquivo é o registro.

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
| Blusão Moletom | *não publicada* | 78,4 cm | — |

O Oversized é o único template fora de escala. **Isso não corrompe o
placement**: se o render estica a peça, estica a tinta junto, então a razão
`(tinta_topo − gola) / span_tinta` não muda e `placement_cm` é imune. É
exatamente a propriedade que motivou a régua-pela-arte.

## Resultado

- 46 produtos tiveram o placement recalculado; **13 mudaram mais de 1,5 cm**:
  352727892, 352720257, 352702753, 352703276, 352728451, 352618903, 352407182,
  352722232, 352728524, 352702796, 352703343, 352728019, 352890896.
- Doze desses são correções legítimas de gola, entre −4,01 e −1,56 cm.
- O décimo terceiro, 352727892, **não** era erro de gola: era erro de peça no
  CSV. Ver a seção final; o placement correto dele é 4,32 cm.

## Comprimento do Blusão Moletom

A YouDraw não publica tabela de medidas para essa peça. Os quatro mockups de
Blusão dão, pela régua-pela-arte, 78,78 / 78,05 / 77,99 / 80,23 cm — mediana
**78,4 cm**, que é o valor adotado. A meia-circunferência (58 cm) vem do
Moletom Canguru G, que é a mesma base sem capuz, e serve só de piso, porque
`--torso` mede o raio efetivo na foto real.

Ressalva registrada: o método acerta −1,6% na Camiseta Premium e −0,3% no
Moletom Canguru, mas erra +11% no Oversized. Os 78,4 cm podem carregar erro de
escala do template, e as capas de Blusão devem ser marcadas como baseadas em
suposição até a YouDraw confirmar.

## Quanto cada erro vale em centímetros

O teste de comprimento implicado é sensível, mas responde a dois erros
diferentes com gravidades muito distintas:

| erro | efeito no placement |
|---|---|
| gola errada em X pontos percentuais | X × (cm/ponto) ≈ **1 cm por ponto** — 1:1, grave |
| vão da tinta errado em X% | X% *do próprio placement* — 5% sobre 9 cm = 0,45 cm |

Ou seja, um resíduo de 3,5% no comprimento implicado pode significar 2,6 cm de
erro (se veio da gola) ou 0,3 cm (se veio da tinta). O teste sozinho não
distingue os dois: foi a evidência da **silhueta** que provou que a gola é
constante do template. Com a gola presa a essa constante, todo resíduo restante
é da tinta, e portanto imaterial.

## Falso alarme já descartado

**352722232** (Sagrado Coração Spray | Camiseta Premium) ficou com comprimento
implicado de 79,3 cm contra 75,5 tabelados (+5%) mesmo após a correção. Isso
**não o bloqueia**: 5% sobre um placement de 9,04 cm dá 0,43 cm, dentro da
tolerância de 1,5 cm do gate. A altura oficial da arte (24,9 × 40,0 cm) foi
conferida no CSV da auditoria de 22/07 e está certa. O pior caso do catálogo
seria 5% sobre o maior placement (21 cm), ainda assim 1,05 cm.

## O que mudou no processo

`scripts/produce-cover.mjs compor` passa a gravar `<capa>.receita.json` ao lado
de cada capa, com todos os parâmetros usados. Sem isso não era possível
recompor uma capa sem re-derivar os landmarks à mão: quando esta correção
apareceu, havia 37 capas prontas e apenas 17 QA JSONs, com nomes
inconsistentes. As receitas antigas foram recuperadas dos diários dos
workflows (29) e do script do lote v8 (11); faltam duas
(352718275-branca-v3, 352722685-branca-v1).

## Erro de peça encontrado: 352727892

Aplicar a constante do template em bloco quase introduziu um erro grande.

O CSV da auditoria de 22/07 registra **Aparecida Spray | Blusão Moletom**
`[352727892]`. O agente que mediu o mockup anotou gola em 29,4%, muito acima
dos 12,2% dos outros Blusões, e isso parecia erro de leitura.

Não era. O mockup oficial **e** a loja publicada mostram capuz e bolso canguru:
o produto é **Moletom Canguru**. Os 29,4% eram a junção do capuz, lida
corretamente. Forçar a constante do Blusão (12,4%) teria deslocado a estampa em
cerca de 17 cm.

Corrigido:

- peça reclassificada para Moletom Canguru na tabela de placement e no plano;
- placement recalculado com a constante do Moletom (27,3%): **4,32 cm**, que
  cai dentro do grupo dos outros Moletons (3,71 a 4,60 cm);
- comprimento implicado 68,0 cm contra 65 tabelados, coerente;
- o produto saiu da amostra do comprimento do Blusão, que passa a ser a mediana
  de **quatro** mockups (78,4 cm em vez de 78,5).

A lição: o teste de consistência sinalizou o produto certo, mas a causa que eu
supus (leitura errada) era a oposta da real (peça errada no CSV). Antes de
sobrescrever uma leitura divergente com uma constante, vale olhar a imagem.
