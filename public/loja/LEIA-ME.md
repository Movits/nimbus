---
status: vigente
atualizado: 2026-11-25
---

# Vitrine NIMBUS (/loja/)

Vitrine estatica da marca. A sacola mora no navegador (`js/ui.js`) e a compra
fecha na loja propria: `finalizar/` manda o pedido ao servidor (`servidor/`),
que devolve o resumo e o link do Mercado Pago; `pedido/` e `pedido/obrigado/`
acompanham o pedido (`js/compra.js`). O servidor ainda nao esta ligado e a loja
segue fechada: as tres paginas nao tem link no site e ficam fora do sitemap.
O teste delas no navegador e `npm run loja:formulario`.

O que e GERADO por `npm run vitrine` (nao edite a mao): `index.html`, `c/`, `p/`,
`catalogo.json`, `media/`, `gates/`, `envios/`, `impacto/`, `trocas/`,
`privacidade/`, `manifesto/`, `finalizar/`, `pedido/`, alem de
`../loja-preview/` (stubs de redirect), `../gravuras/`, `../404.html`,
`../sitemap.xml` e `../robots.txt`.

O texto das paginas institucionais (envios, impacto, trocas, privacidade) se
edita em `INSTITUCIONAIS`, dentro de `scripts/vitrine/build-paginas.mjs`, nunca
no HTML gerado (o proximo build sobrescreve em silencio).

O que se edita a mao: `css/`, `js/` e os geradores em `scripts/vitrine/`.
Topo, rodape, titulo, botao e vidro NAO moram em `css/`: moram em
`../css/marca.css`, o mesmo arquivo que a landing liga, e as palavras repetidas
em `src/data/marca.json` (`docs/fluxos/site-um-so-ceu.md`).
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
