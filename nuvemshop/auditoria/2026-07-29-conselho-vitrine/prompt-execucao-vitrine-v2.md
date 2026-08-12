---
status: concluido
atualizado: 2026-08-12
---
# Prompt de execução: NIMBUS vitrine v2 (saída da 2ª rodada do conselho, 2026-07-29)

> [!info] Plano CUMPRIDO (29-31/07). Endereços de época: /loja-preview morreu (vitrine é /loja/ desde 31/07), caminhos /home/user/ eram da nuvem, upsell de R$199 morto. NADA executável aqui.

Executar com o agente implementador (Claude). Fonte: ata em `ata-conselho-vitrine-v2.md`.

---

TÍTULO: NIMBUS VITRINE v2 — PROMPT DE EXECUÇÃO ÚNICO (2ª rodada do conselho, 2026-07-29)

OBJETIVO
Transformar a vitrine nimbuswear.com.br/loja-preview na loja de verdade da NIMBUS: corrigir o funil, alinhar identidade à landing, substituir capas e fotos fora da regra, e embarcar medição. Timebox de 5 dias úteis; se estourar, corta-se escopo visual, nunca funil nem medição.

REGRAS IMUTÁVEIS (valem para todas as tarefas)
- Repo `nimbus` é PÚBLICO: nunca commitar arte em alta, master de capa, prancha de casting, token, senha ou dado de cliente nele. Masters e evidências vão para `/home/user/nimbus-assets` (privado).
- Copy pública: sem travessão, sem "troca fácil", sem "loja oficial". Tom curto, humano, reverente.
- Fotos de produto: teto 500x500 da CDN, exibição máxima 400px CSS, upscale proibido.
- Higgsfield somente para editoriais do site (e apenas o piloto do hero nesta v2); Gemini API somente para artes (os 3 masters de capa).
- Casting oficial: Caio, Clara, Gabriel, Helena. Rosto visível só do casting. Genérico só sem rosto.
- Aprovações do dono sempre em lote com checklist, nunca imagem a imagem. Gates: GATE A (densidade do grid), GATE B (lote de 3 capas), GATE C (piloto do hero).
- Decisão fechada, não reabrir: a vitrine é a loja de verdade; Nuvemshop é motor de carrinho/checkout.
- Não mexer em preço, custo, domínio, checkout, dados legais sem dado do dono, integração YouDraw, produtos ou variantes. Não executar pedido pago.
- Publicação: merge na main (GitHub Pages). Nada com rosto genérico novo é publicado na v2.

TAREFAS EM ORDEM DE EXECUÇÃO

1. Verificações iniciais
Em `/home/user/nimbus`: `git status -sb && git pull --ff-only`, `npm run typecheck`, `node scripts/geometry/validate.mjs` (38.880 casos), `node scripts/producao/inventario.mjs`, e `npm run vitrine` como baseline. Fazer o mesmo pull em `/home/user/nimbus-brain` e `/home/user/nimbus-assets`.
ACEITE: todos os comandos saem com código 0 antes de qualquer edição.

2. PRIMEIRO COMMIT: bug da Sacola
Em `/home/user/nimbus/scripts/vitrine/build-paginas.mjs`, trocar `https://loja.nimbuswear.com.br/carrinho/` por `https://loja.nimbuswear.com.br/comprar/` no header (linha 50) e no footer (linha 61). Rebuildar, commitar isolado, mergear na main.
ACEITE: `grep -rc "carrinho" scripts/vitrine/ public/loja-preview/` retorna 0 ocorrências em links; `curl -sIL https://loja.nimbuswear.com.br/comprar/` retorna HTTP 200; clique verificado na página publicada (home e 1 PDP) sem 404.

3. Remoção imediata da prancha do Caio
Em `/home/user/nimbus/scripts/vitrine/build-media.mjs`, remover o job da linha 51 (`caio-identidade-3-vistas.png` para `editorial-street-1200.webp`). Interinamente, apontar o slot para imagem sem rosto já existente ou removê-lo até a tarefa 15. Revisar a banda "O caimento": se for mockup cru, substituir por foto sem rosto ou remover.
ACEITE: `grep -c "identidade-3-vistas" scripts/vitrine/build-media.mjs` = 0; nenhuma página gerada referencia `editorial-street-1200.webp` derivado de prancha; inspeção visual da home e de c/street sem prancha ou mockup cru.

4. Sequenciamento em docs/ESTADO.md e pendências do dono
Registrar em `/home/user/nimbus/docs/ESTADO.md`: frentes ativas (máximo 3): v2, capas de produto (6 suspeitos + 4 sem torso primeiro), IzzyPrint; ticket Nuvemshop marcado BLOQUEADO até aceite formal da v2; timebox v2 = 5 dias úteis. Abrir lote único de pendências do dono: (a) dados legais (nome empresarial, CNPJ ou CPF de MEI, endereço), (b) ID do GA4 ou preferência por Plausible, (c) modelo do casting para o piloto do hero, (d) parcelamento vigente no painel Nuvemshop, (e) consulta de prazo à YouDraw (criar rascunho no Gmail de nimbuswearbr@gmail.com para o dono enviar). Registrar também as pendências futuras: dono como modelo (rodada futura, risco de pessoa-chave, sempre complemento ao casting), canonical/SEO vitrine x Nuvemshop antes de tráfego pago, reshoot completo com casting pós-catálogo precificado pelo piloto.
ACEITE: `grep` em ESTADO.md encontra as 3 frentes, o ticket bloqueado, o timebox e as 3 pendências futuras; rascunho YouDraw existe no Gmail.

5. Documento normativo de fotos e cenários (ANTES de qualquer imagem nova)
Criar `/home/user/nimbus/docs/decisoes/fotos-editoriais-e-cenarios.md` com `status: ativo` no topo, contendo: rosto visível só do casting oficial (Caio, Clara, Gabriel, Helena); genérico só sem rosto (de costas ou corte abaixo do queixo) e dentro de cenário e luz canônicos; descarte obrigatório de geração semelhante a pessoa real; proibição permanente de mockup ou prancha crua como foto de site; diretriz jurídica: cenários gerados e inspirados, sem reprodução fiel de obra ou graffiti identificável, sem nomes reais (Niemeyer, Catedral, paróquias) em copy comercial. Cenários canônicos (detalhe em `/home/user/nimbus-brain/wiki/concepts/prompts-higgsfield.md` e `/home/user/nimbus-brain/wiki/entities/{street,reliquia,nuvem}.md`): STREET = beco/rua de concreto com graffiti e brutalismo inspirado em Niemeyer, luz dura; RELÍQUIA = fachada de igreja brasileira no golden hour, grão de filme; NUVEM = monumentos de Brasília (catedral) com céu claro e nuvens. Adicionar ao manifesto de mídia em `build-media.mjs` um campo obrigatório por job (ex.: `origem: "casting" | "generica-sem-rosto" | "cenario" | "produto"`) e lint que falha o build se o campo faltar ou se fonte de prancha/board de casting for usada como editorial.
ACEITE: doc existe com `status: ativo`; quebrar de propósito o manifesto (job sem `origem`) faz `npm run vitrine:media` falhar; restaurado, passa.

6. Lints de build: links e paridade de tokens
Criar `scripts/vitrine/lint-links.mjs` (varre HTML gerado em `public/loja-preview/`, falha o build em qualquer link interno 404) e `scripts/vitrine/parity-tokens.mjs` (diff dos tokens de `/home/user/nimbus/src/styles/global.css` contra `/home/user/nimbus/public/loja-preview/css/tokens.css`, com allowlist comentada no próprio script). Integrar ambos ao `npm run vitrine`. Estender `lint-copy.mjs` para falhar em: travessão, "troca fácil", "loja oficial". Eliminar toda cor literal fora de token em `loja.css` (hex/rgb migram para `tokens.css`).
ACEITE: link interno quebrado de teste faz o build falhar; `grep -E "#[0-9a-fA-F]{3,8}|rgb\(" public/loja-preview/css/loja.css` retorna 0 fora da allowlist; `npm run vitrine` verde no estado final.

7. Header pela régua da landing
Replicar a régua de `/home/user/nimbus/src/sections/Topbar.tsx` e `.topbar__logo img` (global.css linha 94): logo à esquerda com `height: clamp(34px, 5vw, 46px)`, nav à direita, Sacola como pill. Ajustar template do header em `build-paginas.mjs` e CSS.
ACEITE: `grep "clamp(34px, 5vw, 46px)"` no CSS da vitrine; screenshots lado a lado landing x vitrine em 390, 768 e 1280 antes do merge, logo com mesma posição e proporção; nenhum texto funcional do header abaixo de 12px.

8. Régua do navy e botões
Registrar em `tokens.css` (comentário normativo): navy permitido em announcement e footer globais, mais no máximo 1 campo navy adicional por página (banda manifesto na home; palco RELÍQUIA na PDP de RELÍQUIA). `btn--primary` volta a `--ink`.
ACEITE: inspeção página a página contando campos navy além de announcement/footer: home = 1, c/street = 0, c/reliquia = 0, c/nuvem = 0, PDP RELÍQUIA = 1, demais PDPs = 0; `grep` confirma `btn--primary` usando `var(--ink)`; a régua está escrita em `tokens.css` (será a base da replicação Nuvemshop).

9. Grid e densidade
Colunas explícitas por breakpoint: 4 colunas em >=1100px, 3 em >=820px, 2 abaixo. Entre 1280 e 1680px o grid ocupa no mínimo 90% do container útil. Caixa de foto de produto limitada a 400px CSS (CDN entrega 500x500; nunca upscale). Linhas curtas completadas com tile editorial da coleção, nunca esticando imagem. Unificar tokens de largura com a landing (resolver 1180 vs 1280 em favor de um único token compartilhado).
ACEITE: media queries verificáveis por `grep` no CSS; screenshots em 1024 (3 ou 4 colunas, nunca 2), 1280 e 1680 (medida do grid >=90% do container); `grep "400px"` no CSS da caixa de foto; contraste dos metadados dos cards >=4.5:1 (calcular e registrar os pares cor/fundo).

10. GATE A: protótipo de densidade
Gerar pelo próprio build uma página interna `public/loja-preview/prototipo-grid/` com 2 ou 3 variantes de densidade (não linkada na navegação). Apresentar ao dono em lote com checklist; só depois da escolha aplicar à home e às coleções.
ACEITE: página existe e renderiza as variantes; escolha do dono registrada em ESTADO.md com data; home reflete a variante escolhida.

11. Analytics e UTM
Embutir GA4 (ID fornecido pelo dono; se ele preferir, Plausible) em todas as páginas geradas. Todo link para `loja.nimbuswear.com.br` recebe `utm_source=vitrine`, `utm_medium=home|colecao|pdp` conforme a página, `utm_campaign=<slug do produto ou coleção>`. Evento de clique no Comprar preservando `?variant=`. Registrar em ESTADO.md as 3 métricas da rodada 3 (sessões, CTR do Comprar, conversão pós-handoff) e o link do painel.
ACEITE: `grep -L "gtag\|plausible" public/loja-preview/**/*.html` retorna vazio; `grep -o "loja.nimbuswear.com.br[^\"]*" public/loja-preview/**/*.html` mostra 100% dos links com utm_source=vitrine e utm_medium correto por página (conferir home, c/street, c/reliquia, c/nuvem e 1 PDP); painel ativo no dia do deploy.

12. Copy sem "loja oficial" e nova seção da home
Em `build-paginas.mjs`: CTA da PDP vira "Comprar"; remover o link "Ver na loja oficial" (linha 265); trust bar (linha 108) vira "Pagamento seguro: Pix, boleto e cartão"; rever o link "Loja oficial" do rodapé (linha 61), que vira "Sacola" ou sai. Substituir a seção Impacto por "Como a sua peça nasce" em 3 passos: pedido; produção sob demanda com prazo; envio mais 10% do lucro para o projeto escolhido no checkout. Só texto e links, zero asset novo. Lista de projetos com fonte única compartilhada com a landing; claim dos 10% em redação idêntica à da landing, linkando a página de metodologia.
ACEITE: `grep -ric "loja oficial" scripts/vitrine/ public/loja-preview/` = 0; diff do claim dos 10% contra a landing = idêntico; seção nova visível na home; lint-copy verde.

13. PDP completa
Em cada PDP: cores nomeadas no seletor; faixa concreta de dias úteis de produção se a YouDraw responder no timebox, senão o interino exato "Feita para você depois do pedido. Prazo exato no checkout."; parcelamento real confirmado no painel Nuvemshop exibido junto ao preço (é copy, não mexe em preço); nota de fotos provisórias sai do bloco de compra e vai ao rodapé; toda editorial com modelo pareada com foto da peça em si; módulo "complete R$199" junto ao preço (camiseta R$149,90 + Ecobag R$49,90 = R$199,80).
ACEITE: inspeção de 1 PDP por coleção (street, reliquia, nuvem) confirmando os 6 itens; `grep "Prazo exato no checkout"` presente se não houver resposta YouDraw; nenhuma nota de provisórias dentro do bloco de compra.

14. Rodapé legal e Ajuda
Rodapé em todas as páginas geradas: bloco legal (nome empresarial/CNPJ ou CPF de MEI, e-mail, endereço, direito de arrependimento de 7 dias conforme CDC art. 49, links para políticas) com os dados fornecidos pelo dono; bloco Ajuda com no mínimo 3 links funcionais: Trocas e devoluções (padrão CDC, sem a expressão "troca fácil"), Envios e prazos, Fale com a NIMBUS (nimbuswearbr@gmail.com). Se os dados legais não chegarem no timebox: publicar e-mail, arrependimento e políticas, e marcar o bloco CNPJ/endereço em ESTADO.md como BLOQUEADOR DE LANÇAMENTO (não bloqueia o deploy da v2).
ACEITE: lint-links verde nos 3 links de Ajuda (zero 404); `grep -ric "troca fácil"` = 0; rodapé presente em home, c/street, c/reliquia, c/nuvem e PDPs.

15. GATE B: capas de coleção (3 masters via Gemini)
Somente após a tarefa 5. Gerar na MESMA sessão da Gemini API, com âncora comum de color grade, 3 masters >=1600px, sem rosto e sem peça: STREET (beco/brutalismo, luz dura), RELÍQUIA (fachada de igreja no golden hour, grão de filme), NUVEM (monumentos de Brasília, céu claro e nuvens), usando as descrições canônicas do nimbus-brain. Salvar masters em `/home/user/nimbus-assets/marketing/2026-07-29-vitrine/capas/` (nunca no repo público). Em `build-media.mjs`, gerar crop próprio por superfície: tile da home, cabeçalho da coleção, faixa da PDP; proibido reaproveitar o mesmo arquivo de 900px nos três slots. Reescrever a tagline da RELÍQUIA sem jargão. Revisão antes de publicar: nada de obra ou graffiti identificável, nenhum nome real em copy comercial. Aprovação do dono em lote único de 3, checklist em resolução real, teste de 10 segundos (nome e tagline legíveis, mundo reconhecível). PLANO B definido antes de gerar: reprova geral mantém as capas atuais marcadas como provisórias, sem segunda rodada de geração no timebox. Ao aprovar, substituir o slot editorial da tarefa 3 por crop do master STREET.
ACEITE: 3 masters >=1600px no nimbus-assets; `ls public/loja-preview/media/` mostra arquivos distintos por superfície (nomes e dimensões diferentes por slot, conferido com `identify` ou equivalente); `grep -i "niemeyer\|catedral" nas copy comerciais geradas` = 0; decisão do lote registrada em ESTADO.md.

16. Página de metodologia dos 10%
Redigir a página (definição de lucro, calendário de repasse mensal, formato da comprovação), linkar de todo lugar onde o claim aparecer (vitrine e landing). Publicação obrigatória antes do LANÇAMENTO como loja de verdade; se o dono não aprovar o texto no timebox, marcar em ESTADO.md como bloqueador de lançamento.
ACEITE: página existe e responde 200 no ambiente publicado ou está registrada como bloqueador; todo claim dos 10% linka para ela (lint-links verde).

17. Especificação Nuvemshop (escrever, não executar)
Escrever `/home/user/nimbus/docs/decisoes/nuvemshop-continuidade.md`: pacote mínimo de continuidade (cores, announcement, logo, tipografia) derivado da régua das tarefas 7 e 8, com confirmação de que cabe no CSS do plano Impulso (tema Baires), sem promessa de paridade de layout. Execução: lote único, imediatamente após o aceite formal da v2 e antes do lançamento.
ACEITE: doc existe com `status:` no topo; ticket segue BLOQUEADO em ESTADO.md.

18. GATE C: piloto do hero (Higgsfield)
Pré-requisito absoluto: arquivar evidência da licença comercial do plano Higgsfield em `/home/user/nimbus-assets/marketing/2026-07-29-vitrine/licenca-higgsfield/` (print/export do plano). Sem evidência, o piloto não roda e o hero atual fica como provisório com prazo de validade registrado. Com licença: 1 geração-piloto do hero com modelo do casting escolhido pelo dono, usando a cena aprovada como reference image (casting em `/home/user/nimbus-assets/casting/2026-07-16/`), teto de 40 créditos (medir saldo antes e depois), aprovação explícita do dono. Estourou o teto ou decepcionou: mantém o hero atual como provisório. Custo real registrado em ESTado.md (precifica o lote de reshoot pós-catálogo).
ACEITE: evidência de licença arquivada; diferença de saldo de créditos <=40 registrada; decisão do dono (aprova/mantém provisório) registrada com data.

19. Teste de funil registrado (antes do deploy)
Em navegador real, desktop e mobile: partir da vitrine com 2 produtos diferentes, clicar Comprar, chegar ao checkout da Nuvemshop com a variante correta pré-selecionada via `?variant=`, e verificar que os parâmetros UTM sobrevivem até o fim do handoff (conferir a URL em cada passo). Registrar roteiro, screenshots e resultado em ESTADO.md.
ACEITE: registro com data, os 2 produtos, viewports usados, confirmação da variante pré-selecionada e da sobrevivência do UTM; qualquer falha bloqueia o deploy até correção.

20. Deploy da v2 e fechamento
Merge na main após os gates A e B resolvidos (C pode fechar como "provisório mantido"). Verificar em produção: home, c/street, c/reliquia, c/nuvem e 1 PDP por coleção. Atualizar `/home/user/nimbus/docs/ESTADO.md` (frentes, pendências, métricas) e o nimbus-brain: `estado.md`, append em `log.md`, e síntese da rodada em `wiki/syntheses/` com wikilinks e fontes, conforme o CLAUDE.md do brain. Commitar nimbus-brain e nimbus-assets nos respectivos repositórios privados.
ACEITE: URLs de produção respondem 200; checklist do critério de pronto 100%; brain atualizado (index, estado, log).

LOOPS DE CHECAGEM OBRIGATÓRIOS (rodar após CADA tarefa que altere código ou visual)
- Visual: screenshots em 390, 810 e 1440 de home, c/street, c/reliquia, c/nuvem e 1 PDP por coleção; comparar contra a régua da landing (header, tokens, navy). Para o header, adicionalmente 390/768/1280 lado a lado com a landing (tarefa 7).
- Código: `npm run typecheck`; `npm run vitrine` (catalogo + lint-copy + lint-links + parity-tokens + paginas); `node scripts/geometry/validate.mjs` (38.880 casos, tem que passar); `node scripts/producao/inventario.mjs`.
- Links externos: `curl -sIL` com HTTP 200 para todo link externo do HTML gerado (loja.nimbuswear.com.br/comprar/, projetos-sociais, mailto validado por formato).
- Copy: grep confirmando ausência de travessão, "troca fácil" e "loja oficial" em todo HTML gerado.
- Commits pequenos e temáticos; merge na main somente com todos os loops verdes.

FORA DE ESCOPO (não fazer nesta execução)
- Executar a continuidade na Nuvemshop (somente especificar); mexer em tema, preço, produto, variante, checkout, domínio ou integração YouDraw.
- Reshoot completo com casting (é lote pós-catálogo, precificado pelo piloto, rodada 3).
- Dono como modelo e política de transparência sobre IA (rodada futura, apenas registrar).
- Canonical/SEO vitrine x Nuvemshop (registrar pendência; obrigatório antes de tráfego pago, não da v2).
- Sessão de fotos reais das peças, pixel-diff, investimento em mídia, IzzyPrint.
- Qualquer imagem com rosto fora do piloto do hero; qualquer uso de Higgsfield além do piloto; segunda rodada de geração de capas dentro do timebox.
- Reabrir a decisão vitrine = loja de verdade.
- Publicar qualquer coisa que dependa de aprovação de gate ainda não dada.

CRITÉRIO DE PRONTO (todos verificáveis, todos obrigatórios)
1. Zero "carrinho" nos links; clique na Sacola em produção chega em /comprar/ sem 404.
2. Prancha do Caio e mockups crus fora do ar; doc normativo de fotos ativo; lint de manifesto de mídia falhando build em violação.
3. lint-links, parity-tokens e lint-copy integrados ao build e verdes; zero cor literal fora de token em loja.css.
4. Header idêntico à régua da landing (screenshots 390/768/1280 arquivados); navy dentro do orçamento por página; btn--primary em --ink.
5. Grid: 4/3/2 colunas por breakpoint, nada acima de 1024px em 2 colunas, >=90% do container entre 1280 e 1680, foto <=400px; variante de densidade escolhida pelo dono (GATE A).
6. 3 capas aprovadas em lote (GATE B) com crops distintos por superfície, ou capas atuais marcadas provisórias pelo plano B; tagline RELÍQUIA sem jargão; zero nomes reais em copy comercial.
7. Analytics em 100% das páginas, 100% dos links de compra com UTM padrão e ?variant= preservado, painel ativo e 3 métricas em ESTADO.md.
8. Zero "loja oficial", zero travessão, zero "troca fácil"; "Como a sua peça nasce" na home; claim dos 10% idêntico à landing e linkado à metodologia.
9. PDPs com cores nomeadas, prazo (real ou interino), parcelamento, módulo R$199, editorial pareada com foto da peça.
10. Rodapé legal e Ajuda com 3 links 200; pendências do dono registradas com status de bloqueador quando faltarem.
11. Piloto do hero resolvido (GATE C): executado <=40 créditos com licença arquivada, ou hero atual mantido como provisório com prazo.
12. Teste de funil desktop e mobile registrado com variante pré-selecionada e UTM sobrevivendo ao handoff.
13. typecheck, geometry/validate (38.880 casos) e inventário verdes; v2 publicada; ESTADO.md e nimbus-brain (estado, log, síntese, index) atualizados e commitados.
