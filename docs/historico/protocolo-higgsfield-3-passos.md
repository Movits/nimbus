---
status: historico
atualizado: 2026-08-11
---

> [!warning] HISTORICO — nao seguir. Metodo PROIBIDO desde 26/07 (IA desenhando a estampa falhou duas vezes sem mover a escala).

> [!CAUTION]
> # ⛔ MÉTODO PROIBIDO — status: invalidado
>
> **invalidado-em: 2026-07-26 · substituido-por: `docs/fluxos/capa-lifestyle.md`**
>
> Este protocolo manda gerar a capa pedindo à IA que **desenhe a estampa**,
> calibrando escala por prompt. Isso é proibido desde 25/07: falhou duas vezes
> seguidas sem mover a escala um pixel, porque com foto de referência no pedido
> o modelo copia o tamanho errado junto.
>
> O método vigente gera a peça EM BRANCO e compõe a arte oficial por malha.

> ⚠️ **`youdraw-dimensoes.csv` NÃO é a régua.** A fonte única de dimensões em cm é
> `nuvemshop/auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte.csv`,
> colunas `front_*_cm` e `back_*_cm` — são as que `derive-composicao.mjs` e
> `measure-print-geometry.mjs` leem de fato. Corrigido em 26/07.

# Protocolo Higgsfield: 3 passos para anúncios ultra-realistas (23/07/2026)

Fonte: vídeo oficial da Higgsfield "3-Step Workflow To Make Ultra-Realistic
AI Ads" (youtube.com/watch?v=3rDs6FhFoUQ) e o post irmão
higgsfield.ai/blog/cinematic_headphones. Adaptado ao fluxo NIMBUS.

## Passo 1: construir e travar os assets ANTES de gerar

Princípio central: produto, personagem, locação e props recorrem em toda
cena; travar tudo antes é o que mantém a consistência.

- **Produto**: folha limpa com vários ângulos (frente, 3/4), specs travadas.
  No NIMBUS: a arte original exata (arquivos B*-*.png no CDN da YouDraw) +
  mockup oficial da peça/cor + dimensões em cm
  (`nuvemshop/auditoria/2026-07-23-reauditoria-visual/youdraw-dimensoes.csv`).
- **Personagem**: folha de rosto em close (trava identidade) + corpo inteiro
  frente/costas em fundo cinza (trava silhueta); versões de outfit
  separadas. No NIMBUS: manter o elenco fixo já usado nas capas; criar
  folhas de referência por modelo.
- **Locação**: stills em ângulo 3/4 (dá profundidade e espaço de câmera).
  No NIMBUS: azulejos portugueses, concreto Niemeyer, becos com grafite.
- Nomear cada asset de forma consistente (@modelo, @arte, @locacao) e
  anexar as referências certas em todo prompt.

## Passo 2: framework de prompt

- Prefixo de estilo unificado aplicado a todas as cenas; mudar uma vez
  atualiza tudo.
- Fórmula: luz natural apenas; color grade 60:30:10
  (dominante/secundária/acento); realismo de pele em nível de poro (pelos,
  assimetrias, rubor capilar); linguagem física de câmera (35mm/50mm,
  motion blur de obturador 180°, FOV exato); sem objetos flutuando,
  gravidade respeitada.
- A Higgsfield distribui um Claude Skill
  (`higgsfield-seedance-shotlist-director.skill`) que gera shotlists
  formatadas para Seedance; útil quando formos fazer VÍDEO de anúncio.

## Passo 3: animar por cortes com blocking preciso

Cada cena com 2-3 cortes descritos como direção de cinema (câmera, lente,
movimento, ação do personagem com micro-pausas). Só relevante na fase de
vídeo/ads; para as capas estáticas, os passos 1 e 2 bastam.

## Regras de consistência (as que importam já nas capas NIMBUS)

1. Referência do produto anexada a TODO prompt que o contenha.
2. Uma folha de referência por estado do personagem/roupa.
3. Props idênticos em todos os cortes; zero deriva de identidade.
4. Header de estilo global; posições travadas por esquema espacial.

## Aplicação imediata no NIMBUS (Fase B)

- Gerar capas no Gemini web usando: arte original (camada rígida, nunca
  redesenhada) + mockup YouDraw da peça/cor + foto de referência do modelo
  do elenco + locação da colecão + dimensões em cm para calibrar a escala.
- Multi-cor: mesma cena/pose, só trocar a cor da peça (par de hover).
- Finais sem marca d'água via API Nano Banana 2 (US$0,0336/img) ou
  Higgsfield; escalar para Nano Banana Pro só em caso teimoso.
