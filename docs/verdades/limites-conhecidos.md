---
status: vigente
atualizado: 2026-07-28
---

# O que os instrumentos NÃO enxergam

Esta é a página mais importante do projeto. Cinco dos sete defeitos catalogados
nasceram de confiar num instrumento cego, e o lote de 77 capas foi aprovado pelo
gate e reprovado pelo dono.

**Regra:** quando um check acusa, ou você conserta o instrumento ou prova que o
alarme é falso. Rebaixar para informativo é como a estampa torta passou em todas
as capas.

---

## Caixa de tinta por limiar

Marca como tinta o que difere do blank acima de um limiar.

**Cega para tinta escura sobre tecido escuro.** A mesma arte, no mesmo
placement, deu erro de posição de −0,04 cm na camiseta branca e +2,44 cm na
preta, com a caixa da preta 4,4 pontos mais curta nas **duas** pontas.

**Encolhe mais na horizontal** em arte de silhueta irregular (spray, stencil),
porque respingo fino cai abaixo do limiar. Isso produzia alerta de aspecto em
capa correta: a caixa dizia 15,96% de compressão onde o registro mede 2,57%.

→ Escala, posição e aspecto usam **registro NCC**. A caixa ficou informativa.

## Registro NCC

Casa a arte oficial com a composta. É robusto a cor, e por isso é o instrumento
de escala, posição e aspecto.

**Escore baixo não significa infidelidade.** Arte detalhada sobre tecido claro dá
correlação naturalmente menor: os quatro escores mais baixos do catálogo
(0,42–0,53) foram conferidos no olho e estão fiéis.

**Não mede compressão anisotrópica** de forma confiável, porque ajusta escala nos
dois eixos.

## Silhueta da peça

**Inclui manga e braço.** Em pose 3/4 ela é assimétrica, e usar o meio dela como
eixo joga a estampa para o lado. Foi assim que o Aparecida Spray saiu 5,4 pontos
fora do centro.

→ O eixo se mede pelos **vincos de cava**, não pela silhueta externa.

## measure-torso

**Uma dobra sombreada parte a corrida de tecido em duas** e ele fica com a maior
metade. Devolvia 0,2881 onde o real é 0,4756 — 40% menor — e reportava
`suspeito: false`.

Corrigido em 26/07 (ponte de 3% da largura, e `suspeito` dispara também quando
sobra outra corrida grande ou quando o resultado foge 30% da tabela). Ainda assim
**use como segunda opinião**, não como autoridade.

## Detector de barra

Confiável em **camiseta clara**. Em moletom pega a calça; em camiseta preta sobre
calça preta o degrau mais forte também é a calça; e o pesponto fica ~2 cm acima
da borda real, o que já custou −5,9% e −6,5% de escala.

## Máscara borrada pelo sharp

`sharp` promove raw de 1 canal para sRGB e devolve **três** canais. Indexar sem
o stride lê o byte errado. No transplante a saída saía idêntica à base; no
reaplicador de oclusão o efeito era **pior porque parecia certo** — aplicava uma
versão comprimida da máscara no terço de cima, e o capuz fica no terço de cima.

## Recuperar máscara de oclusão por interseção

**Não funciona, e o erro é de princípio.** A interseção entre capuz e arte
*antiga* deixa de ser borda quando o placement muda: vira **buraco no meio do
desenho**. O polígono do capuz tem que ser traçado e **guardado na receita**.

## Teste de par de cor

`qa-par-hover` compara as duas capas **só onde os blanks coincidem**, ou seja
fora da roupa. Um pedaço de peça fora da máscara (gola, capuz) mantém a cor da
base nas duas imagens, os blanks coincidem ali, e **o teste passa com o defeito
na cara**. Aconteceu duas vezes, pego só no olho.

→ O transplante reporta `residuo_cor_antiga_pct`. Acima de 0,4% é suspeito.

## Comprimento implicado pela régua-pela-arte

Responde a dois erros de gravidade muito diferente: gola errada entra no
placement **1:1** (~1 cm por ponto percentual), vão de tinta errado entra
**proporcionalmente** (5% sobre 9 cm = 0,45 cm). Um resíduo de 3,5% pode ser 2,6
cm de erro ou 0,3 cm. O teste sozinho não distingue.

## Extensão de arquivo mente sobre o formato

Vários blanks de `producao-capas/` são **JPEG salvos com extensão `.png`**
(ex.: `352722510-branca-blank.png`). Instrumento que decide o parser pela
extensão lê cabeçalho errado e falha em silêncio — a varredura de 28/07 perdeu
57 das 77 medições assim antes de ler pela assinatura do arquivo. Leia sempre
pelos **primeiros bytes**, nunca pelo nome.

## Datas de receita colhida

`gerado_em` nos sidecars **não** é a data da composição: a colheita de 26/07
carimbou os 134 sidecars com a mesma data. O que distingue receita do
compositor novo são os campos que só ele escreve: `relevo` e `sombra_tecido`.
Caminhos colhidos no Windows vêm com barra invertida (`foto:
"nuvemshop\\assets\\..."`) e precisam de normalização.

## O gate, no todo

Não vê: **fidelidade de traço e texto**, **sinal do yaw**, **compressão sutil**,
e **integração com o tecido**. Os três primeiros são limitação declarada. O
quarto foi descoberto pelo dono, não pelo gate.

---

## Régua estimada

O **Blusão Moletom** usa comprimento **estimado** de 78,4 cm: a YouDraw não
publica tabela para essa peça. O método acerta −1,6% na Camiseta Premium e −0,3%
no Moletom Canguru, mas erra **+11% no Oversized**. As capas de Blusão carregam
esse risco e o gate marca `regua_estimada: true`.
