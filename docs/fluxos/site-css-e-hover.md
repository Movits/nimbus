---
status: vigente
atualizado: 2026-08-03
---

# Fluxo: CSS, hover e layout da loja

> [!info] Atualizado em 2026-08-03: o mecanismo de hover por par de cores foi
> REMOVIDO em 28/07. A loja usa o hover nativo do tema Baires, e os cards da
> vitrine (`public/loja/`) ficam sem hover de troca de cor desde 30/07, para não
> piscar cor errada (curadoria por cor adiada pelo dono; o hover vigente da
> vitrine mostra a segunda foto da mesma cor). As partes de CSS deste fluxo
> seguem válidas; as seções de hover marcadas abaixo valem só como histórico.

Tema **Baires**, plano Impulso. A Nuvemshop **sanitiza CSS**, então igualdade
byte a byte não prova publicação correta: compare o CSS servido pela loja com o
local. Evite `var()` sem fallback.

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
