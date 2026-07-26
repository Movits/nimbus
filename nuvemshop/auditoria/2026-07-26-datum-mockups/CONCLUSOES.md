# Datum da tabela YouDraw — investigação nos mockups locais (26/07/2026)

A questão aberta que valia 3-5% ("a altura da tabela sai do OMBRO ou da BASE
DA GOLA?") foi atacada com o plano aprovado no handoff: medir a razão
ombro→barra ÷ gola→barra em mockup plano, usando os mockups oficiais que
descobrimos existir localmente para os 49 produtos
(`nuvemshop/assets/product-lifestyle/2026-07-16/catalog/references/`).
Quatro medidores independentes, um por tipo de peça, com scripts
reproduzíveis e conferência visual por overlay.

## RESULTADO PRINCIPAL: na Camiseta Premium, a tabela mede GOLA→BARRA

Com a arte oficial do Brasão (29,6x40 cm) como régua dentro do próprio
mockup:

| Hipótese de datum | Comprimento implícito | vs tabela G = 75,5 cm |
|---|---|---|
| base da gola → barra | **75,9 cm** | **+0,5%** ✔ |
| ombro (HPS) → barra | 79,7 cm | +5,6% ✘ |

**A convenção vigente do projeto (gola→barra) é a da YouDraw.** As duas
auditorias e as 11 capas novas medem na régua certa. Offset HPS→gola no
template: ~3,8 cm; razão R = 1,0495 ± 0,0006 (8 mockups, template único
pixel-idêntico entre os 4 produtos).

Ressalva declarada: assume que o mockup da Premium renderiza a arte na
escala de produção — corroborado pelo px/cm quase isotrópico (5,125 vertical
vs 5,20 na arte) e pelo erro de 0,5%.

## Por tipo de peça

- **Camiseta Premium**: acima. Template ÚNICO para os 4 produtos; horizontal
  do template NÃO proporcional (largura implicaria 50 cm vs 54 do G) — nunca
  usar a régua vertical para larguras.
- **Oversized**: o template NÃO renderiza a ribana no centro-costas → a gola
  é indetectável (R degenera para ~1,00 nas brancas; o 1,052 das pretas mede
  fim-de-sombra). Régua utilizável do template: ombro→barra. O template
  desenha a peça "maior que G" (tinta do Querubim = 42,5% de ombro→barra →
  ~94 cm se a arte fosse 40 cm, vs 82 do G) — consistente com o padrão do
  canguru abaixo. **352720257 (Acima de Tudo Gótico) NÃO tem mockup de
  costas: o print é FRONTAL** (confirma o caso especial da fila).
- **Moletom Canguru**: gola OCULTA pelo capuz em 8/8 (R não mensurável nesta
  vista). DOIS templates de foto (branco ≠ preto, ~2,2% de diferença em
  ombro→barra), mas a tinta é ancorada na MESMA posição de canvas nos dois, e
  k = 5,21 ± 0,03 px/cm constante entre produtos e cores → o template desenha
  a peça ~16-18% maior que um G real. Mockup de canguru NÃO é régua absoluta.
- **Blusão Moletom (primeiro dado que existe!)**: R = 1,0366 ± 0,015 (3
  mockups crewneck); F = tinta/(gola→barra) = 0,51 ± 0,014 para artes de
  ~40 cm. SE o template do blusão inflar como o do canguru (+17%), o
  comprimento G real ficaria em **~66-72 cm** — ESTIMATIVA com duas
  suposições empilhadas; NÃO usar como régua de veredito (regra do ruído).
  Serve para sanidade e para desenhar a coleta real no painel YouDraw.

## Anomalias para o dono

1. **352727892 (Aparecida Spray "Blusão")**: o mockup usa o template de
   MOLETOM CANGURU (capuz + cordões). Ou o mockup está errado na YouDraw, ou
   o produto é na verdade um canguru — conferir no painel, afeta tabela de
   medidas e descrição.
2. Ordem da galeria é inconsistente (02/04 trocam preto/branco por produto;
   blusões usam 03/04) — nunca assumir posição fixa por cor.
3. No 352407196 a arte difere entre cores (branca tem wordmark que a preta
   não mostra) — mesma família de descoberta das capas (variantes por cor).

## Consequências práticas

- A fila de correção e as 11 capas produzidas ficam em régua CONFIRMADA.
- O viés "se o datum fosse ombro" deixa de existir para Premium; para
  canguru/oversized/blusão o datum segue não-medido diretamente, mas o
  precedente da Premium + a coerência k-constante tornam gola→barra a
  leitura de longe mais provável (mesma tabela, mesmo fornecedor).
- Placement: as frações de tinta (F) por produto medidas aqui servem de
  referência de placement por produto para futuras composições.

Dados brutos e scripts: journal do workflow `wf_8d9618ae-cdd` e scripts em
scratchpad citados nos laudos (measure-final.js, measure3.mjs, measure.mjs).
