---
status: vigente
atualizado: 2026-07-26
---

# Estado do projeto

Esta é a única página que envelhece rápido. Leia antes de agir e atualize ao sair.

## Capas

**77 das 78 variantes existem em disco.** A 78ª é a Ecobag, mantida de propósito
(a pipeline não processa painel plano).

**⛔ O lote NÃO está publicável.** Em 26/07 o dono reprovou as 77 depois de olhar
em resolução real. Três defeitos, todos confirmados por medição depois:

1. **Estampa parecia colada.** O compositor curvava a arte num cilindro liso e
   multiplicava por uma sombra suavizada — retângulo de bordas retas sobre pano
   amassado. Corrigido: a arte agora é deformada e sombreada pelas dobras do
   próprio tecido.
2. **Estampa torta.** O eixo do painel era estimado pela silhueta, que inclui
   manga e braço. No Aparecida Spray o erro era de **5,4 pontos**. O check de
   centro tinha sido rebaixado por mim para informativo, e por isso passou em
   todas.
3. **Arte por cima do capuz.** Regressão do compositor novo, já corrigida: a
   oclusão voltou a ser parte da composição, com o polígono guardado na receita.

**Três pilotos refeitos e aprovados** com o compositor novo (352718999 branca,
352889132 preta, 352618878 preta). O dono aprovou o resultado visual.

**A varredura de receitas foi feita.** O vício do `torso` se repete: **12 capas**
inflam o raio acima do teto dos pilotos (a pior, 352725852 preta, a 2,03× a
tabela), **8** estão com `centro` ou `torso` não medidos, e há **11 contradições
provadas** entre receitas do mesmo blank. Ordem de retrabalho e método em
[`verdades/torso-e-centro.md`](verdades/torso-e-centro.md); instrumento em
`scripts/producao/auditar-receitas.mjs`.

**O yaw deixou de ser escolha e virou medida (27/07).** O dono apontou o
landmark que faltava: a **costura central das costas** (capuz no moletom,
centro da gola na camiseta) marca o meridiano verdadeiro da peça, visível na
foto. `scripts/geometry/estimar-yaw.mjs` resolve o yaw invertendo o próprio
`artMesh` até o meridiano da estampa cair na costura. Validação: no moletom o
dono escolheu −14 no olho e a costura devolve **−14,75**. Medidos: 352725852
**+7,25**, 352728277 **+9** (leitura fraca), 352718787 **−14,75**. Junto disso,
o tecido ganhou `--sombra-global` (a estampa segue a iluminação da cena) e
`--dobra-larga` (segue o caimento, não só o vinco); o dono escolheu
**dobra 180 · relevo 8**. As três capas estão recompostas com isso (v4/v5),
gate aprovado, à espera do olho.

**Três capas refeitas em 26/07, à espera do olho do dono:** 352725852 preta
(Camiseta Premium, era 2,03× → 1,19×), 352728277 preta (Oversized, 1,86× →
1,18×) e 352718787 branca (Moletom Canguru com capuz, 1,45× → 1,14×). As três
passam gate, compressão de malha e leitura visual. A fila acima do teto caiu de
**12 para 9**.

Escolhidas para cobrir três caminhos de risco diferentes: tecido escuro, peça de
área maior, e tecido claro com capuz.

**Próximo passo:** com o aval do dono, seguir a fila em lotes, remedindo `torso`
e `centro` no blank antes de recompor. A 352718999 branca aparece na fila mas
**já está resolvida** — é um dos pilotos aprovados, e o que falta é promover o
piloto a entregável, não refazer.

## Medições fechadas

- Placement por produto, régua-pela-arte sobre os 48 mockups oficiais.
- Datum resolvido: a "altura" da tabela YouDraw é **gola→barra**.
- Horizontal: a arte é centrada no produto, mediana de desvio **0%**.
- Comprimento do Blusão: 78,4 cm, **estimado**, com a ressalva registrada.
- 352727892 reclassificado de Blusão para Moletom Canguru.

## Placement remedido e adotado (27/07)

O medidor de mockup foi consertado em quatro pontos e a caixa da estampa passou
a sair do **registro com o PNG oficial da arte** (score mediano 0,883). Detalhe
em [`verdades/limites-conhecidos.md`](verdades/limites-conhecidos.md).

**Os valores corrigidos já estão em `placement-por-produto.json`:** 42
corrigidos, 3 confirmados, 3 sem leitura. O valor de 26/07 fica ao lado em
`placement_cm_2026_07_26`; nada de histórico foi apagado.

As correções são pequenas na maioria (mediana ~0,1 cm) mas chegam a **2,2 cm**
no 352722232 e **1,4 cm** no 352728451. Reaplicar depois de remedir custa um
comando: `node scripts/geometry/adotar-placement.mjs --aplicar`.

Três produtos ficam sem leitura por serem **estampa frontal** (o template de
costas não se aplica): 352702753, 352702796 e 352720257. Eles mantêm o valor
antigo, que foi medido com o template errado e **não deve ser usado**.

> [!warning] Toda receita anterior a 27/07 usa o placement velho
> As três capas refeitas em 26/07 incluídas. Recompor exige repassar o
> `--placement` novo.

## A sessão na nuvem compõe sem chave de IA

Provado em 26/07 num clone limpo: `npm install` + `setup-assets` + `compor`
reproduz o piloto aprovado do 352718999 com `arco_meio_rad 0,735`, idêntico à
receita. Os **149 blanks estão versionados** no repo de assets; só as capas
compostas ficaram de fora.

A `GEMINI_API_KEY` é necessária **apenas para gerar blank novo** (passo 1 do
fluxo de capa). Recompor o catálogo a partir dos blanks que já existem não
depende dela. As duas variantes sem blank são 352890896 off-white e a Ecobag.

## Pendências do projeto

1. Reconstruir o catálogo com o compositor novo.
2. Publicar, com autorização produto a produto.
3. Reconciliar 49 produtos e variantes entre Nuvemshop e YouDraw.
4. Completar páginas de produto: material, modelagem, medidas, prazo POD,
   política, impacto social.
5. Finalizar páginas legais e de ajuda.
6. Validar analytics e eventos do funil antes de anúncio pago.
7. Confirmar com a YouDraw a tabela de medidas do Blusão Moletom.

## Reorganização de 26/07

O projeto passou a viver em **dois repositórios**: o público (código,
documentação, medições, receitas) e `Movits/nimbus-assets`, privado, com as
artes, os blanks e os mockups. `node scripts/setup-assets.mjs` mescla os dois.

Provado de ponta a ponta: clone limpo dos dois + `npm install` + `setup-assets`
compõe uma capa.

As **capas compostas ficaram fora do repo de assets** de propósito. São
deriváveis de blank + arte + receita, e as receitas estão versionadas. Eram 559
MB de iterações mais 215 MB de diagnóstico.

Cinco conflitos de instrução foram neutralizados, incluindo a terceira auditoria
invalidada que estava sem aviso nenhum. `docs/` passou a ser roteado por tarefa.

## Suspeitas abertas

- A capa publicada do **352727892** pode estar com a peça errada: uma das duas
  fotos no ar não mostra capuz, e o produto é Moletom Canguru. Confirmar na loja.
- O medidor de eixo automático (`scripts/geometry/eixo-costas.mjs`) **não é
  confiável**: mediu o tronco pela metade em peça preta. O eixo hoje se mede por
  leitura visual dos vincos de cava. Consertar ou aposentar.
