# Runbook operacional NIMBUS

## Donos

| Função | Responsável | Substituto | Canal |
|---|---|---|---|
| Pedidos e conciliação | Roberto | AGUARDA DEFINIÇÃO | AGUARDA CANAL |
| Atendimento | Roberto | AGUARDA DEFINIÇÃO | AGUARDA E-MAIL NIMBUS |
| Nuvemshop e site | Roberto + Codex | AGUARDA ESPECIALISTA DE CONTINGÊNCIA | Painel Nuvemshop |
| Produção YouDraw | YouDraw | AGUARDA CONTATO DE ESCALAÇÃO | Painel/WhatsApp |
| Financeiro e impacto | Roberto | AGUARDA DEFINIÇÃO | Planilha operacional |

## Rotina diária

1. Conferir pedidos pagos na Nuvemshop.
2. Confirmar que cada pedido apareceu na YouDraw com o mesmo SKU, peça, tamanho, cor, arte e endereço.
3. Registrar exceções numa fila única. Não corrigir SKU ou pedido silenciosamente.
4. Conferir pedidos em produção, postados, atrasados, cancelados ou com falha.
5. Verificar mensagens de atendimento e responder dentro do SLA.
6. Registrar receita, custo YouDraw, taxas, frete subsidiado, reembolso e provisão social.

## SLA inicial

- Confirmação automática do pedido: imediata após aprovação do pagamento.
- Primeira resposta humana: até 1 dia útil.
- Divergência Nuvemshop–YouDraw: pausar o pedido e escalar no mesmo dia útil.
- Atraso após o prazo prometido: contatar fornecedor e cliente no mesmo dia útil.
- Defeito, arte ou item incorreto: registrar fotos, pedido e solução; não pedir nova compra ao cliente.

## Incidentes

### Pedido não chegou à YouDraw

1. Não recriar o pedido sem conferir se já existe duplicado.
2. Registrar ID Nuvemshop, pagamento, horário e SKUs.
3. Consultar integração e suporte YouDraw.
4. Informar o cliente somente quando houver uma previsão sustentada.

### SKU, tamanho, cor ou endereço divergente

1. Pausar produção se ainda for possível.
2. Capturar evidência dos dois painéis.
3. Corrigir pelo fluxo oficial do fornecedor.
4. Registrar causa e prevenção antes de encerrar.

### Atraso

1. Comparar data prometida, produção, postagem e rastreio.
2. Atualizar o cliente com fatos, sem inventar prazo.
3. Oferecer solução coerente com a política e legislação.

### Produto com defeito ou arte incorreta

1. Pedir fotos gerais, detalhe do problema e etiqueta.
2. Comparar com o pedido e o arquivo aprovado.
3. Acionar YouDraw e decidir reenvio, troca ou reembolso.
4. Se a causa for de catálogo, pausar o produto até corrigir.

## Freeze pré-lançamento

Sete dias antes do soft launch, não alterar preço, SKU, integração, domínio, meios de pagamento, estrutura do tema ou catálogo sem registrar motivo, backup, validação e rollback. Correções bloqueadoras continuam permitidas.

## Limites para pedir ajuda

- Mais de 15 chamados em uma semana.
- Mais de 30 pedidos por mês sem substituto treinado.
- Duas divergências de integração na mesma semana.
- Qualquer reclamação de privacidade, propriedade intelectual ou segurança.
- Qualquer produto com defeito recorrente ou arte diferente do aprovado.
