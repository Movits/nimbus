---
status: vigente
atualizado: 2026-08-04
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
JSON-LD divergente do catálogo), `sitemap.xml` e
`robots.txt` gerados no build. **Atualização de 03/08**: desde 01/08 (commit
`3866da3`) a vitrine está FORA do índice do Google por decisão
(`VITRINE_INDEXAVEL = false` no `build-paginas.mjs`, até haver fotos com
modelo): o sitemap gerado tem **1 URL** (a landing) e o `robots.txt` tem
`Disallow: /loja/`. As "53 páginas" valeram só até essa chave virar. Reabrir ao
Google = virar a chave e regerar com `npm run vitrine`; o Search Console segue
esperando o Google do dono.

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
dos R$399,90) trocados juntos; zero sobras de R$199 no site. **CUMPRIDO em
31/07 pela sessão Cowork do painel**: regra de frete grátis a partir de
R$399,90 configurada e testada com CEPs reais (Brasília 71620-045 e São Paulo,
R$449,80 = frete R$0) e barra de anúncio alinhada. O brinde é operacional,
adicionado pelo dono em cada pedido elegível.
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
`nimbus-brain/financeiro/gastos.xlsx` (**R$6.800 até 31/07**, com YouDraw,
domínio e Canva preenchidos pelo dono em 31/07).

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
1440: zero corte em foto de produto. **Auditorias de UX (6 frentes) e de UI (5 frentes) com verificação
adversarial rodadas em 31/07: 52 e 28 achados confirmados.** As duas levas 1
foram ao ar em 01/08 (PRs #43 e #44). UX: gaveta virou diálogo de verdade
(aria-modal, inert, foco preso e devolvido; fechada, ela deixava 9 botões
focáveis invisíveis, um deles o Esvaziar), contraste corrigido (#7a8495 a
3,63:1 em 44 cards, #8b97a8 a 2,85:1 no botão de remover, kicker dourado
parado em 3,63:1), subtotal e linha de frete na sacola, badge até 99, alvos de
toque a 44px, institucionais a 40em (rodavam a 166-197 caracteres por linha),
toast do celular na largura da tela e abrindo a gaveta em vez de mandar o
cliente para a loja, bug do Desfazer que apagava o que entrou depois da
remoção, e copy proibida que estava no ar (a PDP da Ecobag citava a YouDraw; a
landing tinha travessão no title e "sob demanda" na descrição do Google). O
lint-copy passou a varrer a landing e o content.ts. UI: régua de escala por
peça na grade (bbox medido: Oversized ocupava 493px de 500 contra 409 da
Premium), pílula Sacola em navy, cabeçalho de coleção com altura em clamp e
foco por coleção (a 1920 a igreja virava laje de parede), select na fonte do
site, hover do tile sem fresta, preço da gaveta sem colisão de especificidade,
grid do tablet a partir de 700px e card do celular com preço em linha própria.
Planos completos das duas levas 2 no scratchpad da sessão e resumidos ao dono.

### Teste de carrinho em produção (01/08) e o portão que nasceu dele (02/08)

**O primeiro teste de verdade do funil aconteceu em 01/08**, no navegador, com o
Cowork operando a máquina do dono. Resultado: **43 dos 44 produtos entram no
carrinho com a variante certa**, e a Ecobag não entrava.

- **A URL do carrinho é `/comprar/`, não `/cart`.** O `/cart` responde 200 e
  devolve outra página. Foi lendo a página errada que eu concluí, errado, que o
  tema publicado tinha divergido do backup.
- **O rótulo da variante é `(GG, Preta)`**: parênteses, tamanho antes da cor,
  vírgula. O `cart.tpl` esperava `Preta / G` e fazia `split("/")`.
- **A Ecobag:** a vitrine mandava dois eixos (`Único` e `Crua`) e a loja só tem
  um (`Bege`). O POST ia, a loja recusava a combinação e o cliente voltava para
  uma sacola vazia, **sem erro na tela**. Como a Ecobag é o brinde do frete
  grátis e o produto restrito do cupom ECOBAG, era o pior lugar para isso.
- **O teste da remoção que atravessa os dois sites ficou pendente**, porque
  depende do upload do `cart.tpl` novo por FTP.

**Portão novo: `scripts/vitrine/parity-variantes.mjs`** (`npm run
vitrine:variantes`). O teste manual só alcançou 2 produtos; este alcança os 44.
Ele lê o `LS.variants` que o tema imprime em toda página de produto (a lista de
variantes reais, com `option0`, `option1`, preço, SKU e disponibilidade) e
compara com o que o formulário da vitrine realmente POSTa: número de eixos,
valores aceitos, **ordem** (`option0` é tamanho, `option1` é cor, a mesma ordem
do rótulo do carrinho), id do produto, preço e estoque. Rodado em 02/08:
**44 de 44 casam**. Aceita `SKIP_REDE=1` para pular offline, como o
`link-check`. Todos os portões juntos: `npm run vitrine:portoes`.

### Endereços escritos nos documentos (02/08)

**O painel da Nuvemshop fica em <https://loja.nimbuswear.com.br/admin>**, no
domínio da própria loja. **Não existe `dashboard.nuvemshop.com.br`**; eu escrevi
esse host de memória num roteiro versionado e o dono bateu num
ERR_CONNECTION_TIMED_OUT.

Daí nasceu **`scripts/link-check-docs.mjs`** (`npm run docs:links`), que bate em
todo endereço escrito em markdown nos três repositórios. O `link-check.mjs`
cobria só as páginas geradas da vitrine, e é no markdown que moram as instruções
que uma pessoa vai seguir. Classificação: **erro** quando não responde nada (DNS,
recusa, tempo esgotado) ou 404/410; **aviso** em 401, 403 e 429, porque aí o host
existe e o que barrou foi login ou proteção antirrobô; **OK** em 2xx e 3xx.
Exceções ficam em `link-check-docs.allow.json`, uma por vez e com motivo escrito.

Primeira rodada, 160 documentos e 102 endereços. Achou 8 mortos, entre eles
**duas fontes inventadas**: as duas citações de `blog.youdraw.com.br`, host cujo
DNS não resolve, uma delas em `loja-plataforma.md` e outra no plano de
implementação. Não eram links que quebraram, eram links que nunca existiram.
Também caíram a página da AskPot (410 Gone) e o site da God In Heaven (domínio
fora do ar). As quatro exceções legítimas: o clone do repositório privado (o
GitHub responde 404 para quem não está autenticado), a URL do CSS que é citada
justamente por dar 404, e dois documentos históricos onde a URL errada é o
próprio registro do erro da época.

### O `ਐ` do rodapé, e o conserto que salva a quebra de linha (02/08)

O rodapé publicado diz **"feito no Brasil.ਐ% do lucro"**. O `ਐ` é GURMUKHI
LETTER AI, U+0A10. A regra era `content:"...Brasil.\A 10% do lucro..."`, onde o
espaço depois do `\A` é o **delimitador do escape**, não texto. O minificador do
painel come espaço, entregou `\A10%`, e o navegador leu `A10` como hexadecimal.
Um caractere punjabi no meio da frase dos 10% para projeto social, em **todas as
páginas da loja** (conferido na home, PDP, carrinho, sobre e contato).

O primeiro conserto tirava a quebra de linha. **O conserto certo é escrever o
escape com seis dígitos: `\00000A`.** A especificação encerra o escape depois de
seis dígitos hexadecimais, então ele dispensa delimitador e não sobra espaço
para o minificador comer. Medido em Chromium: `\A 10%` e `\00000A10%` produzem a
mesma string, e só a de seis dígitos continua igual depois de minificada. A
quebra de linha do rodapé voltou.

**Os 12 escapes dos quatro CSS da loja foram convertidos**, não só o do rodapé.
Os outros ainda não tinham quebrado por sorte de contexto: `\A Envios` viraria
`®nvios`, porque `AE` também é hexadecimal válido.

**Portão novo: `scripts/verifica-css-loja.mjs`** (`npm run loja:css`). Ele não
confere padrão de escrita, confere **comportamento**: pega todo `content:` dos
CSS da loja, simula o que o painel faz (apagar o espaço depois do escape) e
compara a string calculada pelo navegador nos dois casos. 14 escapes conferidos,
zero divergem. **Este CSS não sobe por Git**: a Nuvemshop não faz deploy por
repositório, e o dono cola em Loja online → Layout → Edição de CSS avançada.

### O funil provado de ponta a ponta (03/08)

**O teste 4 passou.** É a primeira prova real de que a sacola da vitrine e o
carrinho da loja são o mesmo carrinho. Rodado pelo Cowork no navegador do dono,
depois que o `cart.tpl` novo subiu por FTP:

- Duas linhas no carrinho da loja, `(P, Preta)` e `(GG, Preta)`.
- Removeu **só o P** pela gaveta da vitrine.
- No carrinho da loja sobrou **só o GG**.

O espelho mandou `pid` e `partes: ["gg","preta"]`, ou seja, o parser leu o
`(GG, Preta)` direito. É exatamente onde a versão anterior falhava: sem as
partes, a P e a GG do mesmo modelo colapsavam numa chave só e remover uma
removia as duas.

> [!warning] A remoção leva cerca de **15 segundos** depois de o carrinho
> carregar. Quem conferir rápido demais conclui que falhou. O caminho é longo de
> propósito: a vitrine grava o cookie `nimbus_sacola_alvo`, a loja carrega, o
> `MutationObserver` do `cart.tpl` dispara com 600 ms de folga, o `aplicaAlvo`
> chama `LS.removeItem`, e a loja redesenha a lista.

**O que fecha o funil:** adicionar funciona nos 44 produtos (com portão
automático desde 02/08) e remover atravessa os dois sites. Nada mais depende do
FTP.

### O CSS do rodapé, parado no último clique (03/08)

O `ਐ` continua no ar. O Cowork chegou até o fim da colagem e parou no B4: achou
o campo em **Layout → Editar layout atual → Edição de css avançada**, guardou o
backup do conteúdo antigo (54.029 bytes) e carregou o CSS novo no campo, mas
**o clique em "Publicar alterações" não salva quando feito por script**. No
clique saem só chamadas de analytics, nenhuma com `css_code`. O painel roda em
`nimbus40.lojavirtualnuvem.com.br`, domínio para o qual a extensão do navegador
não tem permissão, então clique de verdade e screenshot são negados ali.

Ele **não forçou um POST na mão**, e essa foi a decisão certa: seria mexer por
baixo do aplicativo numa loja ativa sem enxergar o resultado. A regra fica.

De quebra, ele confirmou a causa raiz que eu tinha deduzido: **o CSS guardado no
painel não tem `\A10%`, tem o caractere gurmukhi já resolvido, cru.** O
minificador comeu o escape e **gravou o caractere**. É a prova de que o
`\00000A` de seis dígitos resolve, e de que recolar é mesmo o único caminho.

Falta um clique: o do dono, ou o do Cowork com permissão para aquele domínio.
Roteiro em `nuvemshop/cowork-publicar-css.md`.

### O clique saiu: CSS PUBLICADO no painel (03/08, fim do dia)

A sessão local publicou pelo Claude in Chrome, no navegador logado do dono e
com a autorização dele, seguindo o roteiro: backup conferido por hash (o campo
era byte-idêntico ao `backup-css-painel-2026-08-02.txt`; cópia de 03/08
gravada), o arquivo canônico buscado do raw da main e validado por SHA-256
dentro da própria página, colado no campo, **Testar CSS** e clique real em
**Publicar alterações**. Prova de que salvou: recarregando o editor do zero, o
CSS GRAVADO tem 50.736 caracteres, contém `\00000A10% do lucro` e **zero**
`ਐ`. O que resta é o cache de página da plataforma drenar (em 30/07 levou
horas); enquanto ele não drena, o HTML servido ainda mostra o caractere velho.
Conferir depois: home, `/produtos/wildstyle/` e `/comprar/` com Ctrl+F5.

### A sessão que quase se perdeu, e os portões no Windows (03/08)

**O PR #52 estava em RASCUNHO e nunca tinha sido mesclado.** O handoff da sessão
de 03/08 prometia `docs/HANDOFF-SESSAO.md` e `nuvemshop/cowork-publicar-css.md`
"na main", mas eles só existiam no branch do PR. A sessão local de 03/08 achou o
PR, revisou o diff inteiro e mesclou. Lição repetida do projeto: **push sem merge
não entrega**; conferir o estado do PR antes de encerrar a sessão.

**Os sete portões passam no Windows** (a máquina do dono), depois de dois
consertos de portabilidade que não mudam critério nenhum:

- `verifica-css-loja.mjs` importava o Playwright por caminho absoluto de Linux.
  Agora tenta o pacote local (`playwright` virou devDependency) e cai para o
  caminho da nuvem; o `executablePath` só é forçado se `/opt/pw-browsers`
  existir. Mesmo veredito da nuvem: 14 escapes, zero divergem.
- `link-check-docs.mjs` mandava o corpo do curl para `/dev/null`, que não existe
  no Windows: o curl saía com erro 23 e **todo endereço parecia morto** (101
  falsos mortos numa rodada). Agora usa o `devNull` do Node. Rodada limpa: 94
  OK, 6 exceções com motivo, e **2 mortos de verdade** que o portão pegou: o
  `dashboard.nuvemshop.com.br` sobrevivendo no roteiro FTP do `nimbus-assets`
  (corrigido; roteiro marcado `status: concluido`, missão cumprida em 03/08) e o
  endpoint MCP da Nuvemshop numa página histórica do brain (exceção cadastrada:
  não responde a GET sem sessão OAuth, mas foi usado de verdade em 24/07).

**Branch `fix/sacola-sync-preserva-pid`: SUPERADO, não mesclar.** Ele casava o
espelho com a loja por nome normalizado; a main casa por **pid + partes da
variante** (o mesmo desempate do `cart.tpl`) desde o conserto de 01/08, e foi
com o código da main que o teste 4 passou em 03/08. Proposto ao dono: apagar o
branch. O PR #1 ("Varredura das receitas"), também antigo, segue aberto — a
varredura já está registrada como feita em 28/07.

**`nimbusloja.js` saiu do limbo**: a única cópia do loader do ticket de onload
(retirado em 29/07) estava untracked na raiz do checkout do dono. Versionado em
`nuvemshop/nimbusloja.js` com anotação de status: o alvo
`public/loja/nimbus-loja.css` não existe DE PROPÓSITO (o 404 é a prova cadastrada
no allowlist) e criá-lo sem decisão explícita ativaria o override em silêncio.

**Máquina do dono sincronizada e ligada aos três repos**: o checkout estava 112
commits atrás (o brain, 131, com curadoria de 23-24/07 nunca commitada — 
reintegrada e empurrada, ver o log do brain). `C:\Users\rober\nimbus-brain` é
uma **junction** para o vault aninhado `Nimbus\Nimbus brain` (o Obsidian do dono
mora lá); não clonar por cima. `setup-assets` mesclou as 16 artes NUVEM 4K de
02/08 na árvore local.

### Doctor de 03/08: revisão geral dos três repositórios

A pedido do dono, varredura de saúde completa (7 frentes + verificação
adversarial): **65 achados confirmados e aplicados** no mesmo dia. Os que
mudam comportamento:

- **As FONTES do build do CSS (16/07 e 17/07) ainda tinham os escapes `\A `
  curtos** — regenerar o consolidado reintroduziria o `ਐ`. Convertidas para
  `\00000A` e o portão `loja:css` ampliado para cobri-las (22 escapes
  conferidos, zero divergem).
- **`lint-copy` agora varre `nuvemshop/pagina-*.html`**; a `pagina-sobre.html`
  tinha "sob demanda" duas vezes e foi reescrita (recolar no painel só com
  autorização).
- A régua de docs valeu para tudo: handoffs e prompts executados ganharam
  `status:` e banner (5 prompts Cowork moveram da raiz para `nuvemshop/`;
  `HANDOFF-SESSAO-LOCAL` foi para `docs/historico/`), 24 scripts de métodos
  superados ganharam banner de uma linha + `scripts/LEIA-ME.md` com o mapa
  vivo/superado, `precificacao.md` marcado superado (frete R$199 e cupom de
  estreia morreram em 31/07), `eixo-costas.mjs` aposentado.
- **Correções de fato neste ESTADO** (cada uma no seu lugar acima): sitemap
  hoje tem 1 URL (`VITRINE_INDEXAVEL=false` desde 01/08), a regra dos
  R$399,90 foi configurada em 31/07 (não estava pendente), gastos fecharam em
  R$6.800.
- **94 JPGs de diagnóstico** saíram do índice do repo público (gitignore
  ampliado); no assets, wordmark duplicado removido e diagnósticos de mockup
  fora do índice.
- Brain atualizado em peso: frete R$399,90 nas 11 páginas que ensinavam R$199,
  tema Baires no lugar de Morelia, asa escolhida no lugar de "não presuma",
  ticket onload como retirado, contadores do índice recontados, overview
  destravado de 01/07.
- Limpeza de branches, concluída por delegação do dono ("seja o juiz"): PR #1
  fechado; TODOS os branches antigos viraram **tags de arquivo** e foram
  apagados — os commits ficam alcançáveis para sempre e a lista de branches
  ficou só com a `main`. Tags: `review` (mesmo nome do branch, de propósito:
  preserva as URLs `raw.../review/...` citadas em docs históricos — conferido
  respondendo 200 após a troca), `arquivo/2026-06-18-hotprinti`,
  `arquivo/2026-07-01-impulso-docs`, `arquivo/2026-07-02-loja-v3`,
  `arquivo/2026-07-28-pivo-capas` (a história do pivô, com o script de
  publicação por API que pode voltar a servir) e
  `arquivo/2026-08-01-sacola-nome-normalizado`.

### Conselho, 4ª rodada (03/08): consenso pleno em duas votações

Convocado pelo dono com regra nova: rodadas de votação até consenso pleno.
Mesma bancada da r3 (14 membros + presidência de Helena Vasquez), todos com
visita real ao site no ar. Pergunta da rodada: o que fechar ANTES de (a) abrir
a frente de estampas da NUVEM e (b) mandar tráfego em 29/09 e 12/10. Primeira
votação: 11 aprovar + 3 ressalvas (Falcão, Clara, Renata); os três ajustes
foram incorporados integralmente e a segunda votação fechou **14 a 0**.

**Pauta: 14 itens — 4 P0 bloqueadores de tráfego, 7 P1 amarrados à frente
NUVEM, 3 P2 condicionados.** Os P0: (1) GA4 na loja com cross-domain e UTMs
internos neutralizados, na ordem certa — hoje o funil morre sem medição no
domínio pagante; (2) lote único de painel: nome empresarial + CNPJ no rodapé
da loja, banner sem termo banido, Projetos Sociais em voz única com o
/loja/impacto/, e o furo do índice (a loja indexável enquanto a vitrine tem
noindex); (3) verdade nas promessas do ponto de decisão: nota da galeria
condicionada a foto real, parcelamento "12x" qualificado (o gateway cobra
16,65% a 23,44% da 2ª parcela em diante), lembrete do cupom ECOBAG no
/comprar/ via cart.tpl, e três linhas de conformidade (controlador na
privacidade, "devolvemos tudo o que você pagou" nas trocas); (4) margem de
contribuição por peça, teto de CAC e orçamento de mídia por escrito. A frente
NUVEM segue LIBERADA, mas nasce com portão de três condições (P1-1 a+b+c:
lints da NUVEM ativos, escopo do piloto commitado, tabela de medidas nas PDPs
quitada). **Sete perguntas aguardam o dono** (painel, data das fotos, margem,
print do campo dos 10%, Acutis até 12/10, carta do fundador, roteiro do pedido
pago). Ata completa em
`nuvemshop/auditoria/2026-08-03-conselho-vitrine-r4/ata-conselho-vitrine-r4.md`.

### P1-1 e P1-5 executados (03/08, à noite): portões da NUVEM e tracking plan

**Os portões a, b e c do P1-1 estão ATIVOS** (as três condições de lint do
portão de nascimento; faltam ainda P1-2 e P1-4 para a primeira arte):

- **(a+b+d) `npm run vitrine:nuvem`** (`scripts/vitrine/lint-nuvem.mjs`, no
  `npm run vitrine`, no `vitrine:portoes` e no deploy.yml): arte do catálogo
  sem entrada completa no `devocional.json` ou PDP gerada sem o bloco
  devocional QUEBRA o build (o fallback silencioso do build-paginas agora é
  falha); peça sem escala declarada em `escala-grade.json` (tabela nova,
  fonte de verdade conferida contra o loja.css nos dois sentidos) quebra;
  produto+cor sem par frente/costas quebra, com 7 exceções DATADAS de 03/08
  congeladas em `par-fotos.excecoes.json` (lista que só encolhe).
- **(c) `npm run producao:dpi300`** (`scripts/producao/lint-export-300dpi.mjs`,
  no `vitrine:portoes`): receita de export pinada em
  `docs/verdades/receita-export-300dpi.md` (300 DPI no maior uso; costas =
  4724 px de altura para 40 cm); 86 artes conferidas, 64 legadas de ~222 DPI
  numa baseline datada que só encolhe (re-export segue pendência 0). Roda
  local (precisa dos assets privados); `SKIP_ASSETS=1` só para ambiente sem eles.
- **(f) deploy.yml regenera as páginas** (`build-paginas.mjs` sobre o catálogo
  commitado) **e falha em diff sujo**: HTML velho commitado deixou de passar.
  Prova real na primeira execução do Actions após o push.
- **(g) `.github/workflows/monitor-diario.yml`**: agendado diário rodando
  parity-variantes e link-check CONTRA O AR, abrindo issue única ao falhar
  (drift de painel não dispara push). Falta a primeira rodada verde no
  Actions, que só existe depois do push.
- **PENDÊNCIA (e), não bloqueia o nascimento (ata)**: fallback de relacionados
  cross-coleção quando a mesma coleção rende menos de 3 (as 2 PDPs da NUVEM
  são becos sem saída). Exige editar `build-paginas.mjs`, em edição por outra
  frente em 03/08; quando existir, o check de >= 3 relacionados entra no
  lint-nuvem (antes disso ele falharia sempre, e portão não vira informativo).

**P1-5 entregue no repo**: `docs/fluxos/tracking-plan.md` (status: vigente) com
os 5 eventos vivos + `page_view` automático + `purchase` planejado (P0-1),
decisões por escrito sobre view_item_list/select_item/select_size e eventos
dos 10% e da régua (todos FORA por ora, com motivo), e a estrutura de metas de
29/09 e 12/10 **a preencher pelo dono**. Portão novo `npm run vitrine:tracking`
(`lint-tracking.mjs`, no `vitrine:portoes` e no deploy): evento no código fora
do plano, linha `ativo` sem código ou decisão atropelada quebram o build.
**Registro formal: o gate de baseline de 7 dias da r3 morreu sem dano e fica
substituído por instrumentação completa e validada (tag na loja + cross-domain
+ UTMs neutralizados + pedido-teste) antes do primeiro real de mídia.**
Pendências de painel/admin do P1-5 (sessão do P0-1/P0-2): filtro de IP do
dono, annotation do período pré-lançamento e evidência arquivada em
`nuvemshop/auditoria/`.

### Carta do fundador no repo e Projetos Sociais em voz única (04/08, madrugada)

- **P2-1 executado na parte que não depende de material**: a carta do fundador,
  escrita a pedido do dono (pergunta 6 da r4) e **APROVADA por ele em 03/08**,
  virou a institucional `/loja/manifesto/` no `INSTITUCIONAIS` do
  `build-paginas.mjs` (texto verbatim; sem foto e sem Instagram pessoal por
  ora, decisão do dono). CTA "O manifesto" do hero, link do header e do footer
  deixaram de gastar o clique na landing e apontam para a página; o
  `nuvemshop/pagina-sobre.html` do kit ganhou o link de volta (com `ref=loja`).
  A página respeita `VITRINE_INDEXAVEL`: entra no sitemap só quando a vitrine
  abrir ao índice. Restam do item: a foto, se o dono quiser, e a recolagem do
  Sobre no painel (lote do P0-2).
- **P0-2c pronto para recolar**: `nuvemshop/pagina-projetos-sociais.html`
  reescrita na voz do `/loja/impacto/`: o que chamamos de lucro, repasse
  mensal, comprovante no Diário de Repasses (2 links para a página do impacto,
  com `ref=loja`) e a mecânica REAL conferida no painel em 03/08: o cliente
  escreve o projeto no campo "Mensagem do cliente" do checkout. Zero
  "Divulgaremos periodicamente", zero "campo com três opções". Os três projetos
  e o "outro que você indicar" continuam; grid e modais preservados (as classes
  vivem no CSS do painel). A recolagem é do lote de painel do P0-2.
- Portões completos verdes no Windows: typecheck, `vitrine` e
  `vitrine:portoes` inteiro (lint-copy, claims, tokens, links, variantes 44/44,
  nuvem, tracking, dpi300, docs:links, loja:css), exit 0.

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

0. **Avaliar a IzzyPrint**: **amostras COMPRADAS pelo dono (informado em
   03/08), aguardando chegada.** Quando chegarem: julgar qualidade, fechar
   tabela de custos POD, integração Nuvemshop, área máxima de estampa e white
   label. Se aprovada: refazer artes a 300 DPI, novos blanks com o casting e
   integração.
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

- **GA4 NA LOJA: NO AR (03/08, à noite).** Com a vitrine nova publicada (UTMs
  internos neutralizados em produção, deploy verde após o conserto do hash
  reprodutível), o `G-E041S3ZHWB` foi colado no campo nativo de Códigos
  externos do painel e confirmado 3x no HTML servido da home da loja e do
  `/comprar/`. O funil inteiro mede na mesma propriedade. Restam do P0-1: o
  cross-domain + exclusão de referral no admin do GA4 (Google do dono) e o
  pedido-teste (só o dono executa pedido).
- **Campo dos 10% no checkout: RESOLVIDO como falso alarme (03/08, à noite).**
  A sessão tinha registrado "não existe campo" olhando só a 1ª tela do
  checkout. Conferido depois nas Opções do checkout do painel: o campo
  "Mensagem do cliente" EXISTE e está LIGADO, com o texto pedindo o projeto
  social e, acima de R$399,90, a arte da Ecobag; ele aparece em etapa
  posterior à que a sessão alcançou sem preencher dados. Nada a mudar no
  painel; só a página Projetos Sociais da loja segue prometendo "campo com
  três opções" (recolagem já no lote de painel do P0-2).
- **cart.tpl com o lembrete do cupom ECOBAG: NO AR (03/08, à noite).** Upload
  por FTP pela sessão salva do WinSCP (senha armazenada pelo dono; nenhuma
  credencial manuseada), com backup do arquivo anterior antes da escrita e
  re-download conferindo hash byte a byte. O `nimbus-aviso-ecobag` já aparece
  no HTML servido do `/comprar/`.
- **352727892 (Aparecida Spray | Moletom): FORA DO AR por ordem do dono
  (03/08, à noite).** "Não quero esse tipo de inconsistência": visibilidade
  Oculto salva no painel. O texto dizia "sem capuz" com capa de capuz e a
  galeria misturava peças; volta ao ar quando for reconciliado (P1-7). O
  produto não está na vitrine (Blusão fora dos 44), então nenhum portão muda.
- **352727892 (Aparecida Spray | Moletom Canguru) — CONFIRMADA em 03/08, pior
  que a suspeita.** Conferido a olho nas fotos servidas pela CDN
  (`/produtos/aparecida-spray1/`): a capa é o moletom canguru correto, mas as
  OUTRAS TRÊS fotos da galeria são camiseta oversized (duas pretas, uma
  off-white) — peça errada, provavelmente herdadas do irmão 352728019
  (Aparecida Spray | Camiseta Oversized). O dono autorizou em 03/08 remover a
  foto duplicada (mantendo o resto, já que a Oversized existe como produto
  próprio com Preta e Off-White); a remoção esbarrou no admin congelando sob
  automação e fica para uma sessão de painel estável. Agravante descoberto no
  admin: o TÍTULO e a DESCRIÇÃO do produto dizem "Blusão moletom sem capuz",
  mas a capa é um canguru com capuz; a reclassificação de 26/07 nunca chegou ao
  texto do produto (P1-7).
- ~~O medidor de eixo automático (`scripts/geometry/eixo-costas.mjs`)~~
  **RESOLVIDO em 03/08: aposentado.** Zero scripts o importavam; ganhou banner
  de aposentado no cabeçalho. O eixo segue medido por leitura visual dos
  vincos de cava (`docs/verdades/limites-conhecidos.md`).
