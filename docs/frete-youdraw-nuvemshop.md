# NIMBUS — Frete: YouDraw → Nuvemshop (entrega personalizada por região)

Quem envia é a **YouDraw** (produz, embala e envia direto ao cliente). A YouDraw **cobra de você** um frete
**fixo (1ª unidade) + adicional (cada unidade extra)**, que varia **por macro-região do Brasil** e **por
categoria de produto**. O objetivo aqui é o checkout da Nuvemshop cobrar do cliente ~o mesmo que a YouDraw
te cobra — pra você não absorver o frete.

## Entenda primeiro: "entrega personalizada" ≠ Correios calculado
Na Nuvemshop existem dois tipos de frete, e a diferença importa:
- **Correios calculado (tempo real):** conecta no *seu* contrato dos Correios, calcula por CEP e **assume que
  VOCÊ envia** (você imprime etiqueta / o Correios coleta no seu endereço e **você paga o Correios**). ❌ Não
  use — quem envia é a YouDraw.
- **Entrega personalizada:** é só **um valor fixo que você digita**. Não conecta em conta nenhuma dos Correios,
  **não gera etiqueta, não dispara coleta, não cobra frete de você**. É apenas o número que o cliente paga no
  checkout. ✅ É esse que usamos. O único frete que você paga é o da **YouDraw** (fixo + adicional); o frete que
  o cliente paga cobre esse custo. Ninguém dos Correios vai à sua casa nem te cobra "a mais".

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
⚠️ Na sua conta **não existe** a tela "Descontos > Frete Grátis", e "Descontos > Promoções" **não tem** tipo
"frete grátis". Como você usa entrega personalizada, faça o frete grátis **na própria configuração de envio**:
1. `Configurações > Meios de envio` → **"+ Adicionar entrega personalizada"**.
2. **Nome:** `Frete grátis acima de R$199`. **Custo:** **Grátis**.
3. **Condição "Valor total da compra":** mínimo **R$199** (máximo em branco). Zona: todo o Brasil.
4. Pra não mostrar duas opções ao mesmo tempo: na entrega personalizada **paga**, coloque **máximo R$198,99**;
   na **grátis**, mínimo R$199. Abaixo de R$199 aparece só a paga; a partir de R$199, só a grátis.

É **automático, sem cupom/código** — o cliente não digita nada.
- Você **assume** o custo do frete grátis (a YouDraw te cobra mesmo assim) — por isso R$199 "cabe na margem".
- ⚠️ Se um cupom (ex.: **ESTREIA15**) derrubar o subtotal **abaixo de R$199**, o frete grátis **deixa de valer**.

## Manutenção
- Revisar os valores **sempre que a YouDraw mudar** a tabela (senão você absorve a diferença).
- Testar de ponta a ponta: carrinho por região + acima/abaixo de R$199.

## Fontes
- YouDraw frete: `youdraw.tawk.help` — "Como funciona o frete na YouDraw"
- Nuvemshop entrega personalizada: `atendimento.nuvemshop.com.br` — "Como configurar um frete personalizado"
- Nuvemshop frete grátis: `atendimento.nuvemshop.com.br` — "Como configurar um frete grátis na minha loja"
