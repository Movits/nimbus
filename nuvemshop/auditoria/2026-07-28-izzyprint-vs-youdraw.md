---
status: vigente
atualizado: 2026-07-28
fonte: paginas publicas de izzyprint.com.br lidas em 28/07 (HTML servido, nao resumo)
---

# IzzyPrint × YouDraw: o que dá para decidir sem entrar na conta

Levantado a pedido do dono, que avalia migrar a produção POD. Os dados abaixo
vieram do HTML das páginas de produto da IzzyPrint, não de resumo: composição,
gramatura e tabela de medidas estão publicadas lá e não apareciam na leitura
superficial do site.

**O que este documento não responde:** custo POD para revenda, integração com a
Nuvemshop, white label e frete real. Isso só a conta logada mostra
(`cowork-izzyprint-avaliacao-prompt.md`).

## Tecidos: a IzzyPrint publica, a YouDraw não

| Peça IzzyPrint | Composição | Gramatura | Detalhes |
|---|---|---|---|
| Camiseta Clássica | 100% algodão penteado premium, fio 26 | **180 g/m²** | selos Sou de Algodão e BCI |
| Camiseta Oversized Street | 100% algodão penteado premium, fio 26.1 | **200 g/m²** | gola canelada 3 cm, reforço ombro a ombro |
| Camiseta Boxy | 100% algodão penteado premium, fio 26 | **200 g/m²** | malha encorpada, fios longos |
| Moletom Canguru | 96% algodão + 4% elastano | **300 g** | tecido de dois cabos, reforços |
| Moletom Careca | 96% algodão + 4% elastano | **300 g** | dois cabos, reforço ombro a ombro |

Para uma marca cuja tese é acabamento premium, ter gramatura e certificação
publicadas é vantagem real de argumento de venda. Precisa ser confirmado no
produto físico, que é justamente o objetivo das amostras.

## Medidas: as peças NÃO são intercambiáveis

Tamanho G, largura × comprimento em cm. A régua da NIMBUS hoje vem da YouDraw
(`docs/verdades/medidas-pecas.md`).

| NIMBUS hoje | Equivalente IzzyPrint | Largura | Comprimento |
|---|---|---|---|
| Camiseta Premium 54×75,5 | Clássica 56×73 | +4% | −3% |
| Camiseta Oversized Premium 66×82 | Oversized Street 61×76 | **−8%** | **−7%** |
| Moletom Canguru 58×65 | Canguru 59×78 | +2% | **+20%** |
| Blusão Moletom 58×78,4 (estimado) | Careca 58,5×77,5 | +1% | −1% |

Duas leituras importantes:

1. **O Moletom Canguru da IzzyPrint é 20% mais comprido.** Como o datum de
   placement da NIMBUS é gola→barra, *todo* o placement dos moletons teria que
   ser re-medido. Não é ajuste fino: é refazer a medição.
2. **O "Moletom Careca" é o equivalente do nosso Blusão Moletom** e sua tabela
   publicada (58,5 × 77,5) fica a 1% da nossa estimativa de 78,4 cm — que era a
   única medida estimada do projeto, justamente porque a YouDraw não publica
   tabela. Não prova a estimativa (é outra peça, de outro fornecedor), mas é a
   primeira corroboração externa que ela recebe.

**Sem equivalente de Ecobag** na loja da IzzyPrint. É a 78ª variante do nosso
plano, hoje fora da pipeline de qualquer forma, mas some do catálogo se
migrarmos.

## Estampa: o limite de 30 cm é o que mais dói

Regras publicadas no editor deles: **300 DPI recomendado** (mínimo 72), **PNG
sem fundo** (avisam explicitamente para não mandar fundo nem na cor da peça) e
**área máxima 30 cm × 40 cm = 3543 × 4724 px**.

Cruzando com nossas 26 artes (`2026-07-28-dpi-artes.md`):

- **16 das 26 estouram os 30 cm de largura**, até +5,2 cm (as de 35,2 cm).
- Encolher para caber tem um efeito colateral bom: aumenta o DPI. **11 artes
  chegam a 295–296 DPI só encolhendo** — diferença imperceptível dos 300.
- As outras **15 continuam em 218–276 DPI** porque quem limita é a altura de
  40 cm, e aí não há encolhimento que ajude. Essas precisam mesmo ser refeitas
  em resolução maior (fator de 1,3× a 1,4×) ou vetorizadas — boa parte é
  stencil chapado, que vetoriza bem e resolve o problema para sempre.

A técnica de impressão **não está confirmada**. Há um slug de URL antigo com
"estampa-dtg" reaproveitado numa configuração de cookies, o que sugere DTG, mas
isso é evidência fraca e não serve como veredito. Perguntar na conta: DTG em
algodão tem toque macio e casa com premium; DTF tem cor mais viva e toque mais
plástico.

## Preços de vitrine (não são o custo POD)

Clássica R$29,90–55,90 · Oversized Street R$39,90–69,90 · Boxy R$59,90 ·
Canguru R$139,90 · Careca R$119,90. São preços de varejo do site deles, **não**
o custo de produção para revenda — que é o número que decide a margem e só
aparece logado. Para comparar: na YouDraw a camiseta frente+verso custa
~R$73,20 e o blusão com estampa grande R$122,65.

## O que pesa na decisão

**A favor da IzzyPrint:** tecidos publicados e certificados, gramatura de 200
g/m² no oversized, tabela de medidas por tamanho em todas as peças (a YouDraw
não publica a do Blusão), editor de criação muito superior, catálogo de cores
maior no oversized (8 cores, incluindo estonados e marmorizado).

**Contra:** produção até 4 dias úteis contra ~48h; sem marketplace próprio como
vitrine extra; limite de 30 cm mexe em 16 artes; peças com medidas diferentes
obrigam a refazer a medição de placement; sem Ecobag; custo POD e integração
ainda desconhecidos.

**Custo real da migração, em trabalho:** refazer 15 artes em alta resolução,
reduzir 16 para 30 cm, re-medir o placement de todas as peças (o datum muda),
refazer os blanks com o casting novo e reconstruir as capas. É praticamente o
mesmo trabalho que a reconstrução do catálogo já exigia — o que, ironicamente,
faz deste o **melhor momento possível** para migrar, se as amostras
convencerem: o catálogo vai ser refeito de qualquer jeito.

## Próximo passo

Amostras. Nenhuma decisão de tecido ou de estampa se toma por HTML.
