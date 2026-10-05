---
status: vigente
atualizado: 2026-09-12
---

# 01-estampas — espelho local, gerado

**Esta pasta é descartável.** Ela é preenchida por
`node scripts/setup-assets.mjs`, que copia `01-estampas/` do repositório privado
`nimbus-assets` para cá. Apagar e recriar a qualquer momento não perde nada.

Ela existe porque o portão `npm run producao:dpi300` mede o DPI das artes, e as
artes não sobem para um repositório público. O `.gitignore` ignora tudo aqui
dentro menos este arquivo.

A verdade da arte é o repositório privado: `nimbus-assets/01-estampas/`, indexada
em `nimbus-assets/LEIA-ME.md`.

## Estrutura

```
01-estampas/<colecao>/<posicao>/[40x50/]*.png
```

`<colecao>` é `street`, `reliquia`, `gotica`, `nuvem` ou `marca`. `<posicao>` é
`costas` ou `peito`, e decide a caixa de impressão contra a qual o portão mede o
DPI (`docs/verdades/receita-export-300dpi.md`). A subpasta `40x50/` guarda a
mesma arte no tamanho maior, e **também é conferida** pelo portão.

Antes de 12/09/2026 este espelho se chamava `designs/prontos/` e guardava as
artes da era YouDraw. Elas viraram histórico em
`nimbus-assets/_historico/catalogo-youdraw/`, com as 30 descrições de produto
junto.
