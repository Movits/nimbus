---
status: vigente
atualizado: 2026-08-21
---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# NIMBUS

Marca brasileira de streetwear católico premium, loja na Nuvemshop (plano
Impulso, tema Baires congelado). Produção print-on-demand em transição:
**migração para a IzzyPrint decidida em 07/08**; a YouDraw produziu o catálogo
atual. Estado vivo em `docs/ESTADO.md`.

## Leia isto e mais nada

👉 **[`docs/00-COMECE-AQUI.md`](docs/00-COMECE-AQUI.md)**

É o roteador do projeto: ache a sua tarefa e vá direto ao fluxo. Depois dele,
`docs/ESTADO.md`, que é a única parte que envelhece rápido.

Não leia o projeto inteiro. Ele tem três auditorias invalidadas e dois métodos de
geração superados, todos preservados como histórico — e foi exatamente instrução
antiga sobrevivendo que sequestrou uma auditoria nova em 26/07.

**Se um documento fora de `docs/` contradisser um de dentro, o de dentro vence.**
Todo documento tem `status:` no topo (`vigente | superado | concluido |
historico`); sem status, trate como suspeito. O portão `npm run docs:status`
cobra isso.

A versão anterior deste arquivo, com o histórico longo, está em
`docs/historico/CLAUDE-2026-07-25.md`.

## Os três repositórios — layout REAL desta máquina

```
C:\Users\rober\Nimbus\               PÚBLICO   código, docs, medições, receitas
C:\Users\rober\Nimbus\Nimbus brain\  PRIVADO   vault Obsidian ANINHADO (repo git próprio, gitignorado daqui)
C:\Users\rober\nimbus-assets\        PRIVADO   artes, blanks e capas
C:\Users\rober\nimbus-brain          junction → o vault aninhado (para scripts que esperam repos irmãos)
```

⚠️ O brain **não é um clone irmão** nesta máquina: mora DENTRO do repo público.
**Nunca rode `git clean -fdx` no público** (apagaria o segundo cérebro) e não
clone por cima da junction. Máquina nova sem o vault: aí sim, clone os três
lado a lado (`docs/REPOSITORIOS.md`).

Os scripts acham o privado em `../nimbus-assets` ou em `NIMBUS_ASSETS`.
`SKIP_ASSETS=1` (portão 300 DPI) e `SKIP_REDE=1` (link-check) existem só para
ambiente sem os privados ou sem rede, como o CI; localmente rode sem eles.

## Comandos

Não há test runner: cada portão é um script Node que sai com código ≠ 0, e a
"suíte" é `vitrine:portoes`. Para rodar um portão só: `node scripts/vitrine/<portao>.mjs`.

```bash
npm run typecheck                    # tsc --noEmit (landing)
node scripts/geometry/validate.mjs   # 38.880 cenas sintéticas; nenhum veredito de medição sem ele passar
npm run vitrine:portoes              # os 11 portões: copy, claims, tokens, links, variantes, nuvem, tracking, dpi300, docs:links, docs:status, loja:css
npm run vitrine                      # REGERA public/loja/ (catalogo → lint → paginas → claims → nuvem); commitar a saída junto
npm run dev | build | preview        # landing Vite (localhost:5173)
npm run sessao:fim                   # ritual de saída (docs/HANDOFF-SESSAO.md, seções 11 e 12)
```

`docs:status` usa a lista de exceções `scripts/status-docs.allow.json`, que só
encolhe — nunca acrescente um .md nela para passar no portão.

## Arquitetura — o que só se entende lendo vários arquivos

Um repositório, **três entregáveis** (tabela no `README.md`): landing em `src/`;
vitrine em `public/loja/`, **gerada, nunca editar `index.html`, `c/`, `p/` à
mão**; loja em `nuvemshop/`, kit colado à mão no painel (leia
`nuvemshop/instrucoes.md` antes: o painel apaga custom properties, CSS com
`var()` fica inerte).

**Pipeline da vitrine** (`scripts/vitrine/`): `build-catalogo.mjs` funde as
planilhas auditadas (matriz de variantes = verdade comercial; `nuvemshop-products.json`
= só slug e URL de imagem; CSV de descrições = copy e quem entra) em
`public/loja/catalogo.json`, o hub de tudo. `build-paginas.mjs` é o template
que gera o HTML a partir dele; `build-media.mjs` deriva as imagens editoriais
do repo privado. Os `lint-*.mjs` e `parity-*.mjs` leem o `catalogo.json`.

**O deploy é um portão de reprodutibilidade**: o CI roda os lints, regenera as
páginas a partir do catálogo commitado e falha se `git diff -- public` não
sair limpo. Quem mexe em `build-paginas.mjs`, no catálogo ou em `public/loja/{css,js}`
roda `npm run vitrine` e commita o resultado no mesmo commit. O `?v=` dos
ativos é hash do conteúdo com CRLF normalizado (Windows × CI).

**`scripts/` mistura vivo e superado** sem nada ter sido movido: o mapa é
`scripts/LEIA-ME.md` e todo script superado tem banner no topo. Na dúvida,
confira o mapa antes de rodar. `scripts/geometry/` (medidor de escala/posição
da estampa, README explica o princípio físico) e `scripts/producao/` (capas,
inventário, portão 300 DPI) têm README próprio.

`tmp_*` na raiz e `_arquivo-*/` são rascunho local gitignorado; `dist/` é
saída de build.

## Marca

Fé reverente, design autoral, brasilidade e acabamento premium. Céu, nuvens,
concreto branco modernista, luz e atmosfera editorial.

Tom curto, humano, específico e reverente. **Copy pública proibida** (decisão de
29/07, `docs/decisoes/2026-07-29-regra-de-fotos-e-copy-do-site.md`): travessão;
"sob demanda", "print on demand", "produzida após o pedido" e variações; "troca
fácil"; "loja oficial". Linguagem aprovada: "feita no Brasil, para você".
`scripts/vitrine/lint-copy.mjs` e `lint-claims.mjs` cobram isso no catálogo.

10% do lucro de cada pedido vai para um projeto social escolhido pelo cliente,
após custos e o prazo de arrependimento, com repasse mensal e comprovação.

## Endereços

Landing <https://nimbuswear.com.br/> · Vitrine <https://nimbuswear.com.br/loja/>
· Loja <https://loja.nimbuswear.com.br/> · Painel
<https://loja.nimbuswear.com.br/admin> (não existe `dashboard.nuvemshop.com.br`)
· Produção YouDraw <https://app.youdraw.com.br/> · IzzyPrint
<https://izzyprint.com.br/> · `nimbuswearbr@gmail.com` · `NimbusWear.br` no
Instagram e TikTok.

A landing e a vitrine são publicadas pelo GitHub Pages a partir deste
repositório. **A Nuvemshop não faz deploy por Git**: a loja publicada e o painel
são a fonte de verdade da loja; CSS se cola no painel seguindo
`docs/fluxos/site-css-e-hover.md`.

## Limites

Nada é publicado sem autorização explícita, produto a produto. Não mexa em preço,
custo, domínio, checkout, dados legais, integração POD, produtos ou variantes.
Não execute pedido pago.

Este repositório é **público**: nunca exponha CPF, endereço, senha, cookie, token
ou dado de cliente.

## Verificações iniciais

Um hook de sessão (`scripts/sessao/checagem-inicial.mjs`) roda sozinho ao abrir
e imprime a sincronia dos 3 repos e a idade do ESTADO. Depois dele, rode os
três primeiros comandos da seção Comandos (typecheck, validate, portões).

Saída de sessão: `npm run sessao:fim` (o ritual completo está no
`docs/HANDOFF-SESSAO.md`, seções 11 e 12).
