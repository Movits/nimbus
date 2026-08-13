---
status: vigente
atualizado: 2026-08-12
---

# Pixels da Meta e do TikTok

Condição 4 do conselho r5 (12/08/2026, Marina Duarte), com a exigência da
Larissa Fontes de que os pixels contem o **mesmo produto** que o GA4
(condição 29). O plano de eventos é [`tracking-plan.md`](tracking-plan.md),
seção "Pixels"; este documento é o **fluxo de colagem**, com a divisão clara
entre o que já está pronto no código e o que só o dono pode fazer.

Pixel armado **não é mídia paga**. A trava continua: nenhum real de anúncio
antes do `purchase` medido no DebugView (condição 3). O pixel entra antes de
tudo por um motivo só: **público não se constrói retroativamente**. Cada dia
com pixel desligado é um dia de visitante que a campanha de 29/09 não vai
poder reencontrar.

## Estado, em uma linha

**O código está pronto e desligado**, esperando dois números que vivem nas
contas do dono. Nada é injetado enquanto eles não chegarem.

## Passo 1 — pegar os dois IDs (dono, 5 minutos)

| Pixel | Onde | O que copiar |
|---|---|---|
| Meta | [Gerenciador de Eventos](https://business.facebook.com/events_manager2) → Fontes de dados → o pixel da NIMBUS | o **ID do pixel**, 15 ou 16 dígitos |
| TikTok | TikTok Ads Manager → Ferramentas → Eventos → Web Events → o pixel | o **Pixel ID** (o `sdkid`, letras e números) |

Se o pixel ainda não existe, criar é gratuito e não compromete verba: na Meta,
"Conectar fontes de dados" → Web; no TikTok, "Criar pixel" → instalação manual
(**não** escolher a integração automática de plataforma: a vitrine é estática e
o snippet já está escrito aqui).

## Passo 2 — ligar na vitrine (código, 1 minuto)

Em `scripts/vitrine/build-paginas.mjs`, as duas constantes vazias:

```js
const META_PIXEL_ID = "";
const TIKTOK_PIXEL_ID = "";
```

Preencher e rodar `npm run vitrine`. O snippet base entra no `<head>` das 45
páginas, junto do gtag, e os eventos de conversão passam a disparar sozinhos —
`ui.js` já espelha `view_item`, `add_to_cart` e `begin_checkout` para
`ViewContent`, `AddToCart` e `InitiateCheckout`, com o **mesmo `item_id`** do
GA4 (o ID do produto na Nuvemshop).

O portão `npm run vitrine:tracking` **fica vermelho na hora**, e é de
propósito: ele cobra que as quatro linhas da seção "Pixels" do tracking-plan
passem de `planejado` para `ativo` no mesmo commit. Vermelho aqui não é bug, é
o plano exigindo ser atualizado junto com o ar.

Um pixel só também funciona: quem tiver apenas o da Meta preenche só aquela
constante, e o TikTok continua desligado.

## Passo 3 — conferir (dono, 10 minutos)

1. **Meta Pixel Helper** (extensão do Chrome) aberto em
   `nimbuswear.com.br/loja/p/<qualquer-produto>/`: tem que aparecer `PageView`
   e `ViewContent`. Adicionar à sacola → `AddToCart`. Abrir a gaveta e clicar
   em pagar → `InitiateCheckout`.
2. **Test Events** do Gerenciador de Eventos, na mesma navegação, confirma o
   recebimento do lado do servidor da Meta.
3. **TikTok Pixel Helper** faz o mesmo caminho.
4. Guardar um print datado em `nuvemshop/auditoria/` (mesmo critério de
   evidência do P1-5).

## O que é do dono e NÃO se resolve neste repositório

1. **O pixel da LOJA.** O checkout roda em `loja.nimbuswear.com.br`, fora do
   GitHub Pages. A Nuvemshop tem campo próprio para o pixel da Meta no painel
   (a mesma sessão que colou o `G-E041S3ZHWB`), e é ele que dispara o
   `Purchase`. Sem esse passo, a Meta vê intenção e nunca vê venda — o mesmo
   buraco que o `purchase` do GA4 tem hoje.
   Protocolo de painel: [`site-css-e-hover.md`](site-css-e-hover.md) e o
   roteiro vigente em
   [`consertos-loja-2026-08-08.md`](../../nuvemshop/consertos-loja-2026-08-08.md).
2. **A API de Conversões (CAPI).** Envio servidor-a-servidor, que recupera o
   que o navegador perde (iOS, bloqueadores). Depende de token da Meta e de
   integração no lado da loja; entra **depois** do pixel da loja funcionando,
   nunca antes.
3. **Consentimento.** A página de privacidade já está no ar e cita medição.
   Se algum dia entrar banner de consentimento, os dois snippets passam a
   depender dele — hoje não existe banner e a decisão de não ter um é do dono.

## Por que os eventos são só esses quatro

O funil da vitrine tem seis eventos no GA4. Dois ficaram de fora dos pixels de
propósito: `view_cart` e `remove_from_cart` não têm evento padrão equivalente
nas duas plataformas, e evento fora do padrão não entra em otimização de
campanha — entraria só para engordar relatório. `Purchase` não está aqui
porque acontece na loja (item do dono, acima).

Quem quiser mudar isso mexe primeiro no `EQUIVALE` de
`public/loja/js/ui.js` e na tabela do tracking-plan, no mesmo commit: o portão
cobra os dois lados.
