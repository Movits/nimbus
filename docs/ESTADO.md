---
status: vigente
atualizado: 2026-07-31
---

# Estado do projeto

Esta é a única página que envelhece rápido. Leia antes de agir e atualize ao sair.

## Sequenciamento vigente (29/07, ordem do conselho da 2ª rodada)

Máximo 3 frentes ativas, nesta ordem:
1. **Vitrine v2** (`public/loja/`): timebox de 5 dias úteis; se estourar, corta-se
   escopo visual, nunca funil nem medição. Ata e prompt em
   `nuvemshop/auditoria/2026-07-29-conselho-vitrine/`.
2. **Capas de produto**: reconstrução com o compositor novo (6 suspeitos + 4 sem torso primeiro).
3. **Avaliação IzzyPrint** (amostras Boxy + Oversized + Canguru em G; aguarda WhatsApp).

### Vitrine v2, estado de 30/07 (dia 3)

Dia 2 **publicado e aceito pelo dono em 30/07** (header pela régua da landing,
UTM, copy sem "sob demanda" e sem "Loja oficial", lints `link-check` e
`parity-tokens`, cenários canônicos, GATES B e C no ar).

Dia 3 (feedback do dono de 30/07, decisão em
`docs/decisoes/2026-07-30-visual-loja-e-sacola.md`):

- **Visual pela loja publicada**: announcement e footer claros (footer com borda
  dourada e faixa legal navy), títulos e botão primário navy, sublinhado ouro no
  nav. A vitrine e a loja devem ficar idênticas; o que faltar do lado Nuvemshop
  é lote único no painel, pós aceite.
- **Sacola sem sair da vitrine**: PDP com POST do formulário oficial da loja em
  iframe oculto + contador local; handoff só no carrinho. **Pendente: teste de
  funil em produção com 2 produtos antes de considerar aprovado.**
- **GATE A fechado em 30/07: variante A** (grid atual, 4 colunas a partir de
  1100px). Escolha do dono no mesmo dia em que o protótipo foi ao ar; a página
  `prototipo-grid/` e as variantes B e C saíram do código.
- **Curadoria de fotos por cor: adiada por ordem do dono (30/07).**
- **Catálogo completo na vitrine (ordem do dono, 30/07 à noite): 44 produtos.**
  Entra todo produto com copy PRONTO (17 STREET, 25 RELÍQUIA, 2 NUVEM); os 5
  Blusão Moletom continuam fora (BLOQUEADO POR DADO YOUDRAW, sem tabela de
  medidas). Os 8 heroes viram `destaque: true` e são o grid da home; as coleções
  listam tudo. Sem curadoria por cor, a foto da cor é a `colorImages` do
  products.json (a mesma capa que a loja usa) e o card fica sem hover para não
  piscar cor errada. Lints verdes: lint-copy nos 44, link-check com 50 páginas
  e 152 URLs externas.
- **Sacola aprovada no teste do dono (30/07)**: 2 itens chegaram ao carrinho com
  tamanho e cor certos, sem desafio, contador batendo. Pendência que sobrou do
  teste: navegar pelo menu da loja Nuvemshop não volta para a vitrine.
- **Nova direção do dono (30/07): a vitrine é a referência de design; a Nuvemshop
  é só o funil (carrinho + checkout).** Desdobramentos:
  - **Header da loja lendo como a vitrine — FEITO em CSS** (Rodada 8): esconde
    Buscar e Conta, Carrinho vira pill "Sacola", hover dourado no nav. No
    consolidado `nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css`
    (regenerado, 50,7 KB), conferido por screenshot. **Falta o dono colar** no
    painel (Edição de CSS avançada).
  - **Menu da loja → vitrine: FEITO pelo dono no painel e verificado no ar em
    30/07** (os 5 itens com as URLs e UTMs da tabela; Sobre, Projetos Sociais e
    Contato mantidos internos). Com logo e "Seguir comprando" já no ar, o funil
    está 100% fechado. Retoque opcional sugerido: menu do rodapé da loja ainda
    aponta Trocas/Envios para /contato/; URLs das páginas novas entregues ao dono.
  - **Logo e "Seguir comprando" → vitrine: NO AR em 30/07.** O dono aceitou o
    pedágio do FTP, baixou o tema pelo WinSCP (FTP com TLS explícito, hotspot,
    porque a rede do trabalho bloqueia a porta) e subiu os 4 arquivos que eu
    editei: `snipplets/header/header-logo.tpl` (logo → vitrine, componente
    substituído por markup explícito), `snipplets/cart-totals.tpl` ("Ver mais
    produtos" → vitrine), `snipplets/cart-panel.tpl` e `templates/cart.tpl`
    (aviso de sem estoque → vitrine). Verificado no ar: página do carrinho na
    hora, e a home da loja confirmada às 21:58 UTC de 30/07, depois de o cache
    de página da plataforma drenar. Backup
    completo do tema + os 4 editados em `nimbus-assets/nuvemshop/tema-baires/`.
    **O Baires agora está congelado (sem atualizações automáticas); manutenção
    manual com a doc oficial docs.nuvemshop.com.br/help.**
  - **CSS Rodada 8 colado pelo dono e conferido no ar em 30/07** (bloco inline da
    loja com as regras novas; o editor só reescreveu `::after` para `:after`).
- **30/07, tarde (pedidos do dono ao usar o site):**
  - **Vitrine renomeada para `/loja/`** (`nimbuswear.com.br/loja/`): URL
    profissional no lugar de `/loja-preview/`. Todos os builds e lints migrados;
    caminhos antigos redirecionam por stubs gerados pelo build + `404.html`.
  - **CTAs da landing** (Topbar e os 2 botões do Overlay) agora levam à vitrine
    `/loja/`, não mais à Nuvemshop.
  - **Cache de retorno**: service worker (`public/sw.js`, escopo do domínio)
    para o GitHub Pages não expirar tudo em 10 min: assets com hash em
    cache-first, imagens em stale-while-revalidate, HTML em network-first.
    Registrado no `main.tsx` (landing) e no `ui.js` (vitrine). A textura das
    nuvens 3D do drei foi **auto-hospedada** (`img/drei-cloud.png`): antes vinha
    de CDN de terceiros (rawcdn.githack.com) a cada visita, e derrubava o app
    offline. Verificado local: recarga offline monta a landing completa.

**Conselho, 3ª rodada (30/07, convocada pelo dono)**: 14 análises independentes
sobre o site no ar, pauta consolidada por Helena Vasquez, 10 aprovar + 4
ressalvas (todas de ordem de execução, incorporadas). **Pauta final: 12 itens**
(5 P0: gates no build antes de deploy novo, GA4 com privacidade e tracking
plan, páginas legais + CNPJ, página dos 10% com prova, consertos de jornada;
7 P1: disclaimer único, bloco devocional por arte, relacionados no build, régua
de frete grátis, medidas + caimento, gates completos, sitemap + Search
Console). Ata completa em
`nuvemshop/auditoria/2026-07-30-conselho-vitrine-r3/ata-conselho-vitrine-r3.md`.
**Go do dono dado em 30/07 ("legal pode corrigir") e respostas registradas em
`docs/decisoes/2026-07-30-respostas-do-dono-r3.md`.** Executado na sequência:
P0-1 (lints no deploy), P0-3 parcial (Trocas e Envios no ar; CNPJ segue
bloqueador), P0-4 (página /loja/impacto/ com a fórmula do dono e Diário de
Repasses), P0-5 (Instagram e TikTok no footer) e o preparo do P0-2
(/loja/privacidade/ no ar; snippet GA4 inerte à espera do ID que o dono vai
gerar).

**Leva P1 completa NO AR (31/07, PR #25, go do dono "vai")**: bloco devocional
por arte nos 8 destaques (`scripts/vitrine/devocional.json`; escalar aos 44
exige gate do dono), breadcrumb, relacionados "Complete o conjunto", caimento
por peça, disclaimer de fotos só na galeria da PDP (saiu do footer), régua do
frete grátis estática (PDP, Ecobag como completa-pedido) e dinâmica (toast com
valor da sacola em localStorage), gate novo `lint-claims.mjs` no build e no
deploy (frete grátis sem condição, overclaims, CDN acima de -640-0.webp,
JSON-LD divergente do catálogo), `sitemap.xml` (53 páginas públicas) e
`robots.txt` gerados no build. Da pauta resta só o Search Console (precisa do
Google do dono; o sitemap já está pronto para envio).

**Feedback do dono aplicado em 31/07 (PR #27, no ar)**: relacionados deixou de
sugerir a mesma arte em outra peça e virou "Você também pode gostar" (outras
artes da mesma coleção, mesma peça primeiro); nota da galeria informa que as
pessoas das fotos vestem tamanho G (só peças com numeração); **GA4 ATIVO** com
o ID `G-E041S3ZHWB` gerado pelo dono (vitrine via `GA4_ID` no build-paginas e
landing via index.html). Senha do FTP rotacionada pelo dono em 31/07; tema
segue congelado.

**Frete grátis NOVO no ar (31/07, PR #29, decisão do dono)**: teto de
**R$399,90 com Ecobag de brinde** (arte escolhida na mensagem do checkout).
Announcement, notas da PDP (avisam que o frete do CEP aparece na sacola), toast
("Faltam R$X para frete grátis e Ecobag de brinde"), /envios/ (nova seção
"Quanto custa o frete": peso + CEP na sacola) e lint-claims (exige a condição
dos R$399,90) trocados juntos; zero sobras de R$199 no site. **PENDENTE DO
DONO: configurar a regra de frete grátis a partir de R$399,90 no painel da
Nuvemshop e alinhar a barra de anúncio da loja** (instruções entregues no
chat); o brinde é operacional, adicionado por ele em cada pedido elegível.
Frete abaixo do teto: repassar o cálculo do checkout, sem subsídio (decidido).
GA4 ganhou os eventos `view_item` e `add_to_cart` na PDP (mesmo PR).

**Busca prévia INPI feita em 31/07** (pePI, classe 25, exata + radical):
"NIMBUS" nominativa tem histórico hostil na classe 25: pedidos de 2009 e 2023
INDEFERIDOS, um "NIMBUS" de 2020 (GS3 Ind. e Atacado do Vestuário) sub judice,
e a ASICS mantém GEL-NIMBUS (2010) e NIMBUS MIRAI (2024, Madri) EM VIGOR.
Recomendação registrada: não depositar "NIMBUS" palavra sozinha; tentar marca
MISTA "NIMBUSWEAR" com o logotipo nuvem+auréola, ciente do risco moderado, ou
consultar agente de PI antes da taxa. Detalhe no brain
(`wiki/concepts/dominio-e-marca.md`). Planilha de gastos criada em
`nimbus-brain/financeiro/gastos.xlsx` (R$6.150 estimados até 31/07; YouDraw,
domínio e Canva a preencher pelo dono).

**Sala de aprovação em `/loja/gates/`**: GATES B e C **fechados em
29/07**. STREET definitiva: beco de São Paulo (Brasília SCS em espera).
Manifesto: beco em sombra, no ar na banda da home. Hero: **remix B** com casting
(contra-plongée nas colunas do Planalto), no ar na home; remix A e a antiga cena
sem pessoas ficam em espera na sala. Originais em
`nimbus-assets/marketing/2026-07-29-vitrine/`. Nada entra nas páginas da loja
antes do ok, gate a gate.

**Bloqueado até nova ordem**: ticket Nuvemshop do script onload (retirado em 29/07).

**Ciclo de 31/07 (tarde e noite), tudo NO AR**: o dono TEM um MEI (CNPJ
53.977.834/0001-18, ATIVA, CNAE alterado para vestuário) e ele está no rodapé
de todas as páginas: **bloqueador legal do lançamento FECHADO** (PR #36).
Frete fixo da loja: R$19,90. Brinde virou mecânica real: **cupom `ECOBAG`
criado e validado no painel** (R$49,90 fixos, mínimo R$449,80, restrito ao
produto Ecobag, testado nos dois lados do limite). Sacola ganhou **gaveta
lateral** (itens, régua de progresso, festa ao cruzar a meta, checkout) e
**sync com o carrinho real** via cookie `nimbus_sacola_loja` gravado pelo
`templates/cart.tpl` do tema (lado da vitrine no ar; **pendente do dono: subir
o cart.tpl por FTP**, arquivo em
`nimbus-assets/nuvemshop/tema-baires/2026-07-30-funil-editado/`). Cache
busting `?v=hash` nos ativos. **Correção da régua do brinde (31/07 à noite,
bug achado pelo dono)**: a barra contava só peças e ignorava ecobags; a regra
certa, tradução exata do cupom, é **total da sacola menos UMA ecobag >=
R$399,90** (ecobags extras contam). `ui.js`/`produto.js`/`envios` trocados
juntos; teste Playwright com 4 sacolas (incluindo a do print do dono) 4/4.
MEI: e-CAC verificado, sem Termo de Exclusão, dívida constituída R$1.202,33,
PGFN limpa; dossiê da advogada no chat. Detalhe vivo no brain (`estado.md`).

**Gaveta editável e fim do corte das fotos (31/07 à noite, PRs #41 e #42, no
ar)**. Sacola: cada linha ganhou passo de quantidade e botão de remover, com
**Desfazer** no lugar de `confirm()` e região `aria-live`; a régua, o badge e a
festa recalculam a cada edição. Como o POST de adicionar não tem volta na loja,
a edição é gravada no cookie de alvo `nimbus_sacola_alvo` (domínio pai) e o
`cart.tpl` aplica no carrinho real com `LS.removeItem` (nimbus-assets#23),
consumindo a ordem ao aplicar; **vale a partir do upload por FTP**. Fotos: o
card forçava retrato 4/5 numa foto quadrada e comia 20% da largura, e na PDP o
`aspect-ratio: 1/1` nunca valia porque faltava `height: auto` contra o atributo
`height="500"` (cortava 24% no desktop e 39% no celular). Card, PDP, thumbs e
miniatura da gaveta passaram a 1:1 com `contain`; logo do rodapé com `contain`
(distorcia 2,2%). Varredura de todas as imagens de todas as páginas em 390 e
1440: zero corte em foto de produto. **Auditorias de UX e de UI em 6 e 5
frentes com verificação adversarial rodaram em 31/07**; o plano de execução
delas orienta a próxima leva.

## Capas

**77 das 78 variantes existem em disco.** A 78ª é a Ecobag, mantida de propósito
(a pipeline não processa painel plano).

**⛔ O lote NÃO está publicável.** Em 26/07 o dono reprovou as 77 depois de olhar
em resolução real. Três defeitos, todos confirmados por medição depois:

1. **Estampa parecia colada.** O compositor curvava a arte num cilindro liso e
   multiplicava por uma sombra suavizada — retângulo de bordas retas sobre pano
   amassado. Corrigido: a arte agora é deformada e sombreada pelas dobras do
   próprio tecido.
2. **Estampa torta.** O eixo do painel era estimado pela silhueta, que inclui
   manga e braço. No Aparecida Spray o erro era de **5,4 pontos**. O check de
   centro tinha sido rebaixado por mim para informativo, e por isso passou em
   todas.
3. **Arte por cima do capuz.** Regressão do compositor novo, já corrigida: a
   oclusão voltou a ser parte da composição, com o polígono guardado na receita.

**Três pilotos refeitos e aprovados** com o compositor novo (352718999 branca,
352889132 preta, 352618878 preta). O dono aprovou o resultado visual.

**Próximo passo:** varrer as 77 receitas atrás de `torso` e `centro` errados, e
reconstruir o catálogo uma capa por vez. Um agente já encontrou que a receita do
352718999 usava `torso 0.44`, que é a largura **manga a manga** — dobrava o raio
da malha e achatava a estampa. É provável que o vício se repita.

## Reavaliação de plataforma e modelos (28/07)

O dono avalia **migrar da YouDraw para a IzzyPrint** (<https://izzyprint.com.br/>).
Plano: criar produtos-teste na IzzyPrint, **comprar amostras** e julgar a
qualidade; só então decidir migração, integração com a Nuvemshop (existe, mas
não é API pública — foi confirmada com eles por contato direto) e novas fotos.
Nada foi migrado ainda; a YouDraw segue sendo a produção vigente.

Decisões do dia:

- **Modelos oficiais = casting de 16/07** (Caio, Clara, Gabriel e Helena), em
  `nimbus-assets/casting/2026-07-16/`. Os **149 blanks antigos** (modelos
  avulsos por produto, base YouDraw) foram **removidos** do assets: eram de
  produtos que não vamos usar. Recuperáveis pelo histórico do git. O fluxo
  blank + arte + receita continua válido — será refeito sobre a base nova
  quando a plataforma estiver decidida.
- **Varredura das 77 receitas feita** (`2026-07-28-varredura-receitas.md`): 6
  torsos suspeitos, 4 sem torso. Vale como histórico de medição; a
  reconstrução aguarda a decisão de plataforma.
- **Nenhuma arte chega a 300 DPI** no tamanho em que imprime
  (`2026-07-28-dpi-artes.md`): padrão de export foi 3500 px para 40 cm =
  222 DPI. Para POD premium (IzzyPrint recomenda 300), as artes precisam de
  re-export/regeneração a 4724 px de altura, ou vetorização. A IzzyPrint
  também limita 30×40 cm no editor público, e temos costas de até 35,2 cm —
  confirmar o limite do fluxo POD na conta.

## Medições fechadas

- Placement por produto, régua-pela-arte sobre os 48 mockups oficiais.
- Datum resolvido: a "altura" da tabela YouDraw é **gola→barra**.
- Horizontal: a arte é centrada no produto, mediana de desvio **0%**.
- Comprimento do Blusão: 78,4 cm, **estimado**, com a ressalva registrada.
- 352727892 reclassificado de Blusão para Moletom Canguru.

## Pendências do projeto

0. **Avaliar a IzzyPrint**: produtos-teste na conta do dono, compra de
   amostras, tabela de custos POD, integração Nuvemshop, área máxima de
   estampa e white label. Se aprovada: refazer artes a 300 DPI, novos blanks
   com o casting e integração.
1. Reconstruir o catálogo com o compositor novo (aguarda a decisão de
   plataforma).
2. Publicar, com autorização produto a produto.
3. Reconciliar 49 produtos e variantes entre Nuvemshop e YouDraw.
4. Completar páginas de produto: material, modelagem, medidas, prazo POD,
   política, impacto social.
5. Finalizar páginas legais e de ajuda.
6. Validar analytics e eventos do funil antes de anúncio pago.
7. Confirmar com a YouDraw a tabela de medidas do Blusão Moletom.

## Reorganização de 26/07

O projeto passou a viver em **dois repositórios**: o público (código,
documentação, medições, receitas) e `Movits/nimbus-assets`, privado, com as
artes, os blanks e os mockups. `node scripts/setup-assets.mjs` mescla os dois.

Provado de ponta a ponta: clone limpo dos dois + `npm install` + `setup-assets`
compõe uma capa.

As **capas compostas ficaram fora do repo de assets** de propósito. São
deriváveis de blank + arte + receita, e as receitas estão versionadas. Eram 559
MB de iterações mais 215 MB de diagnóstico.

Cinco conflitos de instrução foram neutralizados, incluindo a terceira auditoria
invalidada que estava sem aviso nenhum. `docs/` passou a ser roteado por tarefa.

## Suspeitas abertas

- A capa publicada do **352727892** pode estar com a peça errada: uma das duas
  fotos no ar não mostra capuz, e o produto é Moletom Canguru. Confirmar na loja.
- O medidor de eixo automático (`scripts/geometry/eixo-costas.mjs`) **não é
  confiável**: mediu o tronco pela metade em peça preta. O eixo hoje se mede por
  leitura visual dos vincos de cava. Consertar ou aposentar.
