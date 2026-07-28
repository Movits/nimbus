---
status: vigente
atualizado: 2026-07-28
---

# Estado do projeto

Esta é a única página que envelhece rápido. Leia antes de agir e atualize ao sair.

## Capas — o sistema está APROVADO

O dono aprovou em 27-28/07 o sistema de criação + auditoria
([`fluxos/capa-lifestyle.md`](fluxos/capa-lifestyle.md) e
[`fluxos/auditoria-capa.md`](fluxos/auditoria-capa.md)): IA (Nano Banana, 3
referências, 3-5 candidatas) para camiseta/oversized/blusão; geométrica com
landmark físico (etiqueta / costura do capuz / IA-agrimensor) para capuz, arte
de padrão e posição crítica. Cor da estampa: **arte pura, sem compensação**.

**16 capas aprovadas pelo dono até aqui** (12 por IA, versionadas no
nimbus-assets como `*-ia-v1.png` com sidecar `.capa.json`; 4 geométricas, por
receita):

| Produto | Variante | Método |
|---|---|---|
| 352618935 São Jorge Vintage | branca, preta | IA |
| 352728019 Aparecida Spray | preta | IA |
| 352723243 São Miguel Celeste | branca | IA |
| 352718275 Azulejo | branca | geométrica v7 (yaw −28,5 pela etiqueta) |
| 352718787 São Jorge Neobarroco (moletom) | branca | geométrica v4 (piloto) |
| 352890896 Aparecida Barroca | preta | IA |
| 352703276 Deus é Fiel (oversized) | preta | IA |
| 352703343 Deus é Fiel (camiseta) | preta | IA |
| 352702020 Salmo 19 (camiseta) | preta | IA |
| 352718943 São Jorge Neobarroco (oversized) | preta | IA |
| 352618837 São Jorge Vintage (blusão) | preta | IA |
| 352407182 São Miguel Vintage | offwhite | geométrica v5 (etiqueta 0,425) |
| 352717723 Brasão | offwhite | geométrica v6 (relevo 0,44) |
| 352619175 Salmo 19 (moletom) | preta | geométrica v15 (costura do capuz 0,565 + oclusão) |
| 352718999 São Jorge Neobarroco (camiseta) | preta | v3 mantida — os 2 mockups YouDraw batem com ela (15 cm); o dono vai refazer a ARTE depois |

**Fila restante da auditoria visual de 27/07:** 352717723 preta, 352703276 par
offwhite?, 352718943 offwhite, 352718999 branca, 352618837 branca, 352407182
preta, 352890896 offwhite (**sem blank** — gerar com Gemini), 352619175 branca,
352718943/352718275 pares de cor conforme catálogo. Métodos e ressalvas por
capa em [`../scripts/gemini/PROMPTS-PILOTO.md`](../scripts/gemini/PROMPTS-PILOTO.md).

Fora do fluxo, com motivo: Ecobag (painel plano); 3 produtos frontais
(352702753, 352702796, 352720257 — placement de frente nunca medido).

## Publicação

O pacote para o painel sai de `node scripts/producao/preparar-publicacao.mjs`
(`_PUBLICAR/` + índice). A Nuvemshop é colagem manual — **o upload é do dono**,
com a lista de conferência que a sessão entrega. Preservar as fotos oficiais
YouDraw (decisão de 25/07); remover as fotos de modelo antigas das capas
trocadas.

## Reorganização de 28/07

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

1. Terminar a fila de capas restante (métodos já validados).
2. Upload das capas aprovadas no painel (dono, com a lista de conferência).
3. Reconciliar 49 produtos e variantes entre Nuvemshop e YouDraw.
4. Completar páginas de produto: material, modelagem, medidas, prazo POD,
   política, impacto social.
5. Finalizar páginas legais e de ajuda.
6. Validar analytics e eventos do funil antes de anúncio pago.
7. Confirmar com a YouDraw a tabela de medidas do Blusão Moletom.
8. Dono: redesenhar a arte do São Jorge Neobarroco camiseta (decisão 28/07).

## Suspeitas abertas

- A capa publicada do **352727892** pode estar com a peça errada (foto sem
  capuz num Moletom Canguru). Confirmar na loja durante o upload.
- `eixo-costas.mjs` (medidor automático de eixo) não é confiável — aposentar ou
  consertar; o eixo se lê por marca física.
