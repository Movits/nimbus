---
status: vigente
atualizado: 2026-08-03
---

# Vitrine NIMBUS (/loja/)

Vitrine estatica da marca. A Nuvemshop segue como motor de carrinho/checkout.

O que e GERADO por `npm run vitrine` (nao edite a mao): `index.html`, `c/`, `p/`,
`catalogo.json`, `media/`, `gates/`, `envios/`, `impacto/`, `trocas/`,
`privacidade/`, alem de `../loja-preview/` (stubs de redirect), `../sitemap.xml`
e `../robots.txt`.

O texto das paginas institucionais (envios, impacto, trocas, privacidade) se
edita em `INSTITUCIONAIS`, dentro de `scripts/vitrine/build-paginas.mjs`, nunca
no HTML gerado (o proximo build sobrescreve em silencio).

O que se edita a mao: `css/`, `js/` e os geradores em `scripts/vitrine/`.
`teste-carrinho/` e pagina manual interna: nenhum script a gera, e ela fica fora
do sitemap (noindex).

Regerar tudo:

    npm run vitrine

Fontes de dados: ver cabecalho de `scripts/vitrine/build-catalogo.mjs`.
Regras de copy: `scripts/vitrine/lint-copy.mjs` (falha o build se violar).
Imagens de `media/`: derivados editoriais gerados por `build-media.mjs` a partir
do repo privado nimbus-assets. Regra vigente (fonte: `scripts/vitrine/build-media.mjs`,
decisao de 29/07): maximo 1600 px, WebP, alvo <= 200 KB, sem alpha. Artes nunca
inteiras (recorte sangrado sobre campo de cor). Nao subir arte original para
este repo (e publico).
