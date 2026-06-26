# NIMBUS — Frete: YouDraw → Nuvemshop (entrega personalizada por região)

Quem envia é a **YouDraw** (produz, embala e envia direto ao cliente). A YouDraw **cobra de você** um frete
**fixo (1ª unidade) + adicional (cada unidade extra)**, que varia **por macro-região do Brasil** e **por
categoria de produto**. O objetivo aqui é o checkout da Nuvemshop cobrar do cliente ~o mesmo que a YouDraw
te cobra — pra você não absorver o frete.

## Passo 0 — conferir no app YouDraw (faça isso primeiro)
No painel/app da YouDraw, veja se o frete já é **injetado automaticamente** no checkout da Nuvemshop:
- **Se sim:** você não precisa cadastrar zonas manualmente — só **valide** os valores num pedido de teste.
- **Se não:** replique a tabela abaixo como **entrega personalizada** na Nuvemshop.

(A evidência indica que normalmente é manual por zona na Nuvemshop, mas confirme na sua conta.)

## Passo 1 — pegar a tabela atual da YouDraw
Na Central de Ajuda/painel da YouDraw ("Como funciona o frete"), anote **frete fixo** e **frete adicional**
por **região × categoria**. Os valores **mudam com o tempo** — sempre use a tabela vigente.

> Exemplo **ilustrativo** (não use como verdade): Camiseta básica → Sudeste/SP ≈ **R$13,95 fixo + R$4,75
> adicional**. Outras regiões e categorias têm valores diferentes.

### Planilha pra preencher (fixo / adicional por região)
| Categoria | Norte | Nordeste | Centro-Oeste | Sudeste | Sul |
|---|---|---|---|---|---|
| Camiseta Premium |  /  |  /  |  /  |  /  |  /  |
| Oversized Premium |  /  |  /  |  /  |  /  |  /  |
| Moletom / Blusão |  /  |  /  |  /  |  /  |  /  |
| Ecobag |  /  |  /  |  /  |  /  |  /  |

> A YouDraw calcula o frete **por categoria dentro do pedido** — um carrinho com camiseta + moletom soma o
> fixo+adicional de cada categoria. Na entrega personalizada da Nuvemshop o frete é por **zona/valor fixo**,
> então use um valor que cubra o caso comum (ex.: a peça mais cara do carrinho) e deixe o **frete grátis >
> R$199** absorver os pedidos maiores.

## Passo 2 — cadastrar na Nuvemshop (entrega personalizada)
1. `Configurações > Meios de envio` → **desativar** os Correios em tempo real (e Loggi/Jadlog se aparecerem).
2. Adicionar **"Entrega personalizada"** e criar **zonas por estado/região** (agrupe os estados em Norte,
   Nordeste, Centro-Oeste, Sudeste, Sul).
3. Em cada zona, lançar o **custo** (use o fixo da sua planilha; se o tema permitir, configure faixas por
   quantidade/produto pra refletir o adicional). **Prazo:** SLA YouDraw (produção ~1–3 dias úteis para peças
   simples / 4–8 para personalizadas) + envio 2–7 dias úteis (mais rápido no Sudeste).

## Passo 3 — frete grátis acima de R$199
`Descontos > Frete Grátis > "+ Configurar frete grátis"` → condição **"Valor total da compra"**, mínimo
**R$199** → selecionar a(s) forma(s) de **entrega personalizada** que recebem o grátis.
- Você **assume** o custo do frete grátis (a YouDraw te cobra mesmo assim) — por isso R$199 "cabe na margem".
- ⚠️ Se um cupom (ex.: **ESTREIA15**) derrubar o subtotal **abaixo de R$199**, o frete grátis **deixa de valer**.

## Manutenção
- Revisar os valores **sempre que a YouDraw mudar** a tabela (senão você absorve a diferença).
- Testar de ponta a ponta: carrinho por região + acima/abaixo de R$199.

## Fontes
- YouDraw frete: `youdraw.tawk.help` — "Como funciona o frete na YouDraw"
- Nuvemshop entrega personalizada: `atendimento.nuvemshop.com.br` — "Como configurar um frete personalizado"
- Nuvemshop frete grátis: `atendimento.nuvemshop.com.br` — "Como configurar um frete grátis na minha loja"
