---
status: vigente
atualizado: 2026-08-23
---
# scripts/video/ — mapa

Pipeline de edição de vídeo dos ads no DaVinci Resolve **gratuito** (o fluxo
completo, com o porquê de cada peça, está em `docs/fluxos/video-ads.md`; a
decisão que abriu a frente é `docs/decisoes/2026-08-23-video-no-resolve-e-orcamento-higgsfield.md`).

A unidade de trabalho é a **rodada**: `nimbus-assets/marketing/<data>-<assunto>/video/`
com `rodada.json` (a receita versionada) dentro. O ponteiro
`nimbus-assets/marketing/_rodada-atual.txt` diz qual é a rodada corrente; todos
os comandos aceitam o diretório como argumento para trabalhar outra.

- **lib.mjs** — utilidades: resolução da rodada, ffprobe, tempo racional do
  FCPXML alinhado ao frame, tokenizador XML.
- **normaliza-clipes.mjs** (`npm run video:normaliza`) — fontes → mezanine
  `_mezanine/` 1080x1920 30 fps CFR H.264 all-intra CRF 16; grava sha256 das
  fontes no `rodada.json`. ⛔ As fontes reais chegam com 30 e 59,94 fps
  misturados (WhatsApp é VFR): **nenhuma timeline é gerada sobre fonte crua**.
- **monta-timeline.mjs** (`npm run video:timeline`) — `rodada.json` →
  `timeline/<nome>.fcpxml` (FCPXML 1.10: cortes, retime linear, cross dissolve,
  títulos como Text+) + `projeto/rodada-config.lua` (ponte lida pelo Lua do
  menu interno do Resolve).
- **gera-srt.mjs** (`npm run video:srt`) — bloco `legendas` da receita →
  `legendas/<nome>.srt` (entra no Resolve por Timeline > Import > Subtitle).
- **diff-timeline.mjs** (`npm run video:diff`) — compara a timeline gerada com
  a exportada pelo Resolve após a edição do dono (`timeline/export/`), clipe a
  clipe, em segundos. É o feedback estrutural do ciclo de revisão.

Do lado do Resolve, dois scripts Lua vivem no menu **Workspace > Scripts**
(`%APPDATA%/Blackmagic Design/DaVinci Resolve/Support/Fusion/Scripts/Edit/`,
fora do git; o conteúdo canônico está em `resolve/` aqui ao lado e é copiado
para lá pelo fluxo):

- **resolve/nimbus-importa-rodada.lua** — cria/abre o projeto da rodada, seta
  1080x1920@30, importa o mezanine e a timeline FCPXML.
- **resolve/nimbus-exporta-estado.lua** — exporta a timeline atual para
  `timeline/export/<nome>-<data>.fcpxml` + o projeto `.drp` para `projeto/`.

⛔ O scripting EXTERNO (fusionscript de fora do app) é Studio-only desde o
Resolve 19.1: nada aqui depende dele. O que a edição gratuita permite é o menu
interno de scripts e a importação de timeline — e é só disso que o pipeline
precisa.
