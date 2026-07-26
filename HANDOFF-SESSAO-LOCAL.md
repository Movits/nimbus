# Handoff para a sessão LOCAL — produção e publicação das capas NIMBUS

Escrito em 26/07/2026 por uma sessão na nuvem, que **não** alcança o computador do
Roberto nem o painel da Nuvemshop. Este arquivo existe para que a sessão local
continue de onde paramos sem redescobrir nada.

Cole o bloco `PROMPT` abaixo numa sessão local com acesso ao Chrome dele e ao
repositório. O resto do arquivo é a referência que o prompt cita.

---

## PROMPT (copiar daqui até a linha de corte)

> Você vai continuar o projeto NIMBUS (streetwear católico brasileiro, produção
> sob demanda pela YouDraw, loja na Nuvemshop). Leia `CLAUDE.md` na raiz do repo
> antes de qualquer coisa, depois `HANDOFF-SESSAO-LOCAL.md`, que é este
> documento e explica o estado exato.
>
> **O que você tem que a sessão na nuvem não tinha:** acesso ao Chrome local do
> dono (logado na Nuvemshop e na YouDraw) e à pasta local com as artes de
> impressão. É por isso que a tarefa foi passada para você.
>
> **Suas três tarefas, nesta ordem:**
>
> 1. **Destravar o portão A1.** Existe um detector automático de landmarks em
>    `scripts/geometry/blank-landmarks.mjs` que foi escrito, medido e
>    **reprovado** no critério (24 de 41 dentro de 1 pp, quando o critério era
>    1 pp). O cabeçalho do módulo tem os três métodos já tentados, os números de
>    cada um, e a ressalva de que o teste roda no domínio errado. Não repita
>    nenhum dos três. O caminho barato indicado lá é anotar à mão 8 a 10 peças em
>    branco e repetir `scripts/geometry/validate-blank-landmarks.mjs` no domínio
>    certo. **Enquanto esse portão estiver vermelho, nenhuma capa é composta com
>    landmark automático sem conferência humana.**
>
> 2. **Produzir as capas.** O escopo aprovado pelo dono são os **49 produtos /
>    78 variantes de cor**. Duas estão prontas. O pipeline e os comandos estão na
>    seção "Como produzir uma capa" abaixo. Vá em blocos de ~10, medindo o bloco
>    inteiro antes de liberar o próximo — o `CLAUDE.md` proíbe lote sem portão.
>
> 3. **Publicar na Nuvemshop.** Esta é a parte que só você consegue. A sessão na
>    nuvem não tem credencial (a API responde 401). Substitua **apenas** capas
>    lifestyle aprovadas, uma de cada vez, e confira no site real em desktop e
>    mobile. Não altere preço, variante, checkout, dados legais nem a integração
>    YouDraw.
>
> **Três regras que não são negociáveis, e cada uma custou caro para ser
> aprendida:**
>
> - **A IA não desenha a estampa.** Ela gera pessoa, peça, cenário e luz *sem
>   estampa nenhuma*; a arte oficial entra depois por composição. Pedir escala
>   certa por prompt já falhou duas vezes seguidas sem mover um pixel.
> - **Tolerância é simétrica.** Estampa menor que o alvo é defeito igual a maior.
>   Doze das treze fotos da fila de correção estão *pequenas* demais, e prompts
>   antigos (anteriores a 25/07) mandavam encolher na dúvida — não copie prompt
>   de commit antigo sem checar isso.
> - **Nunca publique número dentro do próprio ruído.** Foi assim que duas
>   auditorias de escala inteiras foram invalidadas. Se a margem medida do método
>   é 8 pp, não existe veredito a 5%.
>
> Comece apresentando uma revisão crítica do estado, dizendo claramente o que
> você verificou agora e o que veio só do documento. Não comece corrigindo
> imagem.

--- fim do prompt ---

## O algoritmo, em duas etapas

Está em `scripts/produce-cover.mjs`. A separação é a ideia inteira.

**Etapa 1 — peça em branco.** A IA (`gemini-3-pro-image`, API do Google AI
Studio) gera a foto usando a capa publicada como referência de modelo, cenário,
enquadramento e luz, mas **sem estampa nenhuma**. Não há o que ela erre de
escala, porque não há estampa. O prompt repete a proibição de várias formas
porque com a foto de referência no pedido o modelo tende a reproduzir a estampa
junto.

**Etapa 2 — composição.** A arte oficial entra por malha cilíndrica
(`scripts/geometry/render.mjs`), no tamanho que os centímetros da YouDraw mandam.
Escala e posição ficam certas **por construção**, e o medidor vira teste de
regressão em vez de loteria.

Entre as duas etapas ficam os landmarks (gola, barra, centro das costas). **É o
único passo humano que sobrou, e é onde mora o erro que ainda não está medido**
— ver a seção do portão A1.

## A régua

**Tabela de medidas real da YouDraw** (largura do tórax × comprimento, em cm):

| Peça | P | M | G | GG | EG |
|---|---|---|---|---|---|
| Camiseta Premium | 49,5×70,5 | 52,5×72 | 54×75,5 | 60,5×81,5 | 63×85 |
| Camiseta Oversized Premium | 62×78 | 64×80 | 66×82 | 68×84 | 70×86 |
| Moletom Canguru | 52×60 | 55×64 | 58×65 | 61×65 | 69×70 |
| Blusão Moletom | — | — | — | — | — |
| Ecobag | 41×35, alças de 60 | | | | |

Blusão Moletom **não tem dados** — 5 produtos ficam sem veredito de escala.

**Convenção**: toda foto lifestyle representa o tamanho **G** (`CANONICAL_SIZE`).

**Tolerância**, decidida pelo dono em 25/07:

| Desvio vs G | Rótulo | Ação |
|---|---|---|
| ≤ 5% | `OK` | aprovado |
| 5% a 8% | `ACEITAVEL` | fica no ar |
| > 8% | `FORA-DO-ALVO` | entra na fila |
| nenhum tamanho real explica | `REPROVADO-DURO` | entra na fila |

Com uma trava mecânica: **o limiar efetivo nunca fica abaixo da margem medida do
método** — 4 pp para arte com moldura desenhada, 8 pp para arte de silhueta livre
(spray, stencil). `validate.mjs` tem o critério `toleranceExceedsMargin` e deixa
o portão vermelho se alguém apertar o limiar sem antes derrubar a margem.

## A questão aberta do datum (vale 3 a 5%)

A tabela da YouDraw dá "largura × altura" e **não documenta se a altura sai do
ombro ou da base da gola**. São 2 a 4 cm de diferença, ou 3 a 5% — mais que a
tolerância inteira.

**Decisão vigente:** produzir com a mesma convenção que a auditoria usou
(**gola → barra**). Isso torna correção e medição coerentes: a capa nova mede 0%
pela mesma régua que condenou a antiga.

**Direção do erro, se o datum for o ombro:** empurraria os desvios para o lado
positivo, o que mantém a fila atual conservadora e nunca inflada.

**Como fechar** (o dono recusou explicitamente perguntar à YouDraw, e com razão —
a informação publicada é ambígua na origem): medir a razão ombro→barra ÷
gola→barra num mockup plano. Razão é adimensional e sobrevive a template
normalizado. O obstáculo é que **não existe mockup plano acessível**: a varredura
das 49 páginas classificou 105 imagens e achou **zero**, e o site da YouDraw é uma
SPA atrás de login. **Isto é algo que só a sessão local resolve**, entrando no
painel da YouDraw e baixando um mockup plano.

## Os erros de algoritmo já pagos — não repita nenhum

1. **Recorte com margem de tecido valeu 18%.** Os cm oficiais descrevem a caixa
   da *tinta*. Qualquer margem no recorte faz os cm serem aplicados ao recorte.
   Resolvido definitivamente: a caixa agora sai do **canal alpha** da arte
   oficial (`arteRecortadaPorAlpha`), não de um recorte por limiar.
2. **`Buffer` de 8 bits faz WRAP, não saturação.** 230 × 1,25 = 287 vira 31. Como
   cada canal estoura em momento diferente, o sintoma era cintilação ciano na
   borda das letras, que parecia defeito de sombreamento e era aritmética de
   inteiro. Corrigido com clamp em `render.mjs`.
3. **Moiré por amostragem bilinear.** A malha amostra a textura com 4 texels; numa
   minificação de 10× ela pula a maior parte dos pixels e o meio-tom vira xadrez.
   Corrigido pré-reduzindo a arte com Lanczos antes do warp.
4. **Landmark lido no olho vale até 2,8% de escala.** É o defeito ainda ABERTO.
5. **Os dois eixos de veredito dividiam o mesmo `if/else`**, e um "não sei" do eixo
   duro silenciava um "fora do alvo" do eixo de catálogo. Foi isso que fez a fila
   passar de 6 para 13 — correção de defeito, não medição nova.
6. **Sinal da profundidade invertido no gerador sintético** (modelava um dorso
   côncavo). Corrigido, com a previsão declarada antes do teste.
7. **Comprimentos de peça errados** na re-derivação de 24-25/07 (68-72 para canguru
   quando o real é 60-70), com erro em direções opostas conforme a peça. Foi o que
   fabricou o padrão "nenhuma estampa é maior que o oficial".

## As artes oficiais

**31 PNGs, 3500 px, com canal alpha** — são os arquivos de produção. Vieram do
armazenamento do Higgsfield (o dono subiu pelo widget) e estão hoje em
`/tmp/artes/` da sessão na nuvem, que é **efêmera**.

**Elas NÃO estão versionadas, e isso é deliberado:** o repositório `Movits/nimbus`
é **público**, e versionar os arquivos de impressão em 3500 px deixaria qualquer
pessoa reproduzir os produtos. Só o metadado foi commitado, em
`nuvemshop/auditoria/2026-07-25-geometria/artes-mapeamento.json`.

A sessão local deve pegá-las da **pasta local do dono**, que é a fonte durável.

**Cobertura**: 21 famílias de arte no catálogo, **18 em mãos**. Faltam 3, cobrindo
**12 das 78 capas**:

- Brasão NIMBUS
- Fé Acima de Tudo
- Querubim Spray

O dono decidiu (com a ressalva registrada de que degrada a arte) que, se não
aparecerem, elas devem ser **extraídas da foto publicada** desenrolando a projeção
cilíndrica. Duas checagens gratuitas antes disso: a pasta local dele, e a última
página de mídia do Higgsfield, que ficou por conferir.

Uma dúvida honesta a resolver: a arte `698375f7` tem razão que casa **tanto** com
Brasão NIMBUS (29,6×40) quanto com São Miguel Vitorioso (29,1×39,5). Eu decidi
por São Miguel olhando o conteúdo, mas se eu errei, uma das famílias que faltam
deixa de faltar. Decidir por `registerArt()` contra as fotos publicadas de
`352727545` e `352717837` — a correlação mais alta resolve, e é objetiva.

## Como produzir uma capa

```bash
export GOOGLE_AI_KEY=...        # nunca commitar; rotacionar depois do lote

# 1. peça em branco (sem estampa)
node scripts/produce-cover.mjs blank \
  --produto 352618878 --cor "off-white" --colecao RELIQUIA \
  --cena /caminho/foto-publicada.webp \
  --out /tmp/prod/352618878-branca-blank.png

# 2. grade percentual para ler gola/barra/centro
node scripts/produce-cover.mjs grade \
  --foto /tmp/prod/352618878-branca-blank.png --out /tmp/prod/grade.png

# 3. composição da arte oficial no tamanho dos cm
node scripts/produce-cover.mjs compor \
  --produto 352618878 \
  --foto /tmp/prod/352618878-branca-blank.png \
  --arte /caminho/arte-oficial.png \
  --gola 0.325 --barra 0.855 --centro 0.515 \
  --out /tmp/prod/352618878-branca-v5.png
```

Comandos de apoio:

```bash
node scripts/derive-composicao.mjs --product 352618878   # cm oficiais e composição
node scripts/geometry/validate.mjs                        # o portão; sai 1 se falhar
node scripts/measure-all-annotated.mjs <dir> --out medicoes.csv
node scripts/geometry/validate-blank-landmarks.mjs        # o teste do detector
```

**Rejeite a peça em branco e regere** quando a pose sair torcida, a barra ficar
fora do quadro, ou a IA desenhar estampa mesmo proibida. Taxa observada: 1 em 7.

**Duas falhas equivalentes no mesmo produto:** pare, mude de método ou de modelo.
Não insista no prompt.

## Estado exato em 26/07

**Pronto:** 2 capas de 78. Salmo 19 Moletom preta (piloto, +0,3% do alvo) e São
Jorge Vintage Moletom branca (razão da arte −0,4%, altura por construção batendo
com o alvo).

**Peças em branco geradas e não compostas:** 6 utilizáveis
(`352407156` preta e branca, `352721633` off-white, `352407196` branca,
`352718999` branca, `352721477` branca). Mais 1 **reprovada**: `352718787` preta,
pose torcida e barra cortada, precisa regerar.

**Portão A1: VERMELHO.** Detector de landmarks reprovado no critério.

**Fila de correção medida:** 13 fotos de 11 produtos, em
`nuvemshop/auditoria/2026-07-25-geometria/ACHADOS.md`, com a coluna
`band_decisive` dizendo quais são indiscutíveis.

**Pendências que só a sessão local resolve:**

- Publicar na Nuvemshop (a nuvem não tem credencial).
- Baixar um mockup plano do painel da YouDraw — resolve o datum, a tabela de
  medidas e a posição de uma vez, e é a melhor régua que existe.
- Pegar as artes da pasta local, inclusive as 3 famílias que faltam.
- Tabela de medidas do **Blusão Moletom**, que a YouDraw não publica.

**Pendências independentes:** as 18 páginas sem cópia local da foto publicada
(baixar pelo CDN, que hoje funciona com `https://`); o caminho de arte na FRENTE
para 4 produtos (`352720257`, `352702753`, `352702796`, e a Ecobag `355581274`,
que não é peça vestida e não tem gola nem barra).
