---
status: vigente
atualizado: 2026-08-13
---

# Decisões do dono, 13/08/2026: Ecobag, status do pedido e a ordem do lançamento

Quatro decisões dadas no chat, que mudam o plano do conselho r5 (12/08).

## 1. A Ecobag SAI do catálogo, e as promoções dela junto

Com a produção indo para a IzzyPrint, que **não fabrica Ecobag**, o dono
decidiu **remover a Ecobag e toda a mecânica presa a ela**, em vez de manter
um brinde que a produção nova não entrega. A qualidade das peças da IzzyPrint
é o que sustenta a marca; a sacola de brinde deixa de ser argumento.

**O frete grátis continua existindo**, a partir de um valor a definir, mas
**sem brinde de Ecobag**. A mecânica nova (qual valor, qual incentivo no lugar)
ainda vai ser decidida pelo dono.

O que isso desmonta, e precisa ser desfeito com ordem dele, item a item:

- o cupom `ECOBAG` no painel da Nuvemshop (R$49,90 fixos, mínimo R$449,80);
- a régua de frete grátis que hoje calcula "total menos UMA ecobag ≥ R$399,90"
  (vitrine: `ui.js`, `produto.js`, `/envios/`, toast e gaveta);
- o texto do campo "Mensagem do cliente" no checkout, que hoje pede a arte da
  Ecobag acima de R$399,90;
- o lembrete do cupom no `cart.tpl` do tema (`nimbus-aviso-ecobag`);
- o produto Ecobag na loja e na vitrine, e o portão `vitrine:variantes` que o
  cobre.

⚠️ Nada disso se mexe sozinho: são preço, checkout e painel, que só o dono
autoriza, produto a produto.

## 2. O cliente NÃO vê status de produção

Decisão de experiência: o cliente não precisa saber que a peça está sendo
produzida sob encomenda. O acompanhamento fala de **pedido**, nunca de
produção:

- **"Preparando seu pedido"** enquanto está na gráfica;
- depois, **enviado**, com o rastreio.

Nada de "em produção", "na fila de impressão" ou equivalente. Isso é coerente
com a regra de copy de 29/07, que já proíbe "sob demanda" e variações.

## 3. Prazo da IzzyPrint: 4 dias úteis, confirmado por escrito

O dono já tem por escrito o prazo de **produção em até 4 dias úteis**
(confirmado pela Sablina; medido também nas amostras: compra na quinta,
chegada na terça). Isso destrava a condição do conselho que proibia qualquer
promessa de prazo sem confirmação escrita. O prazo ao cliente continua sendo o
**total em dias úteis** (produção embutida, sem citar produção).

Pendente com eles, **sem pressa e junto de outras perguntas**: o frete real de
uma peça para CEPs distantes.

## 4. A ordem do lançamento é PRODUTO PRIMEIRO, conteúdo depois

O plano do conselho r5 supunha começar conteúdo em 15/08 (abertura da Quaresma
de São Miguel) e vender em 29/09. **O dono decidiu o contrário**: primeiro
termina o produto, depois aparece.

Sequência vigente:

1. **Artes prontas** (fundo removido à mão, transparente, 300 DPI, resize 4K);
2. **Produtos montados na IzzyPrint** (com a tabela de-para peça/cor/tamanho);
3. **Fotos com a arte na peça** (as 62 fotos do Soul hoje mostram o dono com
   peça LISA, sem estampa nenhuma: são base de cena, não foto de produto);
4. **Site atualizado** com essas fotos;
5. **Só então** conteúdo, fila de e-mails e venda.

Consequência direta: **os prazos de 14/08 e 15/08 do conselho r5 caem**
(pixels, grade editorial, primeiro post). Eles voltam quando a etapa 4 fechar.
A data de 29/09 deixa de ser meta de venda e vira, no máximo, alvo móvel.
