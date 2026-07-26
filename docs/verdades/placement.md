---
status: vigente
atualizado: 2026-07-26
fonte-unica: nuvemshop/auditoria/2026-07-26-datum-mockups/placement-por-produto.json
---

# Onde a estampa fica

## Horizontal: centrada, sempre

Medido nos 48 mockups oficiais: a mediana do desvio entre o centro da arte e o
centro da peça é **exatamente 0%**. A arte é centrada horizontalmente no produto.

Isso é regra dura, não ajuste. `--centro` é o **eixo do painel**, e a arte fica
simétrica em torno dele por construção. Com o modelo virado, o painel muda de
ângulo e a arte aparece deslocada na foto — mas continua centrada no produto, que
é o que importa.

## Vertical: por produto, nunca padrão

**Não existe padrão.** O placement varia de 2,21 a 21,21 cm, fator de quase 10, e
varia tanto entre peças da mesma arte quanto entre artes da mesma peça. Até
26/07 o código usava 8 cm fixos para todo o catálogo, declarado como suposição;
só 10 dos 48 produtos ficam perto disso.

Os valores estão em
`nuvemshop/auditoria/2026-07-26-datum-mockups/placement-por-produto.json`.

## Como foi medido: régua-pela-arte

    placement_cm = (tinta_topo − gola) / (tinta_base − tinta_topo) × altura_arte_cm

A arte tem tamanho oficial exato em cm, então ela é a régua. A fórmula é **imune à
escala do template**: se o mockup estica a peça, estica a tinta junto e a razão
se cancela. Foi isso que permitiu medir o Oversized, cujo template implica peça
de 91 cm contra 82 tabelados.

**Gola e barra são constantes do template**, não do produto. Só a tinta muda. Uma
releitura por produto introduziu ruído e, em quatro casos, marcou o topo da
ribana em vez da costura — 2,6 pontos, ou ~2,5 cm de deslocamento.

Constantes, em % da altura do mockup: Camiseta Premium 13,1 · Oversized 5,2 ·
Moletom Canguru 27,3 · Blusão 12,4.

## Correções conhecidas

- **352727892** está como "Blusão Moletom" no CSV de 22/07 e é **Moletom Canguru**
  (o mockup e a loja mostram capuz e bolso). Corrigido na fonte em
  `scripts/derive-composicao.mjs`; placement 4,32 cm.
- **352722232** tem comprimento implicado 5% acima do tabelado. Não bloqueia:
  erro de vão entra proporcionalmente e dá 0,43 cm.
