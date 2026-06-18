# NIMBUS — Estampas para Hotprinti (Fase 0.5)

Cápsula inicial de **6 estampas** em arte **vetorial** (SVG), pensada pra impressão em peças
**claras e escuras**. Tudo no "mundo céu" da marca: azul-jóia, dourado de auréola, branco-nuvem,
linha bold e simétrica, nuvens e luz.

> **Por que vetor (e não render fotoreal do Higgsfield)?** Estampa pede arte chapada, de alto
> contraste e fundo transparente, que escala sem perder nitidez. Render fotoreal de nuvem fica
> "lavado" e sujo no tecido. Os arquivos `.svg` são o **master** — dá pra exportar em qualquer
> tamanho sem pixelar.

## A cápsula

| # | Estampa | Posição sugerida | Produto-alvo | Arquivo base |
|---|---|---|---|---|
| 1 | **Wordmark NIMBUS** (Fraunces + auréola) | Peito esq. / manga | Tee Aurora / básicos | `wordmark` |
| 2 | **Ícone nuvem + auréola** | Bolso / manga / peito | Hoodie Cumulus | `icone` |
| 3 | **Selo "NIMBUS · BRASIL · EST. 2026"** | Peito / manga | Crewneck Niemeyer | `selo` |
| 4 | **Catedral de Brasília** (coroa + raios) | Costas grande | Crewneck Niemeyer | `catedral` |
| 5 | **Cristo Redentor** (sunburst) | Costas grande | Tee Redentor | `redentor` |
| 6 | **Vitral Dom Bosco** (cruz de luz) | Costas / all-over | Tee Vitral | `vitral` |

Cada estampa tem **2 colorways**:
- **`-claro`** → traço **azul-jóia `#0B2360`** + dourado terroso `#B98722`. Pra peça **clara**
  (branco / areia).
- **`-escuro`** → traço **branco-nuvem `#F7FBFF`** + dourado luminoso `#EFCB72`. Pra peça
  **escura** (azul-profundo / preta).

**Variações** pra escolher (em `estampas/`): wordmark `empilhado` vs `-line` (em linha); selo
`duplo` vs `-simples` (anel); catedral/Cristo `com raios` vs `-limpa`. Veja
`estampas/previews/_variacoes.png`.

## Arquivos

```
estampas/
  *.svg                      ← masters vetoriais (fundo transparente), 16 arquivos
  previews/
    _lookbook.png            ← visão geral (claro | escuro nos swatches)
    _variacoes.png           ← opções pra escolher
    <id>-<colorway>.png      ← preview individual de cada arte
  print/
    <id>-<colorway>@300dpi.png ← PNG transparente, pronto pra Hotprinti
  _build.mjs                 ← gerador (edite aqui pra ajustar paleta/desenho)
```

## Regerar / ajustar

O desenho é todo paramétrico em `estampas/_build.mjs` (paleta, traço, geometria). Depois de
mexer:

```bash
npm i                       # garante a dep @resvg/resvg-js (devDependency)
node estampas/_build.mjs            # regenera SVGs + previews + lookbook
node estampas/_build.mjs --print    # exporta os PNGs 300 DPI transparentes
```

> Os previews usam as fontes **Fraunces** e **Archivo** (carregadas de `/tmp/nfonts` no ambiente
> de geração). Pra exportar localmente, tenha as duas `.ttf` e ajuste `fontFiles` no topo do
> `_build.mjs`. Pra um PNG 100% à prova de fonte, dá pra **converter o texto em curvas** num
> editor vetorial antes de exportar.

## Specs de impressão — Hotprinti

- **Formato:** PNG com **fundo transparente**, **RGB**.
- **Resolução:** **300 DPI**. Os arquivos em `estampas/print/` já saem assim.
- **Tamanhos** (largura da arte; ajuste no `PRINT_CM` do `_build.mjs`):
  - Costas (catedral, Cristo, vitral): **~32 cm** → ~3780 px.
  - Peito/wordmark: **~28 cm**. Selo: **~14 cm**. Ícone bolso/manga: **~12 cm**.
- **All-over / sublimação:** precisa de **padrão sem emenda** no tamanho exato do template da
  Hotprinti — fica como próximo passo (o vitral pode virar base de um all-over).

### Fluxo na Hotprinti
1. Suba o PNG de `estampas/print/` (escolha `-claro` ou `-escuro` conforme a cor da peça).
2. Posicione no template do produto (peito ~8–10 cm de largura; costas centralizado, topo ~8 cm
   abaixo da gola).
3. Configure os **colorways**: peça clara → arte `-claro`; peça escura → arte `-escuro`.
4. Confira o **mockup** e, idealmente, peça **uma amostra física** antes de publicar (DTG às
   vezes muda o tom do azul/dourado).

## Próximos passos sugeridos
- Escolher as variações (wordmark, selo, catedral, Cristo).
- Definir all-over de nuvens pra sublimação (padrão tileável).
- Fechar o mapa peça×estampa×cor pra montar os produtos na Hotprinti.
