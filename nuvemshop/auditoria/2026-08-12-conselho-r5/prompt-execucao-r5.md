---
status: vigente
atualizado: 2026-08-12
---

# Prompt de execução da 5ª rodada do conselho

Cole o bloco abaixo da linha horizontal como **primeira mensagem** de uma sessão
nova de agente de programação. Ele implementa a parte **executável por código**
das 39 condições aprovadas por consenso 14 a 0 em 12/08/2026
(`ata-conselho-r5.md`, nesta pasta, seção "As condições incorporadas"). O que
depende de decisão, painel, pagamento ou assinatura do dono está listado dentro
do bloco, na seção 4, e **não** é tarefa do agente.

---

Você assume o projeto NIMBUS, marca brasileira de streetwear católico premium,
em pré-lançamento: a marca **ainda não vendeu**. A loja é Nuvemshop (plano
Impulso, tema Baires congelado, reduzida a carrinho e checkout); a vitrine de
verdade é estática, em `nimbuswear.com.br/loja/`, publicada por GitHub Pages a
partir deste repositório, com a landing R3F na raiz. A produção print-on-demand
está em migração: YouDraw encerrada em 07/08, IzzyPrint decidida, catálogo de
44 produtos a remontar. As datas que governam tudo são **29/09 (São Miguel)** e
**12/10 (Aparecida)**. Em 12/08 o conselho da 5ª rodada aprovou por 14 a 0 um
plano com 39 condições obrigatórias, registradas em
`nuvemshop/auditoria/2026-08-12-conselho-r5/ata-conselho-r5.md`. Esta sessão
executa a parte dessas condições que se resolve com código e documento.

São **três repositórios**, já clonados nesta máquina: `C:\Users\rober\Nimbus`
(público), `C:\Users\rober\nimbus-assets` (privado, artes e blanks) e o brain,
que é um vault Obsidian **aninhado** em `C:\Users\rober\Nimbus\Nimbus brain`
(repo git próprio, gitignorado do público; `C:\Users\rober\nimbus-brain` é uma
junction para ele). ⚠️ **Nunca rode `git clean -fdx` no público**: apagaria o
vault. Um hook de sessão confere a sincronia dos três ao abrir; se algo estiver
atrás, `git pull --ff-only`. Os portões do projeto rodam com
`npm run vitrine:portoes` (hoje onze; esta rodada acrescenta novos), mais
`npm run typecheck` e `node scripts/geometry/validate.mjs`. **Antes de tocar em
qualquer coisa, leia `docs/ESTADO.md` até o fim** (a linha de cima pode estar
revogada trinta linhas abaixo) e `docs/00-COMECE-AQUI.md`. Regra de
precedência: documento fora de `docs/` que contradiga um de dentro perde; entre
`docs/ESTADO.md` e o `estado.md` do brain vence o de data mais nova; contra o
ar, o ar vence.

## 2. Limites inegociáveis

- **Nada é publicado sem autorização explícita do dono, produto a produto.**
  Não mexa em preço, custo, domínio, checkout, produtos, variantes, dados
  legais nem integração POD. Não execute pedido pago.
- **Copy pública proibida** (o portão `vitrine:lint` cobra): travessão,
  "sob demanda", "loja oficial", "troca fácil". A lista completa está em
  `scripts/vitrine/lint-copy.mjs` (const `BANIDOS`). Tom da marca: curto,
  humano, específico e reverente.
- **CSS e tema da loja não sobem por Git.** A Nuvemshop não faz deploy por
  Git; o protocolo de publicação é do dono e está em
  `docs/fluxos/site-css-e-hover.md`. Tudo o que exige colar ou clicar no
  painel vira item para o dono, nunca tentativa sua.
- **O repo público nunca expõe** CPF, endereço, senha, cookie, token ou dado
  de cliente.
- **No brain, o `log.md` é append-only** (`## [YYYY-MM-DD] <op> | <título>`);
  o schema do vault está no `CLAUDE.md` dele.
- **Nunca rebaixe um portão para informativo.**
- Uma frente por sessão: execute as tarefas abaixo na ordem, uma ou poucas por
  sessão; ao cruzar ~60% de contexto, grave e encerre.

## 3. Tarefas executáveis por código, em ordem de dependência

### Bloco A: instrumentação e portões novos

**1. Custo por SKU versionado + portão `vitrine:margem`** (condição 1, Ricardo
Tanaka; prazo 25/08)
- Criar `public/loja/custo-sku.json` com o custo por variante: blank +
  estampa + etiqueta R$1,00/peça + expedição R$3,50/pedido. Fontes: brain
  `wiki/entities/izzyprint.md` e `financeiro/margem-contribuicao-2026-08.md`.
  Valor sem fonte entra marcado como estimado; nunca invente número.
- Criar `scripts/vitrine/lint-margem.mjs` e o script `vitrine:margem` no
  `package.json`, encadeado em `vitrine:portoes`: reprova SKU com margem de
  contribuição < 40% pós-frete.
- Pronto quando: forçar um SKU abaixo de 40% deixa o portão VERMELHO;
  restaurar deixa verde.

**2. `item_id` da Nuvemshop no GA4** (condição 29, Larissa Fontes)
- Trocar `item_id` de slug para o ID Nuvemshop em
  `public/loja/js/produto.js` (linhas 80 e 161) e `public/loja/js/ui.js`
  (linhas 219, 270 e 430), mantendo o slug em `item_name`. O `p.id` já existe
  no catálogo (é o que `scripts/vitrine/build-paginas.mjs` usa no formulário);
  se o item gravado na sacola ainda não carrega o id, propague-o ao gravar.
- Atualizar a linha correspondente de `docs/fluxos/tracking-plan.md` **no
  mesmo commit** (o portão `vitrine:tracking` cobra).
- Pronto quando: `vitrine:portoes` verde. A prova no DebugView (view_item e
  purchase com o MESMO item_id) fica para o pedido-teste do dono.

**3. Metas de 29/09 e 12/10 + régua go/no-go no tracking-plan** (condições 28
da Larissa e 12 da Beatriz; um commit só, prazo 25/08)
- Preencher a tabela de `docs/fluxos/tracking-plan.md` (linhas 97-98, hoje
  "a preencher pelo dono") com a proposta fechada pelo conselho: 29/09 = 250
  sessões no dia, add_to_cart 6%, 4 pedidos no dia e 10 na janela 15-29/09;
  12/10 = 400 sessões, 8%, 10 no dia e 25 na janela 03-12/10; CAC teto R$50;
  ticket mínimo R$260; ROAS breakeven 3,5x (não 2x).
- No mesmo commit, a régua go/no-go da Beatriz: taxa mínima
  view_item→add_to_cart e nº de Pix antecipados que autorizam abrir venda,
  contando **só sinal pago** (reserva grátis não é demanda).
- Marcar no arquivo: "proposta do conselho r5, aguarda assinatura do dono".
- Pronto quando: nenhum "a preencher" no arquivo e o marcador de assinatura
  presente.

**4. Banda doutrinária no lint-copy + consertos de copy** (condição 37, Frei
Tomás Andrade; prazo 29/08)
- Ampliar a lista `BANIDOS` de `scripts/vitrine/lint-copy.mjs` com a banda
  doutrinária (régua do tom de voz do brain, seção de linhas vermelhas):
  "energia de um show", "band-tee devocional", "acompanha o seu estilo",
  amuleto, sorte, mau-olhado.
- Reescrever em tom reverente: `scripts/vitrine/devocional.json` linhas 13 e
  38, e `scripts/vitrine/build-catalogo.mjs` linha 210 ("Band-tee
  devocional"). Regerar a vitrine.
- Pronto quando: portão verde e grep de "energia de um show" nas páginas
  geradas devolvendo zero.

**5. Portão de medidas IzzyPrint** (condição 26, Jorge Batista)
- Criar a tabela de medidas IzzyPrint versionada (por exemplo
  `docs/verdades/medidas-izzyprint.md`, no padrão de
  `docs/verdades/medidas-pecas.md`), a partir do brain
  `wiki/entities/izzyprint.md` (ex.: Canguru G lá é 59×78, contra 58×65 da
  YouDraw no ar).
- Criar `scripts/vitrine/lint-medidas.mjs` + script `vitrine:medidas`
  encadeado em `vitrine:portoes`: produto marcado como **remontado** com
  medida da YouDraw na `ficha.medidas` derruba o build. Hoje nenhum produto
  está remontado, então o portão nasce verde, mas armado.
- Pronto quando: marcar um produto de teste como remontado com medida YouDraw
  deixa o build vermelho; desfazer deixa verde.

**6. Meta Pixel + TikTok Pixel na vitrine** (condição 4, Marina Duarte; prazo
14/08; casa com a exigência da Larissa de mesmo item_id)
- Injetar o snippet `fbq` (Meta) e o do TikTok em
  `scripts/vitrine/build-paginas.mjs`, no mesmo ponto de injeção do gtag, com
  os eventos disparando com o MESMO item_id da tarefa 2. Os IDs dos pixels
  vêm das contas do dono (Gerenciador de Eventos da Meta e TikTok Ads): sem
  eles, deixe a injeção pronta atrás de flag e registre o bloqueio.
- Se `vitrine:tracking` acusar os eventos novos, registre-os em
  `docs/fluxos/tracking-plan.md` no mesmo commit.
- ⚠️ O pixel da LOJA (campo do painel Nuvemshop) e o CAPI são ITEM PARA O
  DONO: prepare o snippet e a instrução de colagem, não tente colar.
- Pronto quando: as páginas geradas contêm `fbq` com ID real (ou a flag
  documentada aguardando o ID). Pixel armado não é mídia paga; o gasto segue
  travado pela condição 3.

**7. Repatriar o programa do carrinho + portão `loja:tema`** (condição 7,
André Falcão; prazo 19/08)
- Baixar `https://loja.nimbuswear.com.br/comprar/` (GET público funciona) e
  salvar o bloco NIMBUS do tema (~linhas 1130-1240 do HTML servido, com os
  marcadores `nimbus_sacola_loja`, `nimbus_sacola_alvo` e `LS.removeItem`) em
  `nuvemshop/tema/carrinho-nimbus.js` (pasta nova).
- Criar `npm run loja:tema`: baixa a página e falha se os marcadores sumirem
  ou se o bloco divergir do commitado. Encadear em `vitrine:portoes` e em
  `.github/workflows/monitor-diario.yml`.
- Pronto quando: alterar uma linha do arquivo commitado deixa o portão
  VERMELHO; restaurar deixa verde.

**8. Autocorreção do espelho da sacola** (estratégia do André Falcão)
- Em `public/loja/js/ui.js`, depois do `form.submit()` da linha 267, agendar
  `setTimeout` de ~2,5 s chamando a rotina de sincronização que já existe (o
  leitor do cookie da loja, `ui.js:52`): o POST cai em `/comprar/`, o snippet
  do tema roda dentro do iframe e grava `nimbus_sacola_loja`; o espelho passa
  a refletir a resposta real da loja, e variante recusada deixa de aparecer
  como adicionada.
- Pronto quando: portões verdes e o comportamento descrito num teste manual
  registrado no PR.

**9. Portão que POSTa de verdade** (condição 8, André Falcão; prazo 26/08) —
⚠️ AGUARDA AVAL ESCRITO DO DONO ANTES DO MERGE
- Preparar em PR (rascunho) um passo novo no
  `.github/workflows/monitor-diario.yml`: com cookie jar, POST de
  `add_to_cart` + `variation[]` + `quantity=1` de UM produto em `/comprar/`,
  GET da mesma página, assert do item na lista e esvaziamento do carrinho no
  fim. É carrinho, **nunca** pedido pago.
- Pronto quando: PR aberto com run de teste verde; o merge só acontece com o
  aval escrito do dono registrado no roteiro.

### Bloco B: conversão e copy na vitrine

**10. Frete em número + banda de confiança na PDP** (condição 34, Camila
Ortiz; prazo 31/08)
- Em `scripts/vitrine/build-paginas.mjs`: no buy box da PDP, trocar a frase
  vaga do frete por "Frete R$19,90 para a maior parte do Brasil, grátis a
  partir de R$399,90" (a condição do grátis na mesma página, senão
  `vitrine:claims` reprova, e com razão); repetir a banda `.trust` da home
  (linha 161) dentro da PDP.
- Em `public/loja/css/loja.css`: barra fixa de compra abaixo de 900px com
  preço e o botão Adicionar (estratégia da Camila para o celular).
- Pronto quando: a página gerada de `/loja/p/sao-miguel-vintage1/` contém
  "R$19,90" no buy box e a classe `.trust`, com `vitrine:portoes` verde no
  mesmo commit.

**11. Frases sem lastro fora do ar** (condição 11 da Beatriz Rocha, com a
mecânica do Yuri Almeida; prazo 19/08)
- `scripts/vitrine/build-paginas.mjs` linha 334: condicionar "Nas fotos, as
  pessoas vestem tamanho G" a um campo `tem_pessoa` do catálogo (hoje
  inexistente, logo a frase sai das 44 PDPs). Texto substituto: "Imagem da
  estampa aplicada na peça. Medidas exatas na ficha desta página."
- Na página `/loja/impacto/` (gerada pelo mesmo build): suspender a promessa
  de escolha "no checkout, no campo mensagem do pedido" enquanto não existir
  print do campo funcionando; reformular para versão sem mecanismo
  específico.
- Pronto quando: grep de "as pessoas vestem" nas páginas geradas devolvendo
  zero, e `/loja/impacto/` sem a promessa do campo.

**12. Frase-promessa única** (condição 13, Clara Nunes) — ⚠️ AGUARDA ESCOLHA
DO DONO
- Preparar o diff que aplica a frase escolhida, palavra por palavra, em
  `src/data/content.ts`, no hero de `/loja/` (via
  `scripts/vitrine/build-paginas.mjs`) e como exigência no
  `scripts/vitrine/lint-copy.mjs` (mesmo mecanismo da frase dos 10%).
- **Não escolha a frase.** A sugestão do conselho ("Roupa que você usaria
  mesmo sem o santo. Com o santo.") vai como opção; a escolha é do dono, e as
  bios de Instagram e TikTok também são dele. Enquanto não houver escolha,
  registre a tarefa como bloqueada.

**13. Captura de e-mail na vitrine e na landing** (condições 6 da Marina e 15
da Clara; prazo da Clara 20/08)
- Bloco de captura com a copy "O primeiro drop tem aviso. Deixe seu e-mail e
  saiba antes." (botão "Quero saber primeiro") na home da vitrine e nas 44
  PDPs (`scripts/vitrine/build-paginas.mjs`) e na landing (`src/`). **Bloco na
  página, nunca modal cobrindo a foto** (exigência do Yuri).
- O form aponta para o endpoint da ferramenta que o dono escolher (Formspree,
  Brevo ou newsletter nativa da Nuvemshop): a conta é do dono. Sem endpoint,
  deixe pronto atrás de flag e registre o bloqueio.
- O mesmo mecanismo alimenta a fila de São Miguel (condições 21 da Sofia e 30
  da Larissa); distribuição, meta de 300 nomes e corte 40/20 são do dono.
- Pronto quando: o form está no HTML gerado e `vitrine:portoes` segue verde;
  o envio de teste é do dono.

**14. CTA da gaveta na mesma aba** (condição 35, Camila Ortiz; prazo 07/09)
- Remover `target="_blank"` do `.gaveta__checkout` em
  `public/loja/js/ui.js` (linha 348).
- Enquanto o dono não confirmar no painel se `/comprar-express/` leva direto
  ao pagamento, rótulo honesto no botão: "Revisar e pagar na loja".
- Pronto quando: o `ui.js` servido não tem `target="_blank"` no
  `.gaveta__checkout`. O teste do iPhone no navegador in-app (condição do
  Yuri) é do dono e valida este conserto antes de 07/09.

### Bloco C: documentos operacionais

**15. Esqueleto de `docs/fluxos/pedido-a-entrega.md`** (condições 25 do Jorge,
17 do Paulo e 33 do Tiago; prazo 20/08)
- Criar no padrão dos fluxos existentes (frontmatter `status:`), com os 9
  passos: pagamento → conferir cupom ECOBAG → repasse manual na IzzyPrint →
  pagar → NF → etiqueta (remetente SP) → rastreio à mão → e-mail ao cliente →
  marcar D+7 do arrependimento. Campo de tempo por passo em branco, a
  preencher pelo pedido-piloto do dono (é ele que prova o fluxo).
- Incluir a seção "roteiro de resposta ao cliente" (Tiago): confirmação com o
  link da página de acompanhamento, aviso de postagem com rastreio, e D+3 da
  entrega perguntando se serviu.
- Pronto quando: arquivo commitado com `docs:status` e `docs:links` verdes.

**16. Reconciliação das artes acima de 30 cm por script** (condição 9, André
Falcão; prazo 19/08)
- Criar `scripts/producao/plano-izzyprint.mjs`: lê `public/loja/catalogo.json`
  e o endpoint público `https://izzyprint.com.br/wp-json/wc/store/v1/products`
  e emite, por produto: peça equivalente, cores e tamanhos que existem lá,
  variantes órfãs e alvo da arte em cm e px (reusar a lógica de
  `scripts/producao/lint-export-300dpi.mjs`). Zero integração de pedido.
- Corrigir com o número gerado os dois documentos que hoje divergem:
  `docs/ESTADO.md` (diz 48 artes acima de 30 cm) e o brain
  `wiki/entities/izzyprint.md` (diz 16 de 26). Um número só nos dois.
- Pronto quando: rodar o script e o número bater nos dois documentos.

**17. Grade editorial 15/08→29/09 versionada em `docs/`** (condição 5 da
Marina, unificando as 12 peças do Paulo e os 12 posts da Sofia; prazo 15/08)
- UM arquivo novo, por exemplo `docs/fluxos/grade-editorial-2026-quaresma.md`
  (ao lado de `docs/fluxos/conteudo-social.md`), com uma linha por dia de
  15/08 a 29/09: data, formato (formatos 1, 2, 6 e 12 da pesquisa do brain,
  `wiki/syntheses/posts-e-ads-que-funcionam.md`), ativo (as 64 fotos
  aprovadas em `nimbus-assets/casting/2026-08-08-roberto-soul/gerados/v12-lote-60/`
  e o vídeo de 28 s) e legenda mini-homilia no tom da marca, sem travessão.
- A espinha litúrgica vem do brain
  (`wiki/syntheses/calendario-campanhas-2026-2027.md`) **já corrigida pela
  tarefa 18**. Publicar o post é do dono.
- Pronto quando: arquivo no repo com os 45 dias preenchidos e `docs:status`
  verde.

**18. Correções litúrgicas + adendo da Regra da Face** (condição 38, Frei
Tomás Andrade; prazo 05/09)
- No brain: corrigir `wiki/concepts/calendario.md` (linhas ~83 e ~112) e
  `wiki/syntheses/calendario-campanhas-2026-2027.md` (~linha 58): a CNBB
  moveu São Carlo Acutis para **13/10** no Brasil, porque 12/10 é a
  Solenidade de Aparecida; separar as campanhas (12/10 só da Padroeira,
  13/10 Acutis com Fátima). Registrar no `log.md` (append).
- Em `docs/decisoes/`: redigir o adendo à
  `2026-08-06-nova-direcao-colecoes.md` estendendo a proibição de IA à face
  de Cristo e de Nossa Senhora, cobrindo também retoque e upscale, como
  **proposta para assinatura do dono** (decisão é dele; marque "aguarda
  confirmação do dono").
- Pronto quando: brain corrigido, adendo redigido com o marcador, e
  `docs:status` verde.

## 4. O que é explicitamente do dono: NÃO tente

- **Pedido-piloto pago** (um único pedido real serve quatro provas: os 9
  passos do Jorge, a cronometragem do Paulo, o purchase no DebugView do
  Ricardo e o item_id da Larissa) e qualquer pedido-teste no GA4.
- **Os 10 pedidos de R$299,90 no Pix** com a amostra na mão (Beatriz +
  Sofia), gravação e publicação de conteúdo, fotos com pessoas e depoimentos.
- **Escolhas**: preço (mesa de reprecificação), frase-promessa, brinde da
  Ecobag, assinatura das metas do tracking-plan, aval escrito do portão que
  POSTa (tarefa 9).
- **Contrato com a IzzyPrint** (gov.br) e as confirmações por escrito da
  Sablina (prazo de produção, medidas, frete): sem elas, nenhuma linha de
  "chega a tempo do 29/09" vai ao ar.
- **Rotação de credenciais e envelope de emergência** (página fora do repo
  público, gerenciador de senhas, pessoa nomeada).
- **Tudo o que se cola ou clica no painel Nuvemshop**: pixel da loja + CAPI,
  CNPJ e termos no rodapé da loja, telefone fora de `/contato/`, checkout
  fechado se ninguém produzir o pedido nº 1, e-mails automáticos. Quando a
  tarefa exigir painel, o entregável certo é um prompt de Cowork no padrão
  `nuvemshop/cowork-*.md`.
- **Autorizações de terceiros**: as três instituições dos 10% e a
  Arquidiocese do Rio para o Cristo Redentor (condição 39: precedência
  absoluta, nada com o Redentor vai ao ar antes do pedido enviado).
- **`gastos.xlsx` conferido em extrato** e a linha de queima mensal.
- **Mídia paga**: zero real antes do purchase medido no DebugView. Não é
  tarefa, é trava.

## 5. Ritual de saída

1. `npm run vitrine:portoes` (incluindo os portões novos que você criou),
   `npm run typecheck` e `node scripts/geometry/validate.mjs`, todos verdes.
2. Atualize `docs/ESTADO.md` (data `atualizado:` de hoje) com o que mudou e o
   que ficou bloqueado aguardando o dono; no brain, `estado.md` se algum fato
   de negócio mudou e **append** no `log.md`.
3. Commit e push nos repositórios tocados (PR quando a mudança pedir revisão;
   a tarefa 9 fica em PR rascunho até o aval).
4. `npm run sessao:fim`: enquanto imprimir `[FALTA]`, a sessão não terminou.
   O que ficar de fora de propósito, escreva o motivo na última resposta.
