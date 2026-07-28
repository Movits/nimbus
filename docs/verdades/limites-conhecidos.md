---
status: vigente
atualizado: 2026-07-26
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

→ Isso faz o check de **aspecto** levantar alerta em capa correta. No 352725852
preta o gate esperava 6,34% de encurtamento e o NCC leu 1,08%. O alarme é falso e
a prova não é opinião: `scripts/geometry/compressao-malha.mjs` mede a compressão
na **malha projetada**, que é a geometria que vai ser rasterizada, e achou 7,89%.
Rode-o sempre que o aspecto acusar. Ele reprova de verdade quando é para
reprovar: na receita antiga da mesma capa, com `torso 0.546`, deu 3,26% contra
8,92% e saiu `CHAPADA`.

O veredito dele usa o arco da **tabela**, não o da receita. Contra o arco da
própria receita nada é acusado quando o raio está inflado, porque medido e
esperado caem juntos — foi assim que a primeira versão do script aprovou a capa
reprovada.

## Silhueta da peça

**Inclui manga e braço.** Em pose 3/4 ela é assimétrica, e usar o meio dela como
eixo joga a estampa para o lado. Foi assim que o Aparecida Spray saiu 5,4 pontos
fora do centro.

**Também trunca peça clara sobre fundo claro.** No 352718787 branca, moletom
branco contra parede clara, o gate deu `eixo_silhueta 43,95%` contra 49,7% lido
no olho — 5,64 pontos, a mesma magnitude do defeito da Aparecida, só que desta
vez o **alarme era falso**. A prova é aritmética: com a borda esquerda em 29%, um
eixo de 43,95% implica borda direita em ~58,9%, que é o pescoço da modelo e não a
borda da peça, em ~72%. A silhueta perdeu o lado direito no fundo claro.

→ O eixo se mede pelos **vincos de cava**, não pela silhueta externa. Quando o
desvio de centro acusar, marque os dois eixos candidatos sobre o blank e olhe
(`scripts/geometry/grade.mjs`) antes de mexer na receita.

## measure-torso

**Uma dobra sombreada parte a corrida de tecido em duas** e ele fica com a maior
metade. Devolvia 0,2881 onde o real é 0,4756 — 40% menor — e reportava
`suspeito: false`.

Corrigido em 26/07 (ponte de 3% da largura, e `suspeito` dispara também quando
sobra outra corrida grande ou quando o resultado foge 30% da tabela). Ainda assim
**use como segunda opinião**, não como autoridade.

## Silhueta é cega para yaw — a costura central é o landmark

O meio da silhueta de um cilindro girado continua sendo o eixo projetado, para
**qualquer** yaw. Todo check que compara a caixa da arte com o meio da silhueta
é portanto cego para rotação por construção — foi assim que três capas giradas
passaram em todos os instrumentos e o dono viu no olho.

O landmark do meridiano verdadeiro é a **costura central das costas**: a
costura do capuz no moletom, o centro da gola (etiqueta/pingo) na camiseta. Lida
com `grade.mjs` (contraste puxado na faixa da cor do tecido),
`estimar-yaw.mjs` inverte o próprio `artMesh` até o meridiano da estampa cair
nela. Validado: no 352718787 o dono escolheu −14 no olho, a costura devolve
−14,75.

**Calibração de 27/07, com o olho do dono (12 de 12).** O dono corrigiu foto a
foto a auditoria do catálogo recomposto, e a **regra do rosto previu todas as
12 correções direcionais** dele: rosto virado para a esquerda → yaw positivo →
estampa composta com yaw 0 aparece à esquerda do certo; rosto à direita →
o espelho. Rotação sem yaw é o defeito dominante do lote (14+ capas). Duas
convenções ficam fixadas: (1) **esquerda/direita sempre do ponto de vista de
quem olha a foto**, de frente para as costas do modelo — relatos meus haviam
invertido; (2) toda pose girada exige yaw medido antes de compor, sem exceção.

O mesmo feedback fechou mais três correções de método: **torso travado por
produto** (cores da mesma peça saíram com 10–35% de diferença de torso, o que é
impossível no produto real — nenhum instrumento por capa isolada enxerga isso);
**vertical conferida contra o mockup por registro** (Sao Jorge Neobarroco saiu
baixo); e **largura conferida contra o mockup** (Sao Jorge Vintage saiu maior
que o devido). Dado completo em
`nuvemshop/producao/auditoria-visual-2026-07-27.json`.

**Piloto Nano Banana (27/07): a IA é agrimensor, não acabador.** Três capas
compostas pela IA sobre os nossos blanks, medidas com os nossos instrumentos.
Como ACABADOR ela perde: escala +22% a +63% na primeira tentativa, posição até
6,3 cm fora, fidelidade 0,37–0,69 contra 0,83+ da geometria (a arte é
redesenhada; numa rodada ela desenhou uma seta de cota "12.42cm" NA FOTO). O
loop com correção medida converge (63→29%, 35→8,8%) mas gasta rodadas e nunca
garante fidelidade. Como AGRIMENSOR ela ganha: **o meridiano das costas que ela
escolhe casa com a regra do rosto em 6 de 6** e é estável entre rodadas (±0,01).
O híbrido: 1 composição barata da IA por blank → `registerArt` extrai o
meridiano → `estimar-yaw` resolve o yaw → nossa geometria compõe a arte fiel.
Substitui a leitura manual de costura no catálogo inteiro (~US$0,03/blank).

**A/B de prompt (27/07, Aparecida 352728019).** O dono suspeitou do prompt, e
tinha razão em parte: (A) prompt mínimo sem medida → +79% de escala, o
instinto do modelo é estampa gigante; (v1) prompt técnico com centímetros →
+63%, o modelo não ancora cm. O vencedor é **(B) o mockup do produto como
referência, sem número nenhum**: "a primeira imagem é o produto real; mostre a
pessoa vestindo o produto real". O modelo transfere o produto com fidelidade —
a prova involuntária: alimentado por engano com a foto da FRENTE, ele copiou o
selo de peito para as costas, obedecendo a referência ao pé da letra. Com a
foto certa (gallery-02), a capa saiu a mais parecida com o produto real que já
produzimos para esse blank: eixo do corpo girado certo, caimento natural,
escala a +25% (uma rodada de correção do alvo). Armadilha registrada: escolher
a gallery ERRADA reproduz fielmente o produto errado — a seleção de mockup de
costas tem que vir do registro com a arte, nunca do índice da foto.

**Piloto v2 (27/07): prompt de 3 referências, desenhado pelo dono.** Refs =
[arte oficial, blank, mockup de costas], texto curto ("mesmo tamanho e mesma
posição que na foto do produto"), 2 candidatas por capa + 1 rodada de correção
com uma frase de feedback por erro. Resultado medido: **escala resolvida em pose
reta** — tee São Jorge caiu a **+0,2%** e vertical −0,4 cm; a Aparecida
oversized, que insistia em +21/23%, obedeceu "clearly smaller… less than half
the width" e caiu a **+0,3%**, e "keep the gold halo flat" tirou a
re-texturização. Três limites confirmados nas 12 gerações: (1) **capuz é
falha dura** — em 4 tentativas, com e sem instrução explícita, a IA nunca
esconde o topo da estampa sob o capuz; ela encolhe ou desce a estampa inteira
para caber abaixo dele (+5,5 a 6,4 cm de erro vertical no moletom; a via
geométrica com polígono de oclusão continua a única certa para capuz). (2) A
**arte é sempre levemente redesenhada** — letras engrossam ou derretem numa
candidata e não na outra (variância entre candidatas é real: gerar 2 e escolher
paga), cartucho "NIMBUS" virou "NIMEÓN"/"NFARISOS" em 2 de 6 moletons. (3) Em
**pose girada a IA acompanha o corpo** — nas duas capas de pose girada o centro
da estampa foi para o lado que a regra do rosto prevê, contra o eixo da
silhueta; a nossa 352728019 v3 (yaw 0) está errada e a IA está certa.

**Piloto v3/v4 (27/07): a arte na referência faz falta, e correção de estilo é
faca de dois gumes.** O halo chapado que o dono reprovou veio da nossa frase
"keep the gold halo flat and simple" — instrução de estilo minha, não da IA;
corrigir estilo por texto é arriscado, a referência visual é que manda. Tirar a
arte das refs (só mockup 500 px + blank) degrada: desenho redesenhado,
assinatura "NIMBUS" ilegível nas 4 gerações, e a **armadilha de cor** — mandado
"vestir o produto real" (mockup preto) sobre blank branco, o modelo pintou a
camiseta de preto. Receita vigente: 3 refs (arte + blank + mockup), frase de
tamanho, nenhuma frase de estilo, ~5 candidatas e a auditoria escolhe (escala
varia de −13% a +22% entre gerações idênticas). Texto pequeno (assinatura)
nunca sai perfeito — herdeiro direto do "texto é sagrado".

**A armadilha da leitura é o pescoço.** Na 352728277 a ribana some atrás do
pescoço e a primeira leitura pegou a base dele (0,52 → yaw +9, lado errado);
com contraste maior a gola aparece e o mergulho real está em 0,46 → −10,25.
Duas sanidades antes de aceitar uma leitura: (1) o **lado do rosto** prevê o
sinal — rosto à esquerda → yaw positivo, à direita → negativo, nas três capas
conferidas; (2) a ribana tem que ser visível como banda, não como contorno do
pescoço. **3ª ocorrência (28/07, 352718275):** cabelo cobria a gola, li 0,49
com rosto à direita e a sanidade do rosto teria reprovado na hora (exigia
costura à esquerda do eixo 0,475). A sanidade roda ANTES, sempre.

**A etiqueta transparente é o melhor landmark do meridiano (28/07, achado do
dono).** Em camiseta clara a etiqueta interna transparece no tecido logo abaixo
da gola, costurada no centro-costas — e não é coberta por cabelo. Na 352718275
ela aparece com `normalise` + `linear(3.2,−270)` entre 0,375 e 0,41 (centro
0,39 → yaw −28,5, rosto à direita ✓). Ordem de leitura do meridiano: etiqueta >
mergulho da gola > capuz; a sanidade do rosto valida qualquer uma.

## Cor da estampa (28/07 — descoberto pelo dono)

A auditoria não olhava COR, e o dono reprovou uma capa geométrica perfeita em
escala/posição por "cor surrealista, muito clara". Diagnóstico em três camadas:

1. **O clareamento é ótico, não do compositor.** Arte de traço fino (azulejo)
   encolhida para ~245 px mistura linha azul com fundo branco: a própria arte
   reduzida mede razão de luminância 1,28 contra a original. O compositor
   reproduzia isso fielmente — e fiel aqui é errado, porque
2. **a referência do olho é o mockup do produto**, que apresenta a estampa
   bold (o renderizador da YouDraw preserva contraste ao reduzir). O cliente
   compara capa com mockup; a capa tem que ler como o produto.
3. **DESFECHO (28/07): o dono escolheu a arte PURA.** Quatro doses de
   compensação foram compostas (sat +45%, +22%, +5% com contraste, e −5%) e
   todas reprovadas como "muito saturado"; posta a régua completa lado a lado,
   ele escolheu a versão **sem nenhum ajuste**. A reclamação original de "cor
   surrealista" era o conjunto (posição errada + lavado), não pedido de cor
   mais forte. Parâmetros de sombra também não eram a causa (baixar
   `--sombra-max` de 1,35 para 1,08 mudou <1%).

Método que funcionou para fechar cor: **régua de variantes em arquivos
separados, tamanho cheio** (tira lado a lado fica pequena no celular do dono),
numeradas, e ele devolve o número. Uma rodada, decisão dele. O check de cor da
auditoria continua: comparar com a ARTE ORIGINAL (referência que o dono usa),
na escala de celular; instrumento `scripts/geometry/medir-cor-estampa.mjs` só
para diagnóstico (mediana em janela não separa compositor de redução ótica).

## Integração com o tecido

O ponto cego que o gate declara e não mede. Em 27/07 o dono pegou dois defeitos
nele no São Jorge, e os dois são regressão do compositor de 26/07.

**A arte não seguia a iluminação da cena.** `aplicarNoTecido` usava só campos
passa-banda, e o comentário do próprio arquivo dizia que a arte "NÃO deve
seguir" a iluminação global. Está errado: estampa em pano que curva para a
sombra tem que escurecer junto, senão mantém brilho uniforme enquanto o tecido
em volta escurece, e flutua sobre a peça. No blank do 352718787 a iluminação cai
**6 a 10%** ao longo da largura da estampa. O caminho antigo (`compositeArt`,
`k = lumBg/ref`) tinha isso; a reescrita consertou "sem dobra" e quebrou "sem
sombra". Voltou como `--sombra-global` (expoente, padrão 1).

**A arte só seguia vinco pequeno, não o caimento.** O deslocamento usava
passa-banda de 9 a 40 px. Dobra de moletom passa de 100 px, ou seja **era
justamente o que o filtro jogava fora** — a estampa seguia a trama e ignorava o
caimento, e a base dela ficava reta sobre um tecido que ondula. Virou
`--dobra-larga` (raio grande do campo de deslocamento).

> [!info] Alargar a dobra é seguro para o texto; estreitar a trama não é
> A regra "texto é sagrado" nasceu de um piloto onde o "NIMBUS" do cartucho
> ficou ilegível — mas aquilo veio de deslocar pela **trama** (2 a 3 px), que
> treme na escala do pixel. Alargar o raio **grande** mexe em gradiente suave:
> conferido a `dobra 180 · relevo 8` e o cartucho continua legível.

## Caixa de tinta no mockup (`placement-mockup.mjs`)

É de onde sai o `placement_cm` de todo o catálogo. Em 27/07 ela foi consertada
em três pontos, e ainda tem um defeito conhecido.

**Consertado: a referência de tecido não existia no tronco.** A margem que dá a
cor do tecido saía da largura **manga a manga** e era aplicada como janela fixa
em x. Abaixo das mangas o corpo é bem mais estreito, então a janela caía inteira
fora da peça. No 352889132 a peça vai de x=42 a x=461, a margem dava 59 px, e as
janelas [42,101] e [402,461] não tinham um pixel de tecido nas linhas do tronco.
Sem referência própria, o código caía em silêncio na cor dos **ombros**, e num
render iluminado ao centro o tronco inteiro passava por tinta: a caixa abria até
a barra. Foi isso que pôs **9 placements errados em produção**. Agora a margem é
por linha e linha sem referência é pulada, nunca chutada.

> [!warning] Terceira vez que largura manga a manga é usada onde se precisa da
> largura do corpo. As outras duas foram o `torso 0.44` e a largura de
> referência do horizontal. Ao ler qualquer largura de peça, pergunte primeiro
> se ela inclui manga.

**Consertado: produto de estampa frontal era medido com o template de costas.**
`gola` e `barra` do template são as das costas. O 352702753, o 352702796 e o
352720257 são "só frente" e saíam com placement **negativo**. O CSV já sabe a
vista (`back_h_cm` vazio), então agora são excluídos com motivo.

**Consertado: o gate de sanidade reprovava leitura boa.** A primeira versão usava
"caixa cobre mais de 80% da altura da peça". O 352889132 é a Aparecida com
escorridos de spray que descem quase até a barra de propósito, e foi reprovado —
e o descarte fez a seleção cair em silêncio no mockup de **peito**. O critério
passou a ser a **altura oficial da arte** (`back_h_cm`), que não depende do
desenho.

**Consertado: a caixa vem do registro, não de limiar de cor.** O limiar tinha
dois defeitos que não se resolvem calibrando: incluía o contorno antialiasado da
peça, esticando a caixa até a gola e a barra, e perdia tinta de baixo contraste
(respingo fino, escorrido). Medido: no 352619175 o limiar dava base em y=355 onde
a arte acaba em 308; no 352718787 esticava 58 px a mais na direita; no 352725852
**perdia os escorridos**, parando em 301 onde a arte vai a 321.

A caixa passou a sair de `registerArt` casando o **PNG oficial da arte** com o
mockup. Score mediano **0,883** nos 45 produtos, rotação zero em todos. O score
também aposentou a regra de seleção "vence quem tem mais tinta", que premiava a
detecção estourada e caía no mockup de peito: registro casa com a arte daquele
produto, então a foto de peito pontua baixo por construção.

Tentativas que **não** funcionaram, para ninguém repetir: erodir a borda da
máscara (em peça branca o tecido está a 8 níveis do fundo, a máscara é quase só
a estampa e a erosão apaga tudo) e preencher o fundo a partir da borda (com
tolerância baixa a sombra de contato bloqueia o preenchimento; com tolerância
alta vaza para dentro da peça).

**Consertado: a peça vinha do CSV de 22/07.** Aquele CSV é anterior à
reclassificação do 352727892 de Blusão para Moletom Canguru, e o template errado
punha o placement **13,8 cm fora**. A peça agora vem do próprio
`placement-por-produto.json`, que carrega a correção.

> [!warning] Três produtos ainda caem no limiar
> 352717960, 352718083 e 352722232 não casaram no registro (score abaixo de
> 0,45) e mantêm a caixa por cor. No 352722232 ela **corta a auréola dourada**,
> e o placement dele é 2,24 cm maior por isso. Estão marcados com
> `fonte_caixa: limiar` e `confianca: baixa`.

## Detector de barra

Confiável em **camiseta clara**. Em moletom pega a calça; em camiseta preta sobre
calça preta o degrau mais forte também é a calça; e o pesponto fica ~2 cm acima
da borda real, o que já custou −5,9% e −6,5% de escala.

Confirmado de novo em 26/07, nas três capas refeitas: no 352728277 preta ele deu
93,85% contra 90,3% lido no olho, e no 352718787 branca deu 98,63% contra 94,2%.
Nos dois casos o que ele achou foi a calça. **A leitura visual venceu as duas
vezes**, e o `escala` do gate não serve de desempate: ele compara a arte medida
com o alvo calculado a partir da própria `gola`/`barra` que você informou, então
é cego para régua errada.

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
