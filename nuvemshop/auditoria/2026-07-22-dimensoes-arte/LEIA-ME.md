---
status: historico
atualizado: 2026-08-12
---

> [!warning] HISTÓRICO — não seguir. Auditoria PARCIALMENTE invalidada: as colunas *_cm do CSV são a régua em uso; o veredito, o DOCX e o PDF são históricos.

# O que vale e o que nao vale nesta pasta

Escrito em 25/07/2026, depois que o metodo de escala desta auditoria foi
invalidado. A pasta ficou por dois motivos opostos, e e preciso separar os dois.

## VALE: as colunas em centimetros

`auditoria-dimensoes-arte.csv`, colunas `front_w_cm`, `front_h_cm`, `back_w_cm`
e `back_h_cm`. Sao as dimensoes oficiais da arte na YouDraw, 49 IDs unicos, 45
com arte de costas. Foram conferidas em 25/07 contra as 29 artes em PNG que o
dono enviou: 14 de 14 comparaveis bateram dentro de 0,7%.

Essas colunas sao a REGUA em uso hoje. Quem le:

- `scripts/measure-print-geometry.mjs` (linha 105)
- `scripts/derive-composicao.mjs` (linha 151)

Faixa real medida a partir delas: costas de 23,8 a 35,2 cm de largura e de 24,6
a 40 cm de altura. Nao existe "largura padrao de costas".

## NAO VALE: as colunas de veredito

`scale_assessment`, `verdict` e `recommendation`. Elas saem de uma comparacao
entre o mockup PLANO da YouDraw e a foto VESTIDA, cada um com sua propria
escala relativa. Numa peca vestida o tecido envolve o tronco e as laterais
fogem da camera, entao a largura visivel nao e a largura plana: a comparacao
fabrica "estampa grande" mesmo quando a estampa esta certa. Para tapar o buraco
foi usado um "fator de caimento 1,52" medido em UM produto (`352721197`, uma
Camiseta Premium) e aplicado ate a moletons.

Nenhum script de producao le essas tres colunas. Elas ficam so como historico.

A prova de que estao erradas e direta: quatro pecas que estas colunas mandam
refazer (`352726673`, `352727545`, `352718787`, `352728357`) sao APROVADAS pela
medicao geometrica de 25/07, que passa em teste de verdade conhecida. E o sinal
do erro tambem inverteu: a fila real tem estampa MENOR que o alvo, nao maior.

Tambem nao vale a contagem `25 APROVAR / 13 REVISAR / 11 REFAZER` derivada
delas.

## NAO VALEM: o DOCX e o PDF

`auditoria-dimensoes-arte-nimbus.docx` e
`auditoria-dimensoes-arte-nimbus-qa.pdf` renderizam as colunas de veredito e
ensinam o metodo invalidado (razao entre a area da arte e o painel util).
Historicos. Nao use para decidir nada, e nao os cite como fonte.

Os geradores (`scripts/build-art-dimension-audit-docx.py`,
`scripts/build-art-dimension-audit-qa.py`,
`scripts/build-art-dimension-audit-cards.mjs`) estao marcados como historicos no
proprio cabecalho.

## Onde esta o veredito vigente

`nuvemshop/auditoria/2026-07-25-geometria/ACHADOS.md` e `medicoes.csv`, com o
metodo e a precisao medida em `scripts/geometry/README.md`.
