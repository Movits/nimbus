# NIMBUS — Plataforma da loja (decisão + roteiro)

Decisão (jun/2026): **loja na Nuvemshop** (motor de e-commerce) + **app YouDraw** (produção POD) +
**marketplace da YouDraw** (canal extra). A **landing R3F** (GitHub Pages) continua como home da
marca e linka pro "Comprar". Não recriamos o site.

## Arquitetura
```
Landing R3F (home/marca, GitHub Pages)
   → botão "Comprar"
Loja Nuvemshop  (catálogo, carrinho, checkout, Pix/boleto/frete BR)
   → app YouDraw integrado  (produção sob demanda, ~1–3 dias úteis, sem estoque)
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

## Impulso (jun/2026): o que muda
Subimos pro plano **Impulso**, que libera editar **HTML/CSS/JS do tema**. Importante: o tema da Nuvemshop é
**server-side em Twig (`.tpl`)** — **não** hospeda nosso app React/Three.js. Ou seja: o **site 3D continua
separado** (home da marca no GitHub Pages → "Comprar"); o Impulso serve pra deixar a **loja com a cara da
NIMBUS** (cores, fontes, banners e **seções/HTML/CSS próprios**), aplicando o `marca-kit.md`. Checkout,
pagamento e frete continuam sendo da Nuvemshop + app YouDraw.

## Frete (importante)
- **Quem envia é a YouDraw** (gráficas parceiras em SP): produz, embala e envia **direto ao cliente**. Você
  não envia nada. Exige o **plano pago** da YouDraw (grátis = 3 pedidos manuais).
- **NÃO desabilite todas as formas de envio.** Mantenha **≥1 ativa**, senão o checkout não coleta endereço
  nem cobra frete — e a YouDraw **precisa do endereço** e **cobra de você** um frete (**fixo + adicional, por
  região e por categoria**).
- **Desligue o cálculo dos Correios em tempo real** (não bate com a tabela da YouDraw) e use **"Entrega
  personalizada" por região** com valores fixos espelhando a YouDraw. Antes, **confira no app YouDraw** se o
  frete já entra automático no checkout. Passo a passo e tabela: `frete-youdraw-nuvemshop.md`.
- **Frete grátis > R$199**: feito na **própria entrega personalizada** (Custo Grátis + mínimo R$199) — passo a
  passo em `frete-youdraw-nuvemshop.md`. Você assume o custo; cabe na margem.

## Domínio (DNS)
Domínio **nimbuswear.com.br** (comprado na GoDaddy). Pra ligar na loja:
- Na Nuvemshop: `Configurações > Domínios > "Conectar um domínio existente"` → digitar `nimbuswear.com.br`.
- No DNS do GoDaddy: **2 registros A** (`@` → `185.133.35.21` e `@` → `185.133.35.22`) + **1 CNAME**
  (`www` → `nimbus40.lojavirtualnuvem.com.br`). Apagar registros A/CNAME de estacionamento pra não conflitar;
  não mexer nos NS.
- SSL (HTTPS) é **grátis e automático** na Nuvemshop. Propagação: até 48h. Definir `nimbuswear.com.br` como principal.

## Integração YouDraw — venda → envio automático
Pra a YouDraw receber o pedido e enviar sozinha, tudo isto tem que estar ok:
1. **Plano pago** da YouDraw ativo (grátis = 3 pedidos manuais, sem automação).
2. Integração **conectada/autorizada** (YouDraw → Integrações → Nuvemshop → autorizar).
3. **Produtos vinculados** YouDraw↔Nuvemshop (arte, valores, frete, descrição no painel da YouDraw).
4. **Pagamento aprovado** dispara a produção → YouDraw produz e envia → status/rastreio voltam pra Nuvemshop.

Faça um **pedido de teste** antes de divulgar. Lembrete: **NF, atendimento e trocas** continuam sendo seus.

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

## Fontes
- Peito/costas: [Printify](https://printify.com/blog/t-shirt-design-placement-guide/) ·
  [Fourthwall](https://fourthwall.com/blog/design-and-logo-placement-on-t-shirts) ·
  [Bonfire](https://www.bonfire.com/blog/logo-placement-guide/)
- YouDraw: [blog/Nuvemshop](https://blog.youdraw.com.br/post/integrar-produtos-personalizados-nuvemshop-2026)
  · [app Nuvemshop](https://www.nuvemshop.com.br/loja-aplicativos-nuvem/youdraw)
  · [app Shopify](https://apps.shopify.com/youdraw) · [youdraw.com.br](https://youdraw.com.br/)
