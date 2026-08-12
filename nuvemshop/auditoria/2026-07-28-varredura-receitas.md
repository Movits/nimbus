---
status: vigente
atualizado: 2026-07-28
---

# Varredura das receitas do lote reprovado (28/07)

Executa o próximo passo registrado no ESTADO de 26/07: varrer as 77 receitas
atrás de `torso` e `centro` errados antes de reconstruir o catálogo.

**Triagem, não veredito.** O que a varredura acusa vai para re-medição visual;
o que ela não acusa não está aprovado — só não carrega o vício conhecido.
O `centro` de **toda** receita antiga veio da silhueta (método reprovado) e
precisa de re-medição pelos vincos de cava, sem exceção.

Script: `scripts/producao/varrer-receitas.mjs` · dados:
`2026-07-28-varredura-receitas.json`.

## Critério

A razão física visível `torso_px / (gola→barra)_px` é comparada com a razão
largura/comprimento da tabela de medidas (tamanho G). Nos 3 pilotos aprovados
ela fica em **66–72%** da tabela; nas receitas viciadas (torso manga a manga)
ela chega a **88–111%**. O teto de 85% separa os grupos com folga dos dois
lados. A largura visível numa foto real é sempre menor que a medida plana, então
razão acima da tabela é fisicamente impossível sem vício de medição.

## Resultado — 77 variantes (Ecobag fora)

| Classe | Qtde | Significado |
|---|---|---|
| NOVA_26_07 | 3 | pilotos do compositor novo, aprovados pelo dono |
| TORSO_PLAUSIVEL | 64 | torso sem o vício; re-medir só o centro |
| TORSO_SUSPEITO | 6 | provável manga a manga; re-medir torso E centro |
| SEM_TORSO | 4 | receita sem torso; medir do zero |

### Os 6 suspeitos, do pior para o menos pior

| Produto | Cor | Peça | torso | × da tabela |
|---|---|---|---|---|
| 352725852 | Preta | Camiseta Premium | 0,546 | 1,11 |
| 352717837 | Preta | Camiseta Premium | 0,4805 | 1,01 |
| 352728277 | Preta | Camiseta Oversized Premium | 0,4971 | 1,00 |
| 352407196 | Branca | Camiseta Premium | 0,40 | 0,93 |
| 352717723 | Off-White | Camiseta Oversized Premium | 0,412 | 0,88 |
| 352407156 | Branca | Moletom Canguru | 0,464 | 0,88 |

### Sem torso na receita

352720257 Off-White (Oversized) · 352718275 Branca (Camiseta Premium) ·
352619175 Preta e Branca (Moletom Canguru, receitas de par).

### Borda do plausível (≥ 0,80 da tabela) — olhar antes das demais

352890896 Preta (0,85) · 352407182 Preta (0,85) · 352407156 Preta (0,85) ·
352719816 Branca (0,84) · 352718943 Preta (0,82) · 352718787 Preta e Branca
(0,82).

## Descobertas de instrumentação (registradas em limites-conhecidos)

1. **Blanks JPEG com extensão .png** — parser escolhido pela extensão falha em
   silêncio; ler pela assinatura.
2. **`gerado_em` não data a composição** — a colheita de 26/07 carimbou os 134
   sidecars; receita nova se reconhece por `relevo` + `sombra_tecido`.
3. **Caminhos Windows** nas receitas colhidas (`foto` com `\`).
4. O consolidado `receitas.json` estava sem os 4 sidecars de piloto;
   reconsolidado em 28/07.

## Próximo passo

> [!warning] 12/08: NÃO execute esta ordem. A reconstrução ficou condicionada
> à decisão de plataforma, e a decisão saiu em 07/08: o catálogo será
> REMONTADO na IzzyPrint (`docs/ESTADO.md`, seção Produção) — reconstruir
> sobre blanks YouDraw seria trabalho jogado fora. A ordem abaixo fica como
> registro do método (uma capa por vez, centro pelos vincos, olho antes de
> seguir), que continua correto.

Reconstruir uma capa por vez com o compositor novo, começando pelos 6
suspeitos + 4 sem torso (medição do zero), depois os 7 da borda, depois o
resto. Em toda capa: centro pelos vincos de cava, `measure-torso` só como
segunda opinião, conferência visual antes de seguir.
