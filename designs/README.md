# designs/ — artes das estampas (POD)

Direção atual: **streetwear** (graffiti + blackletter + halftone). Prompts em
`../nimbus-designs-roupas-higgsfield.md`. As **imagens não vão pro GitHub** (repo público) —
ficam local + Drive.

## Estrutura
```
_mestres/_originais/   artes geradas no Higgsfield (fundo VERDE) — backup
prontos/
  costas/   gráficos grandes (33 cm) — recortados (sem verde) + 300 DPI, prontos pro POD
  peito/    gráficos pequenos (9 cm)
  _debug/   prévias sobre magenta (conferência do recorte)
```

## Fluxo
1. Gerar no **Nano Banana 2** com **fundo verde sólido (#00B140)** + aspect ratio (3:4 costas, 1:1 peito).
2. Salvar os originais em `_mestres/_originais/`.
3. `node scripts/organize-streetwear.mjs` (ou `npm run cutout:inbox` p/ a pasta `_inbox`):
   recorta o verde (chroma key) + redimensiona pra 300 DPI → `prontos/`.
4. Subir as de `prontos/` na HotPrinti/YouDraw.

## Nomes
`<código>-<descrição>.png` — códigos: **G** graffiti, **B** blackletter, **H** halftone.
Ex.: `G4-cristo-stencil-ouro`, `B1-nimbus-blackletter`, `B5-aparecida-halftone`.

## Prontas (1ª leva, aprovadas)
G1 tag (roxo/azul) · G2 anjo stencil (querubim/livro) · G3 "ACIMA DE TUDO" wildstyle ·
G4 Cristo stencil (branco/ouro) · G5 ícone nuvem spray · `nimbus-spray-puffy` ·
B1 NIMBUS blackletter · B2 Salmo 19 · B3 cruz+crest · B4 "ACIMA DE TUDO" gótico (branco/preto) ·
B5 Aparecida halftone.
