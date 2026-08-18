---
status: vigente
atualizado: 2026-08-17
---

# Estado do projeto

Só o que é verdade HOJE, por frente, com ponteiro para o detalhe. Leia antes de
agir e atualize ao sair (`npm run sessao:fim` cobra). A crônica de julho a
08/08 está congelada em
[`historico/ESTADO-cronica-2026-07-a-2026-08-08.md`](historico/ESTADO-cronica-2026-07-a-2026-08-08.md).

## Regra de precedência

- Este ESTADO é o índice curto da verdade quente do **projeto** (loja, código,
  medição, produção técnica). Para fato de **negócio** (plataforma POD,
  financeiro, marca, calendário, campanha), a página dona é o
  `estado.md` do brain; este aqui aponta e resume.
- Entre os dois estados, **vence o de data mais nova** — e a divergência é bug
  documental: conserte o outro na mesma sessão, antes de agir.
- Contra qualquer outro documento vale a regra de sempre: documento fora de
  `docs/` que contradiga um de dentro perde.
- Contra o ar, **o ar vence**: confira e corrija o documento.

## Loja e funil (Nuvemshop)

- **A marca ainda não vendeu, e a loja está FECHADA**: os 49 produtos da era
  YouDraw foram ocultados em 14/08 e o catálogo será remontado na IzzyPrint.
  Zero produto comprável hoje, por decisão.
- **O funil foi provado de ponta a ponta em 03/08** (adicionar nos 44 então
  publicados, remoção atravessando os dois sites). O mecanismo continua de pé;
  falta produto nele.
- Frete: fixo R$19,90; **grátis a partir de R$399,90, sem brinde** — a Ecobag
  saiu do catálogo em 13/08 e o cupom `ECOBAG` está desativado. A mecânica nova
  do frete grátis ainda vai ser decidida pelo dono.
- Rodapé consertado no ar em 05/08. **Publicação de CSS/tema tem protocolo
  próprio** (Testar CSS → Publicar → `POST /admin/themes/settings/active/` 200
  → provar em página DYNAMIC): [`fluxos/site-css-e-hover.md`](fluxos/site-css-e-hover.md).
- **Roteiro vigente de consertos de painel:
  [`nuvemshop/consertos-loja-2026-08-08.md`](../nuvemshop/consertos-loja-2026-08-08.md)**
  (o cowork-consertos-painel-2026-08-08 saiu com 3 itens fantasma; a v2 provou
  que eram placeholders `display:none` — PR #60).
- **PAINEL LIMPO em 14/08 (o Cowork executou)**: os **49 produtos estão
  OCULTOS** (eram 48 visíveis, não 44: os 4 legados ainda estavam publicados),
  o cupom `ECOBAG` foi DESATIVADO (não excluído) e o campo do checkout perdeu a
  menção à Ecobag. Nada foi excluído; tudo reversível. **O dono pediu em 15/08
  a EXCLUSÃO de verdade**, na Nuvemshop e também na YouDraw: roteiro em
  [`nuvemshop/cowork-excluir-catalogo-youdraw.md`](../nuvemshop/cowork-excluir-catalogo-youdraw.md),
  que exige exportar a lista antes e avisa o que se perde (IDs, histórico, SKU).
- **YouDraw: o dono excluiu os produtos lá ele mesmo (17/08)**. Na **Nuvemshop
  os 49 seguem OCULTOS, não excluídos** — o backup existe, e a exclusão
  definitiva é clique do dono (a sessão não executa exclusão permanente).
- **Ordens do dono de 08/08, no roteiro, aguardando execução no painel**:
  despublicar os 4 legados, remover o telefone dos dados de contato, selo
  powered-by de volta. (O brain de 08/08 as listava como "abertas"; os itens 7
  e 8 do roteiro e o commit #59 registram a decisão.)

## Vitrine e landing (GitHub Pages)

- **VITRINE FECHADA em 14/08 (ordem do dono)**: catálogo YouDraw fora do ar
  durante a remontagem IzzyPrint. Home virou página de remontagem com a
  frase-promessa ("Acima de tudo."); header e footer sem coleções e sem
  Sacola; manifesto, impacto, envios, trocas e privacidade CONTINUAM no ar.
  Reabrir = `VITRINE_ABERTA = true` (build-paginas) + restaurar `ENTRAM`
  (build-catalogo) + `npm run vitrine`. escala-grade e par-fotos esvaziados
  junto (régua da era YouDraw preservada no git; a remontagem mede de novo).
  Textos de Ecobag saíram da vitrine e da gaveta. O painel foi fechado junto,
  no mesmo dia (roteiro `nuvemshop/cowork-fechar-catalogo-youdraw.md`
  executado: produtos ocultos, cupom ECOBAG desativado, texto do checkout).

- Vitrine em `nimbuswear.com.br/loja/` é **a referência de design**; a
  Nuvemshop é só o funil (carrinho + checkout). Landing R3F na raiz.
- **Fora do índice do Google por decisão** (`VITRINE_INDEXAVEL = false` até
  haver fotos com modelo): sitemap com 1 URL, `Disallow: /loja/`.
- Rodada Cashvertising no ar (#58): resumos que vendem o fim, garantia no CTA,
  manifesto em duas colunas, pós-compra ligado.
- Ferramenta `/registro-rosto/` no ar (#61): página utilitária de fotos para o
  Soul, sem link de entrada, noindex.
- **Onze portões** (`npm run vitrine:portoes`), monitor diário no Actions, e
  hook de sessão conferindo a sincronia dos 3 repos ao abrir.

## Catálogo e coleções

- **Direção vigente é a de 06/08**
  ([`decisoes/2026-08-06-nova-direcao-colecoes.md`](decisoes/2026-08-06-nova-direcao-colecoes.md)),
  supersede a ordem de 01/08: roupa bonita com Cristo no centro, **estampa
  única por produto**; RELÍQUIA como "documento sagrado" só com material
  original de época; NUVEM celeste com o ichthys; STREET mantida; linha gótica
  sai para coleção futura.
- **Triagem visual de 12/08 (761 imagens do assets, 100% decididas)**: 557
  reprovadas removidas, 107 aprovadas, **96 na mesa de retrabalho**
  (nimbus-assets `designs/_retrabalho-2026-08/`, organizada por frente:
  emblemas com fundo a remover à mão, fotos de modelo com defeito de cena,
  mockups; resize 4K para a IzzyPrint é etapa posterior). Assets caíram ~1,5 GB.
- **Triagem do dono (06/08): 75 estampas → 24 curadas**
  ([`../designs/prontos/TRIAGEM-2026-08-06.md`](../designs/prontos/TRIAGEM-2026-08-06.md));
  tratamento v1 das 40 referências da RELÍQUIA concluído (07/08). A fila
  operacional vive no brain (`wiki/concepts/fila-de-estampas.md`).
- **Capas: o lote de 77 segue REPROVADO (26/07)** e os 77 PNG foram movidos em
  09/08 para `_arquivo-2026-08-09/` (pasta local, fora do git). O compositor
  novo tem 3 pilotos aprovados. **A reconstrução do catálogo agora é parte da
  remontagem na IzzyPrint** — não reconstruir sobre blanks YouDraw.

## Produção (POD) — MIGRAÇÃO DECIDIDA

- **Decisão do dono (07/08, reconfirmada em 11/08): a produção migra para a
  IzzyPrint e a YouDraw está encerrada.** Qualidade das amostras aprovada (o
  único defeito era do nosso chroma verde). O catálogo atual será REMONTADO na
  IzzyPrint: montar produtos, integração com a Nuvemshop (existe, não é API
  pública) e novas fotos. Detalhe e 10 perguntas operacionais enviadas em
  07/08: brain `wiki/entities/izzyprint.md` e `estado.md` do brain.
- **Instabilidade registrada**: os domínios da YouDraw caíram em 09/08
  (evidência no [`plano de 21/07`](../nuvemshop/auditoria/2026-07-21/implementacao/plano-implementacao-e-pendencias-do-dono.md))
  e voltaram em 11/08 (`app.youdraw.com.br` atrás de login). Não dependa deles.
- **Pré-requisitos da remontagem**: refazer artes a 300 DPI
  ([`verdades/receita-export-300dpi.md`](verdades/receita-export-300dpi.md));
  13 das 78 variantes atuais não existem na IzzyPrint (moletom só preto, sem
  Ecobag) e 48 artes passam dos 30 cm do editor público — confirmar limites na
  conta antes de remontar.
- **ACERVO DE ESTAMPAS FECHADO em 17/08: 23 prontas**, 4 delas pedindo um
  ajuste no Affinity (o dono abre todas lá de qualquer jeito). Das 17 refeitas,
  **8 reprovaram** e foram para `_reprovadas/`; o LEIA-ME anterior dizia "17
  prontas" e era falso — o dono achou os dois primeiros defeitos só olhando a
  galeria, e depois pegou a G5 preto e ouro. **Zero crédito gasto nos
  consertos**: 5 reprovadas foram trocadas pela arte ORIGINAL do dono (ampliada
  quando precisava de tamanho), a B7 fé branca foi derivada da B7 escura
  aprovada, o São Jorge virou ajuste de Affinity e só a B5 Aparecida halftone
  segue sem arquivo bom.
- **Ordem das rotas de arte, por acerto medido**: cor corrigida/despill **2 de
  2**, derivada de aprovada **1 de 1**, ampliação da original **12 de 12**,
  regeração **3 prontas em 15, com 8 reprovadas**. Tudo que NÃO é regeração
  acertou 100%. Arte que já existe transparente se AMPLIA; verde no dourado se
  corrige por CÁLCULO; existindo irmã aprovada, DERIVA-SE dela; regerar é último
  recurso e nada vira oficial sem conferência contra o original nos dois fundos.
  Tabela, defeito por defeito, e as 17 folhas de prova em nimbus-assets
  `designs/_retrabalho-2026-08/emblemas/refeitas-transparentes/`.
- **O padrão das 8 reprovadas**: o modelo **engrossa traço fino, chapa textura e
  inventa contorno**. Onde a arte tinha delicadeza (fio aerografado, craquelado
  vazado, halftone aberto), a regeração devolveu massa sólida. Antes de mandar
  arte para o modelo, perguntar se o valor dela está na delicadeza — se estiver,
  não mandar.
- **B5 Aparecida halftone RESOLVIDA em 17/08 pelo despill** (o último buraco).
  A fonte era JPEG com chroma, então foi recorte + despill — e o recorte certo é
  **desfazer a mistura** (`F = (P − (1−a)·FUNDO)/a`), não apagar o fundo: era
  isso que faltava no recorte de 13/08 que estragou as amostras. O spill restante
  se corrige por **proximidade do fundo**, porque o ouro desta arte é 46,2° no
  interior e 49,6° na borda — o alvo era achatar o gradiente, não recolorir para
  o ouro da marca.
- ⚠️ **SÃO MIGUEL SPRAY VOLTOU PARA A MESA**: eu havia dado como limpa e estava
  errado; o dono viu o dourado OLIVA a olho. Real: 19,9% do ouro oliva na
  contaminada, **10,6% depois do despill** — não zero. Causa: o verde comeu a
  **saturação** (0,561 contra 0,743 da marca), e girar matiz não devolve
  saturação. Candidato reentintado (oliva 2,0%, saturação 0,702, textura
  intacta) em `_alternativas/`, aguardando decisão do dono, porque repinta o
  ouro dele.
- **Medir cor de estampa é medir MATIZ E SATURAÇÃO**, em todas as faixas de
  luminância, com recorte 1:1 na tela. A conferência de 15/08 falhou por medir
  matiz só em pixel de cor forte e só no ouro claro (`r > 140`), deixando de
  fora o ouro escuro e o oliva dessaturado. **Média de imagem inteira esconde
  defeito.**
- **Transferência de máscara entre fonte e resultado só funciona em par
  ALINHADO** — se o modelo redesenhou, a geometria mudou e a máscara da fonte
  destrói a arte (provado na B5, que perdeu o letreiro na tentativa).
- **Medir verde é por MATIZ, não por razão G/R** (a razão confunde brilho com
  cor e já produziu laudo errado): ouro da marca `#e9c46a` = 42,5°, acima de
  ~50° puxa verde, e o detector precisa de piso de saturação.

## Marca, conteúdo e legal

- **INPI: pedido 944711901 protocolado em 06/08** (NIMBUS nominativa, classe
  25). Acompanhar a RPI semanalmente; exigência formal tem prazo de **5 dias**.
  Detalhe: brain `wiki/concepts/dominio-e-marca.md`.
- **MEI regularizado**, CNPJ 53.977.834/0001-18 no rodapé de todas as páginas.
- **Soul do Roberto treinado (v2)**: o dono é o rosto da marca. Material de ads
  produzido em 10-11/08 (40 ads v2 + ciclo 3 com 20 estáticos lookbook e vídeo
  de 28 s) — brain `marketing/2026-08-11-ads-v2/` e sínteses de
  copywriting/ads. **Não roda campanha hoje**: a ordem de 15/08 é produto
  antes de conteúdo, e não há produto comprável.
- Calendário que governa tudo: **29/09 (São Miguel, 3 artes já publicadas)** e
  **12/10 (Aparecida + Acutis + Crianças)**. Para vender em outubro, estampa e
  fotos prontas em setembro.

## Medição (GA4, Meta e TikTok)

- `G-E041S3ZHWB` ativo na landing, vitrine e loja, **cross-domain configurado**
  (04/08). Plano de eventos: [`fluxos/tracking-plan.md`](fluxos/tracking-plan.md)
  (portão `vitrine:tracking`).
- **12/08: `item_id` é o ID da Nuvemshop, não mais o slug** (condição 29 do
  conselho r5). Os cinco disparos da vitrine passaram a mandar o mesmo
  identificador que a loja usa no `purchase`; o slug ficou em `item_name`.
  Sem isso não dava para saber QUAL estampa vendeu — a decisão da remontagem na
  IzzyPrint. **Falta a prova**: o formato exato do `google_item_id` da loja só
  se confirma no DebugView do pedido-teste (do dono), comparando `view_item` e
  `purchase`. Se divergir, o ajuste é de uma linha.
- **Pixels Meta e TikTok armados e DESLIGADOS** (condição 4): snippet, eventos
  e portão prontos, esperando os dois IDs, que vivem nas contas do dono
  ([`fluxos/pixels-meta-tiktok.md`](fluxos/pixels-meta-tiktok.md)). Constantes
  vazias = nada injetado. Ao colar um ID, `vitrine:tracking` fica VERMELHO até
  as linhas do plano virarem `ativo` — o portão arma sozinho, de propósito.
- **Metas de 29/09 e 12/10 preenchidas como PROPOSTA do conselho r5**
  (condições 28 e 12), com CAC teto R$50, ticket mínimo R$260, ROAS breakeven
  3,5x e a régua go/no-go da abertura de venda (só Pix pago conta como demanda).
  **Aguardam assinatura do dono**; não autorizam gasto.
- Pende: pedido-teste no DebugView (**só o dono executa pedido**), filtro de IP
  interno (1 min, precisa do IP do dono), os dois IDs de pixel e a assinatura
  das metas.

## Decisões do dono de 13/08 (mudam o plano r5)

- **A Ecobag SAI**, e as promoções presas a ela junto (cupom ECOBAG, régua de
  frete que desconta uma ecobag, lembrete no cart.tpl, texto do campo do
  checkout). O frete grátis continua, com mecânica nova a definir. Nada disso
  se desfaz sem ordem dele, item a item.
- **O cliente não vê status de produção**: "Preparando seu pedido" e depois
  enviado, com rastreio. Nunca "em produção".
- **Prazo IzzyPrint: 4 dias úteis, confirmado por escrito** — destrava a
  proibição de falar de prazo. Frete real de 1 peça fica para depois, junto de
  outras perguntas.
- **Ordem do lançamento: PRODUTO PRIMEIRO.** Artes → produtos na IzzyPrint →
  fotos COM estampa → site → só então conteúdo e venda. **Os prazos de 14/08 e
  15/08 do r5 caíram** (pixels, grade editorial, primeiro post) e 29/09 deixa
  de ser meta de venda.
- ⚠️ **As 62 fotos do Soul são o dono vestindo peça LISA, sem estampa**: base
  de cena e prova de caimento, NÃO foto de produto. Corrigido em 13/08 no
  prompt r5, que as tratava como material de campanha.

Detalhe: [](decisoes/2026-08-13-ecobag-status-e-ordem-do-lancamento.md).

## Pendências, em ordem

> [!info] **Conselho, 5ª rodada (12/08): consenso pleno 14 a 0 na 2ª votação**,
> com 39 condições incorporadas como pauta obrigatória. Ata, síntese da
> presidente, plano de negócio e prompt de execução em
> [`nuvemshop/auditoria/2026-08-12-conselho-r5/`](../nuvemshop/auditoria/2026-08-12-conselho-r5/).
> O plano de 7/30/90 dias de lá ABSORVE e detalha as pendências abaixo; meta de
> 29/09 definida como prova: 10 pedidos pagos medidos na janela 15–29/09.

1. **Frente IzzyPrint** (a que destrava tudo): respostas das 10 perguntas,
   produtos-teste, integração, limites de área na conta.
2. **Artes a 300 DPI na direção de 06/08** — pré-requisito da remontagem.
3. **Fotos (Soul/modelo) → abrir venda** a tempo de 29/09 e 12/10.
4. Decisões abertas do dono: 4 legados compráveis, telefone no rodapé, selo
   powered-by.
5. Pedido-teste GA4 no DebugView (dono) + filtro de IP. **Um pedido real serve
   quatro provas** (9 passos do Jorge, cronometragem do Paulo, `purchase` do
   Ricardo, `item_id` da Larissa): não repita compra-teste.
6. Reconciliar o 352727892 (Aparecida Spray | Moletom Canguru): título e fotos
   ainda de "Blusão sem capuz"; produto Oculto no painel desde 03/08.
7. Reabrir a vitrine ao índice (`VITRINE_INDEXAVEL`) quando houver fotos com
   modelo; Search Console espera o Google do dono.

## Limites que não mudam

Nada é publicado sem autorização explícita, produto a produto. Não mexer em
preço, custo, domínio, checkout, dados legais, integração POD, produtos ou
variantes. Não executar pedido pago. Repo público: nunca expor dado pessoal,
senha, cookie ou token.
