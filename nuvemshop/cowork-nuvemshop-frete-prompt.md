---
status: concluido
atualizado: 2026-08-12
---

> [!warning] Missão CUMPRIDA em 31/07/2026: a regra de frete grátis a
> partir de R$399,90 foi configurada e testada no painel com CEPs reais
> (Brasília e São Paulo). Não recolar. Fica como registro do procedimento.

# Prompt Cowork: frete grátis R$399,90 no painel da Nuvemshop

Copiar e colar o bloco abaixo numa sessão do Claude Cowork no desktop, com o
navegador logado no painel da Nuvemshop (nimbus40). Escrito em 31/07/2026,
depois que o site passou a anunciar o teto novo (PR #29 do nimbus).

---

Você está numa sessão com o navegador logado no painel da Nuvemshop da NIMBUS
(loja.nimbuswear.com.br, plano Impulso, tema Baires). Sua missão é configurar o
frete grátis novo e conferir três detalhes do funil. O site da vitrine JÁ
anuncia essa regra, então ela precisa valer no checkout hoje.

REGRAS RÍGIDAS, sem exceção:
- Mexa SOMENTE no que está listado abaixo. Não toque em preços, produtos,
  variantes, integração YouDraw, domínio, dados legais nem pagamento.
- NÃO habilite edição de código do tema e NÃO troque o layout (o tema é
  mantido por FTP e congelado; abrir o código por outro caminho quebra isso).
- Antes de cada mudança, tire um print do estado anterior. Se algo não existir
  no plano Impulso, não improvise: registre e siga para o próximo item.

TAREFA 1, a principal: frete grátis a partir de R$399,90.
1. Procure a configuração de frete grátis. Caminhos prováveis, nesta ordem:
   a) Marketing (ou Aumentar vendas) > Promoções > criar promoção do tipo
      "Frete grátis" com valor mínimo de pedido R$399,90, válida para todo o
      Brasil, sem prazo de término;
   b) se não houver, Configurações > Opções de envio (Meios de envio): dentro
      do meio de envio ativo (Correios ou app), o campo "oferecer frete grátis
      a partir de" = 399,90.
2. IMPORTANTE: se existir uma regra antiga de frete grátis (R$199 ou qualquer
   outro valor), atualize ou remova, para não ficarem duas regras somadas.
3. Teste de verdade: monte um carrinho de teste com mais de R$399,90 na loja,
   digite um CEP de Brasília e um de São Paulo e confirme frete R$0,00 nos
   dois. Depois teste um carrinho abaixo de R$399,90 e confirme que o frete é
   cobrado normalmente. NÃO conclua a compra, só chegue até o cálculo do frete.

TAREFA 2: campo de mensagem do pedido.
Confirme que o carrinho/checkout permite o cliente escrever uma observação
(algo como "comentários no carrinho" ou "observações do pedido", geralmente em
Configurações > Opções de checkout). É por esse campo que o cliente escolhe o
projeto social dos 10% e, agora, a arte da Ecobag de brinde. Se estiver
desligado, ligue. Tire print.

TAREFA 3: rodapé da loja (menu).
No menu do rodapé (Loja online > Menus, ou Navegação), aponte os itens de ajuda
para as páginas próprias da vitrine, criando os itens se não existirem:
- Trocas e devoluções -> https://nimbuswear.com.br/loja/trocas/?utm_source=loja&utm_medium=rodape
- Envios e prazos -> https://nimbuswear.com.br/loja/envios/?utm_source=loja&utm_medium=rodape
- Privacidade -> https://nimbuswear.com.br/loja/privacidade/?utm_source=loja&utm_medium=rodape
Não remova outros itens que já existam.

TAREFA 4: barra de anúncio, só conferir.
A barra da loja deve dizer "Conheça as coleções na vitrine Nimbus" e, se for
clicável, apontar para https://nimbuswear.com.br/loja/?utm_source=loja&utm_medium=announcement
. Se o texto for outro, corrija para esse. Não adicione promessa de frete nela.

AO FINAL, me entregue um relatório curto com: o que foi mudado em cada tarefa,
os prints de antes e depois, o resultado dos dois testes de CEP da Tarefa 1 e
qualquer coisa que o plano Impulso não permitiu fazer.

---

## Operacional do brinde (rotina do dono, não é tarefa do Cowork)

Quando as vendas começarem, todo pedido pago de R$399,90 ou mais leva UMA
Ecobag de brinde na produção:
1. Ler a mensagem do pedido no checkout: lá vem a arte que o cliente escolheu
   (e o projeto social dos 10%).
2. Ao lançar o pedido na YouDraw, incluir a Ecobag com essa arte, junto das
   peças compradas, para sair no mesmo pacote.
3. Se o cliente não escreveu a arte, mandar um e-mail rápido perguntando; sem
   resposta em 24h, enviar a NIMBUS Wildstyle (assinatura da casa).
4. Se o pedido já tiver uma Ecobag comprada, o brinde vai do mesmo jeito, de
   arte diferente da comprada.
