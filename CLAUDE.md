# NIMBUS

Marca brasileira de streetwear católico premium, produção sob demanda pela
YouDraw, loja na Nuvemshop (plano Impulso, tema Baires).

## Leia isto e mais nada

👉 **[`docs/00-COMECE-AQUI.md`](docs/00-COMECE-AQUI.md)**

É o roteador do projeto: ache a sua tarefa e vá direto ao fluxo. Depois dele,
`docs/ESTADO.md`, que é a única parte que envelhece rápido.

Não leia o projeto inteiro. Ele tem três auditorias invalidadas e dois métodos de
geração superados, todos preservados como histórico — e foi exatamente instrução
antiga sobrevivendo que sequestrou uma auditoria nova em 26/07.

**Se um documento fora de `docs/` contradisser um de dentro, o de dentro vence.**
Todo documento tem `status:` no topo; sem status, trate como suspeito.

A versão anterior deste arquivo, com o histórico longo, está em
`docs/historico/CLAUDE-2026-07-25.md`.

## Os três repositórios

```
nimbus/          PÚBLICO   código, documentação, medições, receitas
nimbus-assets/   PRIVADO   artes, blanks e capas (+ capas IA aprovadas)
nimbus-brain/    PRIVADO   segundo cérebro (wiki) + credenciais
```

Clone lado a lado. Sessão nova (qualquer conta): seção "Nova sessão" do
[`docs/00-COMECE-AQUI.md`](docs/00-COMECE-AQUI.md). Detalhe em
[`docs/REPOSITORIOS.md`](docs/REPOSITORIOS.md).

## Marca

Fé reverente, design autoral, brasilidade e acabamento premium. Céu, nuvens,
concreto branco modernista, luz e atmosfera editorial.

Paleta: navy `#0b2360`, ouro `#e9c46a`, azul-céu `#8fc1ea`, céu claro `#dcebfa`,
branco-nuvem `#f7fbff`, texto `#1b2733`. Títulos Fraunces/Georgia, corpo Inter.

Tom curto, humano, específico e reverente. **Sem travessão em copy pública.**

10% do lucro de cada pedido vai para um projeto social escolhido pelo cliente,
após custos e o prazo de arrependimento, com repasse mensal e comprovação.

## Endereços

Landing <https://nimbuswear.com.br/> · Loja <https://loja.nimbuswear.com.br/> ·
Produção <https://dashboard.youdraw.com.br/> · `nimbuswearbr@gmail.com` ·
`NimbusWear.br` no Instagram e TikTok.

A landing é publicada pelo GitHub Pages a partir deste repositório. **A Nuvemshop
não faz deploy por Git**: a loja publicada e o painel são a fonte de verdade da
loja. A YouDraw é a fonte de verdade de produto-base, arte, posição e produção.

## Limites

Nada é publicado sem autorização explícita, produto a produto. Não mexa em preço,
custo, domínio, checkout, dados legais, integração YouDraw, produtos ou
variantes. Não execute pedido pago.

Este repositório é **público**: nunca exponha CPF, endereço, senha, cookie, token
ou dado de cliente.

## Verificações iniciais

```bash
git status -sb && git pull --ff-only
npm run typecheck
node scripts/geometry/validate.mjs      # 38.880 casos, tem que passar
node scripts/producao/inventario.mjs
```
