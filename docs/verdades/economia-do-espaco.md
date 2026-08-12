---
status: vigente
atualizado: 2026-08-11
---

# Economia do espaço de estampa

> [!info] 11/08: a premissa desta página (caixa de 30×40 cm do editor da
> IzzyPrint) deixou de ser hipótese — a migração para a IzzyPrint foi DECIDIDA
> em 07/08. Confirmar na conta se o fluxo POD contratado mantém o limite do
> editor público (temos costas de até 35,2 cm).

A área de impressão é finita e cara: **30 × 40 cm** no editor da IzzyPrint. Uma
arte não compete pelo tamanho do arquivo, compete pela **presença** dentro
daquele retângulo. Duas artes com o mesmo tamanho declarado podem ler como
grande e como pequena.

Medido em 28/07 sobre as três estampas de frente
(`scripts/producao/medir-espaco.mjs`).

## As três medidas que importam

**1. Caixa da arte contra a área.** O retângulo que a arte realmente ocupa. Arte
com proporção diferente da área desperdiça as sobras nas laterais ou em cima.

**2. Tinta dentro da própria caixa.** Dos pixels da caixa, quantos são desenho.
Abaixo de 40% a arte lê como pequena mesmo ocupando a área inteira.

**3. Onde estão 90% da tinta.** Se a maior parte do desenho cabe em 60% da
altura, os outros 40% são apêndice: gastam área e não aumentam presença.

| Arte | Ocupa | Tinta na caixa | 90% da tinta em |
|---|---|---|---|
| RELÍQUIA monograma NMB | 30 × 31 cm | 64% | 83% da altura |
| NUVEM nuvem cartoon | 30 × 27 cm | 61% | 88% da altura |
| STREET nuvem stencil | **25 × 40 cm** | **36%** | **59% da altura** |

## O caso STREET, que é o didático

Os drips (escorridos) são finos e longos. Eles esticam a caixa até a proporção
0,62, que é mais alta que a área de 0,75 — então a arte passa a ser limitada
pela **altura**, e a largura sobra: a nuvem sai com 25 cm em vez de 30.

Ou seja: **41% da altura carrega 10% da tinta, e ainda por cima encolhe a nuvem
em 5 cm.** O escorrido é assinatura da coleção e não deve sumir. O que ele não
pode é ditar a proporção da caixa.

## Regras que saem daí

1. **Proporção da arte deve puxar para a da área** (0,75 em 30 × 40). Arte muito
   mais alta que larga desperdiça largura; muito mais larga desperdiça altura.
2. **Apêndice fino não entra na caixa.** Drip, respingo, fumaça e sombra devem
   caber no espaço que o corpo do desenho já ocupa, ou ser encurtados. Um drip
   de 40% da altura vira um de 15% sem perder a leitura.
3. **Ocupar largura é mais barato que ocupar altura.** O limite de 30 cm é o que
   estrangula, mas quem costuma sobrar é a largura, porque as artes tendem ao
   formato retrato. Composição que abre na horizontal ganha presença de graça.
4. **Densidade acima de 50% na própria caixa.** Abaixo disso, ou o desenho ganha
   massa (peso de traço, preenchimento, elemento secundário), ou a caixa encolhe
   até a densidade subir.
5. **Silhueta antes do detalhe.** A peça é vista a três metros antes de ser vista
   a trinta centímetros. Detalhe que só aparece de perto não compra presença.

## O que isto não é

Não é pedido de arte "cheia". Respiro é parte do desenho e o vazio interno conta
como composição. A regra é sobre **vazio de borda**, o que fica entre o desenho e
o limite da área — esse não tem função nenhuma, porque a peça já é o fundo.
