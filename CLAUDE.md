---
status: vigente
atualizado: 2026-08-21
---

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

## Os três repositórios — layout REAL da máquina do dono

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

Em **sessão remota** (Claude Code na web / Cowork), os três chegam como clones
irmãos — `nimbus/`, `nimbus-assets/`, `nimbus-brain/` — e o aviso da junction
não se aplica; os scripts acham os vizinhos em `../nimbus-assets` e
`../nimbus-brain` (ou no caminho de `NIMBUS_ASSETS`) sem ajuste.

## Marca

Fé reverente, design autoral, brasilidade e acabamento premium. Céu, nuvens,
concreto branco modernista, luz e atmosfera editorial.

Paleta: navy `#0b2360`, ouro `#e9c46a`, azul-céu `#8fc1ea`, céu claro `#dcebfa`,
branco-nuvem `#f7fbff`, texto `#1b2733`. Títulos Fraunces/Georgia, corpo Inter.

Tom curto, humano, específico e reverente. **Copy pública proibida** (decisão de
29/07, `docs/decisoes/2026-07-29-regra-de-fotos-e-copy-do-site.md`): travessão;
"sob demanda", "print on demand", "produzida após o pedido" e variações; "troca
fácil"; "loja oficial". Linguagem aprovada: "feita no Brasil, para você".

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

## O código, em uma frase por frente

Landing React + R3F em `src/` (`npm run dev`, `npm run build`); vitrine
estática gerada por `scripts/vitrine/` em `public/loja/` (`npm run vitrine`
regenera catálogo, mídia e páginas e passa os linters); kit da Nuvemshop em
`nuvemshop/` — cola-se à mão no painel, leia `nuvemshop/instrucoes.md` antes.
Detalhe no `README.md`.

## Verificações iniciais

Um hook de sessão (`scripts/sessao/checagem-inicial.mjs`) roda sozinho ao abrir
e imprime a sincronia dos 3 repos e a idade do ESTADO. Depois dele:

```bash
npm run typecheck
node scripts/geometry/validate.mjs      # 38.880 casos, tem que passar
npm run vitrine:portoes                 # a corrente completa de portões
```

Saída de sessão: `npm run sessao:fim` (o ritual completo está no
`docs/HANDOFF-SESSAO.md`, seções 11 e 12).
