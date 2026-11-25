---
status: vigente
atualizado: 2026-11-25
aprovacao: rascunho-espera-o-dono
---

# Loja própria: textos legais em rascunho

> [!warning] RASCUNHO. Nada daqui está publicado nem pode ser publicado sem o
> sim do dono (passo 11 do
> [plano de 13/11](2026-11-13-loja-propria-plano.md)). As páginas no ar seguem
> as de hoje até a fase 4, com a loja fechada. Os trechos `[EM ABERTO: ...]`
> esperam uma decisão dele.

Base: plano de 13/11, seção 7 ("Nos textos legais"), com as recomendações
aprovadas em 13/11: Mercado Pago por redirecionamento, Resend, Melhor Envio, e
estorno quando o cliente desiste (decisão 6). Regras de copy do `CLAUDE.md`:
sem travessão e sem as expressões proibidas de 29/07.

## O que ainda falta o dono decidir para estes textos

1. ~~**Endereço do rodapé** (decisão 3 do plano)~~: **decidido em 25/11, o do
   CNPJ.** O Decreto 7.962 (art. 2º, II) pede endereço físico. O texto do
   endereço só entra no `marca.json` no passo 11, como está no cartão do CNPJ:
   este repositório é público, e o endereço não vem para cá antes de ir para o
   site.
2. **Nome empresarial** como está no cartão do CNPJ (o MEI usa o nome do
   titular): vai no rodapé (art. 2º, I).
3. **Para onde a peça devolvida vai**: para a IzzyPrint, de onde saiu, ou para
   o dono. Confirmar com a IzzyPrint o que ela faz com a peça que chega lá.
4. **Prazo fora das capitais.** A primeira versão da finalização não cota o
   CEP (frete por regra fixa, sem API), então a página de envios precisa dizer
   um prazo máximo por região em vez de "aparece no checkout".
5. **Por quanto tempo o pedido pago fica guardado**: 5 anos é o usual; fechar
   com o contador (passo 10).
6. **Resposta automática do e-mail de atendimento** (art. 4º, parágrafo único):
   ligar a resposta automática no Gmail da marca. É configuração da conta: passo
   do dono.

## Rodapé (`src/data/marca.json`, campo `legal`)

Hoje: "© 2026 NIMBUS · CNPJ 53.977.834/0001-18 · Brasília DF".

Proposta:

> © 2026 NIMBUS · [EM ABERTO: nome empresarial] · CNPJ 53.977.834/0001-18 ·
> [endereço do CNPJ, entra no passo 11] · nimbuswearbr@gmail.com

## Selo da loja aberta (`src/data/marca.json`, `seloDoEstado.aberta`)

Hoje: "Compra pelo checkout da Nuvemshop: Pix, cartão e boleto".

Proposta:

> Pagamento na página do Mercado Pago: Pix, cartão em até 12x e boleto

## Privacidade (`/loja/privacidade/`)

Fica igual: o aviso de loja fechada, "Quem responde pelos seus dados", o Google
Analytics, o botão "Quero ser avisado" e "Seus direitos". Muda o resto:

**O que coletamos neste site**

> A sacola vive no seu navegador: guardamos ali os itens que você adicionou e o
> cache das páginas, que deixa as visitas seguintes mais rápidas. Nada disso
> sai do seu aparelho até você finalizar a compra.

(Saem os cookies `nimbus_sacola_alvo` e `nimbus_sacola_loja`, que deixam de
existir com a Nuvemshop.)

**O que pedimos para fazer a compra**

> Para entregar e emitir a nota, a finalização pede o seu nome, e-mail,
> telefone, CPF e endereço de entrega, e o projeto social que recebe os 10%.
> Cada dado tem um uso:
>
> - nome e endereço: a entrega;
> - e-mail: a confirmação do pedido, o link para acompanhar e o rastreio;
> - telefone: o contato da transportadora e o nosso, se algo der errado com o
>   pedido;
> - CPF: a nota fiscal da compra.
>
> Para evitar pedidos feitos por robô, a Cloudflare confere que quem preenche é
> uma pessoa, e guardamos uma marca cifrada do seu endereço de internet (não o
> endereço) para limitar pedidos repetidos.

**Pagamento**

> O pagamento acontece na página do Mercado Pago. O número do cartão é digitado
> lá e nunca passa pela NIMBUS. Do pagamento guardamos só o número da
> transação, o meio (Pix, cartão ou boleto) e a situação.

**Com quem compartilhamos**

> Só com quem precisa para o pedido chegar até você, e nunca para venda:
>
> - Mercado Pago: o seu nome e e-mail, para abrir o pagamento;
> - Cloudflare: hospeda o site e guarda os pedidos;
> - Resend: envia os e-mails do pedido;
> - IzzyPrint: faz a sua peça e recebe os itens do pedido
>   [EM ABERTO: e o endereço, se ela despachar];
> - Melhor Envio e a transportadora: nome, endereço e telefone, para a etiqueta
>   e a entrega;
> - nosso contador: os dados da nota fiscal.
>
> Quando o pagamento é confirmado, registramos a compra no Google Analytics com
> o valor e os itens, sem nome, e-mail ou CPF.

**Por quanto tempo**

> Pedido que não foi pago é apagado em 30 dias. Pedido pago fica guardado pelo
> prazo da lei fiscal, [EM ABERTO: 5 anos, a confirmar com o contador], e
> depois é apagado.

**Seus direitos** (acréscimo ao texto de hoje)

> ... e resolvemos, como manda a LGPD. Os dados de um pedido pago só podem ser
> apagados depois do prazo fiscal; até lá, corrigimos o que estiver errado.

## Trocas e devoluções (`/loja/trocas/`)

Fica igual: defeito em 90 dias e "O problema apareceu depois?". Muda:

**Mudou de ideia? Você tem 7 dias**

> A peça chegou perfeita, mas não era o que você imaginava. Você pode desistir
> da compra em até 7 dias corridos após o recebimento, por qualquer motivo, como
> garante o artigo 49 do Código de Defesa do Consumidor.
>
> O caminho mais rápido é o botão "Quero desistir", na página do seu pedido (o
> link está no e-mail da compra). Se preferir, escreva para
> nimbuswearbr@gmail.com com o número do pedido. A confirmação de que a
> desistência chegou vai para o seu e-mail na hora.
>
> Depois disso, mandamos a etiqueta de devolução, paga pela NIMBUS, e pedimos ao
> Mercado Pago o estorno de tudo o que você pagou, frete incluído. O valor volta
> pelo mesmo meio do pagamento: no Pix, para a conta que pagou; no cartão, na
> fatura, no prazo da operadora.

**Errou o tamanho?**

> O direito de desistir em 7 dias também vale para o tamanho, pelo mesmo botão
> ou pelo mesmo e-mail, com o estorno de tudo o que você pagou, frete incluído.
> Se preferir o tamanho certo no lugar do dinheiro, escreva para o nosso e-mail
> e a gente combina. A tabela de medidas de cada produto ajuda a acertar de
> primeira.

**Como pedir**

> Desistência: o botão "Quero desistir" na página do pedido, ou um e-mail.
> Defeito e troca: um e-mail para nimbuswearbr@gmail.com, com o número do pedido
> no assunto e fotos, se for defeito. Toda mensagem recebe confirmação
> automática na hora, e a resposta de verdade chega em até 5 dias.

O endereço para onde a peça volta vai na etiqueta, não na página
([EM ABERTO: IzzyPrint ou dono]).

## Envios e prazos (`/loja/envios/`)

**Prazos por região**

> - São Paulo, Rio de Janeiro, Belo Horizonte, Brasília e Porto Alegre: até 12
>   dias úteis
> - Salvador: até 13 dias úteis
> - Outras cidades: [EM ABERTO: prazo máximo por região]

**Rastreio**

> Todo pedido segue com código de rastreio, enviado por e-mail assim que a peça
> sai para entrega. Ele aparece também na página do pedido.

**Frete** (no lugar de "Frete grátis" e "Quanto custa o frete", que hoje dizem
outra regra)

> Fora da região Norte, o frete é grátis em qualquer valor.
>
> Na região Norte (Acre, Amapá, Amazonas, Pará, Rondônia, Roraima e Tocantins),
> o frete é R$ 19,90, e grátis a partir de R$ 399,90 em produtos.
>
> O valor do frete aparece na finalização da compra, junto com o total, antes de
> pagar.

## Impacto (`/loja/impacto/`)

Muda só o primeiro passo de "Como funciona":

> Na finalização da compra, você escolhe qual projeto recebe: Fazenda da
> Esperança, Cáritas Brasileira, Pequeno Cotolengo, ou outro que você indicar.

E a frase do topo: "você escolhe no checkout" vira "você escolhe ao finalizar
a compra".

## Resumo antes de pagar (`/loja/finalizar/`, fase 4)

O Decreto 7.962 (art. 2º, IV, e art. 4º, I e II) pede o resumo antes do botão
de pagar. Proposta dos rótulos:

> **Confira antes de pagar**
>
> [itens, quantidade e preço] · Frete: [valor ou "grátis"] · Total: [valor]
>
> Prazo: [o da página de envios para a região do CEP]
>
> Você pode desistir em até 7 dias após receber. [Trocas e devoluções]
>
> [Corrigir a sacola] [Corrigir o endereço] **[Pagar no Mercado Pago]**

## E-mails do pedido

Os textos estão em `servidor/src/email.js`, marcados como rascunho: pedido
recebido, pagamento confirmado, desistência recebida (ao cliente), e os avisos
ao dono. Falta o e-mail de envio com o rastreio, que nasce com o painel
(fase 5).
