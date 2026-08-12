---
status: vigente
atualizado: 2026-08-12
---

# Estado do projeto

Só o que é verdade HOJE, por frente, com ponteiro para o detalhe. Leia antes de
agir e atualize ao sair (`npm run sessao:fim` cobra). A crônica de julho a
08/08 está congelada em
[`historico/ESTADO-cronica-2026-07-a-2026-08-08.md`](historico/ESTADO-cronica-2026-07-a-2026-08-08.md).

## Regra de precedência

- Este ESTADO é o índice curto da verdade quente do **projeto** (loja, código,
  medição, produção técnica). Para fato de **negócio** (plataforma POD,
  financeiro, marca, calendário, campanha), a página dona é o
  `estado.md` do brain; este aqui aponta e resume.
- Entre os dois estados, **vence o de data mais nova** — e a divergência é bug
  documental: conserte o outro na mesma sessão, antes de agir.
- Contra qualquer outro documento vale a regra de sempre: documento fora de
  `docs/` que contradiga um de dentro perde.
- Contra o ar, **o ar vence**: confira e corrija o documento.

## Loja e funil (Nuvemshop)

- **A marca ainda não vendeu.** 44 produtos publicados (17 STREET, 25 RELÍQUIA,
  2 NUVEM); os 5 Blusão Moletom fora por falta de tabela de medidas.
- **Funil provado de ponta a ponta desde 03/08**: adicionar funciona nos 44
  (portão `vitrine:variantes` confere), remover pela gaveta da vitrine some do
  carrinho da loja (~15 s de propósito; não conclua falha antes disso).
- Frete: fixo R$19,90; **grátis a partir de R$399,90 com Ecobag de brinde**
  (cupom `ECOBAG`; a régua é total menos UMA ecobag ≥ R$399,90).
- Rodapé consertado no ar em 05/08. **Publicação de CSS/tema tem protocolo
  próprio** (Testar CSS → Publicar → `POST /admin/themes/settings/active/` 200
  → provar em página DYNAMIC): [`fluxos/site-css-e-hover.md`](fluxos/site-css-e-hover.md).
- **Roteiro vigente de consertos de painel:
  [`nuvemshop/consertos-loja-2026-08-08.md`](../nuvemshop/consertos-loja-2026-08-08.md)**
  (o cowork-consertos-painel-2026-08-08 saiu com 3 itens fantasma; a v2 provou
  que eram placeholders `display:none` — PR #60).
- **Ordens do dono de 08/08, no roteiro, aguardando execução no painel**:
  despublicar os 4 legados, remover o telefone dos dados de contato, selo
  powered-by de volta. (O brain de 08/08 as listava como "abertas"; os itens 7
  e 8 do roteiro e o commit #59 registram a decisão.)

## Vitrine e landing (GitHub Pages)

- Vitrine em `nimbuswear.com.br/loja/` é **a referência de design**; a
  Nuvemshop é só o funil (carrinho + checkout). Landing R3F na raiz.
- **Fora do índice do Google por decisão** (`VITRINE_INDEXAVEL = false` até
  haver fotos com modelo): sitemap com 1 URL, `Disallow: /loja/`.
- Rodada Cashvertising no ar (#58): resumos que vendem o fim, garantia no CTA,
  manifesto em duas colunas, pós-compra ligado.
- Ferramenta `/registro-rosto/` no ar (#61): página utilitária de fotos para o
  Soul, sem link de entrada, noindex.
- **Onze portões** (`npm run vitrine:portoes`), monitor diário no Actions, e
  hook de sessão conferindo a sincronia dos 3 repos ao abrir.

## Catálogo e coleções

- **Direção vigente é a de 06/08**
  ([`decisoes/2026-08-06-nova-direcao-colecoes.md`](decisoes/2026-08-06-nova-direcao-colecoes.md)),
  supersede a ordem de 01/08: roupa bonita com Cristo no centro, **estampa
  única por produto**; RELÍQUIA como "documento sagrado" só com material
  original de época; NUVEM celeste com o ichthys; STREET mantida; linha gótica
  sai para coleção futura.
- **Triagem do dono (06/08): 75 estampas → 24 curadas**
  ([`../designs/prontos/TRIAGEM-2026-08-06.md`](../designs/prontos/TRIAGEM-2026-08-06.md));
  tratamento v1 das 40 referências da RELÍQUIA concluído (07/08). A fila
  operacional vive no brain (`wiki/concepts/fila-de-estampas.md`).
- **Capas: o lote de 77 segue REPROVADO (26/07)** e os 77 PNG foram movidos em
  09/08 para `_arquivo-2026-08-09/` (pasta local, fora do git). O compositor
  novo tem 3 pilotos aprovados. **A reconstrução do catálogo agora é parte da
  remontagem na IzzyPrint** — não reconstruir sobre blanks YouDraw.

## Produção (POD) — MIGRAÇÃO DECIDIDA

- **Decisão do dono (07/08, reconfirmada em 11/08): a produção migra para a
  IzzyPrint e a YouDraw está encerrada.** Qualidade das amostras aprovada (o
  único defeito era do nosso chroma verde). O catálogo atual será REMONTADO na
  IzzyPrint: montar produtos, integração com a Nuvemshop (existe, não é API
  pública) e novas fotos. Detalhe e 10 perguntas operacionais enviadas em
  07/08: brain `wiki/entities/izzyprint.md` e `estado.md` do brain.
- **Instabilidade registrada**: os domínios da YouDraw caíram em 09/08
  (evidência no [`plano de 21/07`](../nuvemshop/auditoria/2026-07-21/implementacao/plano-implementacao-e-pendencias-do-dono.md))
  e voltaram em 11/08 (`app.youdraw.com.br` atrás de login). Não dependa deles.
- **Pré-requisitos da remontagem**: refazer artes a 300 DPI
  ([`verdades/receita-export-300dpi.md`](verdades/receita-export-300dpi.md));
  13 das 78 variantes atuais não existem na IzzyPrint (moletom só preto, sem
  Ecobag) e 48 artes passam dos 30 cm do editor público — confirmar limites na
  conta antes de remontar.

## Marca, conteúdo e legal

- **INPI: pedido 944711901 protocolado em 06/08** (NIMBUS nominativa, classe
  25). Acompanhar a RPI semanalmente; exigência formal tem prazo de **5 dias**.
  Detalhe: brain `wiki/concepts/dominio-e-marca.md`.
- **MEI regularizado**, CNPJ 53.977.834/0001-18 no rodapé de todas as páginas.
- **Soul do Roberto treinado (v2)**: o dono é o rosto da marca. Campanha de ads
  em produção na outra máquina (10-11/08): 40 ads v2 + ciclo 3 com 20
  estáticos lookbook e vídeo de 28 s — brain `marketing/2026-08-11-ads-v2/` e
  sínteses de copywriting/ads.
- Calendário que governa tudo: **29/09 (São Miguel, 3 artes já publicadas)** e
  **12/10 (Aparecida + Acutis + Crianças)**. Para vender em outubro, estampa e
  fotos prontas em setembro.

## Medição (GA4)

- `G-E041S3ZHWB` ativo na landing, vitrine e loja, **cross-domain configurado**
  (04/08). Plano de eventos: [`fluxos/tracking-plan.md`](fluxos/tracking-plan.md)
  (portão `vitrine:tracking`).
- Pende: pedido-teste no DebugView (**só o dono executa pedido**), filtro de IP
  interno (1 min, precisa do IP do dono) e metas de 29/09 e 12/10 a preencher.

## Pendências, em ordem

1. **Frente IzzyPrint** (a que destrava tudo): respostas das 10 perguntas,
   produtos-teste, integração, limites de área na conta.
2. **Artes a 300 DPI na direção de 06/08** — pré-requisito da remontagem.
3. **Fotos (Soul/modelo) → abrir venda** a tempo de 29/09 e 12/10.
4. Decisões abertas do dono: 4 legados compráveis, telefone no rodapé, selo
   powered-by.
5. Pedido-teste GA4 no DebugView (dono) + filtro de IP.
6. Reconciliar o 352727892 (Aparecida Spray | Moletom Canguru): título e fotos
   ainda de "Blusão sem capuz"; produto Oculto no painel desde 03/08.
7. Reabrir a vitrine ao índice (`VITRINE_INDEXAVEL`) quando houver fotos com
   modelo; Search Console espera o Google do dono.

## Limites que não mudam

Nada é publicado sem autorização explícita, produto a produto. Não mexer em
preço, custo, domínio, checkout, dados legais, integração POD, produtos ou
variantes. Não executar pedido pago. Repo público: nunca expor dado pessoal,
senha, cookie ou token.
