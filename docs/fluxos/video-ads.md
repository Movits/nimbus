---
status: vigente
atualizado: 2026-08-24
---
# Vídeo para ads — edição no DaVinci Resolve (gratuito)

> [!warning] Frente PREPARATÓRIA, subordinada à ordem de 15/08 (produto antes
> de conteúdo). Este fluxo constrói biblioteca e prova o pipeline; **nada é
> publicado e nenhum real de mídia roda** até o dono liberar. Vídeo nunca é
> gerado no Higgsfield sem aprovação explícita com referência e custo antes
> (ordem de 10/08). Decisão que abriu a frente:
> `../decisoes/2026-08-23-video-no-resolve-e-orcamento-higgsfield.md`.

## A ideia central, e o motivo de tudo

O dono quer ver, checar e corrigir cada vídeo **dentro do Resolve** da máquina
dele, não receber um mp4 pronto. Então o Claude não renderiza vídeo: ele escreve
uma **receita** (`rodada.json`), transforma a receita em timeline (FCPXML 1.10)
e entrega essa timeline viva dentro do Resolve, onde o dono edita. A receita é
o que se versiona; o render se regenera. O scripting EXTERNO do Resolve é
exclusivo da edição Studio desde o 19.1 — mas o menu interno **Workspace >
Scripts** roda Lua/Python com o objeto `resolve` vivo em qualquer edição, e é
só disso que o pipeline precisa. Provado de ponta a ponta em 23/08 com a
rodada-piloto (mídia real da IzzyPrint, zero créditos).

## Passos

1. **Criar a rodada**: pasta `nimbus-assets/marketing/<AAAA-MM-DD>-<assunto>/video/`
   com `rodada.json` (fontes, cortes, títulos, legendas — modelo na rodada
   `2026-08-23-piloto-resolve`). Apontar o ponteiro:
   `nimbus-assets/marketing/_rodada-atual.txt`.
2. **Normalizar**: `npm run video:normaliza` — mezanine 1080x1920 30 fps CFR em
   `_mezanine/` (gitignorado), só a janela usada pelos cortes.
3. **Gerar timeline e legendas**: `npm run video:timeline` e `npm run video:srt`.
4. **Importar no Resolve**: abrir o Resolve e disparar **Workspace > Scripts >
   nimbus-importa-rodada** (cópia canônica dos Lua em `scripts/video/resolve/`).
   Se o import por script falhar, o fallback é `Ctrl+Shift+I` no `.fcpxml`.
   O SRT entra por File > Import > Subtitle (na free o import de SRT funciona;
   o que é Studio é a transcrição automática).
5. **Dono edita**: trim, ordem, cor, Fairlight. Texto de headline/CTA é camada
   de título no Resolve, nunca queimado no clipe (regra de reuso da decisão).
6. **Exportar o estado**: **Workspace > Scripts > nimbus-exporta-estado** grava
   `timeline/export/<nome>-<data>.fcpxml` + o `.drp` em `projeto/`.
7. **Fechar o ciclo**: `npm run video:diff` mostra o que mudou, clipe a clipe.
   Mudança que virou regra → atualizar `rodada.json` e regenerar. **A receita
   nunca fica atrás da timeline.**
8. **Auditoria multi-agente (OBRIGATÓRIA, ordem do dono de 24/08)**: antes de
   apresentar qualquer vídeo como pronto, extrair frames do render de review
   (ffmpeg) e rodar um painel de agentes com no mínimo as lentes de
   **marketing** (o hook prende? o CTA converte?), **direção de arte** (estética
   premium da marca? título legível? encerramento é cena própria?) e **edição**
   (ritmo, cortes, áudio). Agente reprovou → refaz a parte apontada e re-audita.
   Vídeo só chega ao dono com o painel verde.
9. **Entregar**: Deliver em H.264 8-bit (o teto da free é UHD; 1080x1920 passa
   folgado). Para Reels/TikTok, legenda queimada ("Burn into video"); áudio
   normalizado a -14 LUFS (specs em `../verdades/specs-video-ads.md`).

## Camada 2 (sob ordem): controle vivo por MCP

O MCP <https://github.com/samuelgursky/davinci-resolve-mcp> tem um *free-edition
bridge* (script no mesmo menu Workspace > Scripts) validado por usuários no
Resolve 21 gratuito em Windows 11 — dá controle de API completo sem Studio.
Instalação fica para quando a frente sair do preparatório; o pipeline acima não
depende dele. Ferramentas de apoio mapeadas: Faster-Whisper-XXL (legendas de
founder talk), auto-editor (corte de silêncio com `--export resolve`) —
detalhe no brain, `Nimbus brain/wiki/concepts/edicao-de-video-com-claude.md`.

## Armadilhas conhecidas (medidas ou verificadas em fonte)

- **Título grande demais não cabe nem se lê** (piloto de 23/08, 96 px estourou):
  padrão agora é 64 px, máx. 22 caracteres (acima de 16, corpo 48), dentro da
  faixa central. Todo vídeo tem trilha leve conforme a vibe (áudio único e
  chiado reprova na auditoria), e o encerramento de marca é **cena própria**
  com estética premium, nunca um cartão colado no fim do take anterior.
- **Cena-fonte com QUALQUER texto/cartela queimada não entra** (dono, 24/08 —
  sem exceção para cartela "bonita"): o catálogo de cenas marca `texto_queimado`
  e a janela é descartada. Texto é sempre camada nossa no Resolve.
- **Áudio diegético contínuo nunca é picotado** (dono, 24/08, treino t09):
  música/oração da própria cena ou corre INTEIRA por baixo dos cortes de vídeo
  (`audio_base` na receita) ou os clipes entram mudos (`mudo: true`) e só a
  trilha toca.
- **Cena com pessoa = Soul ID do dono por padrão** (dono, 24/08): anti-cara-de-IA;
  o Soul "Roberto NIMBUS v2" está treinado e é o rosto da marca. Soul trava 1
  pessoa por geração; cena de dupla vira solo ou usa reference elements.

- **Retime (`velocidade`) estraga o round-trip**: o import cria compound clip
  no media pool e o export FCPXML do Resolve pode derrubar o segundo de dois
  clipes retimados seguidos (virou `gap` no piloto de 23/08). Use com
  parcimônia; retime fino se faz no Resolve, e o `video:diff` não acompanha
  clipe retimado.
- **O export FCPXML derruba a faixa de legendas em silêncio.** O SRT no git é a
  única verdade de legenda; nunca dependa do round-trip para ela.
- **A timeline nasce pronta no arquivo**: na free não conte com `SetStart`/
  `SetSetting` por script para ajustar depois; quem ajusta é o dono na UI.
- **Scripts internos sem GUI**: UIManager é Studio desde o 19.1 — Lua do menu
  imprime no console, nunca abre janela.
- **Música em anúncio pago é campo minado**: Meta Sound Collection vale para
  vídeo orgânico no FB/IG, não é liberação automática para mídia paga; a
  Commercial Music Library do TikTok só licencia DENTRO do TikTok; Artlist e
  Epidemic só cobrem ads no plano Pro (~US$ 25/mês). Até decidir, rodada sem
  trilha licenciada não vira ad.
- **Render e mezanine nunca entram no git** (`_mezanine/`, `_render/`
  gitignorados; repo de assets não tem LFS e o `.git` já pesa 9,3 GB).
  Original acima de 100 MB vai ao Drive com ponteiro em `origem-drive.json`.

## O que mudou e por quê

Nasceu em 23/08 junto com a decisão do dono de editar vídeo no Resolve. O
antecessor de espírito, `../historico/protocolo-higgsfield-3-passos.md`, está
HISTÓRICO desde 11/08 (método de IA desenhando estampa, proibido em 26/07) —
nada dele deve ser seguido.
