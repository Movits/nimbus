---
status: vigente
atualizado: 2026-07-26
instrumento: scripts/producao/auditar-receitas.mjs
---

# Torso e centro nas receitas

O `ESTADO.md` de 26/07 pediu para varrer as 77 receitas atrás de `torso` e
`centro` errados, porque a receita do 352718999 usava `torso 0.44` — a largura
**manga a manga**, não a largura do tronco na altura da arte. Esta página é o
resultado da varredura. **O vício se repete.**

## O que `torso` faz

`planejar()` resolve o raio efetivo do cilindro pela projeção da silhueta:

```
torsoPx = 2·f·R/D,  f = pxPorCm·(D−R)   ⟹   R(D−R) = torsoPx·D / (2·pxPorCm)
```

R é a raiz menor, e nunca menor que o R da tabela (`largura_plana / π`). Um
`torso` inflado **infla o raio**, a arte se enrola num cilindro grande demais e
sai chapada. É um dos três defeitos que reprovaram o lote de 77.

## A régua

`inflacao = raio_efetivo / raio_tabela`. Tecido vestido cai mais plano que um
cilindro justo, então inflação **acima de 1 é esperada**. A faixa vem dos três
pilotos que o dono aprovou, e não está chumbada em lugar nenhum: o script a
recalcula a cada rodada.

| Piloto aprovado | Peça | `torso` | Inflação |
|---|---|---|---|
| 352718999 branca | Camiseta Premium | 0,292 | **1,228×** |
| 352889132 preta | Camiseta Premium | 0,265 | **1,117×** |
| 352618878 preta | Moletom Canguru | 0,335 | **1,137×** |

Teto usado na triagem: **1,412×** (o maior piloto + 15%).

## Doze capas acima do teto

Ordem de retrabalho, da pior para a menos ruim:

| Inflação | Produto | Cor | Peça | `torso` |
|---|---|---|---|---|
| 2,025× | 352725852 | preta | Camiseta Premium | 0,546 |
| 1,955× | 352718999 | branca | Camiseta Premium | 0,44 |
| 1,861× | 352728277 | preta | Cam. Oversized Premium | 0,4971 |
| 1,821× | 352717837 | preta | Camiseta Premium | 0,4805 |
| 1,646× | 352407196 | branca | Camiseta Premium | 0,40 |
| 1,599× | 352717723 | off-white | Cam. Oversized Premium | 0,412 |
| 1,528× | 352890896 | preta | Cam. Oversized Premium | 0,45 |
| 1,523× | 352407182 | preta | Cam. Oversized Premium | 0,452 |
| 1,490× | 352719816 | branca | Moletom Canguru | 0,4697 |
| 1,466× | 352718943 | preta | Cam. Oversized Premium | 0,4395 |
| 1,446× | 352718787 | branca | Moletom Canguru | 0,4727 |
| 1,446× | 352718787 | preta | Moletom Canguru | 0,4727 |

O alarme foi **conferido no olho**, não só no número: recompondo o 352718999
branca com `torso 0.292` e com `torso 0.44` sobre o mesmo blank, a versão de
0,44 sai visivelmente mais larga e reta, com a moldura da arte sem o
encurtamento das bordas. É a cara de adesivo que o dono reprovou.

## Contradições provadas

`centro` e `torso` são propriedades **da foto**. Duas receitas sobre o mesmo
blank têm obrigatoriamente o mesmo eixo e a mesma largura de tronco. Quando
divergem, uma das duas está errada — isso não é estimativa.

> [!warning] Onze conflitos entre receitas do mesmo blank
> Os maiores: `352721477-branca-blank` com `torso` 0,33 contra 0,55
> (espalhamento 0,22); `352718999-branca-blank` com 0,292 contra 0,44 (0,148);
> `352727892-preta-blank` com 0,446 contra 0,33 (0,116); e
> `352889132-preta-par-blank` com `centro` 0,391 contra 0,445 (0,054).
> Lista completa em `node scripts/producao/auditar-receitas.mjs --todas`.

Em **todos** os conflitos onde existe receita do método novo (piloto ou par), o
valor novo é o **menor**. O lote v8/v9 inflou torso de forma sistemática.

## Oito capas com `centro` ou `torso` não medidos

Quatro com `centro` exatamente **0,5**, que é o meio da imagem e não o eixo do
painel: 352702796 preta, 352723243 branca, 352702753 off-white e preta.

Quatro **sem `torso`**, em que o raio caiu na tabela (cilindro justo, sem folga
de caimento): 352619175 branca e preta, 352718275 branca, 352720257 off-white.

Nenhuma delas está necessariamente errada — só não foi medida. Confira o eixo
nos vincos de cava antes de recompor.

## Cobertura

76 das 78 variantes têm receita. Faltam **352890896 off-white** (precisa de
landmarks derivados; o blank existe) e a **Ecobag 355581274**, que fica de fora
de propósito porque a pipeline não processa painel plano.

## Limites desta varredura

Ela **não** enxerga:

- se o `centro` bate com os vincos de cava. Isso é leitura visual do blank;
  aqui só se detecta divergência entre receitas e o default 0,5;
- se `gola` e `barra` estão certos. Um par errado desloca `pxPorCm` e portanto a
  inflação, e a varredura culparia o `torso`;
- fidelidade de traço, sinal do yaw e integração com o tecido.

É **triagem para ordenar o retrabalho**, não veredito. Cada capa ainda passa por
composição, gate e olho, uma por vez.

## Relacionados

- [`limites-conhecidos.md`](limites-conhecidos.md) — o que os instrumentos não veem
- [`medidas-pecas.md`](medidas-pecas.md) — a tabela que dá o raio de referência
- [`../fluxos/capa-lifestyle.md`](../fluxos/capa-lifestyle.md) — como medir torso e centro
