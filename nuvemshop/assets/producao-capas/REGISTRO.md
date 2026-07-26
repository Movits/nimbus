# Registro de produção de capas — pipeline v5 (peça em branco + composição)

## LOTE DE 26/07 CONCLUÍDO: fila desbloqueada 100% produzida

**11 das 13 fotos da fila do ACHADOS.md estão PRONTAS** (as 2 restantes estão
bloqueadas: 352725749 off-white sem a arte de tinta escura; 352720257 é arte
na FRENTE, caso especial). Arquivos finais:

| Produto/cor | Arquivo final | Desvio |
|---|---|---|
| Salmo 19 Moletom preta | `352619175/352619175-preta-v7.png` | −0,1% |
| S. Jorge Vintage Moletom branca | `352618878/352618878-branca-v7.png` | 0,0% |
| Querubim Spray Oversized preta | `352725749/352725749-preta-v8.png` | +0,2% |
| S. Jorge Neobarroco Moletom preta | `352718787/352718787-preta-v8.png` | +0,1% |
| NIMBUS Wildstyle Oversized off-white | `352721633/352721633-offwhite-v4.png` | −0,3% |
| S. Miguel Vintage Moletom preta | `352407156/352407156-preta-v1.png` | +0,1% |
| S. Miguel Vintage Moletom branca | `352407156/352407156-branca-v1.png` | −0,1% |
| S. Miguel Vintage Premium branca | `352407196/352407196-branca-v3.png` | −0,1 a −0,4% |
| S. Jorge Neobarroco Premium branca | `352718999/352718999-branca-v2.png` | −0,04% |
| Brasão NIMBUS Premium preta | `352717837/352717837-preta-v2.png` | −0,5% |
| Espírito Santo Spray Premium branca | `352721477/352721477-branca-v2.png` | −0,04% |

Toda capa passou por painel triplo independente e/ou contra-prova numérica
por métrica. Lições que viraram regra/ferramenta durante o lote:
1. Supersampling 2x por padrão (moiré em halftone).
2. Clamp de sombra 0,9–1,12 em peça escura (faixa fantasma) e teto ≤1,15 em
   peça clara (clipping); opacidade 0,96 para spray escuro em tecido claro.
3. Raio efetivo calibrado pela silhueta real (`--torso`).
4. `--yaw` para pose 3/4, calibrado pela assinatura projetiva da publicada —
   e o SINAL se valida pela razão DR/DL (aspecto+centro são cegos ao
   espelhamento; pego no Brasão v1).
5. Barra SEMPRE pelo `detect-hem.mjs` (leitura visual falhou 2x pegando
   pesponto/dobra).
6. Oclusão de capuz via `compose-occlude.mjs` (feather 2) quando o drape
   cobre o topo da arte.
7. `registerArt`/pilot-measure: (a) exige guarda de score (mislock 0,281 no
   spray esparso deu −58% falso); (b) em artes com RGB não-branco sob o
   alpha, achatar o template sobre branco antes (removeAlpha apaga a arte).


Sessão local, iniciada em 26/07/2026. Método: `scripts/produce-cover.mjs`
(ver `CLAUDE.md` e `nuvemshop/auditoria/2026-07-25-geometria/ACHADOS.md`).
Ordem de ataque: a fila de correção do ACHADOS.md, do pior desvio para o menor.
Protocolo: UM PRODUTO POR VEZ; cada capa passa por painel de 3 verificadores
independentes (fidelidade da estampa / peça-modelo-cenário / escala-posição)
mais medição de regressão via `pilot-measure.mjs` (registro da arte + régua
gola→barra).

Landmarks lidos por agente com visão sobre a grade (`grade` + zooms do
`annotate.mjs`), ancorados na anotação humana da foto publicada do mesmo
produto quando existe. Portão A1 continua VERMELHO (detector automático
reprovado): nenhum landmark automático foi usado.

| # fila | Produto | Cor | Desvio da capa no ar | Arquivo FINAL | Regressão | Compressão horizontal | Status |
|---|---|---|---|---|---|---|---|
| 1 | Salmo 19 \| Moletom Canguru `[352619175]` | preta | −19,9% (REPROVADO-DURO) | `352619175-preta-v7.png` | **−0,1%** | 4,4% (física; era ~15% na v6) | **PRONTA** |
| 2 | São Jorge Vintage \| Moletom Canguru `[352618878]` | branca | −15,0% (decisivo) | `352618878-branca-v7.png` | **0,0%** | ~5% (era ~11-13%); moiré segue ~1,0× | **PRONTA** |
| 3 | Querubim Spray \| Oversized Premium `[352725749]` | preta | −12,9% (decisivo) | `352725749-preta-v8.png` | **+0,2%** | 1,9% (era 7,3%); faixa fantasma extinta; tag NIMBUS preta fiel | **PRONTA** |
| 5 | São Jorge Neobarroco \| Moletom Canguru `[352718787]` | preta | −11,9% | `352718787-preta-v8.png` | **+0,1%** | 5,9% ≈ físico 4,8% (era 12,3%); oclusão de capuz com feather 4-7 px | **PRONTA** |
| 7 | NIMBUS Wildstyle \| Oversized Premium `[352721633]` | off-white | −10,3% | `352721633-offwhite-v4.png` | **−0,3%** | pose 3/4: yaw 20° calibrado pela publicada (centro 40,8 vs alvo 40,4; aspecto 0,792 vs 0,788 da cena); v1 com yaw 0 reprovou por "decal" | **PRONTA** |

Descoberta de pipeline no 352721633: o blank saiu como a PRÓPRIA cena
publicada com a estampa removida (diff pixel-idêntico fora da arte) — quando
isso acontece, os landmarks da anotação oficial da capa publicada valem
diretamente e a assinatura projetiva (aspecto/centro do print publicado) é o
alvo de --yaw/--centro. Novo parâmetro `--yaw` (graus) no compor.

| 8 | São Miguel Vintage \| Moletom Canguru `[352407156]` | preta | −9,8% | `352407156-preta-v1.png` | **+0,1%** (dupla anotação: incerteza ±3%, sinal indefinido, ≪ tolerância) | 4,9% (banda física) | **PRONTA (adjudicada)** |
| 9 | São Miguel Vintage \| Moletom Canguru `[352407156]` | branca | −9,2% | `352407156-branca-v1.png` | **−0,1%** | 6,7% (sensível a limiar; vertical exata) | **PRONTA (3/3)** — par com a preta verificado: topo Δ3 px, sem pulo no hover |
| 10 | São Miguel Vintage \| Camiseta Premium `[352407196]` | branca | −9,7% | `352407196-branca-v3.png` | **−0,1 a −0,4%** (contra-prova: barra real 94,94 medida por 308 colunas) | anisotropia NCC 2D −1,0% (a caixa dava −8% por artefato de limiar — arbitrado) | **PRONTA** — assinatura NIMBUS correta (a publicada tinha "NPMBUS"); pose frontal vs preta 3/4 no ar (mundo coerente, registrar para o dono) |

LIÇÃO DE PROTOCOLO (v1→v3 do 196): em CAMISETA, a barra é a BORDA DO TECIDO,
não o pesponto ~2 cm acima — o pesponto custou −5,9% de escala na v1. Nos
moletons a ribana torna isso inequívoco; nas camisetas, medir a borda real.
ATUALIZAÇÃO: o erro se repetiu no 999 (93,6 lida vs 97,3 real, −6,5%) →
agora é OBRIGATÓRIO rodar `scripts/geometry/detect-hem.mjs` no blank e usar
o degrau forte mais baixo como barra (validado contra os painéis nos dois
casos: 95,02 e 97,27).

| 11 | São Jorge Neobarroco \| Camiseta Premium `[352718999]` | branca | **+9,2%** (única grande) | `352718999-branca-v2.png` | **−0,04%** (39,98 cm; −9,8% vs publicada = correção exata) | −0,9% de largura (enrolamento leve) | **PRONTA** — v1 reprovou por barra na dobra (−6,5%); v2 com detect-hem + teto de sombra 1,15 (clipping 0,471%→0,168% luma). Par preta fica no ar com +6,9% ACEITÁVEL: escalas divergem ~7% entre cores até rodada futura |

Adjudicação do 352407156 preta: painel dividiu; adjudicador APROVOU com as
evidências novas. Registros permanentes: (R2) a capa PUBLICADA deste produto
é infiel — wordmark NIMBUS branco serifado INVENTADO pela rodada antiga
(o mockup oficial mostra NIMBUS pequeno tom-sobre-tom, como a candidata) e
arte internamente distorcida ~12%; proibida como referência, mesmo padrão do
Querubim. (R3) `H2-v1` é variante de arte de outra composição; a deste
produto é a `H2-v2`. (R4) AVISAR O DONO: o NIMBUS tom-sobre-tom fica quase
invisível na lifestyle — é fidelidade ao mockup, não omissão. (R1) não
retunar a escala sem régua melhor.

Todas as quatro passaram por painel triplo independente + contra-provas
numéricas por métrica (moiré, sombra, aspecto, feather) + medição de
regressão. Histórico completo de vereditos nas seções abaixo e nos journals
dos workflows. Ponto de marca em aberto no 787: nesta pose o drape do capuz
cobre a cartela NIMBUS do topo da moldura (fisicamente correto; a branca no
ar mostra a cartela — decisão do dono se o par fica assim).

**Mudança de pipeline (26/07):** `produce-cover.mjs compor` agora compõe em
2x e reduz com Lanczos (`--ss`, padrão 2). Motivo: o painel do 352618878 v5
mediu moiré xadrez na trama halftone (energia de alta frequência 1,9–2,9x
acima do downsample fiel; meios-tons clareados ~10 níveis) — a pré-redução
da textura sozinha não basta para arte de meio-tom. As duas capas foram
recompostas como v6 (mesmos landmarks; geometria idêntica por construção).

## Detalhes por capa

### 352619175 preta (Salmo 19 Moletom) — fila #1

- Cena: `live/352619175-01.webp` (capa publicada preta). Arte:
  `designs/prontos/RELIQUIA/costas/B2-salmo19.png` (3500x2883, alpha,
  razão −0,68% da oficial 35,2x28,8).
- Blank aprovado de primeira (capuz, punhos, ribana, mesmo modelo/claustro,
  costas 100% lisas).
- Composição: coluna central 36,4→63,1% (por construção). Regressão:
  −0,9% do alvo; registro score 0,507, rotação −0,4°.
- Painel 3/3 APROVADO. Observações não bloqueantes: anti-alias da borda da
  arte mais duro que a foto em zoom ≥400% (sugerido supersampling 2x em
  regeneração futura); letras "OS"/"A" comprimidas pelo wrap no flanco
  esquerdo (fisicamente coerente); dedo tubular do modelo é defeito
  PRÉ-EXISTENTE da foto publicada (pixel-idêntico), não regressão.
- Extra do painel: a arte da capa publicada atual é um REDESENHO (arco
  proporcionalmente mais largo que o raster oficial) — mais um motivo para a
  substituição.
- Comparativo: `352619175/comparacao-352619175-preta.png`.

### 352618878 branca (São Jorge Vintage Moletom) — fila #2

- Cena: `live/352618878-02.webp` (capa publicada branca). Arte:
  `designs/prontos/RELIQUIA/costas/H4-sao-jorge-halftone.png` (2667x3500,
  alpha, razão −0,43% da oficial 30,6x40).
- Ganho estrutural: na foto publicada o topo da arte (faixa NIMBUS + anel)
  ficava OCULTO pelo capuz (g3: "art_top_occluded_by_hood"); no blank novo o
  capuz cai mais alto e a arte aparece completa.
- Gola estimada 0,28 (σ2,5; capuz oculta a costura — extrapolada pela costura
  de ombro e ancorada na anotação g3 da publicada: 30,5 num quadro ~1% menor).
- Regressão: −0,2% do alvo (65,1 cm); registro score 0,509, rotação 0°.
- Comparativo: `352618878/comparacao-352618878-branca.png`.

## Fila em andamento

## ACHADO MAIOR de 26/07: mockups planos da YouDraw existem — para os 49

`nuvemshop/assets/product-lifestyle/2026-07-16/catalog/references/` tem **49
pastas (151 arquivos)** com os `gallery-0N.webp` de cada produto — e eles SÃO
os mockups planos oficiais da YouDraw (confirmado por conteúdo no Querubim e
por hash: o arquivo local é byte-idêntico ao servido pela loja nas posições
3-6 das galerias). Consequências:

1. **O E1 estava errado**: a varredura da nuvem ("zero mockups em 105
   imagens") falhou porque a heurística de borda BRANCA não reconhece mockup
   de fundo escuro. Os mockups sempre estiveram nas páginas de produto (a
   frase original do CLAUDE.md do main estava certa; a correção do branch,
   errada).
2. **A pendência-chave do datum (gola vs ombro, vale 3-5%) está destravada**:
   dá para medir a razão ombro→barra ÷ gola→barra em mockup plano, para cada
   peça, sem depender do painel YouDraw.
3. O placement por produto (colar→topo da arte) pode ser lido do mockup em
   vez da suposição de 8 cm.
4. CUIDADO: o mockup NÃO serve como régua de escala absoluta ingênua — no
   Querubim a fração de tinta do mockup implicaria peça de ~95 cm, que não
   existe; o template do mockup não é proporcional a um tamanho real. A
   régua vigente continua sendo cm oficiais + gola→barra, até a investigação
   do datum concluir.

Investigação a fazer (alta prioridade, sem créditos): medir nos 49 mockups a
razão ombro/gola por tipo de peça e o placement, e reconciliar com a tabela.

3. Querubim Spray | Oversized preta `[352725749]` −12,9% — **v7 composta**
   (regressão **−0,2%**, registro 0,79). Painel da v6: escala APROVOU cravado
   (topo/base 0,344/0,657; +14-15% vs publicada); fidelidade REPROVOU por
   faixa de sombra fantasma da placa de luminância (clamp 0,75-1,25 ruidoso
   em tecido preto) — v7 usa clamp 0,9-1,12 e centro 0,505 (nudge de -1,5%
   pedido pela lente de escala); contra-prova em curso. A lente 2 também
   apontou "arte 15% maior que o mockup" — medição REJEITADA como régua: usa
   a fração do mockup plano, exatamente o método que a auditoria de geometria
   invalidou (e a régua vigente aprova a v6/v7 com desvio ~0%). Bônus do
   painel: a tag NIMBUS oficial é PRETA tom-sobre-tom — a capa PUBLICADA é
   que a inverteu para branca (mais uma infidelidade da capa antiga que a
   nova corrige).
   Landmarks: gola 0,28 (costura visível, σ0,5) / barra 0,93 / centro 0,52.
   Arte: `designs/prontos/STREET/mockups/Querubim Spray [...]/costas -
   Querubim Spray.png` (alpha só na tinta, inclui a tag NIMBUS da caixa
   oficial 25,5x40). **Cenário mudou de propósito**: beco de grafite → 
   concreto modernista branco (CENA.STREET do pipeline; direção da marca;
   fundos de beco eram MÉDIO na auditoria de 23/07). O par off-white deve
   sair na MESMA cena para o hover.
6. Querubim Spray | Oversized off-white `[352725749]` −11,3% — **BLOQUEADO**:
   a off-white usa a variante de TINTA ESCURA da arte, que não existe no
   acervo local (a família Arcanjo tem (branco)/(preto); o Querubim só tem a
   clara). VERIFICADO em 26/07: a mídia do Higgsfield tem só o lote das 31
   artes de 25/07 (sem querubim escuro), MAS o mockup branco oficial
   (references/352725749-querubim-spray/gallery-04.webp) mostra o querubim
   escuro impresso → o arquivo EXISTE na YouDraw. Recuperação: baixar do
   painel YouDraw com o Chrome do dono (pendência de sessão local).
5. São Jorge Neobarroco | Moletom preta `[352718787]` −11,9% — **v6 composta
   com oclusão de capuz**, regressão **−0,3% do alvo** (65,2 cm). Painel em
   curso. História: o blank da nuvem reprovou (pose torcida); blank novo com
   referência da BRANCA veio bem enquadrado mas com drape do capuz descendo a
   ~44,5%, cobrindo onde o topo da arte cai no placement oficial (36,9%).
   Duas regerações vieram com drape longo → em vez de insistir ou empurrar o
   placement (~17 cm de offset, fora do plausível), a resposta física:
   `scripts/compose-occlude.mjs` restaura os pixels do capuz POR CIMA do topo
   da arte (polígono com feather) — a oclusão que uma foto real teria. Arte
   no placement e escala oficiais; topo da moldura parcialmente sob o capuz,
   como no produto vestido de verdade. Landmarks: gola 0,295 (σ3, cabelo+
   capuz) / barra 0,897 (jeans claro) / centro 0,51. Arte:
   `S6-sao-jorge-barroco-v1.png` (razão −0,72%; a v2 desvia −4,4%, não usar).
   Pose difere do par branca (braços abaixados vs capuz erguido) — mesma
   modelo e cenário; julgamento no painel.
4. Acima de Tudo Gótico | Oversized off-white `[352720257]` −12,5% — ATENÇÃO:
   arte na FRENTE (35x33,8), vista frontal; o pipeline atual assume costas
   (prompt rear-view e COLLAR_TO_ART_CM pensado para costas). Caso especial,
   deixado para depois dos casos de costas.

## Dúvida de inventário anotada

`artes-inventario.json` mapeia G2-anjo-stencil.png E G2-anjo-livro-stencil.png
para o Anjo da Guarda [352728277], mas as pastas de mockups distinguem
"Querubim Spray" (arquivo com dimensões idênticas ao G2-anjo-stencil) de
"Anjo da Guarda" (anjo com livro). Conteúdo confirma que o arquivo usado aqui
é o querubim. Vale corrigir o inventário num passe futuro.

## Custos e chave

- Chave: `GEMINI_API_KEY` no `.env` (mapeada para `GOOGLE_AI_KEY` na hora de
  rodar). ROTACIONAR a chave depois do lote (instrução do handoff).
- Custo observado: 1 chamada de imagem por blank (~US$0,13); zero falhas de
  geração até aqui (2 blanks utilizáveis em 2 tentativas).

---

## Sessão de 26/07: correções de método

### Placement: a gola estava no marco errado

A tabela de 26/07 foi levantada com agentes relendo a gola em cada mockup, mas
gola e barra são constantes do template. Em quatro Camisetas Premium o agente
marcou o topo da ribana (y=53) em vez da costura (y=66): 2,6 pontos, ou ~2,5 cm
de deslocamento, contra uma tolerância de 1,5 cm.

Arbitrado por silhueta idêntica em onze produtos, inspeção visual das duas
linhas candidatas e a constante já verificada nos 45 mockups. Validado contra a
tabela publicada: Camiseta Premium −1,6%, Moletom Canguru −0,3%.

Detalhes em `nuvemshop/auditoria/2026-07-26-datum-mockups/CORRECAO-GOLA-TEMPLATE.md`.

### Quanto cada erro vale

- gola errada em X pontos percentuais → **X cm** de deslocamento (1:1)
- vão da tinta errado em X% → X% *do próprio placement* (5% sobre 9 cm = 0,45 cm)

O teste de comprimento implicado responde aos dois, então sozinho ele super-alarma.

### 352727892 não é Blusão

O CSV registra Blusão Moletom; o mockup oficial e a loja mostram capuz e bolso
canguru. Corrigido na FONTE (`derive-composicao.mjs`), não só via flag, porque
a peça errada troca a régua de 65 para 78,4 cm.

Pendência: o capuz gerado desce 4x mais que o do mockup oficial e conflita com a
estampa. Nem a versão com oclusão (enterra a coroa) nem a sem (estampa por cima
do capuz) servem.

### A trava de peça sumia no Blusão

`GARMENT_LOCK` tinha a chave sem til enquanto o catálogo usa "Blusão Moletom".
O prompt ia sem a trava, ou seja nada impedia a IA de pôr capuz num Blusão.
Agora a busca ignora acento e lança quando não acha.

### Posição medida por registro, não por caixa

A caixa por limiar é cega para tinta escura sobre tecido escuro: a mesma arte no
mesmo placement deu −0,04 cm na branca e +2,44 cm na preta. A posição passou a
usar o registro NCC, como a escala já usava.

### Receitas ao lado de cada capa

`compor` grava `<capa>.receita.json` com todos os parâmetros. Sem isso não era
possível recompor sem re-derivar landmarks à mão: havia 37 capas prontas e só
17 QA JSONs com nomes inconsistentes.

Também há `scripts/geometry/reaplicar-oclusao.mjs`, que recupera a máscara do
capuz do par `<v>-semcapuz.png` / `<v>.png` já existente, sem precisar do
polígono original.

### Blusão Moletom: comprimento estimado

A YouDraw não publica tabela. Adotado **78,4 cm**, mediana da régua-pela-arte
sobre os quatro mockups de Blusão. Marcado como `estimado: true` no spec.

### Ecobag [355581274]: NÃO regenerada, com motivo

É o único item do catálogo que a pipeline não processa: painel plano, sem gola
nem barra, então não há régua vertical nem malha cilíndrica que se apliquem.
Construir um compositor plano para uma capa seria desproporcional.

Verificado o que dava para verificar sem instrumento novo: a arte
`G1-nimbus-tag-azul.png` tem razão 0,933 e o CSV registra 24,0 × 25,7 cm, razão
0,934 — concordam. Uma medição improvisada da escala no mockup NÃO foi confiável
(devolveu razão de tinta 1,126, incompatível com a arte), e por isso não é
usada como evidência.

**Decisão: manter a capa publicada.** Fica explícito que ela não passou pelo
mesmo crivo das outras 77 e depende de decisão do dono se quiser tratamento
próprio.

### Capuz x estampa: decisão de 26/07

Medido em todas as capas de moletom já produzidas quanto o capuz cobre da tinta:

| produto | coberto |
|---|---|
| Aparecida Spray `352727892` | 33% |
| Azulejo Sagrado `352718083` | 17,5% |
| São Jorge Neobarroco `352718787` preta | 17% |
| os outros cinco moletons | 4% a 10% |

A causa é estrutural, não da foto. O placement oficial (~4 cm) foi medido no
mockup PLANO, onde o capuz está deitado ACIMA da costura da gola. Vestido, o
capuz cai e ocupa uns 15 cm abaixo dela. Ou seja, **no produto físico a estampa
começa 4 cm abaixo da costura e o capuz cai por cima**. Uma foto que mostra isso
é a verdadeira; a capa publicada hoje desceu a arte para ~11 cm, o que embeleza
mas não corresponde ao produto.

O dono decidiu entre fotografar como é e usar o capuz levantado, deixando o
julgamento por conta da sessão, com a ressalva de que capuz levantado não pode
ser foto chapada de costas.

**Decisão: capuz na cabeça, pose 3/4, nos três piores** (e na Branca do
`352718787` junto, para não quebrar o par de cor). Capuz levantado não engana
sobre onde a estampa fica, é o que quem usa faz, e preserva a arte inteira;
enterrar a coroa de Nossa Senhora numa marca devocional derruba a capa no
elemento que identifica a peça.

Os outros cinco moletons ficam como estão: 4% a 10% é margem, não arte.

Perfil puro foi descartado como alvo: de lado a estampa desaparece. O alvo é
três-quartos traseiro, com o painel das costas inteiro visível.
