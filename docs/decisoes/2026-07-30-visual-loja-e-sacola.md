---
status: ativo
---
# Visual pela loja publicada e sacola na vitrine (dono, 30/07)

Três decisões do dono em 30/07, depois de ver a v2 dia 2 no ar. Onde esta página
conflitar com a régua de navy de 29/07 (ata da 2ª rodada), esta vence.

## 1. A referência visual agora é a loja publicada

A vitrine e a loja Nuvemshop devem ficar **idênticas em visual**, e a referência
é o que a loja publicada já faz bem: base clara, navy pontual, ouro como detalhe.
Aplicado na vitrine:

- **Announcement** céu claro (`--sky`) com texto navy, como a barra da loja.
- **Footer** replica o rodapé da loja: corpo céu claro com **borda superior
  dourada**, títulos de coluna em serif navy, tagline idêntica à da loja, e
  **faixa legal navy** no pé.
- **Títulos** (`.display`, h1 de PDP) em navy, como o `main-foreground` do tema.
- **Botão primário navy** (era `--ink`), como o botão da loja.
- **Sublinhado dourado** no hover do nav, como o nav da loja.
- Orçamento de navy por página continua valendo como teto; announcement e corpo
  do footer saem da conta porque viraram claros.

Medido da loja no ar em 30/07 (tema Baires, config do lojista): fundo `#f7fbff`,
institucional `#dcebfa`, texto e botões `#0b2360`, acento `#e9c46a`, borda do
footer ouro de 3px, Fraunces + Inter. Bate com os tokens da marca; nenhum token
novo foi preciso.

A continuidade no sentido inverso (ajustes no painel Nuvemshop para fechar o que
falta: header, fontes de título, announcement de lá) segue sendo lote único pós
aceite, executado no painel; o ticket segue bloqueado (ESTADO).

## 2. Fluxo da sacola: adicionar sem sair da vitrine

Confirmação do que a ata de 29/07 já fixava ("Nuvemshop é motor de
carrinho/checkout"), agora com o comportamento exato definido pelo dono:

> O cliente adiciona produtos **pela vitrine mesmo**, e só é direcionado à
> Nuvemshop quando for ao carrinho.

Implementação: a PDP tem um formulário que replica o POST do formulário oficial
da loja (`add_to_cart` + `variation[0]`=tamanho + `variation[1]`=cor +
`quantity`, para `/comprar/`). Com JS, o envio vai para um iframe oculto e o
cliente segue na vitrine, com aviso "na sacola" e contador no header
(espelho em localStorage; a verdade é o carrinho da loja). Sem JS, o POST abre o
carrinho da loja em aba nova, já com o item. O CTA deixou de ser link para a
página do produto na loja.

O iframe funciona porque vitrine e loja são o mesmo site registrável
(`nimbuswear.com.br`), então os cookies de sessão da loja valem no contexto
embutido. **Pendente**: teste de funil em produção (adicionar 2 produtos pela
vitrine publicada e conferir o carrinho) antes de considerar o fluxo aprovado.
Plano B, se o POST embutido falhar no ar: volta o link direto de produto com
`?variant=`.

## 3. Curadoria de fotos por cor: adiada

A curadoria por cor (escolher, entre as fotos existentes da CDN, qual
frente/costas representa cada cor, e o ajuste do hover dos cards) está **fora do
escopo por ordem do dono** (30/07). Nenhuma foto nova de produto está envolvida;
quando reabrir, é só seleção entre as fotos que já existem.

## Relacionados

- `nuvemshop/auditoria/2026-07-29-conselho-vitrine/` (ata e prompt da v2)
- `docs/decisoes/2026-07-29-regra-de-fotos-e-copy-do-site.md`
- `docs/ESTADO.md`
