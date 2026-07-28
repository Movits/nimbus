---
status: vigente
atualizado: 2026-07-28
substitui: a versão de 26/07 deste arquivo (só-geométrica) e Nimbus brain/wiki/concepts/geracao-capas-lifestyle.md
---

# Fluxo: produzir uma capa de produto

A capa é a foto de modelo vestindo a peça, com a estampa oficial aplicada.
O sistema vigente foi validado pelo dono em 27-28/07 sobre 16 capas: **dois
métodos, escolhidos pela peça e pelo caso**, com a mesma auditoria em cima.

## Qual método usar

| Caso | Método |
|---|---|
| Camiseta / Oversized / Blusão (sem capuz), arte normal | **IA (Nano Banana)** — prompt de 3 referências |
| Peça com capuz (Moletom Canguru) | **Geométrica** — a IA nunca esconde o topo da estampa sob o capuz (falha dura, 4/4) |
| Arte de padrão repetido (azulejo) ou posição que precisa de controle exato | **Geométrica** — a IA redesenha o miúdo e não obedece deslocamento por texto |
| Cor da variante ≠ cor do mockup e a IA insiste em recolorir | **Geométrica** |

## Método IA (Nano Banana, `gemini-3.1-flash-image`)

Refs, nesta ordem: **arte oficial PNG · blank do produto · mockup de COSTAS**
(o mockup escolhido por REGISTRO com a arte — `horizontal-oficial.json` — nunca
pelo índice da galeria; a galeria errada é reproduzida fielmente).

Prompt vigente e variações de correção: `scripts/gemini/PROMPTS-PILOTO.md`
(seção v4/lote). Regras que os pilotos provaram:

- **3–5 candidatas por capa** — escala varia de −13% a +22% entre gerações
  idênticas; a auditoria escolhe, nunca a primeira.
- Correção por texto funciona para **tamanho** ("clearly smaller… less than
  half the width") e **vertical** ("place it lower"); **NÃO funciona para
  deslocamento lateral** nem para esconder sob capuz.
- Nenhuma frase de ESTILO no prompt (um "keep the halo flat" já matou a
  textura da arte; estilo vem das referências).
- Critério de escolha entre candidatas: **landmark horizontal primeiro**
  (ver auditoria), escala depois.
- Capa aprovada é **versionada no nimbus-assets** (`<id>-<cor>-ia-v1.png`) com
  sidecar `.capa.json` no público — ela não é derivável de receita.

## Método geométrico (compositor)

1. **Blank**: já existe para 77 variantes (nimbus-assets). Gerar novo só se
   faltar: `node scripts/produce-cover.mjs blank …` (cena = capa publicada do
   produto/cor; o prompt trava a peça e proíbe estampa).
2. **Landmarks**: `gola`/`barra`/`centro`/`torso` por leitura visual com
   `scripts/geometry/grade.mjs`; **yaw pela marca física do meridiano** —
   ordem: etiqueta/relevo costurado (camiseta clara, revelar com CLAHE) >
   costura central do capuz (o V, achar com sobel-x) > IA-agrimensor (gerar 1-2
   candidatas de IA e ler o centro delas por registro; em preto sobre preto é o
   único que funciona). O mergulho da gola **subestima o giro** (viés
   documentado) — não usar como alvo em pose girada.
   `scripts/geometry/estimar-yaw.mjs --receita <r> --costura-x <frac>`.
3. **Placement**: o adotado em `placement-por-produto.json` (nunca o antigo).
4. **Oclusão**: peça com capuz e arte que alcança a zona dele → polígono
   `--oclusao` obrigatório (fronteira em preto-no-preto: onde a candidata de
   IA se recusa a pintar).
5. Compor: `node scripts/produce-cover.mjs compor … --sombra-global 1
   --dobra-larga 180 --relevo 8` (receita de tecido aprovada pelo dono).
6. **Cor da estampa: arte pura.** Nenhuma compensação de saturação/contraste —
   régua de 4 doses foi reprovada; o dono escolheu a arte sem ajuste.

## Depois de compor (qualquer método)

Auditar por [`auditoria-capa.md`](auditoria-capa.md) e enviar ao dono como
final numerada (aprovar/reprovar dele fecha a capa). Uma capa por vez continua
valendo dentro do lote: cada uma passa pela auditoria completa antes de entrar
na leva enviada.
