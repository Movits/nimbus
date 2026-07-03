# NIMBUS — Prompt pro Claude Cowork: aplicar a Loja v3 (casar com o artifact)

Cole no **Claude Cowork** com o painel da Nuvemshop logado. Arquivos vêm do GitHub público.

---

```
Você é um agente de navegador. Objetivo: deixar minha loja Nuvemshop (tema Morelia, painel
nimbus40.lojavirtualnuvem.com.br/admin, já logado) o mais perto possível do design da marca NIMBUS
(claro, arejado, céu/nuvens). Um passo por vez, esperando cada tela carregar. NUNCA exclua
produtos/pedidos; se pedir confirmação destrutiva, senha ou pagamento, PARE e pergunte. NUNCA
escreva "troca fácil". Mantenha um LOG (passo + status).

PASSO 1 — CSS v3 (substituir o antigo)
1. Abra https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/css-nimbus.css e copie TUDO.
2. Loja online → Layout → Personalizar → "Edição de CSS avançada". APAGUE o CSS atual, cole o novo,
   "Testar CSS" se houver, salve/publique. Se der erro, remova a 1a linha @import e salve (anote).

PASSO 2 — Logo
Baixe https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/logo-nimbus.png e suba em
Loja online → Layout → Logo.

PASSO 3 — Baixar imagens (salvam em Downloads)
- .../nuvemshop/assets/banner-hero-desktop.jpg
- .../nuvemshop/assets/banner-hero-mobile.jpg
- .../nuvemshop/assets/tile-street.jpg
- .../nuvemshop/assets/tile-reliquia.jpg
- .../nuvemshop/assets/tile-nuvem.jpg
- .../nuvemshop/assets/banner-fe.jpg
- .../nuvemshop/assets/banner-impacto.jpg
(prefixo: https://raw.githubusercontent.com/Movits/nimbus/main )

PASSO 4 — Montar a home (editor de layout do Morelia), NESTA ordem:
1. SLIDER (1 slide): desktop = banner-hero-desktop.jpg, mobile = banner-hero-mobile.jpg.
   Título "A coleção de estreia" | Sub "Peças de fé, desenhadas no Brasil." | Botão "Ver coleção" (catálogo).
2. SERVIÇOS (3 textos): "Feito no Brasil" | "Pix, cartão e boleto" | "10% do lucro doado".
3. TILES / banners lado a lado (3): tile-street.jpg título "Street" (→ categoria Street) |
   tile-reliquia.jpg título "Relíquia" (→ categoria Relíquia) | tile-nuvem.jpg título "Nuvem" (→ categoria Nuvem).
   Se alguma categoria não existir ainda, aponte pro catálogo e anote no log.
4. PRATELEIRA título "Os essenciais" (4 produtos).
5. BANNER COM TEXTO banner-fe.jpg, texto à esquerda: "Feito de fé" / "Cada estampa nasce de um
   símbolo da fé católica brasileira." / botão "Ver as peças" (→ Relíquia).
6. PRATELEIRA título "Coleção Relíquia".
7. BANNER COM TEXTO banner-impacto.jpg, esquerda: "Vestir também é servir" / "10% do lucro vai para
   um projeto social. Quem escolhe qual é você, no checkout." / botão "Conhecer os projetos" (→ página Projetos Sociais).
8. PRATELEIRA título "Coleção Street".
9. Desative a newsletter e quaisquer seções de template vazias. Salve/publique.

PASSO 5 — Barra de anúncio
"10% do lucro do seu pedido vai para o projeto social que você escolher. Frete grátis acima de R$199."

PASSO 6 — Rodapé (se editável): tagline "Fé, design e propósito. Acima de tudo." e, se houver colunas
de links, organizar em Loja / A marca / Ajuda.

RELATÓRIO FINAL
Liste o que aplicou, os nomes EXATOS dos módulos/seções que o editor do Morelia oferece (pra eu
ajustar se algum não bater), se o @import foi removido, e abra loja.nimbuswear.com.br descrevendo a
home em 6 linhas + um screenshot se conseguir.
```
