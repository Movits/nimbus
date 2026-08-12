---
status: vigente
atualizado: 2026-08-12
---

# scripts/producao/ — mapa

O que vive aqui e o que cada peça é:

- **`lint-export-300dpi.mjs`** — o portão `npm run producao:dpi300` (roda no
  `vitrine:portoes`). Régua em `docs/verdades/receita-export-300dpi.md`;
  baseline datada `export-300dpi.baseline.json` (64 artes legadas toleradas,
  lista que só encolhe). Precisa dos assets privados; `SKIP_ASSETS=1` só em
  ambiente sem eles.
- **`inventario.mjs`** — inventário das capas/variantes em disco (verificação
  inicial clássica do projeto).
- **`auditar-dpi-artes.mjs`** — auditoria de DPI usando a caixa da IzzyPrint
  (plataforma DECIDIDA em 07/08; confirmar o limite real da conta, o editor
  público mostra 30×40 cm).
- **`preparar-publicacao.mjs`** — monta `_PUBLICAR/` a partir das capas finais.
  ⛔ O lote de 77 está reprovado; ver o banner de
  `docs/fluxos/publicar-na-loja.md` antes de rodar.
- Demais arquivos: apoio dos três acima (listas, baselines e saídas datadas).
