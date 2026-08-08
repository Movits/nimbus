---
status: vigente
atualizado: 2026-08-08
---

# Prompt: consertos do painel e do tema (rodada de 08/08)

Cole numa sessão do Claude Cowork no computador, com o painel da loja logado
(`https://loja.nimbuswear.com.br/admin`). Saído das auditorias de copy e UX de
08/08 (brain: `auditoria-copy-site-2026-08` + síntese das quatro lentes).

---

Você vai arrumar configurações do painel da Nuvemshop e, numa segunda parte,
arquivos do tema via FTP. Regras: **nunca finalize compra, não mexa em preço,
não crie nem apague produto ou variante, não peça nem digite senha de FTP** (a
sessão do WinSCP já está salva). No editor de tema, lembre a doutrina de 05/08:
"Publicar alterações" só grava se o formulário estiver sujo; o fluxo é mexer →
Testar CSS quando for CSS → Publicar → conferir o POST 200 na aba Network.

## Parte 1: painel (Personalizar tema e configurações)

1. **Matar a escassez falsa.** As páginas de produto mostram "Atenção, última
   peça!". Procure em Personalizar tema a opção de aviso de estoque
   baixo/última peça e DESLIGUE. Se a única saída for subir estoque de
   variante, PARE e me avise (mexer em variante precisa de ordem do dono).
2. **Matar as promoções fantasma.** Suma com: pop-up/string "Desconto
   exclusivo!", selos "- 0 % OFF" nos cards e "0% de desconto pagando com" na
   página de produto. São sobras do tema Baires sem promoção configurada:
   desative os módulos de promoção/newsletter correspondentes.
3. **Selo "Frete grátis" indevido.** Cards de produto abaixo de R$399,90 exibem
   selo de frete grátis. Confira a configuração de frete grátis (deve valer só
   a partir de R$399,90) e a opção do tema de exibir o selo nos cards; o selo
   só pode aparecer quando a regra vale.
4. **Home da loja não pode ser loja paralela.** Os 3 banners STREET/RELÍQUIA/
   NUVEM da home devem apontar para a vitrine
   (`https://nimbuswear.com.br/loja/c/street/?ref=loja` e equivalentes), e a
   seção "produtos em destaque" deve ser desligada. A loja é só
   carrinho/checkout desde 03/08; a home dela ficou de fora.
5. **Menus com os nomes da vitrine.** No menu e no rodapé: "Sobre" vira
   "Manifesto" apontando para `https://nimbuswear.com.br/loja/manifesto/?ref=loja`;
   "Projetos Sociais" vira "10% do lucro" apontando para
   `https://nimbuswear.com.br/loja/impacto/?ref=loja`. "Contato" fica local
   (é o único formulário).
6. **Nome da loja.** Renomear de "Nimbus" para "NIMBUS" (corrige título da aba,
   og:site_name e o copyright do rodapé de uma vez) e preencher o SEO da home:
   título "NIMBUS | Streetwear católico premium".
7. **Barra de anúncio.** Manter a mensagem que leva à vitrine e acrescentar uma
   segunda rotativa: "Frete grátis e Ecobag de brinde a partir de R$399,90".
8. **Botão "Carrinho" → "Sacola"** no editor de textos do tema (hoje é truque
   de CSS com `font-size:0`, que quebra leitor de tela). Depois de trocar o
   texto de verdade, remova do CSS custom o par `font-size: 0` + `:after`.
9. **SEO errado em 2 produtos.** `/produtos/wildstyle/` é ECOBAG mas o título
   SEO diz "Camiseta"; `/produtos/sao-jorge-vintage1/` é MOLETOM CANGURU e diz
   "Camiseta". Corrigir título e descrição SEO desses dois, e nos demais
   remover fechos de infomercial ("Compre já!", "Garanta já a sua!").
10. **Faixa dos 10%.** Onde diz "10% do lucro destinado a projetos sociais",
    trocar por "10% do lucro doado ao projeto que você escolher" (a escolha do
    cliente é o diferencial; a versão genérica joga isso fora).
11. **SEO das categorias.** `/street/`, `/reliquia/` e `/nuvem/` usam descrição
    automática quebrada ("Compre online STREET por ."). Preencher com os
    resumos da vitrine.
12. **E-mail do rodapé.** O Cloudflare ofusca o e-mail (vira "[email protected]"
    sem JS). Trocar a exibição por texto simples não clicável ou remover,
    confiando na página /contato/.

## Parte 2: FTP (tema Baires, mesmos cuidados do cart.tpl de 02/08)

Transferência sempre **binária**, arquivo extraído por `git show` quando vier
do backup (`nimbus-assets/nuvemshop/tema-baires/`), e backup do arquivo antes.

13. **cart.tpl, estado vazio.** Adicionar botão "Ver as coleções" →
    `https://nimbuswear.com.br/loja/?utm_source=loja&utm_medium=carrinho`, e
    corrigir "aquí" → "aqui" na string de estoque.
14. **cart.tpl, aviso da Ecobag.** O script NIMBUS de 03/08 procura
    `#nimbus-aviso-ecobag` e a div não aparece no HTML servido. Conferir se ela
    existe e renderiza com itens no carrinho; se não, criar junto ao resumo com
    o texto: "Frete grátis garantido. Use o cupom ECOBAG no checkout: uma das
    suas Ecobags sai de graça." Testar com carrinho acima de R$399,90 SEM
    finalizar.
15. **Fontes do tema.** O head carrega Fraunces 400,700; a vitrine usa 300 e
    600. Ajustar o link do Google Fonts para
    `Fraunces:300,400,600,700|Inter:400,600,700`.
16. **Logo na mesma régua.** No CSS custom, alinhar o logo à régua da vitrine:
    154px desktop, 110px mobile.
17. **Rodapé.** Trocar o gradiente de fundo por `background:#dcebfa` (chapado,
    como a vitrine) e conferir se a linha legal ganhou o CNPJ depois do item 6
    (se não, acrescentar "CNPJ 53.977.834/0001-18 · Brasília DF" no bloco de
    dados de contato do painel).

## Parte 3: decisões do dono já tomadas (08/08)

18. **Despublicar os 4 produtos legados** do catálogo antigo, por ordem
    explícita do dono (a produção vai migrar para a IzzyPrint; eles não voltam):
    `/produtos/sao-jorge-vintage/` (São Jorge Vintage | Blusão Moletom),
    `/produtos/aparecida-barroca/`, `/produtos/azulejo/` e
    `/produtos/sao-miguel-celeste/` (os SEM sufixo numérico; os com sufixo,
    tipo `sao-jorge-vintage1`, são os atuais e FICAM). Despublicar/ocultar,
    NÃO apagar: o histórico fica. Confira depois que a busca da loja não os
    devolve mais.
19. **Remover o telefone** dos dados de contato do painel (rodapé e página
    /contato/). Decisão do dono: o canal é e-mail e a página de contato; um
    chat de atendimento será avaliado à parte.
20. **Selo "powered by" volta a aparecer**: remover do CSS custom a regra
    `.powered-by-logo { display: none !important }`. Ocultar o selo pode ferir
    os termos do plano Impulso, e sobre a faixa navy ele fica discreto.

Ao final, me traga: o que conseguiu fazer, o que o tema não permitiu, e um
print de cada mudança visível (home, PDP, carrinho).
