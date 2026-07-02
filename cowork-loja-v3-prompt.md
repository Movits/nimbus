# NIMBUS — Prompt pro Claude Cowork: aplicar o REDESIGN v3 na Nuvemshop

Cole no **Claude Cowork** com o painel da Nuvemshop logado. Aplica o redesign v3 (site claro,
sem newsletter, hero curto, tiles de coleção, rodapé claro). Os arquivos vêm do GitHub público.

---

```
Você é um agente de navegador. Objetivo: aplicar o redesign v3 da marca NIMBUS na minha loja
Nuvemshop (tema Morelia, painel nimbus40.lojavirtualnuvem.com.br/admin, já logado). Um passo por
vez, esperando cada tela carregar. NUNCA exclua produtos/pedidos; se pedir confirmação destrutiva,
senha ou pagamento, PARE e me pergunte. REGRA DE TEXTO: nunca escreva "troca fácil" em lugar nenhum.
Mantenha um LOG (passo + status).

PASSO 1 — CSS v3 (substituir o antigo INTEIRO)
1. Abra https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/css-nimbus.css e copie TUDO.
2. Painel: Loja online → Layout → Personalizar seu layout atual → "Edição de CSS avançada".
3. APAGUE o CSS antigo do campo, cole o novo, use "Testar CSS" se existir, e salve/publique.
4. Se der erro de validação, NÃO remova nenhuma linha (as @font-face são essenciais) — anote o
   erro exato no log, pule este passo e continue; o dono resolve depois.

PASSO 2 — Baixar as imagens novas (todas salvam em Downloads)
- https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/banner-hero-desktop.jpg
- https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/banner-hero-mobile.jpg
- https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/tile-street.jpg
- https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/tile-reliquia.jpg
- https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/tile-nuvem.jpg
- https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/banner-fe.jpg
- https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/banner-impacto.jpg

PASSO 3 — Reordenar/configurar a home (editor de layout do Morelia, nesta ordem)
1. SLIDER PRINCIPAL (1 slide por enquanto): desktop = banner-hero-desktop.jpg, mobile =
   banner-hero-mobile.jpg. Título: "A coleção de estreia" | Subtítulo: "Peças de fé, desenhadas
   no Brasil." | Botão: "Ver coleção" → catálogo/loja toda. Alinhamento do texto: ESQUERDA.
   Se o slider tiver opção de troca automática, ative com velocidade ~3s (preparo pro carrossel
   lifestyle que entra depois).
1b. CABEÇALHO: em Loja online → Layout → Cabeçalho, posicione o LOGO À ESQUERDA (se houver a
   opção). A busca fica ao lado do logo.
2. BANNERS DE SERVIÇOS (3 itens só texto): "Feito no Brasil" | "Pix, cartão e boleto" |
   "10% do lucro doado". REGRA: nunca escreva "sob demanda" em nenhum texto da loja.
3. SEÇÃO DE BANNERS/CATEGORIAS com 3 imagens lado a lado (tiles das coleções):
   tile-street.jpg → categoria/coleção Street | tile-reliquia.jpg → Relíquia | tile-nuvem.jpg →
   Nuvem. NÃO escreva título nem texto na seção (os títulos já estão nas imagens). Se as
   categorias não existirem, aponte pro catálogo e anote no log.
4. PRATELEIRA: título "Os essenciais" (4 produtos, 1 linha, misturando coleções).
5. BANNER COM TEXTO: imagem banner-fe.jpg, texto à ESQUERDA: título "Feito de fé", sub "Cada
   estampa nasce de um símbolo da fé católica brasileira.", botão "Ver as peças" → coleção
   Relíquia (se não existir, catálogo + log).
6. PRATELEIRA: título "Coleção Relíquia" (4 produtos da categoria, se existir).
7. BANNER COM TEXTO: imagem banner-impacto.jpg, texto à ESQUERDA: título "Vestir também é
   servir", sub "10% do lucro vai para um projeto social. Quem escolhe qual é você, no
   checkout.", botão "Conhecer os projetos" → página Projetos Sociais.
8. PRATELEIRA: título "Coleção Street" (se não houver produtos suficientes, pule e anote).
9. NEWSLETTER: DESATIVE/REMOVA a seção de newsletter da home E o campo de newsletter do rodapé
   (procure nas configurações do rodapé no editor). A marca NÃO usa newsletter.
10. Desative seções de template vazias que sobrarem. Salve/publique.

PASSO 4 — Barra de anúncio
Texto: 10% do lucro do seu pedido vai para o projeto social que você escolher. Frete grátis acima de R$199.

PASSO 5 — Rodapé
Se houver campo de tagline/descrição: "Fé, design e propósito. Acima de tudo."

RELATÓRIO FINAL
Liste: o que aplicou, o que não encontrou (nome exato das seções disponíveis no editor), qualquer
erro do CSS. Depois abra loja.nimbuswear.com.br e tire SCREENSHOTS: home desktop, home mobile
(ou janela estreita), uma página de produto e uma página de categoria — e descreva a home em 5
linhas (o que aparece, em que ordem).
```
