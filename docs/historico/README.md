---
status: vigente
atualizado: 2026-07-26
---

# Histórico: o que caiu, e por quê

**Nada aqui deve ser seguido.** Está preservado porque o método que falha ensina.

## Três auditorias de escala invalidadas

Todas mediram a razão estampa/peça entre o **mockup plano** e a **foto vestida**.
Numa peça vestida o tecido envolve um cilindro e as laterais fogem da câmera:
a largura visível não é a largura plana, e a comparação **fabrica "estampa
grande"**. Foi essa trava que empurrou 12 das 13 fotos da fila real para o
defeito oposto — estampa pequena demais.

| Auditoria | Onde | Nota |
|---|---|---|
| 22-23/07, por cm | `nuvemshop/auditoria/2026-07-22-dimensoes-arte/` | **Parcial**: as colunas `*_cm` do CSV são a régua em uso. O veredito, o DOCX e o PDF são históricos. |
| 23/07, reauditoria visual | `nuvemshop/auditoria/2026-07-23-reauditoria-visual/` | Fila `6/27/16`. Ficou **sem aviso de invalidação até 26/07** — era o conflito mais perigoso do projeto. |
| 24-25/07, re-derivação física | citada no histórico | Usou comprimentos de peça errados, em direções opostas conforme a peça. |

A medição vigente é `nuvemshop/auditoria/2026-07-25-geometria/`, e o datum foi
resolvido em `nuvemshop/auditoria/2026-07-26-datum-mockups/`.

## Métodos de geração superados

- **IA desenhando a estampa** (`marketing/social/protocolo-higgsfield-3-passos.md`,
  `Nimbus brain/wiki/concepts/geracao-capas-lifestyle.md`). Falhou duas vezes sem
  mover a escala: com foto de referência no pedido, o modelo copia o tamanho
  errado junto.
- **Pipeline Higgsfield por CLI** (`scripts/generate-lifestyle-v*.mjs` e afins).
  Histórico de método; as travas TEXT IS SACRED e GARMENT LOCK vivem no texto
  deles e foram reaproveitadas.
- **`scripts/gemini/`** — sandbox de 23/07, superado por `scripts/produce-cover.mjs`.

## Quarentena

`_arquivo-2026-07/` — 14 capas geradas com régua invalidada, refs do mesmo lote,
o kit manual de 18/07 e 109 scripts descartáveis. Pode apagar depois da
conferência.
