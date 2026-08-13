---
status: vigente
atualizado: 2026-08-12
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
| `view_item` | ativo | PDP da vitrine | carregamento da PDP (`produto.js`) | `currency: "BRL"`, `value` = preço, `items: [{item_id: ID Nuvemshop, item_name: slug, price, quantity: 1}]` | interesse por produto; topo do funil de peça |
| `add_to_cart` | ativo | PDP da vitrine | envio do formulário da sacola (`produto.js`) | os de `view_item` + `item_variant` = `cor/tamanho` (ou só cor) | intenção real; numerador da taxa de add_to_cart das metas |
| `view_cart` | ativo | gaveta da sacola, em qualquer página da vitrine | abertura da gaveta (`ui.js`) | `currency`, `value` = total da sacola, `items` = linhas com `quantity` | revisão da sacola; degrau entre intenção e checkout |
| `remove_from_cart` | ativo | gaveta da sacola | botão de remover linha (`ui.js`) | `items` = item removido, `value` = preço × quantidade | desistência por item; sinal de atrito de preço/frete |
| `begin_checkout` | ativo | gaveta da sacola | clique no botão de checkout (`ui.js`) | `currency`, `value` = total, `items` = sacola inteira | último evento medível antes da fronteira de domínio |
| `purchase` | planejado | loja Nuvemshop (checkout, domínio loja.nimbuswear.com.br) | tag GA4 nativa do painel Nuvemshop (P0-1 da r4, aprovado pelo dono em 03/08) | os que a integração nativa da Nuvemshop envia (transaction_id, value, items) | a venda; hoje é invisível e o funil morre em `begin_checkout` |

### `item_id`: o ID da Nuvemshop, não o slug (condição 29 do conselho r5)

Até 12/08 a vitrine mandava `item_id: slug` e a loja manda `item_id:
cartItem.google_item_id`. Com identificador diferente nas duas pontas,
`view_item` e `purchase` nunca casavam no relatório de itens do GA4: dava para
ver que ALGO vendeu, não O QUE vendeu — que é justamente a decisão da
remontagem na IzzyPrint. Desde 12/08 os cinco disparos da vitrine usam o **ID
do produto na Nuvemshop** (`p.id` na PDP, `pid` nas linhas da sacola), e o slug
segue legível em `item_name`.

**O que ainda não está provado:** o formato exato do `google_item_id` que a loja
envia no `purchase`. O HTML público do carrinho monta esse campo em JavaScript,
a partir de um carrinho que só existe com sessão, então nenhuma leitura de fora
resolve — a prova é o pedido-teste do dono no DebugView, comparando o
`item_id` do `view_item` da vitrine com o do `purchase`. Se vier com sufixo de
variante (padrão `id-variante` em algumas contas), o ajuste é de uma linha em
`NIMBUS.itemGA4` (`ui.js`) e uma em `produto.js`. **Não promova a linha do
`purchase` para `ativo` antes dessa comparação.**

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

## Fronteira de domínio (P0-1 — EXECUTADO até o pedido-teste)

Estado de 04/08: os UTMs internos vitrine↔loja foram neutralizados (03/08), o
`G-E041S3ZHWB` está colado no campo nativo do painel e **confirmado no HTML
servido da loja** (03/08, à noite), e o cross-domain + exclusão de referral
foram configurados e verificados no admin do GA4 (04/08). O funil inteiro mede
na mesma propriedade.

O que resta do P0-1: **o pedido-teste no DebugView, que é do dono por regra**
(a sessão não executa pedido), e o filtro de IP interno. O `purchase` desta
tabela continua `planejado` DE PROPÓSITO: o disparo viria da integração nativa
da Nuvemshop, fora deste repositório — não promova a linha sem o pedido-teste
aceito.

## Higiene antes da estreia (pendências de painel/admin)

Pendentes, exigem a sessão de painel/admin do GA4 (dono, ou Cowork com
permissão, a mesma sessão do P0-1/P0-2):

1. **Filtro de tráfego interno** com o IP do dono no admin do GA4.
2. **Annotation do período pré-lançamento** (coleta desde 31/07 = só dono e
   agentes; sem a anotação, o baseline futuro nasce contaminado).
3. **Evidência arquivada** das duas configurações (print datado em
   `nuvemshop/auditoria/`), como pede o critério de aceite do P1-5.

## Pixels da Meta e do TikTok (condição 4 do conselho r5)

Mesma doutrina do GA4: o pixel entra primeiro nesta tabela. O portão
`vitrine:tracking` lê a seção e compara com o código, com duas regras próprias.

**Regra 1 — a fonte de verdade do código é o mapa `EQUIVALE` de `ui.js`**, que
traduz evento do GA4 em evento de pixel. Os disparos são dinâmicos
(`fbq("track", evento, ...)`), então não existe nome literal para o portão ler
no lugar do mapa. Todo evento mapeado tem que estar `ativo` no GA4: pixel não
mede o que o GA4 não mede.

**Regra 2 — enquanto `META_PIXEL_ID` e `TIKTOK_PIXEL_ID` estiverem vazios em
`scripts/vitrine/build-paginas.mjs`, nada é injetado** na página: `fbq` e `ttq`
não existem e os disparos são no-op. Por isso as linhas abaixo nascem
`planejado`. **No dia em que o dono colar um ID, este portão fica VERMELHO até
as linhas virarem `ativo`** — é assim que o plano e o ar continuam iguais sem
depender de alguém lembrar.

| Evento | Status | Superfície | Gatilho | Parâmetros | O que mede |
|---|---|---|---|---|---|
| `PageView` | planejado | todas as páginas da vitrine | snippet base da Meta, no `<head>` (o do TikTok faz o mesmo com `ttq.page()`, que não tem nome de evento) | os padrão do pixel | volume de sessões do lado da Meta; base dos públicos |
| `ViewContent` | planejado | PDP da vitrine | espelha `view_item` (`ui.js`, `NIMBUS.pixel`) | `content_type: "product"`, `content_ids` = **mesmo `item_id` do GA4**, `value`, `currency` | público de remarketing por peça vista |
| `AddToCart` | planejado | PDP e gaveta da sacola | espelha `add_to_cart` | os de `ViewContent` + `contents` com quantidade | público de intenção; sinal de otimização da campanha |
| `InitiateCheckout` | planejado | gaveta da sacola | espelha `begin_checkout` | `contents` da sacola inteira, `value`, `currency` | último sinal antes da fronteira de domínio |

`view_cart` e `remove_from_cart` ficam **fora** dos pixels: não têm evento
padrão equivalente nos dois e evento inventado polui o público sem melhorar
otimização nenhuma.

**O que é do dono, não desta pasta:**

1. **Os dois IDs.** Meta: Gerenciador de Eventos → Fontes de dados → o pixel →
   ID de 15 ou 16 dígitos. TikTok: Ads Manager → Ferramentas → Eventos → Pixel
   → o `sdkid`. Com eles em mãos, o passo do código é preencher as duas
   constantes do build e rodar `npm run vitrine`.
2. **O pixel da LOJA e a API de Conversões**, que são campo do painel Nuvemshop
   e servidor da Meta — o `Purchase` acontece no checkout, fora deste
   repositório, exatamente como o `purchase` do GA4. Roteiro em
   [`pixels-meta-tiktok.md`](pixels-meta-tiktok.md).

Pixel armado **não é mídia paga**: a trava da condição 3 (zero real antes do
`purchase` medido no DebugView) continua de pé. O pixel entra antes só porque
público não se constrói retroativamente.

## Metas numéricas das datas (régua da Larissa, P1-5)

Escritas ANTES da primeira campanha, mesmo que modestas: "escrita antes vale
mais que análise depois".

> [!warning] **Proposta do conselho r5 (12/08/2026), aguarda assinatura do
> dono.** Os números abaixo saíram fechados da 5ª rodada (condição 28 da
> Larissa Fontes e condição 12 da Beatriz Rocha, um commit só). Enquanto o dono
> não assinar, eles valem como alvo de trabalho, não como compromisso — e
> nenhum deles autoriza gasto, que segue travado pela condição 3.

| Data | Campanha | Sessões no dia | Taxa de add_to_cart | Pedidos (purchase) no dia | Pedidos na janela |
|---|---|---|---|---|---|
| 29/09/2026 | São Miguel (festa) | 250 | 6% | 4 | 10 entre 15 e 29/09 |
| 12/10/2026 | Aparecida (padroeira; Acutis/Dia das Crianças dependem do escopo P1-2) | 400 | 8% | 10 | 25 entre 03 e 12/10 |

Réguas de economia que valem para as duas datas:

| Régua | Valor | Por quê |
|---|---|---|
| CAC teto | R$ 50 por pedido | acima disso a margem de contribuição não paga a aquisição |
| Ticket médio mínimo | R$ 260 | abaixo disso o frete grátis a R$399,90 vira prejuízo por pedido |
| ROAS de breakeven | 3,5x | **não 2x**: 2x só fecha se a margem fosse 50% líquida, que ela não é |

### Régua go/no-go da abertura de venda (condição 12, Beatriz Rocha)

A pergunta que esta régua responde é uma só: **abrir venda para valer, ou
segurar?** Ela se lê antes de cada data, com o que estiver medido até ali.

| Sinal | Verde (abre) | Amarelo (abre com escopo menor) | Vermelho (segura) |
|---|---|---|---|
| `view_item` → `add_to_cart` | ≥ 6% | 3% a 6% | < 3% |
| Pix antecipados pagos | ≥ 10 | 5 a 9 | < 5 |

**Só sinal pago conta.** Reserva grátis, lista de e-mail e "quero comprar" de
comentário não entram nesta conta: são interesse, não demanda. A régua da
Beatriz nasceu exatamente disso — a marca nunca vendeu, e a única evidência
que vale contra o próprio otimismo é dinheiro que entrou.

- **Verde:** abre o catálogo remontado e libera a campanha das duas datas.
- **Amarelo:** abre só as peças com Pix pago (produção sob demanda real),
  sem mídia; a diferença entre amarelo e verde é escopo, não data.
- **Vermelho:** segura a abertura, mantém a captação e refaz a oferta. Data não
  é compromisso com o público antes de a régua ficar verde.

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
