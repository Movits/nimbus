# NIMBUS — Plataforma da loja (decisão + roteiro)

Decisão (jun/2026): **loja na Nuvemshop** (motor de e-commerce) + **app YouDraw** (produção POD) +
**marketplace da YouDraw** (canal extra). A **landing R3F** (GitHub Pages) continua como home da
marca e linka pro "Comprar". Não recriamos o site.

## Arquitetura
```
Landing R3F (home/marca, GitHub Pages)
   → botão "Comprar"
Loja Nuvemshop  (catálogo, carrinho, checkout, Pix/boleto/frete BR)
   → app YouDraw integrado  (produção sob demanda, ~48h, sem estoque)
+ Marketplace YouDraw  (vitrine extra com tráfego)
```

## Por quê (resumo da pesquisa)
- **Selo de peito consistente + gráfico nas costas = best practice** (não foi atalho): logo de peito
  ~2,5–5 cm + estampa grande nas costas, mantendo elementos coesos e tamanho/posição uniformes; a
  tendência 2025/26 é gráfico grande nas costas + acento sutil no peito.
- **YouDraw só integra via Shopify / Nuvemshop / Yampi.** Não há API pública pra plugar num site
  100% próprio direto. Pra vender com checkout próprio, precisa de uma dessas plataformas.
- **Nuvemshop** escolhida: BR-native, barata, Pix/boleto/frete nativos, integra YouDraw, sem estoque.
  (Shopify ficaria melhor só se fôssemos headless com o site R3F — mais caro/trabalhoso, fica pro
  futuro.)
- **Marketplace YouDraw**: vitrine própria deles com tráfego qualificado — canal extra de graça.

## Checklist (suas ações na Nuvemshop/YouDraw)
1. Criar conta + loja na **Nuvemshop** (pode ficar fechada ao público no começo).
2. Instalar o **app YouDraw** na Nuvemshop e **integrar** (precisa da loja já criada).
3. **Cadastrar os produtos** usando o que já temos:
   - artes/posição: pastas em `designs/prontos/<COLECAO>/mockups/<Produto [peças] [posição]>/`
     (`peito - …` + `costas - …`).
   - nome do produto = nome da pasta (sem os colchetes).
   - descrição = `descrição.txt` dentro da pasta.
   - preço = `precificacao.md` (lembrar do **custo real frente+costas**, ex.: Camiseta R$73,20).
4. Ativar **Pix, boleto e cartão** + regras de **frete** (frete grátis > R$199).
5. **Publicar no marketplace YouDraw** (vitrine extra).
6. Começar enxuto pelos **heroes** (ver curadoria em `produtos-nomes.md`).

## Passo no nosso código (quando a loja tiver URL)
Apontar os CTAs da landing pra Nuvemshop (link externo `STORE_URL`), sem recriar o site:
- `src/data/content.ts` — textos `COPY.*.cta` (hero "Ver coleção", coleção, footer).
- `src/sections/Overlay.tsx` — botões da §5 Coleção, hero e footer (hoje usam placeholder/scroll).
- `src/sections/Topbar.tsx` — botão do topo (hoje `scrollToSection`).
- Trocar `scrollToSection`/placeholder por `<a href={STORE_URL}>` (abre a loja).

## Futuro (opcional)
**Headless com Shopify Storefront API**: o site R3F vira a vitrine real e o checkout vem da Shopify
via API (reaproveita 100% do nosso código). Mais robusto/global, porém mais caro e trabalhoso — só
se a marca crescer e valer a pena.

## Fontes
- Peito/costas: [Printify](https://printify.com/blog/t-shirt-design-placement-guide/) ·
  [Fourthwall](https://fourthwall.com/blog/design-and-logo-placement-on-t-shirts) ·
  [Bonfire](https://www.bonfire.com/blog/logo-placement-guide/)
- YouDraw: [blog/Nuvemshop](https://blog.youdraw.com.br/post/integrar-produtos-personalizados-nuvemshop-2026)
  · [app Nuvemshop](https://www.nuvemshop.com.br/loja-aplicativos-nuvem/youdraw)
  · [app Shopify](https://apps.shopify.com/youdraw) · [youdraw.com.br](https://youdraw.com.br/)
