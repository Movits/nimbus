---
status: vigente
atualizado: 2026-07-28
---

# Estado do projeto

Esta é a única página que envelhece rápido. Leia antes de agir e atualize ao sair.

## Capas — PIVÔ DE DIREÇÃO (28/07, fim do dia)

**O dono descartou TODA a geração de capas compostas** (as 62 que chegaram a
ir ao ar + todos os PNGs gerados nas pastas): "está muito ruim e a gente vai em
outra direção". Estado atual:

- **Loja**: só os mockups oficiais YouDraw (149 imagens, 49 produtos). Nenhuma
  capa de modelo no ar. Vínculos de variante todos nos mockups (hover ok).
- **Preservado**: blanks (149, nimbus-assets) · mockups YouDraw · artes ·
  receitas e sidecars (como história do método) · fluxos/instrumentos/prompts.
- **NOVO INSUMO**: os **boards de casting dos modelos** (Higgsfield, enviados
  pelo dono em 28/07) estão em
  `nimbus-assets/nuvemshop/assets/product-lifestyle/2026-07-16/casting/`
  ({caio,clara,gabriel,helena,elenco}-board-v1.png, estúdio, fundo azul-claro,
  rosto + corpo). São a base da nova direção, que o dono ainda vai detalhar.
- `capas-aprovadas.json` foi **zerado** (nota interna explica).
- A recriação de 28/07 (galeria, correções, runners) fica como história em
  `nuvemshop/producao/recriacao-*.json` e nos fluxos; o sistema de
  criação+auditoria (IA 3-refs + geométrica com landmark) segue válido como
  ferramenta — o que caiu foi o RESULTADO visual desta safra, não o método.

**Aguardando o dono:** o plano da nova direção das capas.

## Reorganização de 28/07

- CSS vigente: `nuvemshop/css-nimbus-publicacao-compacta-2026-07-28.css`
  (28/07, hover padrão do tema). O de 20/07 é histórico.
- Raiz limpa: 11 documentos de fundação (jun-jul/2026) → `docs/historico/`;
  `precificacao.md` (vivo) → `docs/projeto/`; `tmp_bloco.json` removido.
- Scripts pontuais de sprints passadas → `scripts/historico/` (com README).
  Núcleo intacto: `scripts/*.mjs` centrais, `geometry/`, `gemini/`, `producao/`.
- CSS de 16-17/07 → `nuvemshop/css-historico/`. O vigente segue
  `css-nimbus-publicacao-compacta-2026-07-20.css` (ver `nuvemshop/instrucoes.md`).
- Verificações (`typecheck`, `validate`, `inventario`) passam após a mudança.

## Medições fechadas

- Placement por produto (registro com a arte): `placement-por-produto.json` —
  adotado 27/07. Horizontal oficial dos mockups: `horizontal-oficial.json`.
- Datum: a "altura" da tabela YouDraw é gola→barra. Blusão: 78,4 cm estimado.
- 352727892 reclassificado de Blusão para Moletom Canguru.

## Pendências do projeto

1. Nova direção das capas (dono vai detalhar; boards de casting prontos).
2. **Dono colar o CSS novo no painel**: `nuvemshop/css-nimbus-publicacao-compacta-2026-07-28.css`
   (hover volta ao padrão do tema; o de 20/07 escondia a secundária no hover e o
   card ficava branco depois do pivô). Fluxo em `nuvemshop/instrucoes.md`.
3. Reconciliar 49 produtos e variantes entre Nuvemshop e YouDraw.
4. Completar páginas de produto: material, modelagem, medidas, prazo POD,
   política, impacto social.
5. Finalizar páginas legais e de ajuda.
6. Validar analytics e eventos do funil antes de anúncio pago.
7. Confirmar com a YouDraw a tabela de medidas do Blusão Moletom.
8. Dono: redesenhar a arte do São Jorge Neobarroco camiseta (decisão 28/07).

## Suspeitas abertas

- `eixo-costas.mjs` (medidor automático de eixo) não é confiável — aposentar ou
  consertar; o eixo se lê por marca física.
