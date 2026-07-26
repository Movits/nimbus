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

O gate **não vê**: fidelidade de traço e texto, sinal do yaw, compressão sutil e
integração com o tecido. Abra a capa e um recorte 1:1 da estampa, e responda:

- **Parece roupa ou parece adesivo?** Bordas retas e duras atravessando um pano
  amassado é a assinatura do PNG colado. A arte tem que ondular no vinco e
  escurecer na dobra. Prova barata: componha um controle com `--sem-relevo` e
  compare uma mancha grande e chapada da arte.
- **Está centrada no produto?** Compare o centro da arte com o eixo medido pelos
  vincos de cava.
- **A escala bate?** Não confie só no número: veja se a estampa cabe no painel
  com folga plausível.
- **Moletom: a arte some por baixo do capuz**, sem furo no meio e sem passar por
  cima dele?
- **Fidelidade**: traço, cores e texto letra a letra contra o arquivo oficial.
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
