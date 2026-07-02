# NIMBUS — Prompt pro Claude Cowork: aplicar o REDESIGN v2 na Nuvemshop

Cole no **Claude Cowork** com o painel da Nuvemshop logado. Ele aplica o redesign completo
(CSS v2, logo, banners, home, textos). Os arquivos vêm do GitHub público.

---

```
Você é um agente de navegador. Objetivo: aplicar o redesign v2 da marca NIMBUS na minha loja
Nuvemshop (tema Morelia, painel nimbus40.lojavirtualnuvem.com.br/admin, já logado). Um passo por
vez, esperando cada tela carregar. NUNCA exclua produtos/pedidos; se pedir confirmação destrutiva,
senha ou pagamento, PARE e me pergunte. REGRA DE TEXTO: nunca escreva "troca fácil" em lugar nenhum.
Mantenha um LOG (passo + status).

PASSO 1 — CSS v2 (substituir o antigo)
1. Abra https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/css-nimbus.css e copie TUDO.
2. Painel: Loja online → Layout → Personalizar seu layout atual → "Edição de CSS avançada".
3. APAGUE o CSS antigo do campo, cole o novo, use "Testar CSS" se existir, e salve/publique.
4. Se der erro de validação, remova a primeira linha @import e salve (anote no log).

PASSO 2 — Logo do header
1. Baixe https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/logo-nimbus.png
2. Painel: Loja online → Layout → seção Logo → carregar imagem → selecione o arquivo baixado. Salve.

PASSO 3 — Baixar os banners (todos salvam em Downloads)
- https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/banner-hero-desktop.jpg
- https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/banner-hero-mobile.jpg
- https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/banner-fe.jpg
- https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/banner-design.jpg
- https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/assets/banner-impacto.jpg

PASSO 4 — Montar a home (no editor de layout do Morelia, nesta ordem)
Ritmo: banner grande → uma linha de produtos → banner grande. Configure as seções assim
(crie/reordene/desative conforme necessário):
1. SLIDER PRINCIPAL (1 slide só): imagem desktop = banner-hero-desktop.jpg, mobile =
   banner-hero-mobile.jpg. Título: "Acima de tudo" | Subtítulo: "Streetwear católico premium,
   desenhado no Brasil." | Botão: "Ver coleção" → link pro catálogo/loja toda.
2. BANNERS DE SERVIÇOS (3 itens só texto): "Feito sob demanda no Brasil" | "Pagamento seguro:
   Pix, cartão e boleto" | "10% do lucro doado".
3. PRATELEIRA de produtos: título "Os essenciais" (4 produtos, 1 linha).
4. BANNER COM TEXTO: imagem banner-fe.jpg, texto à esquerda: título "Feito de fé", sub "Cada
   estampa nasce de um símbolo da fé católica brasileira.", botão "Ver as peças" → coleção Relíquia
   (se a coleção não existir como categoria, aponte pro catálogo e anote no log).
5. PRATELEIRA: título "Coleção Relíquia" (4 produtos da categoria correspondente, se existir).
6. BANNER COM TEXTO: imagem banner-design.jpg, título "Traço brasileiro", sub "Linhas inspiradas
   na arquitetura de Niemeyer, do concreto às nuvens.", botão "Ver a coleção Street" → categoria Street.
7. PRATELEIRA: título "Coleção Street" (se não houver produtos suficientes, pule e anote).
8. BANNER COM TEXTO: imagem banner-impacto.jpg, texto à esquerda: título "Vestir também é servir",
   sub "10% do lucro vai para um projeto social. Quem escolhe qual é você, no checkout.", botão
   "Conhecer os projetos" → página Projetos Sociais.
9. NEWSLETTER: título "Estamos só começando", subtítulo "Deixe seu e-mail e saiba dos lançamentos
   em primeira mão. Só o essencial, sem spam.", botão "Quero receber".
10. Desative seções de template vazias que sobrarem. Salve/publique.

PASSO 5 — Barra de anúncio
Texto: 10% do lucro do seu pedido vai para o projeto social que você escolher. Frete grátis acima de R$199.

PASSO 6 — Rodapé
Se houver campo de tagline/descrição no rodapé: "Fé, design e propósito. Acima de tudo."

RELATÓRIO FINAL
Liste: o que aplicou, o que não encontrou (nome exato das seções disponíveis no editor), se o
@import foi removido, e abra loja.nimbuswear.com.br descrevendo a home em 5 linhas (o que aparece,
em que ordem). Tire um screenshot final se conseguir.
```
