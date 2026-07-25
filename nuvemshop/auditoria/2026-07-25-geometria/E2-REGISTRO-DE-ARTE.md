# E2 — registro da arte contra anotação humana

Rodado em 25/07/2026 sobre 270 cenas de verdade conhecida.
Relatório completo: `scripts/geometry/register-report.json`.
Reproduzir: `node scripts/geometry/validate-register.mjs`.

## Critério, declarado antes de rodar

> O registro só substitui a anotação se a margem medida ficar **≤ 3 pp** no modo
> de arte irregular, onde a anotação hoje custa 8 pp. Se não ficar, a anotação
> continua e o ±5% segue restrito a arte com moldura. Publica-se o número que
> sair.

## Veredito: REPROVADO no critério

| | viés | desvio | p95 | **margem** |
|---|---|---|---|---|
| Anotação simulada | −6,74 | 9,79 | 22,99 | **27 pp** |
| **Registro** | −1,47 | 2,63 | 5,79 | **7 pp** |

7 pp não é ≤ 3 pp. O critério não se mexe.

## Mas o que o número diz é melhor do que "reprovado"

**O registro é praticamente imune ao problema que ele existia para resolver.**
A margem de 8 pp da arte irregular vem de anotadores escolherem *elementos
diferentes* como extremo — "é tinta ou é vinco do moletom?". O teste modela isso
com uma orla de tinta fraca que o anotador vê com probabilidade decrescente:

| Contraste da orla | Anotação | Registro |
|---|---|---|
| 0,10 (quase invisível) | 33 pp | **8 pp** |
| 0,22 | 27 pp | **7 pp** |
| 0,45 (visível) | 11 pp | **7 pp** |

A anotação varia 3× conforme a tinta apareça ou não. O registro varia de 8 para
7. Ele não tem a dúvida, porque a arte é a entrada: procura *onde* ela está, não
*o que* ela é.

## Onde o erro do registro realmente mora

Não é a tinta fraca. É a escala e o contraste do tecido:

| Recorte | margem |
|---|---|
| escala 0,85× | 5 pp |
| escala 1,2× | **10 pp** |
| tecido preto | 5 pp |
| tecido off-white | **9 pp** |

O off-white ser pior que o preto é contraintuitivo e vale a ressalva: no gerador
sintético o sombreado é multiplicativo, então em tecido claro ele tem amplitude
absoluta muito maior e compete com o gradiente da arte. Parte desses 9 pp pode
ser artefato do gerador, não do método. **Não tratar como medida do mundo real
até conferir em foto de verdade.**

## Hipótese testada e morta: modelar o enrolamento

O resíduo crescia com a escala (0,85× → 5 pp; 1,2× → 10 pp), o que sugeria que a
causa era ajustar uma *similaridade* a uma superfície *curva*. Implementei o
enrolamento cilíndrico dentro do registro, com dois parâmetros (meio-arco e
razão raio/distância), e **declarei a predição antes de rodar**: viés → ~0,
desvio → ~1,2, margem → ~3.

Resultado nas mesmas 270 cenas:

| | viés | desvio | margem |
|---|---|---|---|
| sem enrolamento | −1,51 | 2,64 | 7 pp |
| com enrolamento | −1,47 | 2,63 | 7 pp |

**A predição falhou.** Nada mudou, e custa 3,5× mais tempo. O estágio ficou
atrás de `opts.wrap`, desligado por padrão, com o número escrito no código para
ninguém refazer a tentativa achando que é nova.

> [!warning] Erro meu no caminho, registrado para não se repetir
> Antes de rodar a grade inteira testei três casos isolados e vi melhora grande
> (−2,49 → +1,49 pp na escala 1,2×). Era **comparação inválida**: eu punha um
> caso único contra a *média* de um conjunto diferente de condições. Na
> comparação pareada o ganho some. Cheguei a reportar essa melhora antes de
> conferir.

## O que isto decide

1. **O registro substitui a anotação**, não por atingir 3 pp, mas porque:
   é 4× melhor no agregado (7 contra 27 pp), é imune ao modo de falha que
   domina a anotação, e **elimina a etapa humana** — que é o que impede o método
   de escalar para um catálogo novo, que era o pedido do dono.
2. **O ±5% continua restrito a arte com moldura desenhada.** Com margem de 7 pp,
   o piso honesto para arte irregular passa de 8 pp para 7 pp. É melhora
   modesta, e é a que existe.
3. **O que falta para chegar a 3 pp** não é mais o enrolamento. Pelos recortes,
   é a escala grande e o contraste do tecido claro — e o próximo passo é
   descobrir quanto daquilo é o gerador sintético e quanto é o método, medindo
   em foto real.
