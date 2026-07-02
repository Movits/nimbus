# NIMBUS — Prompt pro Claude Cowork: aplicar o kit da marca na Nuvemshop

Cole o bloco abaixo no **Claude Cowork** com o **painel da Nuvemshop já logado** na sessão.
Ele aplica: CSS da marca, 2 páginas institucionais, campo do projeto social no checkout,
favicon e barra de anúncio — pegando os arquivos direto do GitHub público.

---

```
Você é um agente de navegador. Objetivo: aplicar o kit de identidade visual da marca NIMBUS na
minha loja Nuvemshop (tema Morelia, plano Impulso). Já estou logado no painel
(nimbus40.lojavirtualnuvem.com.br/admin). Trabalhe um passo por vez, esperando cada tela carregar.

REGRAS
- NUNCA exclua nada, não mexa em produtos, pedidos ou pagamentos.
- Se algo pedir confirmação destrutiva, senha ou pagamento, PARE e me pergunte.
- Se uma opção não existir onde indico, procure nome parecido no menu e me avise no log.
- Mantenha um LOG: passo + status (feito / erro X / não encontrei).

PASSO 1 — CSS da marca
1. Abra em outra aba: https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/css-nimbus.css
   e copie TODO o conteúdo (Ctrl+A, Ctrl+C).
2. No painel: Loja online → Layout → "Personalizar seu layout atual" → role até
   "Edição de CSS avançada" (fica no fim do menu lateral de personalização).
3. Cole o CSS no campo. Se houver botão "Testar CSS", clique e confira que não dá erro; depois
   SALVE/PUBLIQUE.
4. Se der erro de validação, apague a PRIMEIRA linha que começa com @import e tente salvar de novo
   (registre no log que o @import foi removido).

PASSO 2 — Página "Projetos Sociais"
1. Abra: https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/pagina-projetos-sociais.html
   e copie todo o conteúdo.
2. Painel: Loja online → Páginas → Criar página. Título: "Projetos Sociais".
3. No editor de texto, mude para o modo de código-fonte/HTML (ícone < > ou "Ver código fonte") e
   cole o HTML. Salve/publique a página. Anote a URL final da página no log.

PASSO 3 — Página "Sobre a NIMBUS"
1. Abra: https://raw.githubusercontent.com/Movits/nimbus/main/nuvemshop/pagina-sobre.html e copie tudo.
2. Crie a página "Sobre a NIMBUS" do mesmo jeito (modo HTML). Antes de salvar, encontre no HTML o
   link <a href="/pagina/projetos-sociais"> e troque o href pela URL REAL da página criada no
   PASSO 2. Salve/publique.

PASSO 4 — Menu
1. Painel: Loja online → Menus (ou Navegação). No menu principal, adicione as duas páginas:
   "Projetos Sociais" e "Sobre a NIMBUS". Salve.

PASSO 5 — Campo do projeto social no checkout
1. Painel: Configurações → Opções de checkout.
2. Habilite o campo "Mensagem do cliente" (observações na finalização da compra).
3. Nomeie o campo EXATAMENTE assim:
   Qual projeto recebe 10% do lucro? Fazenda da Esperança, Cáritas Brasileira, Pequeno Cotolengo ou escreva outro
4. Deixe como OPCIONAL (não obrigatório). Salve.

PASSO 6 — Favicon
1. Baixe: https://raw.githubusercontent.com/Movits/nimbus/main/public/img/favicon-nuvemshop-130.png
   (o navegador salva em Downloads).
2. Painel: Loja online → Layout → seção "Favicon" → Carregar imagem → selecione o arquivo baixado.
   Salve.

PASSO 7 — Barra de anúncio
1. Ainda em Loja online → Layout → Personalizar: encontre a barra de anúncio (announcement bar)
   do tema Morelia.
2. Texto: 10% do lucro do seu pedido vai para o projeto social que você escolher. Frete grátis acima de R$199.
3. Salve/publique.

RELATÓRIO FINAL
Me entregue o log completo: o que foi aplicado com sucesso, a URL das 2 páginas criadas, se o
@import do CSS precisou ser removido, e qualquer coisa que você NÃO encontrou pra eu resolver.
Depois abra a loja (loja.nimbuswear.com.br) e descreva em 3 linhas como ficou o visual.
```
