---
status: concluido
atualizado: 2026-08-12
---

# Auditoria geométrica das capas lifestyle — 25/07

> [!info] 12/08: medição CONCLUÍDA e válida como registro; a "fila de
> correção" abaixo foi SUPERADA duas vezes (o lote inteiro de 77 capas foi
> reprovado pelo dono em 26/07, e a reconstrução agora é parte da remontagem
> IzzyPrint — `docs/ESTADO.md`). A régua das colunas `*_cm` continua oficial.
> Não execute a fila.

Método e precisão: `scripts/geometry/README.md`. Protocolo de anotação:
`scripts/geometry/PROTOCOLO-ANOTACAO.md`. Tabela completa: `medicoes.csv`, gerada por

```
node scripts/measure-all-annotated.mjs <dir-de-anotacoes> --out medicoes.csv
```

**41 fotos medidas**, cobrindo 31 dos 49 produtos. As 18 páginas restantes não têm cópia local da
foto publicada e ficam para a próxima rodada. Nada foi cortado em silêncio: foto não medida aparece
no CSV com o motivo.

| Escala | Nº |
|---|---|
| OK (≤5%, ou ≤ a margem do método) | 21 |
| Aceitável (5% a 8%) | 2 |
| Fora do alvo (tamanho G) | 11 |
| Reprovado por impossibilidade física | 2 |
| Sem veredito | 3 |
| Sem tabela de medidas (Blusão Moletom) | 2 |

Posição: **41 inconclusivas**. Não é falta de dado, é limite do método, e a rodada complementar de
anotação descobriu **por quê** — ver a seção própria.

## Fila de correção

> [!info] **Suspensão de 25/07 (noite) LEVANTADA.** A suspensão existia porque o gerador sintético
> tinha o sinal da profundidade invertido (modelava um dorso côncavo) e, corrigido, o viés do
> caminho de medição de arte irregular passou de +2,85 pp para −3,04 pp. A dúvida era se esse viés
> explicava a fila inteira.
>
> Não explica. O efeito foi modelado no sintético com tinta irregular de verdade e calculado
> **por foto** a partir da posição lateral dos extremos de tinta, que a rodada complementar de
> anotação declarou nas 41 fotos. Resultado: nas fotos reais os extremos ficam a poucos centímetros
> do centro e o viés não passa de **±1 pp**. Os −3,04 pp vinham de arte retangular anotada pelos
> cantos, a ±15,5 cm de arco — um caso que o catálogo não tem.
>
> O viés entra agora onde é honesto: alargando a faixa de incerteza do comprimento implícito, e não
> deslocando a estimativa. Nenhum veredito mudou por causa dele.

Sinal negativo = estampa **menor** que o alvo.

| Desvio | Veredito | Faixa decide? | Peça |
|---|---|---|---|
| −19,9% | Impossibilidade | **sim** | Salmo 19 \| Moletom Canguru `[352619175]` — implica 81,2 cm; o canguru vai a 70 |
| −15,0% | Fora do alvo | **sim** | São Jorge Vintage \| Moletom Canguru `[352618878]` |
| −12,9% | Fora do alvo | **sim** | Querubim Spray \| Oversized `[352725749]` (preta) |
| −12,5% | Impossibilidade | **sim** | Acima de Tudo Gótico \| Oversized `[352720257]` — implica 93,7 cm; a oversized vai a 86 |
| −11,9% | Fora do alvo | só a 5% | São Jorge Neobarroco \| Moletom Canguru `[352718787]` (preta) |
| −11,3% | Fora do alvo | só a 5% | Querubim Spray \| Oversized `[352725749]` (off-white) |
| −10,3% | Fora do alvo | só a 5% | NIMBUS Wildstyle \| Oversized `[352721633]` |
| −9,8% | Fora do alvo | não | São Miguel Vintage \| Moletom Canguru `[352407156]` (preta) |
| −9,7% | Fora do alvo | não | São Miguel Vintage \| Premium `[352407196]` |
| −9,2% | Fora do alvo | não | São Miguel Vintage \| Moletom Canguru `[352407156]` (branca) |
| **+9,2%** | Fora do alvo | não | São Jorge Neobarroco \| Premium `[352718999]` (branca) — **única positiva** |
| −8,5% | Fora do alvo | não | Brasão NIMBUS \| Premium `[352717837]` |
| −8,1% | Fora do alvo | não | Espírito Santo Spray \| Premium `[352721477]` |

**13 fotos, 11 produtos.** A coluna "faixa decide?" (`band_decisive` no CSV) diz se a faixa INTEIRA
de incerteza fica fora da tolerância, ou seja se nem o extremo mais favorável salva a foto. Quatro
entradas são indiscutíveis nesse sentido; três só a 5%; seis dependem da estimativa pontual e
apertariam com segunda anotação. Corrigir na ordem da tabela.

### Por que a fila cresceu de 6 para 13

Não foi a tolerância nova, e não foi medição nova: foi **um defeito de lógica**. Os dois eixos de
veredito dividiam o mesmo `if/else`, então um "não sei" do eixo DURO (nenhum tamanho real explica)
silenciava um "fora do alvo" do eixo de CATÁLOGO (desvia do G). Sete fotos saíam `INCONCLUSIVO`
tendo desvio medido entre 9% e 15%.

O sintoma que denunciou: a Querubim Spray Oversized preta, com −12,9% contra o G, **saiu** da fila
no momento em que a faixa de incerteza alargou o suficiente para encostar na faixa física da peça.
Incerteza maior não pode aprovar foto nenhuma. Os dois eixos agora são avaliados em separado, e o
duro só ganha quando fecha — porque quando fecha é indiscutível.

**Reprovação por impossibilidade** significa que nenhum tamanho real da peça explica a geometria da
foto. Não é comparação com um alvo escolhido, e nenhum "e se o modelo veste EG" derruba. **Fora do
alvo** é o desvio contra o tamanho G, que é a convenção adotada para foto lifestyle; ali o argumento
depende da convenção.

Doze dos treze desvios são **negativos** (a única exceção é a São Jorge Neobarroco Premium branca, +9,2%). Isso é o oposto do que as duas auditorias invalidadas
diziam, e a explicação é conhecida: elas comparavam a largura entre o mockup plano e a foto vestida,
e peça vestida sempre parece mais estreita porque o tecido enrola no dorso. Isso fabricava
"estampa grande" de forma sistemática.

## Tolerância: três faixas, com piso na margem do método

Decisão do dono em 25/07: "quero que sejamos o mais fiel possível, então ±5%; se for um pouquinho
mais tudo bem". Traduzida em faixas:

| Desvio vs G | Rótulo | Ação |
|---|---|---|
| ≤ 5% | `OK` | aprovado |
| 5% a 8% | `ACEITAVEL` | fica no ar; só refaz se a peça for regerada por outro motivo |
| > 8% | `FORA-DO-ALVO` | entra na fila |
| nenhum tamanho real explica | `REPROVADO-DURO` | entra na fila |

Com uma trava que não é opcional: **o limiar efetivo de cada foto nunca fica abaixo da margem
medida do método no modo em que ela foi anotada** — 4 pp para arte com moldura desenhada, 8 pp para
arte de silhueta livre (spray, stencil, lettering). Na prática o ±5% vale hoje para as 3 fotos de
São Jorge Neobarroco; para as outras 38 o piso continua sendo 8%, porque abaixo disso o veredito
seria ruído do próprio medidor. Foi publicar dentro do ruído que derrubou as duas auditorias
anteriores, então a regra é mecânica: `validate.mjs` tem o critério `toleranceExceedsMargin` e o
portão fica vermelho se alguém apertar o limiar sem antes derrubar a margem.

Apertar de verdade exige **derrubar a margem** (mais landmarks, recorte ampliado por ponto, segunda
anotação em arte de spray), não reescrever o número.

O efeito prático de aplicar as faixas foi **uma** mudança de veredito em 41 fotos: São Jorge
Neobarroco Premium preta `[352718999]`, +6,9%, saiu de `OK` para `ACEITAVEL`. Ela é a única foto de
arte com moldura cujo desvio cai entre 5% e 8%. A fila de correção não mudou.

## Aprovados na escala

18 fotos `OK` e 1 `ACEITAVEL`. Três pares de cor fecharam juntos, o que era uma preocupação à
parte: Salmo 19 Premium (−1,0% e −1,3%), Brasão NIMBUS Oversized (−1,5% e −0,6%) e Aparecida
Barroca Oversized (−1,4% e −1,1%). Pares tão apertados em fotos independentes são evidência de que
a medição está estável, não só de que as peças estão certas.

Casos que a auditoria antiga mandava REFAZER e que a medição **aprova**: São Miguel Vitorioso
Moletom `[352726673]` (−1,5% e +6,8%), São Miguel Vitorioso Oversized `[352727545]` (−4,3%) e
Anjo da Guarda Stencil Premium `[352728357]` (+2,5%). Refazer essas fotos seria gastar crédito para
corrigir defeito que não existe.

> [!warning] **A aprovação é POR FOTO, não por produto — correção de 25/07.**
> São Jorge Neobarroco Moletom `[352718787]` estava nessa lista como aprovado. A medição aprova a
> foto **branca** (−4,1%); a foto **preta** mede −11,9% e entrou na fila. Ela vinha saindo
> `INCONCLUSIVO` pelo defeito de lógica descrito acima, então a aprovação do produto foi lida a
> partir da única foto que tinha veredito. Um produto com duas cores tem duas fotos e pode ter dois
> resultados; o piloto de 22/07 mediu a branca.

## Por que só 3 ficaram sem veredito (eram 14)

| Causa | Nº |
|---|---|
| Anisotropia positiva: a altura medida da arte não fecha | 2 |
| Margem do método maior que o desvio, em arte irregular | 1 |

As outras 11 saíam sem veredito porque a incerteza declarada pelo anotador (capuz e cabelo cobrindo
a gola) alcançava a faixa física da peça — e isso derrubava o eixo DURO. Com os dois eixos
separados, o eixo de catálogo continua respondendo: a incerteza da gola alarga a faixa, mas não
apaga um desvio de 12% contra o G. Sete delas foram para a fila e quatro para `OK`.

**A ressalva do capuz continua valendo** onde ela realmente morde: nenhuma dessas 11 tem
reprovação por impossibilidade física, porque para essa é a faixa inteira que precisa cair fora, e
com a gola encoberta ela não cai.

**Consequência para produção — versão revisada em 25/07 (noite).** A primeira redação dizia que
foto de canguru *precisa* mostrar a base da gola. O dono contestou: dá para medir pelos ombros. Ele
está certo, e mais do que isso.

A régua vertical precisa de dois pontos com separação conhecida em cm. A base da gola é apenas
**uma** das escolhas possíveis — a linha do ombro serve igual, e provavelmente serve melhor: a
tabela da YouDraw dá "largura x altura" de peça plana, e "altura" de peça plana normalmente é
medida do ponto mais alto do ombro, não da base da gola. Se for esse o caso, o medidor vem
comparando *gola→barra* contra um número *ombro→barra*, com 2 a 4 cm de diferença de datum — **3 a
5% numa peça de 75 cm**, a mesma ordem da tolerância de ±5%.

Está registrado como questão aberta em `scripts/geometry/README.md`, com a direção do erro: ele
empurraria os desvios para o lado *positivo*, então a fila atual (12 de 13 negativos) é
conservadora nesse eixo, nunca inflada. Resolve com uma pergunta à YouDraw, ou medindo num mockup
plano a **razão** ombro→barra ÷ gola→barra, que é adimensional e sobrevive a template normalizado.

O que fica como requisito de foto é só o piso: a peça inteira no quadro, barra visível, e **ou** a
linha do ombro **ou** a gola legível. Pose livre.

## Posição: o que o método consegue e o que não consegue

As 41 fotos saíram inconclusivas na posição, e isso está medido, não suposto. Três efeitos físicos
independentes somam uma faixa de largura mínima de ~4 cm:

1. **Contraposto contra guinada.** A reta gola→barra é exata sob rotação de câmera mas erra com o
   quadril deslocado; o meio do tronco é imune ao contraposto mas erra 2,3 cm já a 10° de guinada.
   Quando as duas coisas acontecem juntas, os dois erram para o mesmo lado.
2. **Compressão.** Deslocamento grande é lido menor do que é: 3 cm reais leem 1,9-2,5 cm.
3. **Tamanho vestido**, que aqui pesa pouco.

Na prática: o medidor confirma centralização abaixo de ~2 cm e reprova acima de ~7 cm. Entre os
dois, declara que não sabe. Nenhuma das 41 fotos caiu fora dessa zona cega.

O diagnóstico perceptual (deslocamento como % da largura do tronco visível) está no CSV para
triagem humana. Os maiores: **São Miguel Vintage Premium com −24,9%**, **Anjo da Guarda Stencil com
12,4%** e **São Jorge Neobarroco Moletom com −8,7%**. Não são vereditos: nas três a pose tem
guinada, que sozinha produz esse efeito. São as fotos a olhar primeiro numa conferência visual.

### A rodada complementar tentou destravar e descobriu por que não dá

O plano era trocar o estimador de centro: em vez do vinco manga/tronco (que erra 2,3 cm a 10° de
guinada), usar os dois pontos de **tangência da silhueta** do tronco. Para seção circular o ponto
médio das duas tangentes é exatamente a projeção do eixo, **para qualquer guinada** — um círculo é
invariante a rotação em torno do próprio eixo. Medido em 2.160 cenas com ruído de anotação, a
silhueta ganha do vinco em todos os regimes: RMSE 0,87 cm contra 0,96, e viés −0,05 contra +0,31.

Seis anotadores independentes foram às 41 fotos marcar esses dois pontos. **Nenhuma foto tem onde
marcá-los.** Em 41 de 41 o contorno externo na altura do meio da estampa é a **manga**, não o
tronco:

- braço caído colado ao corpo, sem vão de fundo entre manga e tronco;
- oversized de ombro caído, onde acima da cava tronco e manga são a mesma peça de tecido;
- moletom de manga longa, em que dá para seguir o tubo da manga até o punho;
- e, num caso, os dois braços dobrados com as mãos no rosto, onde quem encosta no fundo é o
  cotovelo.

As barras das mangas aparecem 7 a 10 pp da imagem **abaixo** da altura da arte. Em três fotos o
braço nu ainda passa por cima da borda do tronco depois disso, então não existe altura nenhuma em
que a silhueta do tronco apareça limpa contra o fundo.

Isso é limite de **oclusão**, não de matemática: o estimador continua correto e continua
implementado, só não há onde aplicá-lo. Os anotadores registraram os valores da manga nas notas,
marcados como não utilizáveis — usar a silhueta do braço como se fosse a do tronco seria fabricar
número, que é o erro que invalidou as auditorias anteriores.

**Isso não vira exigência de pose.** A primeira versão desta conclusão pedia
que toda foto tivesse o braço afastado do tronco. O dono derrubou em 25/07 e
está certo: posição não precisa ser MEDIDA numa foto que a gente gera — quando a
arte é composta por homografia sobre a foto pronta, ela fica certa **por
construção**, e o medidor vira teste de regressão em vez de loteria. Restringir
a pose para salvar uma medição que a composição torna desnecessária seria trocar
foto boa por auditoria.

Enquanto isso não existir, a centralização fina se confere no **mockup plano** da YouDraw, onde não
há enrolamento, guinada nem contraposto — e, na geração, ela fica certa por construção quando a
arte é composta por homografia inversa em vez de redesenhada.

## Achados de fidelidade (não são escala)

- **São Miguel Vintage Oversized, foto Off-White `[352407182]`**: a estampa não tem a palavra
  NIMBUS que aparece nas fotos do `[352407196]`, mesma família de arte. Confirmado no arquivo
  original: a arte oficial tem um bloco isolado no rodapé, separado por um vão de 39 px; com ele o
  arquivo bate com os cm oficiais (0,785 contra 0,790), sem ele iria a 0,814. Defeito de fidelidade,
  não de escala. O detector de anisotropia acusou o mesmo problema de forma independente, antes de
  saber da observação.
- **São Jorge Vintage \| Blusão Moletom `[352618837]`**: o anotador viu um anel claro atrás do arco
  de texto que pode ser tinta ou vinco do moletom, e não incluiu na caixa. Se for tinta, a altura da
  arte cresce ~5%. Precisa de segunda anotação.
- **Suspeita descartada**: `[352703153]` é "Fé Acima de Tudo" no catálogo e a arte na foto lê
  exatamente isso. O alerta anterior de arte trocada com "Deus é Fiel" era falso.

## O que a execução ensinou sobre o próprio método

Cinco defeitos do medidor só apareceram quando ele encontrou foto real. Ficam registrados porque
cada um custou uma rodada:

1. **Retificação por homografia não serve para posição.** Ela dá uma taxa px/cm média sobre uma
   superfície curva: 3 cm reais liam entre 1,2 e 3,3 cm conforme o tamanho da arte.
2. **O modelo de enrolamento supunha corpo que preenche a peça.** Peça folgada cai quase plana nas
   costas. Com o teto errado, 7 de 23 fotos eram acusadas de "altura comprimida" com o eixo vertical
   intacto.
3. **A incerteza do anotador não chegava na posição.** Uma reprovação chegou a sair apoiada numa
   lateral que o próprio anotador declarou como inferida.
4. **Vista frontal quebra a régua**, porque o decote da frente é mais baixo que a gola das costas.
   O viés tem direção conhecida, então metade do veredito sobrevive.
5. **O protocolo se contradizia** sobre moldura desenhada contra caixa de tinta. No São Jorge
   Neobarroco o manto do cavaleiro estoura a moldura em 8,2%.

Os itens 3, 4 e 5 foram levantados pelos próprios anotadores nas notas, não por mim. Vale manter a
exigência de que eles escrevam o que foi difícil e por quê.

## Pendências

1. As 18 páginas sem cópia local da foto publicada.
2. Segunda anotação nos 11 casos em que o capuz engoliu a gola.
3. Tabela de medidas do **Blusão Moletom** na YouDraw: 2 fotos ficam sem régua.
4. Placement oficial em cm abaixo da gola, que não existe em nenhuma fonte.
