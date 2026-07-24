# Handoff do projeto NIMBUS

Atualizado em 24 de julho de 2026.

Este arquivo e o ponto de entrada para continuar o projeto. Antes de alterar
qualquer coisa, leia o estado abaixo, rode as verificacoes iniciais e consulte
as fontes indicadas. Nao presuma que um documento antigo representa a loja
atual.

## Objetivo e marca

A NIMBUS e uma marca brasileira de streetwear catolico premium, com producao
sob demanda pela YouDraw.

- Posicionamento: fe reverente, design autoral, brasilidade e acabamento
  premium.
- Identidade: ceu, nuvens, concreto branco modernista, luz e atmosfera
  editorial.
- Paleta: navy `#0b2360`, ouro `#e9c46a`, azul-ceu `#8fc1ea`, ceu claro
  `#dcebfa`, branco-nuvem `#f7fbff` e texto `#1b2733`.
- Titulos: Fraunces/Georgia. Interface e corpo: Inter/system-ui.
- Tom: curto, humano, especifico e reverente. Evitar texto generico ou
  exagerado. Nao usar travessao em copy publica.
- Promessa social: 10% do lucro de cada pedido para um projeto social escolhido
  pelo cliente, apos custos e o prazo de arrependimento. O repasse previsto e
  mensal e precisa de registro e comprovacao.

Nao exponha CPF, endereco, senhas, cookies, tokens ou dados de clientes. Este
repositorio e publico.

## Arquitetura e fontes de verdade

- Landing: <https://nimbuswear.com.br/>
- Loja: <https://loja.nimbuswear.com.br/>
- Repositorio: <https://github.com/Movits/nimbus>
- Loja transacional: Nuvemshop, plano Impulso, tema Baires.
- Producao e catalogo operacional: <https://dashboard.youdraw.com.br/>
- Email da marca: `nimbuswearbr@gmail.com`
- Instagram: `NimbusWear.br`
- TikTok: `NimbusWear.br`

A landing e versionada neste repositorio e publicada pelo GitHub Pages. A
Nuvemshop nao faz deploy por Git: o repositorio guarda CSS, HTML, scripts e
evidencias, mas a loja publica e o painel sao a fonte de verdade da loja. A
YouDraw e a fonte de verdade para produto-base, arte, posicao, dimensoes e
producao.

O segundo cerebro privado fica em `Nimbus brain`, tem Git separado e e ignorado
por este repositorio. Consulte-o quando disponivel, mas verifique a data porque
parte do conteudo ficou desatualizada.

## Leitura obrigatoria, nesta ordem

1. `README.md`
2. `nuvemshop/instrucoes.md`
3. `nuvemshop/auditoria/2026-07-21/contexto-nimbus-para-conselho.md`
4. `nuvemshop/auditoria/2026-07-21/ata-conselho-e-auditoria-pre-lancamento.md`
5. `nuvemshop/auditoria/2026-07-21/implementacao/plano-implementacao-e-pendencias-do-dono.md`
6. `nuvemshop/auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte.csv`
7. `nuvemshop/auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte-nimbus.docx`
8. `nuvemshop/auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte-nimbus-qa.pdf`

O CSV e a fonte estruturada da auditoria nova. O DOCX/PDF e o documento visual
lado a lado. Os scripts de reproducao sao:

- `scripts/build-art-dimension-audit-cards.mjs`
- `scripts/build-art-dimension-audit-docx.py`
- `scripts/build-art-dimension-audit-qa.py`
- `scripts/build-final-product-image-audit-2026-07-22.mjs`
- `scripts/download-live-product-gallery-audit.mjs`

## Verificacoes iniciais obrigatorias

Antes de propor ou executar mudancas:

```powershell
git status -sb
git pull --ff-only
git log -8 --oneline --decorate
npm run typecheck
npm run build
node scripts/verify-prelaunch-artifacts.mjs
```

Depois:

1. Leia o diff e os arquivos do commit mais recente.
2. Confirme que o CSV possui 49 IDs unicos e contagem
   `25 APROVAR / 13 REVISAR / 11 REFAZER`.
3. Compare o estado documentado com a loja publica em desktop e mobile.
4. Se houver sessao autenticada, confira a Nuvemshop e a YouDraw sem alterar
   produtos, variantes, imagens ou configuracoes.
5. Entregue ao usuario um resumo do estado atual, divergencias encontradas e o
   proximo passo recomendado antes de iniciar novas geracoes.

## Estado atual do catalogo e da auditoria visual

A loja publica tinha 49 paginas de produto no ultimo inventario:

- STREET: 18
- RELIQUIA: 28
- NUVEM: 3

Nao confundir pagina vendavel com arte. Uma mesma arte pode existir em varias
pecas, e cada peca pode ter varias cores. A colecao NUVEM, por exemplo, tinha
tres paginas de produto, mas uma unica familia de arte: Sao Miguel Celeste.

Em 22-23/07 foi concluida uma auditoria das 49 capas lifestyle contra os
mockups e as dimensoes exatas da YouDraw. Foram coletadas as dimensoes de frente
e costas de cada produto. Resultado:

- 25 `APROVAR`
- 13 `REVISAR`
- 11 `REFAZER`

Exemplo de fonte exata confirmada: Sao Miguel Vintage | Moletom Canguru tem
frente `8,9 x 9,2 cm` e costas `31,5 x 40 cm`.

### REFAZER

- Sao Miguel Celeste | Moletom Canguru `[352722685]`
- Aparecida Barroca | Moletom Canguru `[352719816]`
- Sao Jorge Neobarroco | Camiseta Oversized Premium `[352718943]`
- Sao Jorge Neobarroco | Camiseta Premium `[352718999]`
- Sao Jorge Neobarroco | Moletom Canguru `[352718787]`
- Sao Jorge Vintage | Blusao Moletom `[352618837]`
- Sao Jorge Vintage | Camiseta Oversized Premium `[352618903]`
- Anjo da Guarda Stencil | Camiseta Oversized Premium `[352728277]`
- Sao Miguel Vitorioso | Camiseta Oversized Premium `[352727545]`
- Sao Miguel Vitorioso | Camiseta Premium `[352898175]`
- Sao Miguel Vitorioso | Moletom Canguru `[352726673]`

### REVISAR

- Aparecida Barroca | Camiseta Oversized Premium `[352890896]`
- Monograma NIMBUS | Camiseta Premium `[352702796]`
- Salmo 19 | Camiseta Premium `[352702020]`
- Salmo 19 | Moletom Canguru `[352619175]`
- Sao Jorge Vintage | Camiseta Premium `[352618935]`
- Sao Miguel Vintage | Camiseta Oversized Premium `[352407182]`
- Acima de Tudo Grafite | Camiseta Premium `[352728524]`
- Anjo da Guarda Stencil | Camiseta Premium `[352728357]`
- Aparecida Spray | Camiseta Premium `[352889132]`
- Espirito Santo Spray | Camiseta Premium `[352721477]`
- Querubim Spray | Camiseta Oversized Premium `[352725749]`
- Querubim Spray | Camiseta Premium `[352725852]`
- Sagrado Coracao Spray | Camiseta Premium `[352722232]`

Nao gere nem publique substituicoes antes do feedback do usuario sobre esse
documento.

## Erros conhecidos no ar (registrados em 24/07)

Alem dos 13 REVISAR e 11 REFAZER da auditoria acima, estes defeitos pontuais
estao confirmados na loja publicada:

- Salmo 19 | Camiseta Premium `[352702020]`: as fotos Preta e Branca usam
  modelos (pessoas) visivelmente diferentes; no hover o par troca de pessoa.
  A correcao ja existe (`uploads-v2-small/352702020-branca-v4i.jpg`, mesmo
  modelo da Preta, gerada em 19/07) mas NUNCA foi publicada. Publicar a v4i
  resolve, apos aprovacao do dono.
- Aparecida Barroca | Camiseta Oversized Premium `[352890896]`: a legenda
  minuscula le "BRASIL SRCNO" em vez de "BRASIL SACRO". Foi publicada
  conscientemente pela "regra da distancia" (ilegivel em miniatura), mas com
  zoom na pagina do produto o erro aparece.
- Sao Miguel Vintage | Camiseta Premium `[352407196]` (foto Branca): a
  assinatura da marca le "NPMBUS" em vez de "NIMBUS". Mesmo caso: residuo
  aceito pela regra da distancia.
- Sao Miguel Vintage | Camiseta Oversized Premium `[352407182]` (Preta):
  escala ~12% acima do mockup, publicada como "melhor versao disponivel" apos
  5 rodadas sem convergir.

A "regra da distancia" (aceitar texto corrompido porque fica ilegivel na
miniatura) esta REVOGADA: nenhum defeito residual e aceitavel sem aprovacao
explicita do dono, caso a caso.

Licao central do lote v4 (18-19/07): os julgamentos de escala "no olho" da
propria rodada aprovaram fotos que a auditoria por dimensoes exatas reprovou
depois (ex.: Sao Jorge Neobarroco Moletom foi aprovado com "-6,2%" e esta
20-30% maior que o mockup). Estimativa visual nao substitui calibracao pelas
dimensoes em cm da YouDraw.

## Ferramentas de geracao (decisao vigente, 24/07)

- Canal principal: **API do Google AI Studio** com Nano Banana (variacoes e
  cenas) e Nano Banana Pro (texto e casos dificeis).
- Higgsfield: somente fotografia editorial quando o custo se justificar. O
  pipeline antigo via CLI do Higgsfield (`generate-lifestyle-v*.mjs`) e
  historico de metodo; as travas de prompt (TEXT IS SACRED, GARMENT LOCK,
  escala por espaco vazio, sceneRef/artHelperRef) continuam validas e devem
  ser reaproveitadas no canal novo.
- Nao remover marca d'agua/procedencia por manipulacao; preferir ferramenta
  que entregue o arquivo licenciado sem marca visual desde a origem.

## Protocolo obrigatorio de geracao: UM PRODUTO POR VEZ

Decisao do dono (24/07), apos os lotes v1-v4 produzirem erros repetidos.
E proibido gerar em lote. O ciclo e:

1. Escolha UM produto (e uma cor). Gere UMA candidata com todas as
   referencias corretas.
2. Agentes independentes checam TODOS os fatores: modelo (pessoa) correto e
   consistente com o par de cor, peca certa (manga/capuz/caimento), cor da
   peca, cenario da colecao, estampa identica a arte original (tracos, cores,
   TODO texto letra a letra, assinatura NIMBUS), escala e posicao calibradas
   pelas dimensoes em cm da YouDraw daquele produto especifico.
3. Qualquer fator reprovado: diagnostique exatamente o desvio, corrija o
   prompt e gere de novo. Repita a checagem completa a cada tentativa.
4. So existe "versao final" quando TODOS os agentes aprovam TODOS os
   fatores. Sem "residuo aceitavel" sem aprovacao explicita do dono.
5. So depois da versao final aprovada (e publicada, quando autorizado) passe
   ao proximo produto.

Nao tente acelerar voltando a lotes: sempre sai erro. Apos duas falhas
equivalentes no mesmo produto, pare de gastar creditos e mude metodo ou
modelo antes de tentar de novo.

## Regra para corrigir fotos lifestyle

O problema mais importante e fidelidade. A IA nao pode redesenhar a estampa.

1. Use a arte original exata e o mockup exato de peca/cor da YouDraw.
2. Trate a arte como camada rigida, mascara ou composicao posterior.
3. Gere somente pessoa, roupa, ambiente, luz e fotografia.
4. Reaplique a arte original sem alterar tracos, texto, cores ou proporcao.
5. Calibre a escala pelas dimensoes em centimetros do produto especifico, nao
   pelo tamanho de outro modelo da mesma familia.
6. Compare o resultado lado a lado com YouDraw e registre identidade, escala,
   posicao, cor e confianca.
7. Gere na API do Google AI Studio (Nano Banana / Nano Banana Pro), um
   produto por vez, seguindo o protocolo acima. Higgsfield somente quando o
   custo se justificar.
8. Apos duas falhas equivalentes, pare de gastar creditos e mude metodo ou
   modelo.
9. Preserve todas as imagens oficiais da galeria YouDraw. Substitua apenas uma
   capa lifestyle rejeitada e somente com aprovacao.

## Comportamento aprovado dos cards da loja

- Produto com uma cor: a capa lifestyle permanece no hover, com no maximo zoom
  discreto. Nao revelar o mockup da YouDraw na grade.
- Produto com mais de uma cor: pode trocar entre capas lifestyle das cores
  reais.
- A transicao deve manter a fluidez do Baires, sem blink.
- Dentro da pagina do produto, os mockups reais da YouDraw continuam visiveis.

O CSS local mais recente e seus geradores precisam ser comparados com o CSS
efetivamente servido pela loja. A Nuvemshop sanitiza CSS, portanto igualdade
byte a byte nao prova publicacao correta. Evite `var()` sem fallback. Nao cole
arquivos antigos de 16/07 ou 17/07 sem antes verificar a composicao de 20/07.

Arquivos relevantes:

- `nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css`
- `nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.entry.css`
- `nuvemshop/css-nimbus-responsive-header-footer-2026-07-20.css`
- `scripts/build_nimbus_publication_css.mjs`
- `scripts/qa_nimbus_live_responsive.cjs`
- `scripts/verify-hover-live-products.mjs`

## Metodo de trabalho esperado

- Trabalhe em ciclos: aplicar, verificar na loja real em desktop e mobile,
  corrigir e verificar novamente.
- Mudanca em Nuvemshop so esta concluida depois de publicada e checada no site
  real quando o usuario pedir implementacao.
- Nao altere precos, custos, dominio, checkout, dados legais, integracao
  YouDraw, produtos ou variantes sem autorizacao explicita.
- Nao execute pedidos pagos/controlados.
- Nao gaste creditos de imagem em lote antes de aprovar um piloto.
- Preserve alteracoes existentes e nao descarte trabalho local.
- Em tarefas visuais, mostre comparacao real antes de uma mudanca em massa.
- Se Chrome ou o editor da Nuvemshop bloquear, relate o bloqueio exato e use um
  caminho alternativo seguro, sem colar conteudo corrompido.

## Pendencias de maior prioridade

1. Receber o feedback do usuario sobre o DOCX/PDF da auditoria de escala.
2. Com aprovacao do dono, publicar a correcao ja pronta do Salmo 19
   (`352702020-branca-v4i.jpg`) para eliminar o par com modelos diferentes.
3. Selecionar um unico produto `REFAZER` para piloto de correcao na API do
   Google AI Studio, seguindo o protocolo um-produto-por-vez.
4. Validar o piloto contra as dimensoes exatas da YouDraw. Somente apos
   aprovacao, seguir para o proximo produto (sempre um por vez).
5. Reconciliar 49 produtos e variantes entre Nuvemshop e YouDraw.
6. Completar material, modelagem, tabela de medidas, prazo POD, politica e
   impacto social nas paginas de produto.
7. Finalizar paginas legais e de ajuda com dados publicos aprovados.
8. Validar analytics e os eventos do funil antes de anuncios pagos.
9. Executar pedidos controlados apenas no futuro e com nova autorizacao, pois
   envolvem dinheiro e fabricacao real.

Ao assumir o projeto, nao comece corrigindo imagens. Primeiro apresente uma
revisao critica do ultimo lote, confirme os artefatos e diga claramente quais
afirmacoes foram verificadas agora e quais vieram apenas dos documentos.
