---
status: vigente
atualizado: 2026-11-25
---

# servidor/ — o Worker da loja própria

Fase 3 do plano aprovado em 13/11/2026
([`docs/decisoes/2026-11-13-loja-propria-plano.md`](../docs/decisoes/2026-11-13-loja-propria-plano.md),
seções 3 e 4). **Ainda não está ligado em lugar nenhum:** não há conta
Cloudflare nem credencial do Mercado Pago. A loja segue fechada
(`VITRINE_ABERTA = false`), e nenhuma página do site chama estas rotas.

## O que tem aqui

| Arquivo | O que faz |
|---|---|
| `src/index.js` | entrada do Worker; junta o servidor ao `public/loja/catalogo.json` do mesmo deploy |
| `src/app.js` | as rotas, o aviso de pagamento, a conciliação e a desistência |
| `src/pedido.js` | confere o formulário e monta o resumo (função pura) |
| `src/catalogo.js` | índice SKU → preço em centavos |
| `src/frete.js` | a regra de frete de 28/10 e as faixas de CEP por estado |
| `src/mercadopago.js` | preferência, leitura e busca de pagamento, assinatura do aviso |
| `src/banco.js` | o D1 (pedidos, itens, eventos, avisos) |
| `src/email.js` | os e-mails do pedido pelo Resend (**textos em rascunho**, passo 11) |
| `migrations/0001_inicial.sql` | o esquema do banco |
| `teste/loja-teste.mjs` | o portão `npm run loja:teste` |
| `../wrangler.jsonc` | a configuração do Worker, com dois campos a preencher quando a conta existir |

## Rotas

| Rota | Faz |
|---|---|
| `POST /api/checkout` | recebe SKU, quantidade, contato, endereço e projeto; refaz preço e frete; cria o pagamento no Mercado Pago; grava o pedido; devolve o resumo e o link de pagar |
| `POST /api/webhook/mercadopago` | confere a assinatura, lê o pagamento na API (não confia no aviso) e atualiza o pedido |
| `POST /api/pedido` | consulta do pedido com código e token |
| `POST /api/pedido/desistir` | o botão "Quero desistir" |
| cron `17 * * * *` | confere na API os pedidos sem aviso há mais de 1 hora; apaga os não pagos com mais de 30 dias |

## Onde o código saiu do plano, e por quê

- **A consulta do pedido é `POST`, não `GET`.** O link do e-mail leva o token
  depois do `#` (`/loja/pedido/#NB-XXXX-XXXX.token`), que o navegador não manda
  ao servidor; a página lê e manda no corpo. Assim o token não fica em URL nem
  em log.
- **A preferência não leva `notification_url`.** O endereço do aviso é
  cadastrado no painel do Mercado Pago ("Suas integrações"), onde nasce o
  segredo da assinatura; aviso sem assinatura válida é recusado. O aviso no
  formato antigo (`?topic=`) recebe 200 sem efeito. O que escapar, a
  conciliação de hora em hora pega.
- **O limite por IP usa o próprio banco**: até 5 pedidos por hora por IP,
  guardado como HMAC com `SAL_IP`, nunca o IP. O binding de rate limit da
  Cloudflare não diz se vale no plano grátis.
- **Envio repetido do formulário**: a página manda uma `chave` aleatória por
  tentativa. A mesma chave devolve o pedido já criado; a mesma chave com outra
  sacola é recusada (409).
- **CEP de 78900-000 a 78999-999 é recusado.** As duas fontes do plano
  (Wikipedia e geobr) deixam esse buraco; conferir na Busca Faixa de CEP dos
  Correios junto com as outras faixas.

## Segredos (só no cofre do Worker)

`wrangler secret put <NOME>`, nunca no repositório. O portão
`npm run loja:segredos` procura o formato dessas chaves em todo arquivo
versionado.

| Nome | O que é | Passo do plano |
|---|---|---|
| `MP_ACCESS_TOKEN` | token do Mercado Pago (de teste primeiro) | 4, depois 12 |
| `MP_WEBHOOK_SECRET` | segredo da assinatura, do painel "Suas integrações" | 4 |
| `RESEND_API_KEY` | envio dos e-mails | 8 |
| `TURNSTILE_SECRET` | antirrobô do formulário | 2 (conta Cloudflare) |
| `SAL_IP` | texto aleatório longo, para o HMAC do IP | 2 |

Em `wrangler dev`, os segredos locais ficam em `.dev.vars` (gitignorado). Para
o Turnstile em teste, a Cloudflare publica o segredo que sempre passa:
`1x0000000000000000000000000000000AA`.

## Para ligar no `workers.dev` (fase 3, depois dos passos 2 e 4)

1. `npm i -D wrangler` e `npx wrangler login` na conta do dono.
2. ~~`npx wrangler d1 create nimbus-pedidos`~~: **feito em 25/11 pelo
   painel**; o `database_id` já está no `wrangler.jsonc`. O banco está vazio.
3. `npx wrangler d1 migrations apply nimbus-pedidos --remote`. Só pelo
   wrangler: ele registra a migração na tabela `d1_migrations`; colar o SQL no
   console do painel faria o wrangler tentar de novo e falhar.
4. Os segredos da tabela acima, com as credenciais **de teste** do Mercado Pago.
5. `npm run build` e `npx wrangler deploy`; copiar o endereço `*.workers.dev`
   para `URL_BASE`.
6. No painel do Mercado Pago, modo de teste: cadastrar
   `<URL_BASE>/api/webhook/mercadopago`, evento "Pagamentos", e guardar o
   segredo gerado em `MP_WEBHOOK_SECRET`.
7. Rodar os casos da fase 6 com cartões e contas de teste.

## Como testar

`npm run loja:teste` roda o servidor inteiro no Node, sem conta nem rede: o D1
vira SQLite em memória (`node:sqlite`, Node 22.13 ou mais novo) com a mesma
migração, e o Mercado Pago, o Turnstile e o Resend são simulados. Entra no
`vitrine:portoes` e no CI. O que ele **não** prova: o comportamento real da API
do Mercado Pago e do D1. Isso é a fase 6, no modo de teste do gateway.
