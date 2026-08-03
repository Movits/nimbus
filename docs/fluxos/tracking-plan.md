---
status: vigente
atualizado: 2026-08-03
---

# Tracking plan da NIMBUS (GA4 `G-E041S3ZHWB`)

Este documento é a **única fonte de verdade** dos eventos de medição do site.
Nasceu do P1-5 do conselho r4 (03/08/2026): os eventos vivos não estavam
documentados em lugar nenhum e três planejados nunca entraram.

**O contrato:** todo evento que o código dispara tem uma linha aqui, e toda
linha `ativo` daqui existe no código. O portão
`scripts/vitrine/lint-tracking.mjs` (`npm run vitrine:tracking`, no
`vitrine:portoes` e no deploy) quebra o build quando os dois lados divergem.
Evento novo entra **primeiro nesta tabela, no mesmo commit do código** — na
ordem inversa o build não passa, de propósito.

A propriedade coleta desde 31/07/2026. Até a primeira campanha, o tráfego é só
o dono e os agentes (ver Higiene, abaixo).

## Eventos

A coluna Status é lida pelo portão: `ativo` (disparado pelo código da vitrine
ou da landing), `automatico` (o gtag dispara sozinho a partir do `config`),
`planejado` (aprovado, ainda não implementado; vira `ativo` no commit que o
implementa), `fora` (decidido que não entra; reintroduzir exige mudar a linha).

| Evento | Status | Superfície | Gatilho | Parâmetros | O que mede |
|---|---|---|---|---|---|
| `page_view` | automatico | todas as páginas da vitrine (`/loja/`) e a landing | `gtag('config','G-E041S3ZHWB')` no `<head>` (vitrine via build-paginas.mjs; landing via index.html) | os padrão do gtag (page_location, page_title, ...) | volume e origem de sessões; base de toda taxa |
| `view_item` | ativo | PDP da vitrine | carregamento da PDP (`produto.js`) | `currency: "BRL"`, `value` = preço, `items: [{item_id: slug, item_name, price, quantity: 1}]` | interesse por produto; topo do funil de peça |
| `add_to_cart` | ativo | PDP da vitrine | envio do formulário da sacola (`produto.js`) | os de `view_item` + `item_variant` = `cor/tamanho` (ou só cor) | intenção real; numerador da taxa de add_to_cart das metas |
| `view_cart` | ativo | gaveta da sacola, em qualquer página da vitrine | abertura da gaveta (`ui.js`) | `currency`, `value` = total da sacola, `items` = linhas com `quantity` | revisão da sacola; degrau entre intenção e checkout |
| `remove_from_cart` | ativo | gaveta da sacola | botão de remover linha (`ui.js`) | `items` = item removido, `value` = preço × quantidade | desistência por item; sinal de atrito de preço/frete |
| `begin_checkout` | ativo | gaveta da sacola | clique no botão de checkout (`ui.js`) | `currency`, `value` = total, `items` = sacola inteira | último evento medível antes da fronteira de domínio |
| `purchase` | planejado | loja Nuvemshop (checkout, domínio loja.nimbuswear.com.br) | tag GA4 nativa do painel Nuvemshop (P0-1 da r4, aprovado pelo dono em 03/08) | os que a integração nativa da Nuvemshop envia (transaction_id, value, items) | a venda; hoje é invisível e o funil morre em `begin_checkout` |

## Decididos por escrito (exigência do P1-5)

A ata manda decidir se `view_item_list`, `select_item`, `select_size` e os
eventos dos 10% e da régua do frete entram ou saem. Decisão registrada em
03/08 sob a autorização geral do dono para P1 ("Pode corrigir também o P1 e
P2"); qualquer linha pode ser revertida por decisão dele.

| Evento | Status | Superfície | Gatilho | Parâmetros | Motivo da decisão |
|---|---|---|---|---|---|
| `view_item_list` | fora | grade da home e das coleções | n/a | n/a | setembro é a primeira amostra da história da marca; o funil essencial (view_item → purchase) tem que ficar legível antes de somar volume de evento de grade. Revisitar depois de 12/10 com dados. |
| `select_item` | fora | cards da grade | n/a | n/a | mesmo motivo do view_item_list; o clique no card já vira `view_item` na PDP um passo depois. |
| `select_size` | fora | botões de tamanho da PDP | n/a | n/a | interação de interface, não etapa de funil; o tamanho escolhido já viaja no `item_variant` do `add_to_cart`. |

- **Eventos dos 10% (escolha do projeto social): FORA por ora.** A escolha
  acontece no checkout da loja, domínio que ainda não tem tag (P0-1), e o
  registro operacional dela pertence ao roteiro do pedido pago (P1-6), não ao
  GA4. Se o campo do checkout for confirmado pelo print/da sessão de painel e
  virar medível, o evento entra primeiro aqui.
- **Eventos da régua do frete/celebração: FORA por ora.** Régua, toast e festa
  são interface; o efeito que importa já aparece em `add_to_cart`,
  `view_cart` e `begin_checkout`. Se a celebração com opções de Ecobag
  (feature aprovada no P0-3 da r4) precisar de medição própria, o evento entra
  primeiro nesta tabela, senão o portão quebra o build — que é exatamente o
  comportamento desejado.

## Fronteira de domínio (contexto do P0-1)

O funil medido hoje morre em `begin_checkout`: o domínio da loja não serve
nenhuma tag. Ordem fechada pelo conselho e pelo dono: **neutralizar os UTMs
internos vitrine↔loja ANTES de a tag entrar no painel** (senão cada compra de
campanha é reatribuída a `vitrine/pdp`), depois colar o `G-E041S3ZHWB` no campo
nativo do painel, configurar cross-domain e exclusão de referral no admin, e
validar um pedido-teste no DebugView. O `purchase` desta tabela só vira
`ativo` (na superfície da loja) depois desse aceite.

## Higiene antes da estreia (pendências de painel/admin)

Pendentes, exigem a sessão de painel/admin do GA4 (dono, ou Cowork com
permissão, a mesma sessão do P0-1/P0-2):

1. **Filtro de tráfego interno** com o IP do dono no admin do GA4.
2. **Annotation do período pré-lançamento** (coleta desde 31/07 = só dono e
   agentes; sem a anotação, o baseline futuro nasce contaminado).
3. **Evidência arquivada** das duas configurações (print datado em
   `nuvemshop/auditoria/`), como pede o critério de aceite do P1-5.

## Metas numéricas das datas (régua da Larissa, P1-5)

Escritas ANTES da primeira campanha, mesmo que modestas: "escrita antes vale
mais que análise depois". Os valores são decisão do dono (dependem do
orçamento do P0-4); a estrutura fica pronta aqui.

| Data | Campanha | Sessões no dia | Taxa de add_to_cart | Pedidos (purchase) |
|---|---|---|---|---|
| 29/09/2026 | São Miguel (festa) | a preencher pelo dono | a preencher pelo dono | a preencher pelo dono |
| 12/10/2026 | Aparecida (padroeira; Acutis/Dia das Crianças dependem do escopo P1-2) | a preencher pelo dono | a preencher pelo dono | a preencher pelo dono |

Regra já fechada pelo conselho: **nenhum real de mídia entra** antes de o
fundo do funil estar medido e validado (P0-1) e de o orçamento por data
existir por escrito (P0-4). As metas preenchidas são parte do aceite do P1-5.

## Registro formal

O **gate de baseline de 7 dias** da r3 (Sofia Carvalho) morreu sem dano: com
noindex e tráfego ~zero ele mediria nada. Fica **substituído por
"instrumentação completa e validada antes do primeiro real de mídia"**
(tag na loja + cross-domain + UTMs internos neutralizados + pedido-teste no
DebugView). Registrado também no `docs/ESTADO.md`.

## Como mudar este plano

1. Evento novo: linha na tabela e código **no mesmo commit**; o portão confere.
2. O portão nunca vira informativo (regra 2 do `00-COMECE-AQUI`).
3. Nomes seguem a taxonomia de e-commerce do GA4 quando ela existir
   (`view_item`, `add_to_cart`, ...); evento fora da taxonomia só com nome
   `snake_case` e justificativa na coluna "O que mede".
4. Disparos no código usam `gtag('event', ...)` ou os helpers `ga4(...)`
   (ui.js) e `evento(...)` (produto.js), que são o que o portão sabe ler;
   helper novo de disparo precisa entrar no lint-tracking no mesmo commit.
