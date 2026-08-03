---
status: vigente
atualizado: 2026-08-03
---

# scripts/ — o que é vivo e o que é superado

Este diretório mistura os portões vivos do projeto com scripts de métodos
superados, preservados como histórico. Nenhum arquivo foi movido: quem manda é
este mapa e o banner no topo de cada script superado.

## VIVO (use)

| O quê | Onde |
|---|---|
| Portões e builds da vitrine (`npm run vitrine`, `vitrine:portoes`) | `vitrine/` (build-catalogo, build-media, build-paginas, lint-copy, lint-claims, parity-tokens, parity-variantes, link-check) |
| Reteste local do desempate sacola↔carrinho | `vitrine/teste-sincroniza.mjs` |
| Links da documentação (`npm run docs:links`) | `link-check-docs.mjs` |
| CSS da loja sobrevive ao minificador do painel (`npm run loja:css`) | `verifica-css-loja.mjs` |
| Build do CSS consolidado da loja | `build_nimbus_publication_css.mjs` (leia o achado do escape `\00000A` antes de regenerar) |
| Tabela de medidas (fonte única, lida por `geometry/garment-specs.mjs`) | `build-prelaunch-matrix.mjs` |
| Bootstrap dos assets privados | `setup-assets.mjs` |
| Medidor geométrico e sua validação (38.880 casos) | `geometry/` (`validate.mjs` tem que passar) |
| Produção e inventário de capas | `producao/` |
| Compositor de capas vigente | `produce-cover.mjs`, `compose-art.mjs` e afins (fluxo em `docs/fluxos/capa-lifestyle.md`) |

`verify-store-full.mjs` não está aposentado: é a base do gate P1-6 planejado
pela ata de 30/07 (`nuvemshop/auditoria/2026-07-30-conselho-vitrine-r3/`).

`geometry/provider/` é exceção deliberada sem chamador atual: é o caminho da
eventual migração de fornecedor (ver a tabela de módulos do `geometry/README.md`).

## SUPERADO (não usar; cada arquivo tem banner no topo)

| Família | Arquivos | Por quê |
|---|---|---|
| Pipeline lifestyle v1-v3 | `generate-lifestyle-v2/v3.mjs`, `generate-nuvemshop-lifestyle-batch.mjs`, `build-lifestyle-*.mjs`, `prepare/correct/verify-nuvemshop-lifestyle-*.mjs` | Pedir à IA que desenhe a estampa falhou; capa hoje é blank + composição |
| Diagnóstico hover de julho | `inspect-*.mjs`, `extract-live-css.mjs` | One-off encerrado em 23/07 |
| Automação de clique no painel | `publish_*.ps1`, `repair_*.ps1`, `apply_*.ps1`, `batch-upload-*.ps1` | Clique por script não salva (ESTADO 03/08); publicar CSS segue `nuvemshop/cowork-publicar-css.md` |
| Verificador da auditoria de 01/08 | `vitrine/verifica-consertos.mjs` | Preso a um snapshot extinto; os checks duradouros viraram portões |
