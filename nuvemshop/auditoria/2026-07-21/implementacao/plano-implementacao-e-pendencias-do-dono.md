# Implementação pré-lançamento NIMBUS

Atualizado em 21/07/2026.

## Decisão

O feedback do conselho é útil, realista e viável quando dividido em duas camadas:

1. **Pronto para soft launch:** informação correta de produto, políticas, identificação do vendedor, conciliação Nuvemshop–YouDraw, imagens fiéis, analytics e rotina operacional.
2. **Pronto para escalar anúncios:** margem confirmada, amostras físicas, pedidos reais entregues, CAC observado e atendimento funcionando.

A NIMBUS não precisa de outra reconstrução visual. A coleção NUVEM pode estrear como cápsula com três produtos. Criar mais artes é desejável para a próxima rodada editorial, mas não deve atrasar o aprendizado dos produtos atuais.

## O que já foi feito nesta implementação

- Catálogo público consolidado: 49 produtos, 386 variantes e 386 SKUs públicos únicos.
- Nenhum SKU público duplicado e nenhuma página de produto com erro de leitura.
- Contagem comercial atual: 18 produtos STREET, 28 RELÍQUIA e 3 NUVEM.
- Contagem criativa: 21 artes únicas no catálogo. A NUVEM tem uma arte, São Miguel Celeste, aplicada a três peças. Portanto, ela é uma linha criativa com três produtos comerciais, não três criações diferentes.
- Peças: 19 Camisetas Premium, 16 Oversized Premium, 8 Moletons Canguru, 5 Blusões Moletom e 1 Ecobag.
- Cores: 19 produtos com uma cor, 29 com mais de uma cor e 1 Ecobag sem opção pública de cor. Os 20 bloqueios de troca de foto no CSS correspondem aos 19 mono-cor mais a Ecobag, portanto essa diferença não é um erro.
- Matriz pública por produto e por variante criada nesta pasta.
- Material, modelagem, impressão, cuidado e medidas oficiais preenchidos quando a fonte pública da YouDraw os informou.
- Gaps técnicos marcados, sem inventar informação.
- Rascunhos de Envios e prazos, Trocas e devoluções, Privacidade e cookies e Transparência do impacto preparados nesta pasta.
- Os dois pedidos controlados de G3 foram excluídos desta execução, conforme solicitado. Nada será comprado ou fabricado sem uma autorização futura específica.

## Achados técnicos sobre as peças

### Camiseta Premium

- 100% algodão penteado, fio 30/1.
- Modelagem ajustada unissex.
- Impressão DTG.
- Medidas oficiais disponíveis de P a EG.

### Camiseta Oversized Premium

- A Central de Ajuda atual informa 100% algodão e 240 g.
- Modelagem oversized, mangas 3/4 e gola canelada de 3 cm.
- Impressão DTG.
- Medidas oficiais disponíveis de P a EG.
- **Pendência:** páginas antigas do marketplace citam 165 g. Confirmar no painel qual blank está associado aos 16 produtos NIMBUS antes de publicar a gramatura.

### Moletom Canguru

- 50% algodão e 50% poliéster, 300 g.
- Modelagem unissex com capuz e bolso canguru.
- Impressão DTF.
- Medidas oficiais disponíveis de P a EG.

### Blusão Moletom

- 50% algodão e 50% poliéster.
- Modelagem unissex sem capuz e gola careca.
- Impressão DTF.
- **Pendência:** a fonte pública consultada não apresenta gramatura nem tabela de medidas. Obter no painel ou diretamente com a YouDraw.

### Ecobag

- 100% algodão.
- 41 x 35 cm, com alças de 60 cm.
- **Pendência:** capacidade, peso suportado, método de impressão e cuidado completo.

## Auditoria das fotos lifestyle

As imagens precisam ser comparadas com três referências, por cor:

1. mockup da YouDraw;
2. arquivo final da arte;
3. imagem lifestyle publicada.

Critérios: mesma arte, mesma orientação, cor correta, proporção aparente da estampa, posição no tórax/costas, tipo e caimento da peça. Uma foto não deve ser aprovada apenas porque ficou bonita.

O histórico local mostra que dez produtos passaram por correções e publicação posterior. A varredura pública atual ainda aponta:

- **Anjo da Guarda Stencil | Camiseta Premium:** a capa pública voltou ou permaneceu numa versão em que a estampa aparenta estar grande demais e o caimento parece oversized. Existe uma versão local corrigida `352728357-preta-v4a.png`, mais próxima do mockup YouDraw. Precisa de substituição no painel, preservando os mockups internos.
- **Brasão NIMBUS | Camiseta Premium:** o verificador acusa o nome antigo da capa, mas a imagem foi aprovada visualmente no histórico. Tratar como falso positivo até nova comparação visual.
- **Aparecida Barroca | Camiseta Oversized Premium:** há pequeno resíduo na palavra BRASIL SACRO, de baixa visibilidade.
- **São Miguel Vintage | Camiseta Oversized Premium:** há registro histórico de escala cerca de 12% maior. Revalidar com o mockup atual.

A reaudição 49/49 fica incompleta até acesso autenticado à YouDraw, porque o tamanho físico da área impressa em centímetros não é público e não deve ser deduzido apenas pela fotografia.

## Prazo de entrega confirmado pelo representante da YouDraw

O texto recebido foi:

- São Paulo: 1 a 3 dias úteis;
- Sudeste: 2 a 4 dias úteis;
- Sul e Centro-Oeste: 3 a 5 dias úteis;
- Norte e Nordeste: 4 a 10 dias úteis.

Segundo Roberto, as faixas já incluem produção e transporte e são tempos médios, não garantias. O prazo final do checkout deve prevalecer para o CEP do cliente, e a política precisa alertar para alta demanda, feriados e ocorrências logísticas.

## Dados que Roberto precisa fornecer

### Obrigatórios antes de abrir vendas amplamente

- Nome empresarial ou nome completo do vendedor.
- CPF/CNPJ que realiza a venda e emite o documento fiscal.
- Endereço físico de atendimento da operação.
- E-mail de suporte da NIMBUS. Recomenda-se criar `contato@nimbuswear.com.br` ou `atendimento@nimbuswear.com.br` em vez de publicar o e-mail pessoal.
- Identificação pública do vendedor antes de aceitar pedidos: nome, CPF ou CNPJ, endereço físico e eletrônico.
- Tabela/gramatura do Blusão Moletom e confirmação do blank Oversized atual.
- Capacidade, peso suportado, impressão e cuidado da Ecobag.
- Regra operacional aprovada para o impacto social.
- Responsável principal e substituto para pedidos, atendimento e conciliação.

### Necessários para analytics e anúncios

- Conta Google Analytics 4 e Measurement ID.
- Google Ads com faturamento configurado.
- Meta Business Manager, página do Facebook, Instagram profissional, conta de anúncios e Pixel/Dataset.
- TikTok Business Center, conta de anúncios e Pixel, se TikTok Ads entrar no piloto.
- Orçamento máximo autorizado por canal. Nenhuma campanha deve ser ativada sem esse teto.

### Necessários para margem e escala

- Custo YouDraw atualizado de cada configuração/peça.
- Taxas reais Nuvemshop e meio de pagamento.
- Regime tributário e alíquota efetiva, validados com contador.
- Regra de frete subsidiado, cupons e parcelamento.
- Reserva de caixa disponível para produção, reembolso e mídia.

## Sequência recomendada

### Agora, sem gasto e antes da formalização

1. Exportar ou ler no painel YouDraw produtos, variantes, SKUs, custos e área de impressão.
2. Concluir a matriz de 386 variantes e zerar divergências.
3. Reauditar 49 capas e pares de cor.
4. Corrigir a capa do Anjo da Guarda Stencil Premium.
5. Completar e publicar as quatro páginas institucionais após receber os dados do vendedor.
6. Completar descrições e metadados dos 49 produtos.
7. Configurar analytics e eventos com consentimento adequado.
8. Preparar contas sociais, bio, destaques, calendário e biblioteca criativa.
9. Fazer QA desktop/mobile, acessibilidade e regressão.
10. Criar Instagram/TikTok, conteúdo orgânico e lista de espera, sem aceitar pedidos pagos nem ativar anúncios de conversão.

### Depois, com autorização de gasto

1. Comprar uma unidade mono-cor e uma multicolorida.
2. Validar integração, produção, embalagem, rastreio, arte, escala, material e prazo.
3. Fazer um soft launch de 14 dias com 6 a 9 produtos-herói.
4. Só aumentar mídia após margem e operação observadas.

## Produtos-herói sugeridos para o piloto

- STREET: Aparecida Spray, São Miguel Vitorioso e Querubim Spray.
- RELÍQUIA: São Jorge Vintage, Salmo 19 e Aparecida Barroca.
- NUVEM: São Miguel Celeste como cápsula de uma arte em três peças, sem apresentar as peças como três criações diferentes.

Essa lista é editorial. A seleção comercial final depende de margem e amostra aprovada.

## Direção para redes e mídia

- Criar os perfis e o calendário agora é válido.
- Publicar conteúdo orgânico e captar interessados pode começar após políticas e páginas de produto estarem corretas.
- Google Ads, Meta Ads e TikTok Ads devem permanecer em rascunho até analytics, margem, consentimento e checkout estarem validados.
- Não lançar três canais pagos de uma vez. Começar com Meta/Instagram para criativo e comunidade; usar Google Search para intenção específica; testar TikTok organicamente antes de comprar mídia.
- A coleção NUVEM precisa de mais 2 a 3 artes para se tornar uma coleção ampla. Hoje ela é uma linha de uma arte aplicada a três peças e pode funcionar como cápsula no lançamento.

## Fontes técnicas consultadas

- YouDraw, Tecidos e Qualidade: https://youdraw.tawk.help/article/peso-e-material-de-cada
- YouDraw, Ecobag: https://marketplace.youdraw.com.br/collections/ecobag
- YouDraw, frete: https://youdraw.tawk.help/article/como-funciona-o-frete-na-youdraw
- YouDraw, rastreio: https://youdraw.tawk.help/article/como-funciona-o-rastreio
- YouDraw, embalagens e etiquetas: https://youdraw.tawk.help/article/como-funcionam-as-embalagens-e-etiquetas
- YouDraw, guia POD: https://blog.youdraw.com.br/post/print-on-demand-guia-empreendedores-brasil
