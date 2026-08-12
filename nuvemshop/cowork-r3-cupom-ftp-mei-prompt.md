---
status: concluido
atualizado: 2026-08-12
---

> [!warning] Missão CUMPRIDA: cupom ECOBAG criado e validado no painel em
> 31/07 (testado nos dois lados do mínimo), cart.tpl subiu por FTP e o
> teste 4 do funil passou em 03/08, DASN-SIMEI 2025 transmitida em 01/08.
> Recolar este bloco tentaria refazer tudo isso. Fica como registro.

# Prompt Cowork r3: cupom da Ecobag, FTP do cart.tpl e MEI (PGMEI + DASN)

Sessão no PC de casa, dono presente para captcha, senha do FTP e confirmações.
Escrito em 31/07/2026.

---

Você está numa sessão no computador de casa do Roberto, com navegador logado no
painel da Nuvemshop, no GitHub (conta Movits) e no gov.br. Quatro frentes:
cupom da Ecobag, upload de UM arquivo do tema por FTP, levantamento do DAS no
PGMEI e a declaração anual atrasada. O Roberto está presente para resolver
captcha e confirmar valores.

REGRAS RÍGIDAS:
- NUNCA pague nada, NUNCA conclua compra, NUNCA transmita declaração sem o
  Roberto confirmar o valor na hora, em voz própria.
- A senha do FTP o Roberto digita ou cola; não guarde em arquivo nenhum.
- Print de antes e depois de toda mudança.

TAREFA 1: cupom da Ecobag de brinde.
No painel da Nuvemshop, procure Cupons de desconto (Marketing ou Aumentar
vendas). Crie: código ECOBAG, desconto de VALOR FIXO R$49,90, valor mínimo de
compra R$449,80, sem data de validade, um uso por pedido (usos ilimitados no
total). Se existir a opção de restringir a produtos ou categorias, restrinja ao
produto Ecobag (é o que impede usar o cupom sem ecobag no carrinho); se não
existir, registre no relatório. Teste no carrinho da loja SEM concluir compra:
(a) 2 oversized + 1 ecobag (R$409,70) com o cupom: deve RECUSAR pelo mínimo;
(b) adicione a segunda ecobag (R$459,60) e aplique: deve aceitar e descontar
R$49,90. Desfaça o carrinho de teste ao final.

TAREFA 2: subir templates/cart.tpl para o tema por FTP.
1. No GitHub, abra o repositório privado Movits/nimbus-assets, caminho
   nuvemshop/tema-baires/2026-07-30-funil-editado/templates/cart.tpl, e baixe o
   arquivo cru (botão Raw > salvar).
2. Abra o WinSCP (se não estiver instalado, baixe de winscp.net e instale).
   Conexão: protocolo FTP, criptografia "TLS/SSL Explícita", host
   ftp.nuvemshop.com.br, porta 21, usuário nimbus40. A senha, peça ao Roberto
   (está no painel da Nuvemshop, em onde ele gerou a nova ontem).
3. No servidor, entre na pasta templates/ do tema e envie o cart.tpl baixado,
   substituindo o existente. NÃO toque em nenhum outro arquivo.
4. Teste de ponta a ponta do sync da sacola:
   a. Abra https://nimbuswear.com.br/loja/, adicione 2 produtos pela vitrine
      (escolha tamanho e clique em Adicionar à sacola) e confira o número no
      badge da Sacola.
   b. Abra https://loja.nimbuswear.com.br/comprar/ e confirme no DevTools
      (F12, console: document.cookie) que existe um cookie nimbus_sacola_loja.
   c. REMOVA um item no carrinho da loja, volte para a vitrine (botão voltar)
      e confirme que o badge caiu junto e a gaveta da Sacola reflete o item
      removido.
   d. Esvazie o carrinho de teste ao final.

TAREFA 3: PGMEI, o levantamento do DAS (Roberto resolve o captcha).
No PGMEI (Programa Gerador do DAS do MEI, no portal do Simples Nacional), com
o CNPJ 53.977.834/0001-18: em "Emitir Guia de Pagamento (DAS)", liste TODOS os
períodos em aberto desde 02/2024 até hoje, com valor original e valor
atualizado (juros e multa). Some o total. Gere as guias em PDF (consolidada,
se o sistema oferecer) e salve numa pasta para o Roberto pagar depois. NÃO
PAGUE. Referência do esperado: o recibo da DASN 2024 mostra 02 a 12/2024
apurados em R$75,60/mês e nada pago; 2025 e 2026 devem aparecer também.

TAREFA 4: DASN-SIMEI de 2025, em atraso.
A declaração do ano-calendário 2025 venceu em 31/05/2026 e não consta como
entregue. Pergunte ao Roberto o faturamento de 2025 do MEI (se não houve
receita, é zero). SÓ com a confirmação dele na hora, transmita a declaração e
salve o recibo em PDF; a multa (MAED) virá com a transmissão, salve a guia
também mas NÃO pague. Sem confirmação dele, apenas registre no relatório.

AO FINAL, relatório com: cupom criado e os dois testes do carrinho, upload do
cart.tpl + resultado do teste de sync (item removido na loja refletiu na
vitrine?), tabela dos DAS em aberto com total atualizado, PDFs salvos, e o
status da DASN 2025.
