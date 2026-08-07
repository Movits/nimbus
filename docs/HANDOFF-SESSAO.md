---
status: vigente
atualizado: 2026-08-07
substitui: HANDOFF-CONTA-NUVEM.md
---

# Handoff para uma sessão nova

Cole o bloco abaixo como **primeira mensagem** de uma sessão nova do Claude
Code. Ele é escrito para o agente, não para você.

A parte de baixo, depois da segunda linha divisória, é a **nota para o dono** e
não deve ser colada.

---

Você assume o projeto NIMBUS, marca brasileira de streetwear católico premium,
com produção sob demanda pela YouDraw e loja na Nuvemshop (plano Impulso, tema
Baires). A marca **ainda não vendeu**: está em pré-lançamento, com 44 produtos
publicados e o funil de compra recém-provado de ponta a ponta.

## 1. Bootstrap

São **três** repositórios, clonados lado a lado:

```bash
git clone https://github.com/Movits/nimbus.git
git clone https://github.com/Movits/nimbus-assets.git
git clone https://github.com/Movits/nimbus-brain.git
cd nimbus && npm install
node scripts/setup-assets.mjs
```

- `nimbus` — **público**. Código, documentação, medições, receitas. Nunca
  exponha aqui CPF, endereço, senha, cookie, token ou dado de cliente.
- `nimbus-assets` — **privado**. Artes, blanks, capas e o backup do tema da
  loja. Sem ele você não compõe imagem nenhuma.
- `nimbus-brain` — **privado**. O segundo cérebro do negócio: wiki em markdown
  com calendário, personas, precificação, decisões e a pasta fiscal.

O `setup-assets.mjs` mescla as árvores do público e do privado (copia só o que
falta, é idempotente). Sem ele os caminhos `designs/prontos/...` não existem.

Se o clone de um privado falhar por autenticação, peça ao dono para conectar a
conta GitHub `Movits` nesta sessão. **Não peça, não receba e não guarde token em
texto.**

## 2. Roteiro de leitura, nesta ordem e só isto

No `nimbus`:

1. `CLAUDE.md`
2. `docs/00-COMECE-AQUI.md` — o roteador. Ache a sua tarefa e vá direto ao fluxo.
3. `docs/ESTADO.md` — a única página que envelhece rápido. **Leia até o fim**:
   o bloco da vitrine é cronológico e corrige a si mesmo, então a linha de cima
   pode estar revogada trinta linhas abaixo.

No `nimbus-brain`:

4. `CLAUDE.md` — o schema do vault, que é obrigatório para escrever nele.
5. `index.md` → `estado.md` → as últimas ~10 entradas do `log.md`.

**Não leia o projeto inteiro.** Ele guarda três auditorias invalidadas e dois
métodos de geração superados, todos preservados como histórico. Foi exatamente
instrução antiga sobrevivendo que sequestrou uma auditoria nova em 26/07. Nada
de `docs/historico/` deve ser seguido.

Regra de precedência: **documento fora de `docs/` que contradiga um de dentro
perde**. Todo documento tem `status:` no topo; sem status, trate como suspeito.

## 3. Onde mora cada tipo de verdade

| Você precisa de | Vá para |
|---|---|
| Número de peça, medida, placement, catálogo | `docs/verdades/` |
| Como se faz alguma coisa (capa, CSS, publicação) | `docs/fluxos/` |
| Uma decisão datada do dono | `docs/decisoes/` |
| O que os instrumentos **não** enxergam | `docs/verdades/limites-conhecidos.md` |
| Negócio, calendário, personas, concorrentes, fiscal | `nimbus-brain/wiki/` |

`docs/verdades/limites-conhecidos.md` é a página mais importante do projeto.
Leia antes de confiar em qualquer número.

## 4. Os portões

Um comando roda todos:

```bash
npm run vitrine:portoes
```

Sete portões, e **cada um nasceu de um bug real que passou**:

- `vitrine:lint` — copy pública: sem travessão, frase dos 10% no fim de toda
  descrição, régua `Arte | Peça`.
- `vitrine:claims` — promessa sem lastro: frete grátis sem a condição na mesma
  página, overclaim, imagem de CDN acima do teto, JSON-LD divergindo do catálogo.
- `vitrine:tokens` — paridade dos tokens `:root` entre vitrine e landing.
- `vitrine:links` — links das páginas geradas.
- `vitrine:variantes` — **o que a vitrine POSTa contra o que a loja aceita**,
  nos 44 produtos. Nasceu em 02/08 do bug da Ecobag, que mandava dois eixos de
  variante para um produto que só tem um, e voltava o cliente para uma sacola
  vazia sem erro na tela.
- `docs:links` — todo endereço escrito em markdown nos três repositórios.
  Nasceu de eu ter mandado o dono abrir um host que não existe. Exceções em
  `scripts/link-check-docs.allow.json`, uma por vez e com motivo escrito.
- `loja:css` — todo `content:` dos CSS da loja **sobrevive ao minificador do
  painel**. Nasceu do `ਐ` do rodapé.

Mais dois, fora do conjunto:

```bash
npm run typecheck
node scripts/geometry/validate.mjs      # 38.880 casos, tem que passar
```

**Nunca rebaixe um portão para informativo.** Cinco dos sete defeitos
catalogados do projeto nasceram disso.

## 5. O estado, em cinco frases

**A loja ainda não vendeu.** O catálogo publicado tem 44 produtos (17 STREET, 25
RELÍQUIA, 2 NUVEM); os 5 Blusão Moletom estão fora por falta da tabela de
medidas da YouDraw.

**O funil está provado de ponta a ponta desde 03/08.** Adicionar à sacola
funciona nos 44 produtos, com portão automático conferindo, e remover um item
pela gaveta da vitrine some do carrinho da loja. A remoção leva ~15 segundos;
quem conferir rápido demais conclui que falhou.

**As coleções mudaram de eixo em 06/08:** a direção do dono é "roupa bonita,
Cristo no centro, estampa por produto". A triagem dele cortou 75 estampas para
**24 curadas**, a RELÍQUIA passou a aceitar só material original de época, e a
linha gótica saiu para uma coleção futura. O detalhe vivo está em
`docs/decisoes/` (entradas de 06/08) e na fila de estampas do brain.

**A marca foi depositada no INPI em 06/08**: NIMBUS nominativa, classe 25,
pedido 944711901. Os prazos que valem a partir daí estão em
`nimbus-brain/wiki/concepts/dominio-e-marca.md`.

**O MEI está regularizado**, com R$ 2.520,88 em aberto e caminho de parcelamento
definido. Detalhe em `nimbus-brain/financeiro/`.

Estas frases envelhecem. Se algo aqui contradisser o `ESTADO.md` ou o
`estado.md` do brain, **eles vencem**: são as páginas que toda sessão atualiza.

## 6. Para onde vamos

A peça da NIMBUS é compra de ocasião, não de repetição. O calendário
(`nimbus-brain/wiki/concepts/calendario.md`) governa o plano, e a frase que
resume tudo é: **para vender em outubro, a estampa e a sessão de fotos precisam
estar prontas em setembro.**

- **29/09, São Miguel Arcanjo** — a maior data do catálogo atual, e **não exige
  arte nova**: são 3 artes já publicadas.
- **12/10** acumula Aparecida, a morte de Carlo Acutis e o Dia das Crianças.
  Some numa campanha só. 2 artes de Aparecida já existem.
- O caminho crítico é: estampas na direção nova → fotos com modelo → abrir venda.

A direção vigente das coleções é a de **06/08**
(`docs/decisoes/2026-08-06-nova-direcao-colecoes.md`), que **supersede a ordem
de 01/08**: o foco é roupa bonita com Cristo no centro, estampa única por
produto, RELÍQUIA como "documento sagrado" com material real de época, NUVEM na
chave celeste com o ichthys, STREET mantida. A fila operacional está em
`nimbus-brain/wiki/concepts/fila-de-estampas.md`.

## 7. Limites que não se negociam

**Nada é publicado sem autorização explícita, produto a produto.** Não mexa em
preço, custo, domínio, checkout, dados legais, integração YouDraw, produtos ou
variantes. Não execute pedido pago.

O `nimbus` é público: nunca exponha CPF, endereço, senha, cookie, token ou dado
de cliente.

**Tom da marca:** curto, humano, específico e reverente. **Sem travessão em copy
pública.**

## 8. O que aprendi na marra, e que não está em doc nenhum

Isto existe para você não repetir erro que já custou tempo:

- **A URL do carrinho é `/comprar/`, não `/cart`.** O `/cart` responde 200 e
  devolve outra página. Eu concluí errado, por causa disso, que o tema publicado
  tinha divergido do backup.
- **A loja escreve a variante como `(GG, Preta)`**: parênteses, **tamanho antes
  da cor**, vírgula. Não é `Preta / G`.
- **O painel da Nuvemshop é <https://loja.nimbuswear.com.br/admin>**, no domínio
  da própria loja. **Não existe `dashboard.nuvemshop.com.br`**; eu inventei esse
  host e o dono bateu num `ERR_CONNECTION_TIMED_OUT`.
- **A Nuvemshop não tem editor de código no navegador.** A documentação deles
  manda usar cliente de FTP; o botão "Editar o código" só entrega servidor,
  porta e usuário.
- **O `option batch abort` do WinSCP não protege contra prompt de senha.** Ele
  suprime confirmações, não credenciais.
- **`core.autocrlf = true` no Windows** faz o `cart.tpl` do clone dar 10.496
  bytes e um MD5 diferente sem que a versão esteja errada. Extraia do git.
- **O minificador do painel come o espaço que delimita um escape de CSS.** Por
  isso `\A 10%` virou `ਐ%`. O conserto é escrever `\00000A`, seis dígitos, que
  dispensa delimitador.
- **O botão "Publicar alterações" do editor de tema é um no-op quando o
  formulário não está sujo.** Sem `form-dirty`, o clique dispara só analytics e
  nenhum POST de gravação; pior, o textarea guarda rascunho local que sobrevive
  a reload na mesma aba, então "recarreguei e o valor persistiu" é miragem. O
  fluxo que grava de verdade: colar → **Testar CSS** (suja o formulário) →
  Publicar → conferir na rede o `POST /admin/themes/settings/active/` com 200.
  Foi isso, e não cache, que segurou o rodapé quebrado até 05/08. Registro
  completo no `ESTADO.md`.

A lição geral, que o dono cobrou com razão: **confira antes de afirmar.** Se
você vai mandar alguém abrir um endereço, abra primeiro.

## 9. O que este ambiente consegue e o que não consegue

Medido, não suposto:

- **Numa sessão na nuvem:** o Chromium não atravessa o proxy e o POST para a
  loja é barrado por Cloudflare. Dá para ler a loja publicada com `curl` (GET
  funciona), mas **o teste de carrinho não é executável de lá**.
- **Numa sessão local**, na máquina do dono, você tem o sistema de arquivos e o
  terminal dele, e consegue rodar o `winscp.com` em modo console para editar o
  tema por FTP.
- **O clique de publicar no painel da Nuvemshop não é seu**, em nenhum dos dois
  casos. É do dono, ou do Cowork com permissão de navegador para
  `nimbus40.lojavirtualnuvem.com.br`.

Quando a tarefa depende da máquina ou do navegador logado do dono, o entregável
certo é **um prompt para o Cowork**, não uma tentativa sua. Os prompts já
escritos ficam em `nuvemshop/cowork-*.md` e
`../nimbus-assets/nuvemshop/tema-baires/cowork-*.md`, e servem de modelo: eles
sempre trazem regras que não se negociam, backup antes de sobrescrever, um ponto
de parada explícito e um relatório final com o que anotar.

## 10. A sua primeira tarefa

1. Rode o bootstrap e o roteiro de leitura acima.
2. Rode `npm run vitrine:portoes` para saber se a base está sã.
3. Vá à seção **Pendências** do `docs/ESTADO.md` e à fila de estampas do brain,
   e continue do caminho crítico dali: estampas das coleções na direção de
   06/08 → fotos com modelo → abrir venda a tempo de 29/09 e 12/10. Se algo
   nas pendências contradisser o que você viu no ar, o ar vence: confira e
   corrija o documento antes de trabalhar.

## 11. Ritual de saída

Toda sessão relevante termina assim:

1. `npm run vitrine:portoes`, `npm run typecheck` e a validação de geometria.
2. `docs/ESTADO.md` atualizado, porque é a página que a próxima sessão vai ler.
3. No brain: `estado.md` se algum fato vivo mudou, e **append** no `log.md` com
   `## [YYYY-MM-DD] <op> | <título>`.
4. Commit e PR em rascunho nos repositórios tocados.

---

## Nota para o dono (não colar)

### Autonomia

Este bloco entrega à sessão nova **a mesma autonomia que você me deu**: ela
decide, conserta, commita, abre PR, mescla e publica na landing e na vitrine,
sem perguntar a cada passo. Continua proibida de mexer em preço, produto,
variante, checkout e dado fiscal, e de publicar produto sem sua ordem.

Se quiser uma sessão mais contida, troque o passo 11 por "abre PR em rascunho e
não mescla".

### Como dar acesso aos repositórios privados

O acesso é do **GitHub**, não da conta Claude. Os três repositórios pertencem à
conta `Movits`, que é a sua. Na sessão nova, conecte a integração do GitHub com
essa conta e ela enxerga os três; nenhum convite é necessário.

Token pessoal é o último recurso. Se precisar, crie um *fine-grained token* com
acesso só ao repositório em questão, permissão **Contents: Read-only** e
validade curta. Cole direto na sessão e **nunca o commite**.

### Por que o Google Drive ficou de fora

Decisão de 26/07, e continua valendo para arte: o conector entrega arquivo
passando pelo contexto da conversa, o que inviabiliza arte de 30 MB, e duas
fontes sincronizadas foi como nasceram os dois CSV rivais de medidas que
sequestraram uma auditoria inteira. O Drive segue em uso para documento fiscal,
que é pequeno e não é fonte de verdade de produção.
