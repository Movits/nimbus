---
status: concluido
atualizado: 2026-08-11
---
# Respostas do dono às perguntas da 3ª rodada do conselho (2026-07-30)

Registradas na conversa, com o que foi executado em seguida.

> [!info] 11/08: registro de época, pauta executada. O que envelheceu: o GA4
> tem ID (`G-E041S3ZHWB`) e está no ar com cross-domain desde 03-04/08; o CNPJ
> deixou de ser bloqueador em 31/07 (MEI regularizado, no rodapé); e qualquer
> menção a frete grátis de R$199 morreu em 31/07 (regra vigente: R$399,90 com
> Ecobag). Estado vivo em `docs/ESTADO.md`.

1. **GA4**: o dono não sabia qual ID gerar; instruções entregues no chat (criar
   propriedade GA4 e copiar o ID de métricas G-XXXXXXXXXX). O snippet já está
   pronto no `build-paginas.mjs` (constante `GA4_ID`, vazia); a página de
   privacidade foi publicada ANTES, como o conselho exigiu. Falta só colar o ID.
2. **Fórmula dos 10%**: lucro = o que sobra do pedido depois de todos os custos
   (produção, embalagem, frete, taxas, divulgação). O dono questionou se a
   fórmula precisa aparecer no site; a recomendação do conselho (Dra. Renata:
   claim sem lastro é risco CDC art. 30; Marina/Tiago: prova é o diferencial)
   prevaleceu na forma mínima: um parágrafo honesto em `/loja/impacto/`, sem
   contabilidade aberta. Sujeito a ajuste ou veto do dono.
3. **Troca de tamanho**: a YouDraw não tem política de troca; é responsabilidade
   da NIMBUS. A página `/loja/trocas/` promete apenas o que se pode honrar:
   arrependimento de 7 dias (CDC art. 49), defeito em 90 dias (art. 26), e
   tamanho errado tratado caso a caso por e-mail, sem promessa de reprodução
   gratuita.
4. **Recortes parciais da arte**: DESCARTADO pelo dono em 30/07, depois da
   explicação técnica ("não existe ver sem poder baixar"; a proteção real é o
   teto de 900 px). Decisão: sem zoom de arte; as PDPs usam só as imagens de
   produto da fornecedora e, no futuro, as fotos com modelos. O item sai do
   backlog.
5. **Sessão de fotos reais**: quando houver caixa para contratar. O dono
   **aceita ser o rosto da marca**: quer entrar no roster junto aos modelos do
   casting e posar nas fotos criadas com IA vestindo as peças. Complementa a
   decisão de 29/07 (dono como modelo em rodada futura, mesma luz e cenário
   canônicos, política de transparência sobre IA a definir antes).

## Executado com o go do dono ("legal pode corrigir")

- **P0-1**: `lint-copy`, `link-check` (interno) e `parity-tokens` agora rodam no
  workflow de deploy e derrubam a publicação se falharem.
- **P0-3 parcial**: `/loja/trocas/` e `/loja/envios/` publicadas; CNPJ segue como
  bloqueador de lançamento (sem empresa registrada).
- **P0-4**: `/loja/impacto/` publicada com a fórmula do dono, os 3 projetos e o
  Diário de Repasses (vazio e honesto até a primeira venda). Announcement, home
  e PDPs linkam para ela.
- **P0-5**: Instagram e TikTok clicáveis no footer da vitrine; Ajuda do footer
  aponta para as páginas próprias.
- **P0-2 preparo**: `/loja/privacidade/` publicada; snippet GA4 inerte à espera
  do ID.
