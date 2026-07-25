# Medidor geométrico de estampas

Mede **escala** e **posição** da estampa em fotos de peça vestida, contra as
dimensões oficiais em cm da YouDraw. Substitui as duas auditorias anteriores,
ambas invalidadas (ver `CLAUDE.md`, seção "Medição de escala suspensa").

## O princípio

Em vez de perguntar "a estampa tem o tamanho certo?" — que exigiria saber
quantos pixels valem um centímetro na peça, que exigiria saber que tamanho o
modelo veste — o medidor pergunta:

> dada a arte oficial de H cm de altura, que **comprimento de peça** esta foto
> implica?

Se a foto implica uma Camiseta Premium de 58 cm quando a peça real tem 70,5 a
85 cm, a foto está errada **para qualquer tamanho**. É um argumento de
impossibilidade, não uma estimativa, e não cai no "mas e se ele veste EG?".

## Por que só o eixo vertical

Modelando o dorso como cilindro de raio R com a câmera em guinada θ, uma arte
de largura W projeta como `W · κ · cos θ`, com `κ = sin(a/R)/(a/R)`, `a = W/2`.
Disso saem três consequências:

1. **O eixo horizontal só sabe subestimar** (`κ·cos θ ≤ 1` sempre). Toda
   medição de largura numa peça vestida é limite inferior, nunca estimador.
2. **κ depende do corpo e do caimento.** Derivar κ de um produto e aplicar em
   outro importa o raio errado — foi exatamente o "fator de caimento 1,52",
   medido numa Camiseta Premium e aplicado a moletons.
3. **O eixo vertical é imune a guinada e a enrolamento.** Confirmado na
   validação: o erro de escala praticamente não muda de 0° a 40° de guinada.

Por isso "o horizontal diz menos que o vertical" é o **esperado**, não uma
contradição — e foi essa leitura equivocada que gerou os laudos conflitantes de
18/07.

## Precisão medida (não escolhida)

`node scripts/geometry/validate.mjs` roda o medidor sobre 7.290 cenas
sintéticas com escala, posição e pose **conhecidas por construção** (cilindro +
câmera pinhole, guinada 0-40°, inclinação ±10°, rolagem ±5°, escala 0,7-1,3,
deslocamento 0-4 cm, rotação da arte 0-3°).

| Medida | Viés | Desvio | Margem publicada |
|---|---|---|---|
| Escala, anotação de **8 pontos** | +0,11 pp | 0,95 pp | **±2 pp** |
| Escala, anotação de 4 pontos | +2,46 pp | 1,54 pp | ±6 pp |
| Posição (pose quase frontal) | +0,04 cm | 0,99 cm | **±2,0 cm** |

O detector de anisotropia α acusa pose forte em 100% dos casos com guinada
≥30° e tem 0% de falso positivo em pose frontal com arte correta.

**Anote os 8 pontos.** Medir a altura da arte pelas bordas laterais introduz
viés de +2,5 pontos: as bordas ficam na parte curva do dorso, mais perto da
câmera que a linha central onde estão gola e barra, e projetam ~2% maiores.
Os 4 pontos médios das arestas custam pouco e derrubam o viés para ~zero.

## Erro irredutível: o tamanho vestido

A faixa entre P e EG é larga — Camiseta Premium ±10,3%, Oversized ±5,1%,
Moletom Canguru ±8,3%. Sem declarar o tamanho, **nenhuma tolerância abaixo de
~10% é executável**, e é por isso que os vereditos antigos de "desvio de 7,5%"
estavam dentro do próprio ruído do método.

Duas saídas, ambas implementadas:

- **Veredito duro** (`REPROVADO-DURO`): usa a faixa física inteira. Reprova só
  quando nenhum tamanho real explica a geometria. É indiscutível.
- **Veredito de catálogo** (`FORA-DO-ALVO`): compara com o tamanho canônico
  `G`, por convenção do projeto de que toda foto lifestyle representa um G.
  Essa convenção precisa entrar também no prompt de geração.

## Módulos

| Arquivo | Responsabilidade |
|---|---|
| `homography.mjs` | Álgebra: homografia 4→4 por eliminação gaussiana, inversa, distâncias com sinal. JS puro (não há numpy/OpenCV no ambiente). |
| `garment-specs.mjs` | Fonte única de verdade da tabela de medidas: **lê** `build-prelaunch-matrix.mjs`, não redigita os números. Blusão Moletom devolve "sem tabela" explicitamente. |
| `measure.mjs` | A medição: α, ρ_v, comprimento implícito, δ por tamanho, posição, cross-checks, confiança e vereditos. |
| `synth.mjs` | Gerador de verdade conhecida (cilindro + câmera pinhole). |
| `validate.mjs` | Roda a grade de validação e emite `validation-report.json`. Sai com código 1 se qualquer critério falhar. |

## Regras que o medidor nunca quebra

- Landmark ausente **nunca** vira número: vira limite unilateral ou
  `INCONCLUSIVO`.
- Sem tabela de medidas (Blusão Moletom) a escala é `INDISPONIVEL`, jamais
  estimada.
- α positivo alto significa altura comprimida — inclinação de câmera ou
  anotação errada. Nesse caso o eixo primário está contaminado e nenhum
  veredito é emitido.
- A posição só é avaliada em pose quase frontal; girada, o eixo visível da
  peça se desloca em relação ao eixo verdadeiro.

## Limite conhecido

A validação prova a **matemática** com landmarks perfeitos. O erro de anotação
entra por cima e precisa ser medido em fotos reais, com dois anotadores
independentes por foto — está previsto na Fase 4 e ainda não foi feito.
