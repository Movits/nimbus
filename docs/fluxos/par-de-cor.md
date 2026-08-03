---
status: vigente
atualizado: 2026-07-26
decisao: docs/decisoes/2026-07-26-decisoes-do-dono.md  # seção "Hover troca só a cor"
---

# Fluxo: par de cor para o hover

No card da loja o hover alterna entre as cores. A troca tem que ler como
**mudança de cor**, não como outra foto: mesmo modelo, mesma pose, mesmo
cenário, mesmo enquadramento, e a estampa **sem mudar de tamanho nem de lugar**.

## Como se garante

**1. A segunda cor nasce da primeira.** Gere o blank da cor escura a partir da
capa publicada; gere o da cor clara usando **o nosso blank escuro** como cena,
com instrução de mudar só a cor do tecido. Gerar cada cor da capa publicada dela
não obriga as duas a coincidirem — foi assim que 17 de 29 pares divergiram.

**2. Transplante.** Mesmo assim sobra deslocamento. A ferramenta pega a primeira
imagem e troca nela **só os pixels da peça**:

```bash
node scripts/geometry/transplantar-cor.mjs \
  --base <corA-blank> --doador <corB-blank> --out <corB-alinhado>
```

`frac_peca_pct` entre 10 e 40 é o esperado. `residuo_cor_antiga_pct` acima de
0,4% significa que sobrou peça com a cor antiga — gola ou capuz.

`--corte-ombro` é **opt-in**. Ele impede o cabelo divergente de entrar na
máscara, mas corta a gola junto, e em peça com capuz corta o capuz. Ligue só
quando a cabeça de fato divergir, porque essa falha o teste pega e a da gola não.

**3. Landmarks uma vez só.** Depois do transplante a segunda está alinhada pixel
a pixel, então **os mesmos números valem para as duas**. É isso que trava o
tamanho e a posição da estampa no hover. Medir de novo só introduz diferença.

## Verificação

```bash
node scripts/geometry/qa-par-hover.mjs \
  --a <capaA> --blank-a <blankA> --b <capaB> --blank-b <blankB>
```

O critério que reprova é `fora_da_roupa`: **onde os dois blanks são iguais, as
duas capas também têm que ser**. Ele se calibra sozinho — janela fixa erra em
enquadramento diferente e em peça com capuz, e já deu duas reprovações falsas.

Alvo: diferença média abaixo de 1,5. Os 17 pares refeitos ficaram em 0,02–0,03.

A geometria da estampa se confere na **receita**, não em pixel: `gola`, `barra`,
`centro`, `torso`, `yaw`, `placement` e `arte_cm` idênticos nas duas cores. A
caixa por limiar enxerga menos borda em peça clara e acusa diferença que não
existe.
