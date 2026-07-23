# Estrutura da planilha de impacto mensal

Esta especificação será transformada em `.xlsx` assim que o gerador de planilhas do ambiente voltar a responder.

## Aba Pedidos

Uma linha por pedido elegível:

- Data do pedido.
- ID do pedido Nuvemshop.
- Status do pedido.
- Data da entrega.
- Fim do prazo de arrependimento.
- Projeto escolhido.
- Receita efetivamente recebida.
- Custo YouDraw.
- Taxas de pagamento e plataforma.
- Tributos.
- Frete subsidiado.
- Reembolso ou estorno.
- Lucro elegível.
- Percentual social, padrão 10%.
- Valor social provisionado.
- Mês de competência.
- Status do repasse.
- ID ou link do comprovante.
- Observações.

Fórmulas:

`Lucro elegível = MÁXIMO(0; receita − produção − taxas − tributos − frete subsidiado − reembolso/estorno)`

`Valor social = lucro elegível × 10%`

Pedidos cancelados, reembolsados ou ainda dentro do prazo de arrependimento não entram como valor confirmado.

## Aba Repasses

Uma linha por projeto e mês:

- Mês de competência.
- Projeto.
- Pedidos elegíveis.
- Valor provisionado.
- Ajustes.
- Valor repassado.
- Data do repasse.
- Comprovante.
- Status.
- Observações.

## Aba Projetos

- Nome oficial.
- Área de atuação.
- Site oficial.
- Dados bancários ou canal oficial de doação.
- Contato verificado.
- Data da última verificação.
- Status de elegibilidade.

## Aba Painel

- Lucro elegível do mês.
- Valor social do mês.
- Valor já repassado.
- Valor pendente.
- Quantidade de pedidos elegíveis.
- Distribuição por projeto.
- Gráfico mensal do valor destinado.
- Gráfico por projeto.

## Controles

- Nenhum pedido duplicado.
- Soma por projeto deve reconciliar com o total mensal.
- Repasse não pode exceder valor confirmado.
- Todo valor marcado como repassado precisa de data e comprovante.
- Dados pessoais dos clientes não aparecem no painel público ou nas redes sociais.

## Divulgação mensal

Publicar nas redes somente dados agregados:

- período;
- número de pedidos elegíveis;
- valor total destinado;
- valor por projeto;
- comprovantes com dados bancários e pessoais ocultados;
- acumulado anual.
