---
status: vigente
atualizado: 2026-08-13
---

# Fluxo: de-para de produção Nuvemshop → IzzyPrint (repasse manual)

A integração IzzyPrint↔Nuvemshop existe, mas **só liga com volume mínimo de 5
peças/dia** (Sablina, 11/08, em `Nimbus brain/wiki/entities/izzyprint.md`). Até
lá o pedido cai na loja, o dono paga na IzzyPrint e eles produzem e enviam.
Este documento é a mesa de repasse: qual peça deles corresponde à nossa, qual
arte sobe, em que vista, em que tamanho, e o que fazer na ordem certa.

> [!warning] Este documento **não autoriza nada**. Não muda preço, checkout,
> painel, produto nem variante. É consulta na hora de repassar um pedido pago.

## Quatro coisas que precisam estar claras antes de usar

**1. O catálogo publicado hoje vai ser remontado.** Os 44 produtos no ar foram
montados na YouDraw. A migração para a IzzyPrint foi decidida em 07/08 e
reconfirmada em 11/08. Esta tabela serve para o caso concreto: **entrou pedido
agora, num dos 44 produtos publicados, e ele precisa sair**. Ela não é o plano
do catálogo novo.

**2. A maioria das artes não está mais no disco.** A triagem do dono de 06/08 e
a de 12/08 tiraram do working tree os arquivos de 16 das 21 artes publicadas.
Todos são recuperáveis pelo git — a seção "Recuperar uma arte que saiu do
disco" traz o commit de cada uma. **Nenhuma arte atual chega a 300 DPI** no
tamanho de impressão; a mesa de retrabalho está em
`nimbus-assets/designs/_retrabalho-2026-08/`.

**3. A Ecobag SAI do catálogo** (decisão do dono de 13/08,
`docs/decisoes/2026-08-13-ecobag-status-e-ordem-do-lancamento.md`). A IzzyPrint
não fabrica ecobag, nem sob encomenda (dono, 07/08). Se um pedido de Ecobag
entrar antes de o produto sair do ar, ele **não tem para onde ser repassado**.

**4. O cliente não vê status de produção.** Na Nuvemshop o pedido é
"Preparando seu pedido" e depois enviado, com rastreio. Nunca "em produção",
"na fila de impressão" ou equivalente.

---

## 1. Peça a peça

Nomes comerciais da IzzyPrint lidos no site em 28/07
(`nuvemshop/auditoria/2026-07-28-izzyprint-dossie.md`). Medidas deles em
`nuvemshop/auditoria/2026-07-28-medidas-izzyprint.json` (largura × comprimento,
em cm, faixa publicada por tamanho). Medidas nossas em
`docs/verdades/medidas-pecas.md`.

### Camiseta Premium → **Camiseta Clássica**

19 produtos publicados, 30 pares peça-cor, 150 SKUs.

| Tamanho | NIMBUS (YouDraw) | IzzyPrint Clássica | Leitura |
|---|---|---|---|
| PP | não temos | 48–51 × 66–68 | grade nova disponível |
| P | 49,5 × 70,5 | 51–53 × 68–70 | deles mais largo, mais curto |
| M | 52,5 × 72 | 53–55 × 70–72 | equivalente |
| G | 54 × 75,5 | 55–57 × 72–74 | +4% largura, −3% comprimento |
| GG | 60,5 × 81,5 | 57–59 × 74–76 | **deles bem menor (−5% / −8%)** |
| EG | 63 × 85 | 59–61 × 76–79 | **deles bem menor (−5% / −10%)** |
| G1 | não temos | 61–63 × 79–81 | ≈ o nosso GG |

⚠️ **Do GG para cima a grade deles corre menor que a nossa.** Quem comprar GG
ou EG confiando na tabela publicada na loja recebe peça menor. Enquanto a
tabela de medidas da página de produto não for trocada, **repassar GG e EG
exige atenção**: o mais próximo do nosso GG é o **G1 deles**, e o nosso EG não
tem par exato. Qual letra usar é decisão do dono, não deste documento.

**Cores.** A Clássica tem 9 cores no site deles, só nomes comerciais, sem hex
nem Pantone. Precisamos de **Preta** e **Branca**. Os nomes exatos das duas:
**a confirmar com a IzzyPrint**.

### Camiseta Oversized Premium → **Camiseta Oversized Street**

16 produtos publicados, 28 pares peça-cor, 140 SKUs.

| Tamanho | NIMBUS (YouDraw) | Tamanho IzzyPrint de medida equivalente |
|---|---|---|
| P 62 × 78 | | **GG** (62–64 × 76–78) |
| M 64 × 80 | | **EG** (64–66 × 78–80) |
| G 66 × 82 | | **G1** (66–68 × 80–82) |
| GG 68 × 84 | | **G2** (68–70 × 82–84) |
| EG 70 × 86 | | **G3** (70–72 × 84–86) |

⚠️ **A grade do Oversized deles corre dois tamanhos abaixo da nossa.** Pela
medida publicada, o nosso P é o GG deles, e assim por diante, com encaixe
limpo em toda a régua. Isso é comparação de duas tabelas publicadas por
fornecedores diferentes, não medição de amostra: **conferir na amostra física
antes de fixar a régua**, e a decisão da letra é do dono. Se a letra for
repassada ao pé da letra (P → P), o cliente recebe uma peça 7 cm mais estreita
do que a que comprou.

A grade deles vai até **G4** (72–74 × 86–88), acima de qualquer tamanho nosso.

**Cores.** 8 cores no site (28/07). Precisamos de **Preta** e **Off-White**.
Existir off-white/natural na grade deles: **a confirmar com a IzzyPrint**.

> [!warning] Conflito de fonte sobre cores: a leitura do HTML em 28/07 anotou
> "Oversized Street, sem nenhum azul"; o relato do dono em 06/08, com as
> amostras em mãos, fala em "vermelho, dois azuis, sem marrom nem cinza". A
> lista de cores por peça, com nome exato, é **a confirmar com a IzzyPrint** —
> não use nenhuma das duas versões como verdade.

### Moletom Canguru → **Moletom Canguru**

8 produtos publicados, 13 pares peça-cor, 65 SKUs.

| Tamanho | NIMBUS (YouDraw) | IzzyPrint Canguru | Leitura |
|---|---|---|---|
| P | 52 × 60 | 54–56 × 73–75 | +13 cm de comprimento |
| M | 55 × 64 | 56–58 × 75–77 | +12 cm |
| G | 58 × 65 | 58–60 × 77–79 | largura igual, **+20% de comprimento** |
| GG | 61 × 65 | 60–62 × 79–82 | +15 cm |
| EG | 69 × 70 | 62–65 × 82–85 | deles mais estreito e mais longo |
| G1 | não temos | 68–71 × 72–75 | ⚠️ erro na fonte deles |

⚠️ **O canguru deles é ~20% mais comprido.** Como o datum de placement é
gola→barra, os números de gola→topo da arte da tabela de repasse **não valem
para o moletom da IzzyPrint**: precisam ser re-medidos na peça deles antes do
primeiro moletom sair. Enquanto não forem, use os valores como piso e
confirme no editor com a régua da peça deles.

⚠️ A tabela publicada deles traz o **G1 mais curto que o P** (72–75 contra
73–75). É erro de fonte, sinalizado desde 28/07 e ainda **a confirmar com a
IzzyPrint**.

**Cores. O moletom da IzzyPrint só existe em PRETO** — nos dois modelos, e
**não fazem sob encomenda** (dono confirmou em 07/08; a pergunta está fechada,
não voltar a mandá-la). Ver as órfãs na seção 2.

### Blusão Moletom → **Moletom Careca**

**Fora do catálogo publicado hoje** (os 5 produtos estão despublicados por
falta de tabela de medidas, `docs/ESTADO.md`). Entra aqui porque a migração
resolve justamente o motivo de estarem fora.

| Tamanho | NIMBUS (estimado) | IzzyPrint Careca |
|---|---|---|
| P | — | 54–55 × 73–74 |
| M | — | 56–57 × 75–76 |
| G | 58 × 78,4 (estimado) | 58–59 × 77–78 |
| GG | — | 60–61 × 79–81 |
| EG | — | 62–64 × 82–84 |
| G1 | — | 65–68 × 85–87 |

O Careca é o Canguru sem capuz e sem bolso, mesma malha declarada. O G deles a
77,5 cm fica a 1% da nossa única medida estimada do projeto — a IzzyPrint
**publica a tabela que a YouDraw nunca publicou**, o que destrava a peça.
Também **só existe em preto**.

### Ecobag → **não existe equivalente**

1 produto publicado (355581274, NIMBUS Wildstyle, Bege, 1 SKU). Impressão de
24,0 × 25,7 cm numa face; peça de 41 × 35 cm com alças de 60 cm.

A IzzyPrint não fabrica ecobag e não faz sob encomenda. **Por decisão de
13/08, a Ecobag sai do catálogo junto com todas as promoções presas a ela**
(cupom `ECOBAG`, régua de frete grátis, texto do checkout, aviso no `cart.tpl`,
produto na loja e na vitrine). Nada disso se mexe sem ordem do dono, item a
item — são preço, checkout e painel.

### Camiseta Boxy → **sem equivalente NIMBUS**

Peça que eles têm e nós não (P a EG, 6 cores, largura de peito maior que o
comprimento). Foi uma das três amostras aprovadas em 06/08. Se entra ou não no
catálogo novo é decisão do dono.

---

## 2. Variantes órfãs

O que a IzzyPrint **não cobre** do que está publicado hoje:

| Órfã | Produtos | SKUs | Motivo | Saída |
|---|---|---|---|---|
| **Moletom Canguru Branca** | 8 | 40 | moletom deles só em preto, e não fazem sob encomenda | sem saída na IzzyPrint |
| **Ecobag Bege** | 1 | 1 | não fabricam ecobag | **sai do catálogo** (decisão 13/08) |
| **Blusão Moletom Branca** | 4 variantes da era dos 78 SKUs | — | mesma trava do moletom preto | reaparece quando o Blusão voltar como Careca |

**Três produtos morrem inteiros** se o Canguru Branco não tiver saída, porque
são publicados só em Branca:

- `352722685` São Miguel Celeste | Moletom Canguru
- `352719816` Aparecida Barroca | Moletom Canguru
- `352718083` Azulejo Sagrado | Moletom Canguru

Os outros 5 Canguru sobrevivem na cor Preta (São Jorge Vintage, São Jorge
Neobarroco, Salmo 19, São Miguel Vintage, São Miguel Vitorioso).

**Órfã condicional: Off-White na Oversized** — 13 produtos, 65 SKUs. Depende de
a grade de cores deles ter off-white ou natural. **A confirmar com a
IzzyPrint.** Se não tiver, a órfã salta de 41 para 106 SKUs.

Total hoje descoberto com certeza: **41 SKUs** (40 Canguru Branca + 1 Ecobag)
dos 356 publicados.

---

## 3. Artes: arquivo, vista e tamanho

Fonte do casamento arte↔produto: `nuvemshop/producao/mapa-artes.json`
(conferência visual de conteúdo, não por nome de arquivo). Tamanhos em cm:
colunas `front_*_cm`/`back_*_cm` de
`nuvemshop/auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte.csv`,
cruzadas com `nuvemshop/auditoria/2026-07-28-dpi-artes.json`. Raiz dos
arquivos: `nimbus-assets/designs/`.

> [!warning] **Nunca confie no nome nem na pasta.** O sufixo `-branco`/`-preto`
> nomeia a **cor da peça**, não a da tinta, e a convenção não é uniforme entre
> famílias: `B4-...-branco` é tinta **preta** (para peça clara) e
> `G6-...-branco` é tinta **clara** (para peça preta). A pasta também mente:
> `G7-sagrado-coracao-stencil-preto.png` está em `/peito/` e é estampa de
> **costas** (24,9 × 40, proporção idêntica à do mockup de costas). Trocar
> tinta com peça gera estampa preta sobre peça preta — aconteceu no 352720257 e
> só a inspeção visual pegou.

| Arte | Arquivo | Vista | Tamanho (cm) | DPI hoje | Cabe em 30×40? | Onde está |
|---|---|---|---|---|---|---|
| Acima de Tudo Gótico | `B4-acima-de-tudo-gotico-preto.png` (peça Preta) · `-branco.png` (peça Off-White) | frente | 35,0 × 33,8 | 254 | não (35,0) | fora do disco (`60c0e6d`) |
| Acima de Tudo Grafite | `G3-acima-de-tudo-tags.png` | costas | 35,2 × 27,2 | 253 | não (35,2) | no disco + 4K pronto |
| Anjo da Guarda Stencil | `G2-anjo-livro-stencil.png` | costas | 25,5 × 40 | 222 | sim | no disco + 4K pronto |
| Aparecida Barroca | `S1-aparecida-barroca.png` | costas | 27,9 × 40 | 221 | sim | fora do disco (`dbdc1ea`) |
| Aparecida Spray | `G10-aparecida-stencil-v3.png` | costas | 23,8 × 40 | 221 | sim | fora do disco (`dbdc1ea`) |
| Azulejo Sagrado | `S3-azulejo-cruz-v2.png` | costas | 35,2 × 35,0 | 253 | não (35,2) | fora do disco (`dbdc1ea`) |
| Brasão NIMBUS | `B3-cruz-crest.png` | costas | 29,6 × 40 | 221 | sim | fora do disco (`a2cc67d`); fonte `.jpeg` na mesa de retrabalho |
| Deus é Fiel | `B8-deus-e-fiel.png` | costas | 35,1 × 33,0 | 253 | não (35,1) | fora do disco (`a2cc67d`); fonte na mesa |
| Espírito Santo Spray | `G8-pomba-stencil-branco-teste1.png` (peça Preta) · `G8-pomba-stencil-preto.png` (peça Branca) | costas | 35,2 × 35,1 | 252 | não (35,2) | no disco + 4K pronto |
| Fé Acima de Tudo | `B7-fe-acima-de-tudo-branco.png` (peça Preta) · `B7-fe-acima-de-tudo.png` (peça clara) | costas | 35,2 × 24,6 | 253 | não (35,2) | fora do disco (`a2cc67d`); fontes na mesa |
| Fé Wildstyle | `G9-fe-tag-v3.png` | costas | 33,8 × 40 | 221 | não (33,8) | fora do disco (`dbdc1ea`); no disco há `G9-fe-tag-v2` + 4K |
| Monograma NIMBUS | `B9-monograma-nmb.png` | **frente** | 29,3 × 30,1 | 295 | sim | fora do disco (`a2cc67d`); fonte na mesa |
| NIMBUS Wildstyle | `G1-nimbus-tag-azul.png` | costas | 35,1 × 37,5 | 236 | não (35,1) | no disco + 4K pronto |
| Querubim Spray | `G2-anjo-stencil.png` | costas | 25,5 × 40 | 221 | sim | no disco + 4K pronto |
| Sagrado Coração Spray | `G7-sagrado-coracao-stencil-preto.png` | **costas** (apesar da pasta `/peito/`) | 24,9 × 40 | 222 | sim | fora do disco (`60c0e6d`) |
| Salmo 19 | `B2-salmo19.png` | costas | 35,2 × 28,8 | 253 | não (35,2) | fora do disco (`a2cc67d`) |
| São Jorge Neobarroco | `S6-sao-jorge-barroco-v1.png` | costas | 31,0 × 40 | 221 | não (31,0) | fora do disco (`dbdc1ea`) |
| São Jorge Vintage | `H4-sao-jorge-halftone.png` | costas | 30,6 × 40 | 221 | não (30,6) | fora do disco (`dbdc1ea`); 4K com chroma verde na mesa |
| São Miguel Celeste | `sao-miguel-nuvem.png` | costas | 35,2 × 39,7 | 222 | não (35,2) | fora do disco (`dbdc1ea`) |
| São Miguel Vintage | `H2-sao-miguel-halftone-v2.png` | costas | 31,6 × 40 | 221 | não (31,6) | fora do disco (`a2cc67d`); fonte na mesa |
| São Miguel Vitorioso | `G6-sao-miguel-stencil-branco.png` (peça Preta) · `G6-sao-miguel-stencil-preto.png` (peça clara) | costas | 29,5 × 40 | 218–221 | sim | fora do disco (`dbdc1ea`) |

**Horizontal: centrada, sempre.** Medido nos 48 mockups oficiais, a mediana do
desvio entre o centro da arte e o centro da peça é 0%. É regra dura
(`docs/verdades/placement.md`).

**Vertical: por produto, nunca padrão.** Varia de 2,21 a 21,21 cm no catálogo.
Os números de gola→topo da arte estão na tabela de repasse da seção 4.

**Limite de área.** O editor público deles trava em **30 × 40 cm**; **13 das 21
artes passam de 30 cm de largura**. Por orçamento direto a área chega a
**40 × 50 cm** (tabela de preço recebida em 29/07). Qual limite vale para a
conta da NIMBUS: **a confirmar com a IzzyPrint** — é a pergunta que decide se
os 15 emblemas já ampliados para 40 × 50 em
`designs/_retrabalho-2026-08/emblemas/4k/` servem ou sobram.

**Requisito de arquivo:** PNG **sem fundo** (fundo sólido é rejeitado mesmo na
cor da peça), 300 DPI recomendado. **Chroma verde e magenta estão condenados
desde 06/08** — o recorte verde apareceu nas amostras (verde no dourado). O
dono está removendo fundo à mão no Affinity; não passar removedor automático
por cima.

### Lacunas conhecidas nesta tabela

- **`352718083` (Azulejo Sagrado | Moletom Canguru) não tem entrada no
  `mapa-artes.json`.** Pelas dimensões (35,2 × 35, idênticas às da Camiseta
  Premium do mesmo desenho) é a mesma `S3-azulejo-cruz-v2.png`, mas isso é
  inferência, não conferência visual: **confirmar antes de imprimir**.
- **`G6-sao-miguel-stencil.png` sem sufixo não deve ser usado**: é a mesma arte
  da versão `-preto` com o rótulo "ST. MICHAEL ARCH-STENCIL" cravado embaixo.
- **Salmo 19, São Jorge Vintage e São Miguel Vintage têm um único arquivo cada**
  — a mesma arte foi para peça clara e escura. Na Branca o Salmo 19 fica bege
  lavado sobre branco, com baixo contraste. Não existe versão de tinta escura.
- **São Jorge (H4) e São Miguel (H2 v2) são pôsteres halftone com fundo preto
  próprio** dentro da área de estampa. Confirmar com a IzzyPrint se a peça
  clara imprime o bloco preto cheio.
- Sucessores prováveis das artes cortadas (`G9-fe-tag-v2` para Fé Wildstyle,
  `aparecida-stencil-4k` para Aparecida Spray, `sao-miguel-spray-4k` para São
  Miguel Vitorioso, `asas-livro-65-4k` para São Miguel Celeste) existem no
  disco com **nomes diferentes**. Que a nova substitui a antiga é **a confirmar
  com o dono** — não repassar pedido com arte trocada por semelhança de nome.

### Recuperar uma arte que saiu do disco

Os commits estão na coluna "onde está". No repositório de assets:

```bash
git -C "C:/Users/rober/nimbus-assets" show <commit>^:<caminho-antigo> > <arquivo>
```

Caminhos antigos por commit:

- `dbdc1ea` (triagem 06/08) — `designs/prontos/RELIQUIA/costas/`,
  `designs/prontos/STREET/costas/`, `designs/prontos/NUVEM/costas/`
- `60c0e6d` (emblemas frontais do processo antigo) —
  `designs/prontos/RELIQUIA/peito/`, `designs/prontos/STREET/peito/`
- `a2cc67d` (triagem 12/08) — `designs/acervo/gotica-blackletter/` para B2, B3,
  B7 (duas versões), B8 e H2; `designs/prontos/RELIQUIA/peito/` para B9

Se não achar o caminho, ache o commit da remoção:

```bash
git -C "C:/Users/rober/nimbus-assets" log --oneline --diff-filter=D -- "*<nome-do-arquivo>"
```

⚠️ O arquivo recuperado é o **antigo**: fundo do processo condenado e DPI
abaixo de 300. Serve para não travar um pedido pago, não para fechar o
catálogo novo.

---

## 4. Tabela de repasse (44 produtos publicados)

Uma linha por produto. `Gola→arte` é a distância do topo da arte à costura da
gola, em cm, medida nos mockups oficiais
(`nuvemshop/auditoria/2026-07-26-datum-mockups/placement-por-produto.json`).

### Camiseta Premium → Camiseta Clássica

| ID Nuvemshop | Arte | Cores | Arquivo | Tamanho (cm) | Gola→arte |
|---|---|---|---|---|---|
| 352728524 | Acima de Tudo Grafite | Branca | `G3-acima-de-tudo-tags.png` | 35,2 × 27,2 | 14,20 |
| 352728357 | Anjo da Guarda Stencil | Preta | `G2-anjo-livro-stencil.png` | 25,5 × 40 | 8,67 |
| 352720127 | Aparecida Barroca | Branca | `S1-aparecida-barroca.png` | 27,7 × 40 | 15,33 |
| 352889132 | Aparecida Spray | Preta | `G10-aparecida-stencil-v3.png` | 23,8 × 40 | 8,29 |
| 352718275 | Azulejo Sagrado | Branca | `S3-azulejo-cruz-v2.png` | 35,2 × 35,0 | 11,26 |
| 352717837 | Brasão NIMBUS | Preta + Branca | `B3-cruz-crest.png` | 29,6 × 40 | 8,13 |
| 352703343 | Deus é Fiel | Preta | `B8-deus-e-fiel.png` | 35,2 × 32,9 | 8,15 |
| 352721477 | Espírito Santo Spray | Preta + Branca | `G8-pomba-stencil-branco-teste1.png` na Preta · `G8-pomba-stencil-preto.png` na Branca | 35,2 × 35,1 | 8,82 |
| 352703153 | Fé Acima de Tudo | Preta + Branca | `B7-fe-acima-de-tudo-branco.png` na Preta · `B7-fe-acima-de-tudo.png` na Branca | 35,2 × 24,6 | 8,30 |
| 352721197 | Fé Wildstyle | Preta + Branca | `G9-fe-tag-v3.png` | 33,8 × 40 | 8,48 |
| 352702796 | Monograma NIMBUS | Preta + Branca | `B9-monograma-nmb.png` (**frente**) | 28,5 × 29,4 | 13,70 |
| 352725852 | Querubim Spray | Preta + Branca | `G2-anjo-stencil.png` | 25,5 × 40 | 8,29 |
| 352722232 | Sagrado Coração Spray | Branca | `G7-sagrado-coracao-stencil-preto.png` | 24,9 × 40 | 9,04 |
| 352702020 | Salmo 19 | Preta + Branca | `B2-salmo19.png` | 35,2 × 28,8 | 8,35 |
| 352718999 | São Jorge Neobarroco | Preta + Branca | `S6-sao-jorge-barroco-v1.png` | 31,0 × 40 | 15,29 |
| 352618935 | São Jorge Vintage | Branca + Preta | `H4-sao-jorge-halftone.png` | 30,6 × 40 | 12,73 |
| 352723243 | São Miguel Celeste | Branca | `sao-miguel-nuvem.png` | 35,2 × 39,7 | 9,09 |
| 352407196 | São Miguel Vintage | Preta + Branca | `H2-sao-miguel-halftone-v2.png` | 31,5 × 40 | 8,29 |
| 352898175 | São Miguel Vitorioso | Preta + Branca | `G6-sao-miguel-stencil-branco.png` na Preta · `G6-sao-miguel-stencil-preto.png` na Branca | 29,5 × 40 | 11,58 |

### Camiseta Oversized Premium → Camiseta Oversized Street

| ID Nuvemshop | Arte | Cores | Arquivo | Tamanho (cm) | Gola→arte |
|---|---|---|---|---|---|
| 352720257 | Acima de Tudo Gótico | Preta + Off-White | `B4-acima-de-tudo-gotico-preto.png` na Preta · `-branco.png` na Off-White (**frente**) | 35,0 × 33,8 | 16,22 |
| 352728451 | Acima de Tudo Grafite | Off-White | `G3-acima-de-tudo-tags.png` | 35,1 × 27,2 | 17,91 |
| 352728277 | Anjo da Guarda Stencil | Preta | `G2-anjo-livro-stencil.png` | 25,5 × 40 | 12,29 |
| 352890896 | Aparecida Barroca | Preta + Off-White | `S1-aparecida-barroca.png` | 27,9 × 40 | 11,51 |
| 352728019 | Aparecida Spray | Preta | `G10-aparecida-stencil-v3.png` | 23,8 × 40 | 11,18 |
| 352717723 | Brasão NIMBUS | Preta + Off-White | `B3-cruz-crest.png` | 29,6 × 40 | 9,76 |
| 352703276 | Deus é Fiel | Preta | `B8-deus-e-fiel.png` | 35,1 × 33,0 | 10,58 |
| 352702858 | Fé Acima de Tudo | Preta + Off-White | `B7-fe-acima-de-tudo-branco.png` na Preta · `B7-fe-acima-de-tudo.png` na Off-White | 35,1 × 24,6 | 11,02 |
| 352721118 | Fé Wildstyle | Preta + Off-White | `G9-fe-tag-v3.png` | 33,7 × 40 | 11,51 |
| 352702753 | Monograma NIMBUS | Preta + Off-White | `B9-monograma-nmb.png` (**frente**) | 29,3 × 30,1 | 16,34 |
| 352721633 | NIMBUS Wildstyle | Preta + Off-White | `G1-nimbus-tag-azul.png` | 35,1 × 37,5 | 10,94 |
| 352725749 | Querubim Spray | Preta + Off-White | `G2-anjo-stencil.png` | 25,5 × 40 | 12,88 |
| 352718943 | São Jorge Neobarroco | Preta + Off-White | `S6-sao-jorge-barroco-v1.png` | 30,8 × 40 | 10,89 |
| 352618903 | São Jorge Vintage | Preta + Off-White | `H4-sao-jorge-halftone.png` | 30,6 × 40 | 11,74 |
| 352407182 | São Miguel Vintage | Preta + Off-White | `H2-sao-miguel-halftone-v2.png` | 31,6 × 40 | 10,10 |
| 352727545 | São Miguel Vitorioso | Preta + Off-White | `G6-sao-miguel-stencil-branco.png` na Preta · `G6-sao-miguel-stencil-preto.png` na Off-White | 29,1 × 39,5 | 12,18 |

### Moletom Canguru → Moletom Canguru (só PRETO)

⚠️ **Todo `Gola→arte` desta tabela é da peça YouDraw e não vale na IzzyPrint** —
o canguru deles é ~20% mais comprido. Re-medir antes do primeiro moletom.

| ID Nuvemshop | Arte | Cores | Arquivo | Tamanho (cm) | Gola→arte (YouDraw) |
|---|---|---|---|---|---|
| 352719816 | Aparecida Barroca | **Branca** (órfã) | `S1-aparecida-barroca.png` | 27,7 × 40 | 3,71 |
| 352718083 | Azulejo Sagrado | **Branca** (órfã) | `S3-azulejo-cruz-v2.png` (inferido, sem entrada no mapa) | 35,2 × 35,0 | 3,73 |
| 352619175 | Salmo 19 | Preta + Branca | `B2-salmo19.png` | 35,2 × 28,8 | 3,74 |
| 352718787 | São Jorge Neobarroco | Preta + Branca | `S6-sao-jorge-barroco-v1.png` | 31,0 × 40 | 3,94 |
| 352618878 | São Jorge Vintage | Preta + Branca | `H4-sao-jorge-halftone.png` | 30,6 × 40 | 4,31 |
| 352722685 | São Miguel Celeste | **Branca** (órfã) | `sao-miguel-nuvem.png` | 35,2 × 39,7 | 4,60 |
| 352407156 | São Miguel Vintage | Preta + Branca | `H2-sao-miguel-halftone-v2.png` | 31,5 × 40 | 3,92 |
| 352726673 | São Miguel Vitorioso | Preta + Branca | `G6-sao-miguel-stencil-branco.png` na Preta · `-preto.png` na Branca | 28,5 × 39,4 | 3,54 |

### Ecobag → sem equivalente

| ID Nuvemshop | Arte | Cor | Arquivo | Tamanho (cm) | Situação |
|---|---|---|---|---|---|
| 355581274 | NIMBUS Wildstyle | Bege | `G1-nimbus-tag-azul.png` | 24,0 × 25,7 (face única) | **sai do catálogo** (13/08); sem repasse possível |

---

## 5. Checklist de repasse manual

Do jeito que se usa às 23h. Só entra aqui pedido **pago e aprovado**.

**Na Nuvemshop, ler o pedido**

1. Anotar: número do pedido, ID do produto, arte, **cor**, **tamanho**,
   quantidade e endereço completo do cliente.
2. Conferir que o pagamento está aprovado. Pedido pendente não se repassa.

**Nesta tabela, montar a receita**

3. Achar o ID na seção 4: peça IzzyPrint equivalente (seção 1), arquivo da
   arte, vista, tamanho em cm e gola→arte.
4. Conferir a letra do tamanho contra a grade da seção 1 (Oversized corre dois
   tamanhos; Clássica corre do GG para cima).
5. Se a arte não estiver no disco, recuperar pelo git (fim da seção 3).

**Na IzzyPrint, montar o item**

6. Escolher o blank: peça, cor e tamanho da linha 3/4.
7. Subir a arte: PNG sem fundo, 300 DPI, na vista certa.
8. Posicionar: **centrada na horizontal**, tamanho em cm exato, gola→arte da
   tabela.
9. Marcar a **etiqueta interna da marca** (DTF, R$1,00/peça, arte única para
   todas as peças) e o cartão/insert no pacote, se houver.
10. Lançar o endereço do cliente. A etiqueta de envio sai no nome da NIMBUS,
    com remetente IzzyPrint.

**Antes de pagar, quatro conferências (é aqui que se erra)**

- [ ] **Cor da peça × cor da tinta**: o sufixo do arquivo nomeia a peça, não a
      tinta. Olhar a prévia e ver se a estampa aparece.
- [ ] **Vista certa**: frente é só Monograma NIMBUS e Acima de Tudo Gótico.
      Todo o resto é costas — inclusive o Sagrado Coração, que está na pasta
      `/peito/`.
- [ ] **Tamanho em cm**, não "encaixar na área". Arte esticada até a borda é
      outro produto.
- [ ] **Tamanho da peça** contra a grade deles, não contra a letra do pedido.

**Fechar**

11. Pagar o pedido na IzzyPrint. É o pagamento que dispara a produção
    (até 4 dias úteis, confirmado por escrito).
12. Na Nuvemshop, marcar **"Preparando seu pedido"**. Nunca falar de produção.
13. Quando o rastreio chegar, lançar na Nuvemshop e marcar como enviado.
14. Emitir a **NF do cliente final** (a IzzyPrint emite só a de serviço).
15. Registrar a linha no controle: data, pedido, custo real cobrado por eles.
    É o único jeito de a margem parar de ser estimativa.

---

## 6. Custo do repasse

| Item | Valor | Fonte |
|---|---|---|
| Etiqueta interna (DTF) | **R$ 1,00 / peça** | Sablina, 11/08 |
| Taxa de expedição | **R$ 3,50 / pedido** | Sablina, 11/08 |
| Estampa 15×15 | R$ 15 | tabela recebida 29/07, referencial |
| Estampa 20×20 | R$ 20 | idem |
| Estampa 25×25 | R$ 25 | idem |
| Estampa 30×30 | R$ 30 | idem |
| Estampa 35×40 | R$ 35 | idem |
| Estampa 40×50 | R$ 39 | idem |
| Blank (custo POD para revenda) | **a confirmar com a IzzyPrint** | só por orçamento |
| Frete do envio | **a confirmar** (por peso; R$40 nas amostras) | dono, 31/07 |

⚠️ **Os preços de vitrine do site deles não são custo de POD.** Clássica
R$29,90–55,90 · Oversized Street R$39,90–69,90 · Boxy R$59,90 · Canguru
R$139,90 · Careca R$119,90 são varejo, lidos em 28/07. Compará-los com os
R$73,20 da YouDraw é erro de categoria. A tabela de custo para revenda sai por
orçamento.

A tabela de estampa é **referencial**: o orçamento real é consumo de tinta mais
margem operacional, e varia com a complexidade. Se a cobrança é pela caixa que
contém a arte ou pela tinta gasta: **a confirmar com a IzzyPrint**. Pelas
nossas dimensões, quase toda arte de costas cai na faixa 35×40 e as duas de
frente na faixa 30×30 — mas só a primeira fatura confirma.

Efeito na margem: a migração derruba a margem de contribuição em ~R$25–40 por
pedido aos preços atuais (`Nimbus brain/estado.md`), antes de qualquer novo
número. Detalhe em `Nimbus brain/financeiro/margem-contribuicao-2026-08.md`.

---

## 7. Fila do que falta confirmar com a IzzyPrint

Nada aqui é chute e nada aqui é urgente sozinho — junte numa mensagem só.

1. **Nome exato de cada cor**, por peça, com a lista completa (a fonte do site
   e o relato das amostras se contradizem sobre azul).
2. **Existe off-white ou natural na Oversized Street?** Decide 65 SKUs.
3. **Limite real de área para a conta da NIMBUS**: 30×40 do editor público ou
   40×50 do orçamento direto?
4. **Cobrança da estampa**: pela caixa ou pelo consumo de tinta.
5. **Tabela de custo POD (revenda)** por peça e tamanho.
6. **Tabela de medidas correta do Canguru** (o G1 publicado é mais curto que o
   P).
7. **Gramatura real do Oversized Street** (as duas páginas do mesmo produto
   discordam: 180 ou 200 g/m²).
8. **Técnica declarada por escrito** (DTG está confirmado só por cadastro
   comercial e pelo suporte, nunca pelo site).
9. **Peça clara com arte halftone de fundo preto cheio**: imprime o bloco ou
   precisa de versão recortada?
10. **Frete real de uma peça para CEP distante** (pendente desde 13/08).
11. **Insert de pedido**: se incluem cartão/brinde da marca, custo e mínimo.
12. **O que acontece quando falta cor ou tamanho de blank**: avisam,
    substituem ou cancelam.

**Fechada, não perguntar de novo:** moletom em outras cores e Ecobag. O dono
confirmou em 07/08 que não fazem, nem sob encomenda.

## Ver também

- `Nimbus brain/wiki/entities/izzyprint.md` — a ficha da IzzyPrint
- `docs/decisoes/2026-08-13-ecobag-status-e-ordem-do-lancamento.md` — Ecobag,
  status do pedido e ordem do lançamento
- `docs/verdades/artes-e-mapeamento.md` · `docs/verdades/medidas-pecas.md` ·
  `docs/verdades/placement.md` — as três verdades que esta tabela consome
- `docs/verdades/receita-export-300dpi.md` — como a arte nova tem que sair
- `nuvemshop/auditoria/2026-07-28-izzyprint-dossie.md` — o dossiê de decisão
