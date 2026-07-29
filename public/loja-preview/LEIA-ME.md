# Vitrine NIMBUS (loja-preview)

Vitrine estatica da marca. A Nuvemshop segue como motor de carrinho/checkout.

O que e GERADO (nao edite a mao): `index.html`, `c/`, `p/`, `catalogo.json`, `media/`.
O que se edita a mao: `css/`, `js/` e os geradores em `scripts/vitrine/`.

Regerar tudo:

    npm run vitrine

Fontes de dados: ver cabecalho de `scripts/vitrine/build-catalogo.mjs`.
Regras de copy: `scripts/vitrine/lint-copy.mjs` (falha o build se violar).
Imagens de `media/`: derivados editoriais gerados por `build-media.mjs` a partir do
repo privado nimbus-assets. Artes nunca inteiras, sem alpha, max 900px (recorte
sangrado sobre campo de cor). Nao subir arte original para este repo (e publico).
