# Plano de redes e mídia NIMBUS

Este plano prepara os canais sem ativar gasto. Campanhas permanecem em rascunho até políticas, analytics, margem e checkout estarem validados.

## Perfis

Sugestão de prioridade de nome, sujeita à disponibilidade em cada plataforma:

1. `@nimbuswear`
2. `@nimbuswearbr`
3. `@nimbus.wear`

Usar o mesmo identificador, foto, nome e bio no Instagram e TikTok sempre que possível.

Em 22/07/2026, a disponibilidade de `@nimbuswear` não pôde ser confirmada sem entrar no fluxo de cadastro das plataformas. Não anunciar o nome antes de reservar os dois perfis.

### Nome exibido

`NIMBUS | Streetwear católico`

### Bio curta

`Fé com presença. Streetwear católico autoral, feito sob demanda no Brasil. 10% do lucro apoia um projeto escolhido por você.`

Não publicar a última frase antes de aprovar a fórmula e a prestação de contas.

### Link

Usar `https://nimbuswear.com.br/` como entrada de marca. Links de anúncio de produto devem apontar diretamente para a loja com UTMs.

## Destaques do Instagram

- Coleções
- Tamanhos
- Produção
- Impacto
- Pedidos
- Sobre

## Pilares de conteúdo

1. **Arte e fé:** significado da estampa, referência religiosa e processo autoral.
2. **Produto real:** tecido, caimento, escala, frente/costas e comparação entre tamanhos.
3. **Brasil:** Aparecida, arquitetura, azulejo, rua e céu.
4. **Bastidores honestos:** produção sob demanda, embalagem, rastreio e cuidados.
5. **Impacto:** projeto, regra do cálculo e prestação de contas.
6. **Comunidade:** looks, perguntas, respostas e conteúdo de clientes com autorização.

## Calendário inicial de 14 dias

| Dia | Formato | Conteúdo | CTA |
|---|---|---|---|
| 1 | Reel/TikTok | Manifesto NIMBUS em 10–15 s | Conheça a marca |
| 2 | Carrossel | STREET, RELÍQUIA e NUVEM | Escolha sua linguagem |
| 3 | Reel | Uma arte do esboço à peça | Ver o produto |
| 4 | Stories | Enquete de arte e cor | Responder |
| 5 | Carrossel | Material, modelagem e medidas | Conferir tamanho |
| 6 | Reel | Look de produto-herói STREET | Ver a coleção |
| 7 | Stories | Perguntas sobre POD, prazo e troca | Enviar dúvida |
| 8 | Reel | Produto-herói RELÍQUIA | Ver a peça |
| 9 | Carrossel | Como funciona o impacto | Conhecer projetos |
| 10 | Reel | Cápsula NUVEM e arquitetura | Ver NUVEM |
| 11 | Stories | Comparação de caimento Premium x Oversized | Escolher modelagem |
| 12 | Reel | Embalagem e rastreio, após amostra real | Acompanhar lançamento |
| 13 | Carrossel | Seis produtos-herói | Salvar favorito |
| 14 | Reel/Live | Abertura do soft launch | Entrar na loja |

Não simular embalagem, tecido ou qualidade antes de ter amostra física.

## Produtos-herói editoriais

- STREET: Aparecida Spray, São Miguel Vitorioso e Querubim Spray.
- RELÍQUIA: São Jorge Vintage, Salmo 19 e Aparecida Barroca.
- NUVEM: São Miguel Celeste como cápsula.

A seleção final depende de margem e amostra.

## Analytics mínimo

- `view_item_list`
- `select_item`
- `view_item`
- `add_to_cart`
- `view_cart`
- `begin_checkout`
- `add_payment_info`
- `purchase`
- escolha do projeto social, sem enviar dado pessoal desnecessário

Usar o SKU da variante como `item_id`. Validar eventos no GA4 DebugView e no gerenciador de eventos de cada plataforma antes do lançamento.

## Antes da formalização

- Reservar os perfis e publicar conteúdo orgânico.
- Direcionar para a landing e uma lista de espera, não para checkout pago.
- Não instalar pixels de publicidade nem criar audiências antes da política de cookies e da configuração de consentimento.
- Não ativar anúncios de conversão antes da identificação do vendedor, formalização fiscal e validação de margem.

## Estrutura de mídia paga

### Meta/Instagram, primeiro canal pago

- Objetivo inicial: vendas, somente depois de o evento `purchase` estar validado.
- Uma campanha, orçamento de campanha desativado no primeiro diagnóstico, dois conjuntos no máximo.
- Criativos: manifesto, produto no corpo e detalhe fiel da arte.
- Evitar segmentação excessivamente religiosa ou dados sensíveis. Trabalhar contexto criativo, localização e públicos amplos permitidos pela plataforma.

### Google Ads

- Começar com Search de intenção específica e marca.
- Termos iniciais: `streetwear católico`, `camiseta católica premium`, `camiseta nossa senhora aparecida`, `camiseta são miguel`.
- Bloquear termos informacionais que não indiquem compra e revisar a consulta real diariamente.
- Merchant Center e Performance Max só depois de feed, políticas e imagens estarem aprovados.

### TikTok

- Priorizar conteúdo orgânico para descobrir linguagem e retenção.
- Ativar mídia somente quando houver pelo menos três vídeos com bom sinal orgânico e pixel testado.

## Critérios de pausa

- Evento de compra duplicado ou ausente.
- Produto anunciado com descrição, medida, imagem ou estoque divergente.
- Margem de contribuição abaixo do piso aprovado.
- Reclamações recorrentes de prazo, arte ou tamanho.
- Gasto atinge o teto autorizado sem sinal de checkout qualificado.

## Dados que faltam para ativar

- Handles escolhidos e e-mails dos perfis.
- GA4 Measurement ID.
- IDs do Meta Business, conta de anúncios e Pixel/Dataset.
- IDs do Google Ads e Merchant Center, se usado.
- IDs do TikTok Business e Pixel, se usado.
- Teto total e teto diário por canal.
- Regra de aprovação de criativos e responsável por responder comentários.
