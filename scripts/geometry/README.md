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

`node scripts/geometry/validate.mjs` roda o medidor sobre 38.880 cenas
sintéticas com escala, posição e pose **conhecidas por construção** (cilindro +
câmera pinhole, guinada 0-40°, inclinação ±10°, rolagem ±5°, escala 0,7-1,3,
deslocamento 0-8 cm, rotação da arte 0-3°, contraposto 0-3 cm). O script sai
com código 1 se qualquer critério falhar: **nenhum veredito é publicado sem ele
passar.**

### Escala

| Anotação | Viés | Desvio | Margem publicada |
|---|---|---|---|
| **8 pontos** | +0,6 pp | 1,24 pp | **±3 pp** |
| 4 pontos | +2,86 pp | 1,65 pp | ±6 pp |

**Anote os 8 pontos.** Medir a altura da arte pelas bordas laterais introduz
viés de ~3 pontos: as bordas ficam na parte curva do dorso, mais **longe** da
câmera que a linha central onde estão gola e barra, e projetam ~2,4% **menores**.
Os 4 pontos médios das arestas custam pouco e derrubam o viés para ~zero.

> Até 25/07 este parágrafo dizia o contrário ("mais perto", "maiores"), e o
> gerador sintético tinha o sinal da profundidade invertido — modelava um dorso
> côncavo. Corrigido; o viés de 4 pontos passou de +2,85 pp para −3,04 pp, mesmo
> módulo e sinal oposto.

### Posição: por que ela é fraca, e o quanto

A posição **não devolve um número, devolve uma faixa** — e a faixa é larga.
Isso não é conservadorismo gratuito. São três efeitos físicos medidos, todos
somando na mesma direção:

1. **Contraposto contra guinada.** Há dois jeitos de achar o centro da peça, e
   cada um quebra num regime: a reta gola→barra é exata sob guinada mas erra
   com o quadril deslocado (numa foto real deu 4,4 cm de deslocamento falso);
   o meio do tronco é imune ao contraposto mas erra 2,3 cm já a 10° de guinada,
   porque as duas laterais estão em profundidades diferentes. **Os dois erram
   para o mesmo lado quando as duas coisas acontecem juntas**, e é daí que sai
   a margem fixa de **±1,9 cm**. O sinal que separaria as duas causas — a
   inclinação da coluna central da arte — vale 1,5° para um erro de 1,3 cm,
   ou seja 12 px sobre 450, contra σ de ~8 px por ponto anotado. Está enterrado
   no ruído de anotação.
2. **Compressão.** Deslocamento grande é lido menor do que é: 3 cm reais leem
   1,9-2,5 cm, 8 cm leem 5,1-6,6. O fator ficou estável em ~1,56, e entra como
   **×1,6 no teto da faixa**. O número medido é um piso.
3. **Tamanho vestido.** A faixa P..EG entra como faixa, mas aqui pesa pouco
   (o número é da ordem de 1 cm).

Resultado: cobertura de **98,9%** (a faixa contém a verdade) e **zero vereditos
decisivos errados** em 19.440 casos. O preço é decidir em só **12%** deles.
Traduzindo em prática: o medidor confirma centralização abaixo de ~2 cm e
reprova deslocamento acima de ~7 cm. **Entre os dois ele não sabe, e diz que
não sabe.** Centralização fina não é mensurável numa foto de peça vestida.

### O que NÃO funcionou (não retentar sem olhar o número)

- **Retificação por homografia para posição.** A homografia ajustada pelos
  cantos da arte devolve uma taxa px/cm *média* sobre uma superfície curva.
  Um deslocamento real de 3 cm era lido entre 1,2 e 3,3 cm conforme o tamanho
  da arte em relação ao corpo — fator de 0,40 a 1,10. Trocado por conversão
  pela taxa **vertical** na coluna central, que é imune ao enrolamento.
- **α como portão de pose para a posição.** α também sobe quando a arte está
  muito deslocada (ela enrola assimétrica), então o portão suprimia o veredito
  justamente nas fotos mais deslocadas.
- **Critério perceptual como veredito** ("% da largura do tronco visível").
  Numa sub-grade parecia separar; na grade completa não separa em nenhum corte
  de α — uma estampa centrada chega a 11,7% e uma deslocada 5 cm aparece com
  8,5%. A causa: **α acusa pose ruim mas não atesta pose boa**, porque guinada
  (encolhe a largura) e inclinação (encolhe a altura) se cancelam dentro dele.
  O número continua reportado como diagnóstico para conferência humana, e a
  tabela de sobreposição fica em `validation-report.json`.

## O tamanho vestido: era erro irredutível, virou convenção

A faixa entre P e EG é larga — Camiseta Premium ±10,3%, Oversized ±5,1%,
Moletom Canguru ±8,3%. Enquanto o tamanho vestido era desconhecido, essa faixa
entrava inteira no veredito e **nenhuma tolerância abaixo de ~10% era
executável**. Foi por isso que os vereditos antigos de "desvio de 7,5%"
estavam dentro do próprio ruído.

**Isso deixou de valer em 25/07**, quando o dono adotou a convenção de que
toda foto lifestyle representa um tamanho **G** (`CANONICAL_SIZE`). Com o
tamanho declarado, a faixa P..EG some do eixo de catálogo: ela continua
existindo, mas como a faixa do veredito DURO, não como ruído do veredito de
catálogo.

> [!warning] Correção de 25/07
> Este parágrafo afirmava, sem ressalva, que nenhuma tolerância abaixo de ~10%
> era executável. Depois da convenção do G isso ficou falso, e o texto passou a
> documentar que a meta de ±5% do dono seria ilegítima — quando o que a limita
> hoje é outra coisa.

Duas saídas, ambas implementadas:

- **Veredito duro** (`REPROVADO-DURO`): usa a faixa física inteira. Reprova só
  quando nenhum tamanho real explica a geometria. É indiscutível, e é o único
  que continua carregando a incerteza P..EG.
- **Veredito de catálogo** (`OK` / `ACEITAVEL` / `FORA-DO-ALVO`): compara com o
  tamanho canônico `G`. Essa convenção precisa entrar também no prompt de
  geração.

### O que limita a tolerância hoje

Não é mais a faixa de tamanhos: é a **margem medida do próprio método**, que
depende de como a arte pode ser anotada.

| Tipo de arte | Margem publicada | Tolerância mínima honesta |
|---|---|---|
| Moldura desenhada (8 pontos médios) | ver `validation-report.json`, modo `8pt` | a margem, arredondada para cima |
| Silhueta livre / spray / stencil (caixa envolvente) | modo `4pt`, mais larga | idem |

A regra é mecânica e está codificada em `validate.mjs` como critério
`toleranceExceedsMargin`: **nenhum limiar de veredito pode ser menor que a
margem do modo de anotação em que a foto foi medida**. Publicar veredito dentro
do próprio ruído foi exatamente o que derrubou as duas auditorias anteriores,
então isso não fica por conta de disciplina.

Consequência prática: apertar a tolerância exige primeiro **derrubar a margem**
(mais landmarks, recorte ampliado, segunda anotação), nunca só reescrever o
número. Se a margem não cair para um tipo de arte, aquele tipo mantém o limiar
mais folgado, com o motivo escrito no CSV.

## Terceiro viés sistemático: a caixa da tinta não é a altura da arte

Medido em 25/07 ao construir o teste de registro, e vale para **toda** foto de
arte irregular já medida — que são 38 das 41.

O medidor lê a altura da arte na foto e a compara com a altura oficial em cm.
Mas os cm são medida **plana**, e a régua vertical (gola→barra) corre pelo
**meridiano central** da peça. Para as duas serem comparáveis, a altura da arte
tem de ser lida no mesmo meridiano.

A caixa envolvente não é lida ali: ela inclui os **cantos**, que estão em arco
lateral e projetam mais espalhados. Medido no sintético, variando guinada,
escala e raio do dorso:

| Condição | Caixa vs coluna central |
|---|---|
| guinada 0° | −2,51 pp |
| guinada 10° | −1,89 pp |
| guinada 20° | −2,44 pp |
| escala 1,2 | −2,67 pp |
| escala 0,85 | −2,36 pp |
| raio 17 cm | −2,66 pp |

Ou seja **a caixa é ~2,4 pp mais alta que a coluna central**, de forma estável.

**Consequência e direção.** Usar a caixa infla a altura medida da arte, o que
subestima o comprimento implícito da peça, o que faz a estampa **parecer maior
do que é**. A fila real tem 12 de 13 estampas *menores* que o alvo — então este
viés também empurra contra o achado. Corrigi-lo torna os desvios mais negativos
e a fila mais severa, nunca mais branda.

É o terceiro viés sistemático identificado, e os três apontam para o mesmo lado:

1. datum da altura (ombro vs gola), 3 a 5 pp, direção positiva;
2. viés projetivo de extremos de tinta irregular, até ±1 pp, calculado por foto;
3. caixa vs coluna central, ~2,4 pp, direção positiva.

**A fila atual é conservadora nos três.** Nenhum deles pode ter inflado a fila.

## Questão aberta que vale 3 a 5%: de onde a tabela mede a "altura"

Levantada pelo dono em 25/07, ao contestar a exigência de gola visível. Ele
perguntou por que não medir pelos ombros, e a resposta expôs um problema meu.

A régua vertical precisa de **dois pontos com separação conhecida em cm**. Hoje
são a **base da gola** e a **barra**, e o valor de comparação é a coluna
"altura" da tabela da YouDraw (`P 52x60; M 55x64; G 58x65…`).

O problema: **não está documentado de onde essa altura é medida.** Em tabela de
peça plana, "altura" costuma sair do ponto mais alto do ombro (HPS), não da base
da gola. Se for esse o caso, o medidor compara uma distância *gola→barra* contra
um número *ombro→barra*, e a diferença entre os dois datums é de 2 a 4 cm — ou
seja **3 a 5%** numa peça de 75 cm. Isso é da mesma ordem da tolerância de ±5%
que o dono acabou de pedir, então não é detalhe.

**Direção do erro, se ele existir:** gola→barra é MENOR que ombro→barra, então o
comprimento implícito estaria sendo comparado contra um alvo grande demais, e as
peças pareceriam com estampa GRANDE demais. Como o resultado real é o oposto
(12 das 13 fotos da fila têm estampa pequena), esse viés estaria empurrando
contra o achado: corrigi-lo tornaria os desvios ainda mais negativos e a fila
maior, nunca menor. A fila atual é conservadora nesse eixo.

**O que NÃO resolve:** olhar a distribuição das fotos aprovadas. Testei e o
teste é circular — "aprovada" é definida como implícito próximo do G, então elas
sempre parecerão centradas, com ou sem viés.

**O que resolve**, em ordem de custo:

1. Perguntar à YouDraw de onde sai a medida de altura. Uma frase.
2. Medir num mockup plano. Com a arte de cm oficial conhecido calibrando px/cm,
   dá para ler gola→barra e ombro→barra em cm e ver qual bate com a tabela.
3. Melhor ainda, e imune a template normalizado: medir no mockup só a **razão**
   ombro→barra ÷ gola→barra. Razão é adimensional, então sobrevive mesmo se o
   template não for fiel em tamanho absoluto — basta ser fiel em proporção.

O item 3 é o que também **destrava a linha do ombro como referência de topo**:
com a razão conhecida por tipo de peça, tanto faz qual das duas o anotador
consegue ver. Foi exatamente o que o dono propôs, e é melhor que contorno — pode
ser a referência correta, não a alternativa.

Até isso ser resolvido, os vereditos de escala carregam esse viés desconhecido,
com a direção acima registrada.

## Módulos

| Arquivo | Responsabilidade |
|---|---|
| `homography.mjs` | Álgebra: distâncias com sinal, projeção em eixo, ângulos. A homografia 4→4 continua aqui mas **saiu do caminho da medição** (ver acima); serve para a composição da arte na geração, onde o problema é o inverso. JS puro (não há numpy/OpenCV no ambiente). |
| `garment-specs.mjs` | Fonte única de verdade da tabela de medidas: **lê** `build-prelaunch-matrix.mjs`, não redigita os números. Blusão Moletom devolve "sem tabela" explicitamente. |
| `measure.mjs` | A medição: α, ρ_v, comprimento implícito, δ por tamanho, posição, cross-checks, confiança e vereditos. |
| `synth.mjs` | Gerador de verdade conhecida (cilindro + câmera pinhole + contraposto). |
| `validate.mjs` | Roda a grade de validação e emite `validation-report.json`. Sai com código 1 se qualquer critério falhar. |

## Regras que o medidor nunca quebra

- Landmark ausente **nunca** vira número: vira limite unilateral ou
  `INCONCLUSIVO`.
- Sem tabela de medidas (Blusão Moletom) a escala é `INDISPONIVEL`, jamais
  estimada.
- α positivo alto significa altura comprimida — inclinação de câmera ou
  anotação errada. Nesse caso o eixo primário está contaminado e nenhum
  veredito é emitido.
- A posição sai como **faixa**, nunca como ponto, e só decide quando a faixa
  inteira cai de um lado do limite. Isso torna os vereditos corretos por
  construção: "OK" exige que até o extremo pior caiba na tolerância.
- Nenhum veredito é publicado com `validate.mjs` vermelho.

## Limite conhecido

A validação prova a **matemática** com landmarks perfeitos. O erro de anotação
entra por cima; nas fotos já medidas com dois anotadores independentes a
discordância na caixa da arte ficou em 0,05 ponto percentual, mas isso ainda é
amostra pequena.

O caminho para uma posição realmente precisa **não passa por mais cálculo**:
passa por anotar as laterais do tronco em duas alturas (topo e base da arte),
o que cancela o contraposto por diferença, ou por medir a posição no **mockup
plano** da YouDraw, onde não há enrolamento, guinada nem contraposto. O mockup
resolve a produção; a foto vestida continua limitada ao que está descrito
acima.
