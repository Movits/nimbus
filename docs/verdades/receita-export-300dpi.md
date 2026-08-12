---
status: vigente
atualizado: 2026-08-03
---

# Receita de export de arte: 300 DPI, pinado

Regra do P1-1c do conselho r4 (03/08/2026), condição do portão de nascimento
da frente NUVEM. Serve YouDraw e IzzyPrint.

## A regra

**Toda arte nova sai da fonte com pixel para 300 DPI no MAIOR tamanho em que
ela pode imprimir.** Ampliar depois não cria detalhe: o `finalize-prints.mjs`
só declara a densidade e evita reamostragem do RIP; o detalhe continua o da
origem. Foi assim que o acervo inteiro nasceu a 3500 px (~222 DPI num print de
40 cm) e entrou na fila de re-export (`nuvemshop/auditoria/2026-07-28-dpi-artes.md`).

Números de referência:

| Posição | Caixa máxima (cm) | Arte em pé (limitada pela altura) | Arte deitada (limitada pela largura) |
|---|---|---|---|
| costas | 35,2 × 40,0 | **4724 px de altura** (40 cm) | 4158 px de largura (35,2 cm) |
| frente | 35,2 × 35,1 | 4146 px de altura | 4158 px de largura |
| peito | 9,4 × 14,6 | 1725 px de altura | 1111 px de largura |
| manga | 9,0 × 9,0 | 1063 px | 1063 px |

A caixa é o teto real do catálogo
(`nuvemshop/auditoria/2026-07-22-dimensoes-arte/`), a mesma tabela do
`finalize-prints.mjs`. A caixa da IzzyPrint (30 × 40 cm = 3543 × 4724 px a
300 DPI) cabe dentro desses números. Conta geral: `px = cm / 2,54 × 300`.

Formato: **PNG sem fundo** (a IzzyPrint rejeita fundo sólido mesmo na cor da
peça; a geração em fundo verde sólido + chroma do fluxo vigente continua, o
recorte é que entrega o PNG transparente).

## O portão

`npm run producao:dpi300` (`scripts/producao/lint-export-300dpi.mjs`, dentro
do `vitrine:portoes`): varre `designs/prontos/<COLECAO>/<posicao>/`, encaixa a
proporção de cada PNG na caixa da posição e mede o DPI nesse pior caso.
Abaixo de 300, o portão falha e diz o tamanho exato que falta.

- Precisa dos assets privados mesclados (`node scripts/setup-assets.mjs`);
  por isso roda na máquina local, não no deploy do repo público
  (`SKIP_ASSETS=1` só para ambiente declaradamente sem assets).
- **Baseline datada de 03/08** (`scripts/producao/export-300dpi.baseline.json`):
  as 64 artes legadas do padrão de 3500 px ficam toleradas com dimensões
  congeladas, como pendência de re-export. A decisão de plataforma SAIU em
  07/08 (IzzyPrint): o re-export a 300 DPI virou pré-requisito ativo da
  remontagem do catálogo (`docs/ESTADO.md`, Pendências 2). A lista só encolhe;
  entrada nova para arte nova é rebaixar o portão, e portão não vira
  informativo.

## O que isso muda para a frente NUVEM

Nenhuma arte NUVEM nova é gerada antes de os portões a, b e c do P1-1 estarem
ativos (estão, desde 03/08) — e cada arte nova nasce mirando a linha desta
tabela para a posição dela, senão o portão devolve o arquivo.
