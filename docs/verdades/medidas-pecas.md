---
status: vigente
atualizado: 2026-07-26
fonte-unica: scripts/build-prelaunch-matrix.mjs (YouDraw, Central de Ajuda)
---

# Medidas das peças

**Fonte única.** Os números não são redigitados: `scripts/geometry/garment-specs.mjs`
os lê de `scripts/build-prelaunch-matrix.mjs`, onde estão registrados com a fonte.
Duplicar esta tabela foi exatamente o erro que invalidou a medição de 24-25/07.

Largura do tórax (medida plana, meia circunferência) × comprimento total, em cm:

| Peça | P | M | G | GG | EG |
|---|---|---|---|---|---|
| Camiseta Premium | 49,5×70,5 | 52,5×72 | **54×75,5** | 60,5×81,5 | 63×85 |
| Camiseta Oversized Premium | 62×78 | 64×80 | **66×82** | 68×84 | 70×86 |
| Moletom Canguru | 52×60 | 55×64 | **58×65** | 61×65 | 69×70 |
| Blusão Moletom | — | — | **58×78,4 (estimado)** | — | — |
| Ecobag | 41×35, alças de 60 | | | | |

O tamanho canônico da composição é **G**.

## Blusão Moletom: por que é estimado

A YouDraw não publica tabela para essa peça. O comprimento de 78,4 cm é a mediana
da régua-pela-arte sobre os quatro mockups oficiais (78,78 / 78,05 / 77,99 /
80,23). A largura de 58 cm vem do Moletom Canguru G, que é a mesma base sem
capuz, e serve só de piso — `--torso` mede o raio efetivo na foto real.

O método acerta −1,6% na Camiseta Premium e −0,3% no Moletom Canguru quando
conferido contra a tabela publicada, mas erra **+11% no Oversized**. As capas de
Blusão herdam esse risco. Apagar a estimativa assim que a YouDraw confirmar.

## Lacunas

Não existe medida de ombro-a-ombro por tamanho. Não se sabe qual tamanho o modelo
veste em cada foto — por isso o medidor trabalha com a faixa, nunca com um valor
único.
