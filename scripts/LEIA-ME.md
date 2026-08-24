---
status: vigente
atualizado: 2026-08-12
---

# scripts/ — o que é vivo e o que é superado

Este diretório mistura os portões vivos do projeto com scripts de métodos
superados, preservados como histórico. Nenhum arquivo foi movido: quem manda é
este mapa e o banner no topo de cada script superado.

## VIVO (use)

| O quê | Onde |
|---|---|
| Portões e builds da vitrine (`npm run vitrine`, `vitrine:portoes`) | `vitrine/` (build-catalogo, build-media, build-paginas, lint-copy, lint-claims, parity-tokens, parity-variantes, link-check) |
| Portões de nascimento da NUVEM (`vitrine:nuvem`): devocional em toda arte, escala por peça, par frente/costas por cor | `vitrine/lint-nuvem.mjs` + tabelas `vitrine/escala-grade.json` e `vitrine/par-fotos.excecoes.json` (P1-1 r4) |
| Contrato de eventos GA4 (`vitrine:tracking`; o plano é `docs/fluxos/tracking-plan.md`) | `vitrine/lint-tracking.mjs` (P1-5 r4) |
| Receita de export a 300 DPI (`producao:dpi300`; precisa dos assets mesclados, `SKIP_ASSETS=1` só em ambiente sem eles) | `producao/lint-export-300dpi.mjs` + baseline datada `producao/export-300dpi.baseline.json` (P1-1c r4; regra em `docs/verdades/receita-export-300dpi.md`) |
| Monitor diário contra o ar (Actions, agendado; abre issue ao falhar) | `.github/workflows/monitor-diario.yml` (P1-1g r4) |
| Reteste local do desempate sacola↔carrinho | `vitrine/teste-sincroniza.mjs` |
| Links da documentação (`npm run docs:links`) | `link-check-docs.mjs` |
| CSS da loja sobrevive ao minificador do painel (`npm run loja:css`) | `verifica-css-loja.mjs` |
| Build do CSS consolidado da loja | `build_nimbus_publication_css.mjs` (leia o achado do escape `\00000A` antes de regenerar) |
| Tabela de medidas (fonte única, lida por `geometry/garment-specs.mjs`) | `build-prelaunch-matrix.mjs` |
| Bootstrap dos assets privados | `setup-assets.mjs` |
| Medidor geométrico e sua validação (38.880 casos) | `geometry/` (`validate.mjs` tem que passar) |
| Produção e inventário de capas | `producao/` (mapa em `producao/README.md`) |
| Compositor de capas vigente | `produce-cover.mjs`, `compose-art.mjs` e afins (fluxo em `docs/fluxos/capa-lifestyle.md`) |
| Hook de sessão e ritual de saída (`npm run sessao:inicio` / `sessao:fim`) | `sessao/` (checagem-inicial roda sozinha ao abrir a sessão) |
| Pipeline de vídeo dos ads no Resolve gratuito (`video:normaliza`, `video:timeline`, `video:srt`, `video:diff`; fluxo em `docs/fluxos/video-ads.md`) | `video/` (mapa em `video/README.md`) |
| Frontmatter de status em todo .md (`npm run docs:status`) | `verifica-status-docs.mjs` + `status-docs.allow.json` (lista que só encolhe) |
| Recorte/organização de artes (`npm run assets`, `finalize`, `cutout:inbox`) | `cutout.mjs`, `finalize-prints.mjs`, `transparentize.mjs`, `organize-designs.mjs` (atenção: chroma CONDENADO em 06/08 — o organize vale para legado) |

`verify-store-full.mjs` não está aposentado: é a base do gate P1-6 planejado
pela ata de 30/07 (`nuvemshop/auditoria/2026-07-30-conselho-vitrine-r3/`).

`geometry/provider/` é exceção deliberada sem chamador atual: é o caminho da
eventual migração de fornecedor (ver a tabela de módulos do `geometry/README.md`).

## SUPERADO (não usar; cada arquivo tem banner no topo)

| Família | Arquivos | Por quê |
|---|---|---|
| Pipeline lifestyle v1-v3 | `generate-lifestyle-v2/v3.mjs`, `generate-nuvemshop-lifestyle-batch.mjs`, `build-lifestyle-*.mjs`, `prepare/correct/verify-nuvemshop-lifestyle-*.mjs` | Pedir à IA que desenhe a estampa falhou; capa hoje é blank + composição |
| Diagnóstico hover de julho | `inspect-*.mjs`, `extract-live-css.mjs`, `verify-hover-live-products*.mjs` | One-off encerrado; o hover por par de cores foi REMOVIDO em 28/07 |
| Automação de clique no painel | `publish_*.ps1`, `repair_*.ps1`, `apply_*.ps1`, `batch-upload-*.ps1`, `control-nuvemshop-window.ps1` | Clique por script não salva (ESTADO 03/08); protocolo vigente em `docs/fluxos/site-css-e-hover.md` |
| Verificador da auditoria de 01/08 | `vitrine/verifica-consertos.mjs` | Preso a um snapshot extinto; os checks duradouros viraram portões |

## ONE-OFF CONCLUÍDO (registro; rodar de novo só com motivo)

| Família | Arquivos |
|---|---|
| Auditorias de imagem/dimensão de julho | `build-art-dimension-*`, `build-final-product-image-audit-*.mjs`, `build-nimbus-product-image-audit-sheets.mjs`, `download-live-product-gallery-audit.mjs`, `build-review-page.mjs`, `build-rights-and-image-worklists.mjs`, `audit-store.mjs`, `audit-pagespeed-public.mjs` |
| Medição de pilotos e anotação (época das receitas) | `pilot-generate.mjs`, `pilot-measure.mjs`, `measure-all-annotated.mjs`, `measure-print-geometry.mjs`, `merge-annotation-complement.mjs`, `derive-composicao.mjs` |
| Assets da loja (gerados na era Morelia; conferir Baires antes de regenerar) | `make-tiles-loja.mjs`, `make-banners-loja.mjs`, `make-favicons-e-mobile.mjs`, `make-mockups.mjs`, `build-nimbus-social-profile-kit.mjs` |
| Rascunhos de conteúdo de produto (roda sob ordem; a saída passa pelo lint-copy) | `build-product-content-drafts.mjs`, `descricoes.mjs` |
| Canal Gemini de estampa (ordem de 06/08: estampa-teste sai pelo MCP Higgsfield) | `gemini/` |
