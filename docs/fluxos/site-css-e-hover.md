---
status: vigente
atualizado: 2026-08-11
---

# Fluxo: CSS, hover e layout da loja

> [!info] Atualizado em 2026-08-03: o mecanismo de hover por par de cores foi
> REMOVIDO em 28/07. A loja usa o hover nativo do tema Baires, e os cards da
> vitrine (`public/loja/`) ficam sem hover de troca de cor desde 30/07, para não
> piscar cor errada (curadoria por cor adiada pelo dono; o hover vigente da
> vitrine mostra a segunda foto da mesma cor). As partes de CSS deste fluxo
> seguem válidas; as seções de hover marcadas abaixo valem só como histórico.

Tema **Baires**, plano Impulso, **congelado** (sem atualização automática).
A Nuvemshop **sanitiza CSS**, então igualdade byte a byte não prova publicação
correta. Evite `var()` sem fallback (o painel remove custom properties).

## Publicar CSS no painel — protocolo vigente (05/08)

**O CSS da loja NÃO sobe por Git.** Cola-se à mão no painel, em **Loja online →
Layout → Edição de CSS avançada**. O arquivo canônico a colar é
`nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css` (regenerado; as
fontes de 16-17/07 não se colam isoladas).

Sequência que grava de verdade, medida em 05/08:

1. `npm run loja:css` ANTES de qualquer colagem (simula o minificador do painel).
2. Backup: copie o conteúdo atual do campo antes de sobrescrever.
3. Colar o arquivo canônico (Ctrl+V real).
4. **Testar CSS** — é isso que "suja" o formulário; sem `form-dirty`, o botão
   Publicar é um **no-op** que só dispara analytics.
5. **Publicar alterações** e conferir na REDE o
   `POST /admin/themes/settings/active/` com **200**. Sem esse POST, não gravou.
6. Provar numa página **DYNAMIC** que não passa pela borda de cache, por exemplo
   `/search/?q=aleatorio`, servindo o conteúdo novo. **Verificação dentro do
   editor não prova nada**: o textarea guarda rascunho local que sobrevive a
   reload na mesma aba, e a home fica horas atrás de cache.

Armadilhas conhecidas (ESTADO de 03-05/08): **escape seguido de caractere
hexadecimal é inusável** (o painel come o espaço delimitador E os zeros à
esquerda — `\00000A` NÃO resolve); **publicar qualquer seção do editor de tema
regrava o formulário inteiro**, então o CSS se cola por último na sessão; o
painel remove custom properties (só `var()` com fallback sobrevive).

## Comportamento aprovado dos cards

> [!warning] Superado (ver o aviso de 2026-08-03 no topo): a troca de cor no
> hover descrita abaixo foi removida em 28/07 e não existe na loja nem na
> vitrine.

- **Uma cor:** a capa lifestyle permanece no hover, no máximo zoom discreto.
  Nunca revelar o mockup plano da YouDraw na grade.
- **Mais de uma cor:** troca entre as capas lifestyle das cores reais, e a troca
  tem que ler como mudança de cor — ver [`par-de-cor.md`](par-de-cor.md).
- Transição fluida, sem blink.

## Arquivos

- `nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css` e `.entry.css`
- `nuvemshop/css-nimbus-responsive-header-footer-2026-07-20.css`
- `scripts/build_nimbus_publication_css.mjs`
- `scripts/qa_nimbus_live_responsive.cjs`
- `scripts/verify-hover-live-products.mjs` (verificava o hover por par de cores,
  removido em 28/07; vale só como histórico)

Não cole arquivo de 16 ou 17/07 sem antes conferir a composição de 20/07.

## QA

As rodadas de QA gravam screenshots e `metrics.json` em `nuvemshop/qa/`. Os
perfis de Chrome que elas criavam foram apagados em 26/07 — eram 5,4 GB e
continham `Login Data` e `Cookies`. Se voltar a rodar QA com perfil, aponte para
fora do repositório.
