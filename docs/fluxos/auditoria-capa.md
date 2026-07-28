---
status: vigente
atualizado: 2026-07-26
---

# Fluxo: auditar uma capa

Duas metades, e **as duas são obrigatórias**. O gate mede o que é numérico; o
olho julga o que ele não vê. Confiar só no gate foi como 77 capas passaram e
foram reprovadas pelo dono.

## 1. Gate numérico

```bash
node scripts/geometry/qa-capa.mjs \
  --blank <blank> --composta <capa> --arte <arte oficial> \
  --arte-cm <LxA> --peca "<peça>" --gola <g> --barra <b> \
  --placement <cm> [--arco <arco_meio_rad>] [--yaw <graus>]
```

Sai com código != 0 quando reprova, mas o JSON continua no stdout.

| Check | Instrumento | Reprova? |
|---|---|---|
| `escala` | registro NCC | sim, ±2% |
| `posicao` | registro NCC | sim, ±1,5 cm |
| `tinta_visivel` | fração de tinta que contrasta | sim, ≥15% |
| `confinamento` | diff forte fora da caixa | sim |
| `clipping` | estouro do clamp de sombra | sim |
| `moire` | energia de alta frequência | sim |
| `aspecto` | registro NCC | alerta |
| `barra`, `centro` | detector / silhueta | informativo |

## 2. Olho

O gate **não vê**: fidelidade de traço e texto, sinal do yaw, compressão sutil,
integração com o tecido, **cor da tinta** e **oclusão de capuz**. Abra a capa e
um recorte 1:1 da estampa, e responda:

- **Parece roupa ou parece adesivo?** Bordas retas e duras atravessando um pano
  amassado é a assinatura do PNG colado. A arte tem que ondular no vinco e
  escurecer na dobra. Prova barata: componha um controle com `--sem-relevo` e
  compare uma mancha grande e chapada da arte.
- **Horizontal: o centro da arte está na MARCA FÍSICA do meridiano?** Etiqueta/
  relevo costurado (camiseta, CLAHE), costura central do capuz (moletom,
  sobel-x) ou centro da candidata de IA (preto-no-preto). O eixo da silhueta e
  o mergulho visível da gola NÃO servem em pose girada (vieses documentados).
  Sanidade: regra do rosto (rosto à esquerda → estampa à direita do eixo, e
  vice-versa).
- **A escala bate?** Não confie só no número: veja se a estampa cabe no painel
  com folga plausível. Em capa de IA, escala é loteria entre candidatas —
  medir todas e escolher.
- **Cor: a estampa lê como a ARTE ORIGINAL** na escala de celular, foto
  inteira? (Decisão do dono, 28/07: arte pura, sem compensação.) Diagnóstico
  numérico: `scripts/geometry/medir-cor-estampa.mjs` — mas o veredito é visual.
- **Capuz: a arte some por baixo dele**, sem furo no meio e sem passar por
  cima? Peça com capuz sem polígono de oclusão na receita = reprovada direto
  quando a arte alcança a zona do capuz (o gate não vê isso).
- **Fidelidade**: traço, cores e texto letra a letra contra o arquivo oficial.
  Em capa de IA, texto pequeno (cartucho "NIMBUS") sai borrado — ressalva
  conhecida; reprovar se estiver legivelmente ERRADO, não só borrado.
- **Par de cor**: [`par-de-cor.md`](par-de-cor.md).

## 3. Auditoria do catálogo inteiro

```bash
node scripts/producao/consolidar-receitas.mjs   # junta as receitas
node scripts/producao/recompor-catalogo.mjs     # recompõe e roda o gate em todas
node scripts/producao/verificar-pares.mjs       # o hover
node scripts/producao/auditar-cenario.mjs       # cenário por coleção
node scripts/producao/auditar-capuz.mjs         # quanto o capuz cobre
```

## O que fazer quando um check acusa

**Conserte o instrumento ou prove que o alarme é falso.** Não rebaixe o check.
Foi rebaixando o check de centro que a estampa torta passou em 77 capas.
Ver [`../verdades/limites-conhecidos.md`](../verdades/limites-conhecidos.md).
