---
status: vigente
atualizado: 2026-07-26
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

## Preciso de um número, não de um processo

| Preciso saber… | Abra |
|---|---|
| Medidas das peças em cm | [`verdades/medidas-pecas.md`](verdades/medidas-pecas.md) |
| Onde a estampa fica em cada produto | [`verdades/placement.md`](verdades/placement.md) |
| Qual arte é de qual produto e cor de tinta | [`verdades/artes-e-mapeamento.md`](verdades/artes-e-mapeamento.md) |
| Quais são os 49 produtos e 78 variantes | [`verdades/catalogo.md`](verdades/catalogo.md) |
| Quais receitas têm `torso` ou `centro` errados | [`verdades/torso-e-centro.md`](verdades/torso-e-centro.md) |
| **O que os instrumentos NÃO enxergam** | [`verdades/limites-conhecidos.md`](verdades/limites-conhecidos.md) |

## Contexto de negócio

| Preciso de… | Abra |
|---|---|
| Preços e régua de precificação | [`projeto/precificacao.md`](projeto/precificacao.md) |
| Estado e guia da loja (CSS, páginas, tema) | [`../nuvemshop/instrucoes.md`](../nuvemshop/instrucoes.md) |

`decisoes/` guarda as decisões do dono, datadas. Elas valem até nova decisão dele.

`historico/` guarda o que caiu, com o motivo — inclusive os documentos de
fundação de jun-jul/2026 que moravam na raiz (pesquisa de mercado, nomes de
produto, kit de marca, prompts Higgsfield, handoffs). **Nada de lá deve ser
seguido**; serve só de arqueologia. Os scripts pontuais das sprints passadas
estão em `../scripts/historico/`, na mesma condição.

---

## Nova sessão (qualquer conta do Claude)

O dono trabalha com **duas contas do Claude**; o estado inteiro do projeto vive
nos repositórios, nunca na conversa. Qualquer sessão nova, em qualquer conta,
fica pronta assim:

1. Clonar os TRÊS repos lado a lado: `Movits/nimbus` (público),
   `Movits/nimbus-assets` (privado), `Movits/nimbus-brain` (privado).
2. `npm install && node scripts/setup-assets.mjs` no nimbus.
3. Criar o `.env` (nunca commitado) com `GEMINI_API_KEY` e as 4 variáveis
   `NUVEMSHOP_*` — **os valores estão no repo privado da brain**, página
   `wiki/entities/nuvemshop-api.md` (e a chave Gemini em `estado.md`).
4. Rodar as verificações do `CLAUDE.md` (`typecheck`, `validate`, `inventario`).
5. Ler `ESTADO.md` e seguir o fluxo da tarefa por esta página.

Os processos que têm que sair IDÊNTICOS em qualquer sessão estão todos
escritos: criação de capa ([`fluxos/capa-lifestyle.md`](fluxos/capa-lifestyle.md)),
auditoria ([`fluxos/auditoria-capa.md`](fluxos/auditoria-capa.md)), publicação
([`fluxos/publicar-na-loja.md`](fluxos/publicar-na-loja.md)) e os limites dos
instrumentos ([`verdades/limites-conhecidos.md`](verdades/limites-conhecidos.md)).
Se algo só existir na memória da conversa, está no lugar errado — escreva no
repo antes de encerrar.

---

## Layout dos repositórios

O projeto vive em **três** repositórios irmãos, clonados lado a lado:

```
nimbus/          PÚBLICO  — código, documentação, medições, auditorias
nimbus-assets/   PRIVADO  — as artes, os blanks e as capas (+ capas IA aprovadas)
nimbus-brain/    PRIVADO  — segundo cérebro do negócio (wiki) + credenciais
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
