---
status: vigente
atualizado: 2026-08-03
---

# Comece aqui

Este é o **único ponto de entrada** do projeto NIMBUS. Ache a sua tarefa abaixo e
vá direto ao fluxo. Não é para ler tudo.

Se um documento fora de `docs/` contradisser um daqui, **este vence**. Todo
documento tem `status:` no topo; sem status, trate como suspeito.

---

## O que você quer fazer?

| Quero… | Abra |
|---|---|
| Produzir ou refazer uma **capa de produto** | [`fluxos/capa-lifestyle.md`](fluxos/capa-lifestyle.md) |
| **Auditar** uma capa, ou entender por que o gate aprovou algo errado | [`fluxos/auditoria-capa.md`](fluxos/auditoria-capa.md) |
| Garantir que o **hover** troque só a cor | [`fluxos/par-de-cor.md`](fluxos/par-de-cor.md) |
| **Publicar** capas na Nuvemshop | [`fluxos/publicar-na-loja.md`](fluxos/publicar-na-loja.md) |
| Mexer no **CSS, hover ou layout** da loja | [`fluxos/site-css-e-hover.md`](fluxos/site-css-e-hover.md) |
| Escrever **página de produto**, medidas, prazo, política | [`fluxos/paginas-de-produto.md`](fluxos/paginas-de-produto.md) |
| Criar **conteúdo social**, post, roteiro, campanha | [`fluxos/conteudo-social.md`](fluxos/conteudo-social.md) |
| Mexer em **evento GA4**, medição, meta das datas | [`fluxos/tracking-plan.md`](fluxos/tracking-plan.md) |

## Preciso de um número, não de um processo

| Preciso saber… | Abra |
|---|---|
| Medidas das peças em cm | [`verdades/medidas-pecas.md`](verdades/medidas-pecas.md) |
| Onde a estampa fica em cada produto | [`verdades/placement.md`](verdades/placement.md) |
| Qual arte é de qual produto e cor de tinta | [`verdades/artes-e-mapeamento.md`](verdades/artes-e-mapeamento.md) |
| Quais são os 49 produtos e 78 variantes | [`verdades/catalogo.md`](verdades/catalogo.md) |
| Tamanho mínimo de export de uma arte (300 DPI) | [`verdades/receita-export-300dpi.md`](verdades/receita-export-300dpi.md) |
| **O que os instrumentos NÃO enxergam** | [`verdades/limites-conhecidos.md`](verdades/limites-conhecidos.md) |

`decisoes/` guarda as decisões do dono, datadas. Elas valem até nova decisão dele.

`historico/` guarda o que caiu, com o motivo. **Nada de lá deve ser seguido.**

---

## Layout dos repositórios

O projeto vive em **dois** repositórios irmãos, clonados lado a lado:

```
nimbus/          PÚBLICO  — código, documentação, medições, auditorias
nimbus-assets/   PRIVADO  — as artes, os blanks e as capas
```

O de assets é privado porque as artes são a propriedade da marca. Os scripts
esperam encontrá-lo em `../nimbus-assets` ou no caminho de `NIMBUS_ASSETS`.

Detalhe em [`REPOSITORIOS.md`](REPOSITORIOS.md).

---

## Três regras que não se negociam

**1. Uma capa por vez.** Lote sempre produziu erro repetido. O ciclo é: gerar,
auditar tudo, corrigir, auditar de novo, e só então passar para a próxima. Após
duas falhas equivalentes no mesmo produto, pare e mude de método.

**2. Instrumento cego não vira veredito.** Quando um check acusa, ou você
conserta o instrumento ou prova que o alarme é falso. **Nunca rebaixa o check
para informativo.** Cinco dos sete defeitos catalogados nasceram exatamente
disso — e a estampa torta passou em 77 capas porque o check de centro tinha sido
rebaixado.

**3. A imagem manda no número.** Se a medição diz que está certo e o olho diz que
está errado, o olho está certo e falta instrumento. Foi assim que o lote de 77
foi aprovado por gate e reprovado pelo dono.

---

## Estado do projeto

Em [`ESTADO.md`](ESTADO.md), atualizado a cada sessão. Leia antes de agir: o
estado é a única parte que envelhece rápido.

---

## Começando uma sessão do zero

[`HANDOFF-SESSAO.md`](HANDOFF-SESSAO.md) é o bloco para colar como primeira
mensagem de uma sessão nova: bootstrap dos três repositórios, roteiro de
leitura, os portões, o estado em cinco frases, o rumo e a lista do que já foi
aprendido na marra. Se você é a sessão nova e ninguém colou esse bloco, leia-o.

## Área de impressão

Quanto espaço a arte ocupa na peça, e por que isso muda a leitura de um gate,
está em [`verdades/economia-do-espaco.md`](verdades/economia-do-espaco.md).
