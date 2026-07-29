---
status: vigente
atualizado: 2026-07-28
---

# Estado do projeto

Esta é a única página que envelhece rápido. Leia antes de agir e atualize ao sair.

## Sequenciamento vigente (29/07, ordem do conselho da 2ª rodada)

Máximo 3 frentes ativas, nesta ordem:
1. **Vitrine v2** (`public/loja-preview/`): timebox de 5 dias úteis; se estourar, corta-se
   escopo visual, nunca funil nem medição. Ata e prompt em
   `nuvemshop/auditoria/2026-07-29-conselho-vitrine/`.
2. **Capas de produto**: reconstrução com o compositor novo (6 suspeitos + 4 sem torso primeiro).
3. **Avaliação IzzyPrint** (amostras Boxy + Oversized + Canguru em G; aguarda WhatsApp).

**Bloqueado até nova ordem**: ticket Nuvemshop do script onload (retirado em 29/07).
**Bloqueador de lançamento oficial da vitrine como loja**: dono ainda não tem empresa
registrada; o bloco de identificação do rodapé (CDC) fica pendente até existir CNPJ/MEI.

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

**Próximo passo:** varrer as 77 receitas atrás de `torso` e `centro` errados, e
reconstruir o catálogo uma capa por vez. Um agente já encontrou que a receita do
352718999 usava `torso 0.44`, que é a largura **manga a manga** — dobrava o raio
da malha e achatava a estampa. É provável que o vício se repita.

## Reavaliação de plataforma e modelos (28/07)

O dono avalia **migrar da YouDraw para a IzzyPrint** (<https://izzyprint.com.br/>).
Plano: criar produtos-teste na IzzyPrint, **comprar amostras** e julgar a
qualidade; só então decidir migração, integração com a Nuvemshop (existe, mas
não é API pública — foi confirmada com eles por contato direto) e novas fotos.
Nada foi migrado ainda; a YouDraw segue sendo a produção vigente.

Decisões do dia:

- **Modelos oficiais = casting de 16/07** (Caio, Clara, Gabriel e Helena), em
  `nimbus-assets/casting/2026-07-16/`. Os **149 blanks antigos** (modelos
  avulsos por produto, base YouDraw) foram **removidos** do assets: eram de
  produtos que não vamos usar. Recuperáveis pelo histórico do git. O fluxo
  blank + arte + receita continua válido — será refeito sobre a base nova
  quando a plataforma estiver decidida.
- **Varredura das 77 receitas feita** (`2026-07-28-varredura-receitas.md`): 6
  torsos suspeitos, 4 sem torso. Vale como histórico de medição; a
  reconstrução aguarda a decisão de plataforma.
- **Nenhuma arte chega a 300 DPI** no tamanho em que imprime
  (`2026-07-28-dpi-artes.md`): padrão de export foi 3500 px para 40 cm =
  222 DPI. Para POD premium (IzzyPrint recomenda 300), as artes precisam de
  re-export/regeneração a 4724 px de altura, ou vetorização. A IzzyPrint
  também limita 30×40 cm no editor público, e temos costas de até 35,2 cm —
  confirmar o limite do fluxo POD na conta.

## Medições fechadas

- Placement por produto, régua-pela-arte sobre os 48 mockups oficiais.
- Datum resolvido: a "altura" da tabela YouDraw é **gola→barra**.
- Horizontal: a arte é centrada no produto, mediana de desvio **0%**.
- Comprimento do Blusão: 78,4 cm, **estimado**, com a ressalva registrada.
- 352727892 reclassificado de Blusão para Moletom Canguru.

## Pendências do projeto

0. **Avaliar a IzzyPrint**: produtos-teste na conta do dono, compra de
   amostras, tabela de custos POD, integração Nuvemshop, área máxima de
   estampa e white label. Se aprovada: refazer artes a 300 DPI, novos blanks
   com o casting e integração.
1. Reconstruir o catálogo com o compositor novo (aguarda a decisão de
   plataforma).
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
