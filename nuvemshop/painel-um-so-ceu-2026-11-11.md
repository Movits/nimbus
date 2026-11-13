---
status: superado
atualizado: 2026-11-12
---

# Painel da loja: o que o CSS não alcança (um só céu)

> [!warning] Não aplicado. Em 12/11/2026 o painel abriu bloqueado por falta de
> pagamento, e o dono decidiu sair da Nuvemshop e fazer loja própria
> (`docs/ESTADO.md`, "Loja e funil"). Não execute este roteiro sem ordem nova do
> dono. Só o item (g), apagar telefone e endereço pessoais, segue valendo
> enquanto a loja estiver pública.

A camada de CSS de 11/11/2026 (`css-nimbus-um-so-ceu-2026-11-11.css`) deixa a
loja com a cara da landing e da vitrine. Texto de menu, de capa, nome da loja,
SEO e dado de contato moram no painel e só mudam lá. Esta é a lista para o dono
executar ou autorizar, em <https://loja.nimbuswear.com.br/admin>.

Nada aqui mexe em preço, produto, variante, checkout, domínio ou CNPJ.

**Ordem da sessão.** Primeiro os itens (g) e (f), depois (a) a (e), (k) e (l), e
o CSS por último (i): publicar qualquer seção do editor de tema regrava o
formulário inteiro, então o CSS colado antes se perde.

## (g) Telefone e endereço pessoais: apagar

Em **Configurações > Informações de contato** existem um campo de telefone e
um campo de endereço preenchidos com dado pessoal. Os dois aparecem no HTML de
todas as páginas (rodapé e página de contato); o CSS só tira da vista. Apagar
os dois campos e salvar. O e-mail da loja fica.

Depois disso, avisar para tirar do CSS o bloco "Contato pessoal" de
`css-nimbus-correcoes-2026-07-17.css`, que deixa de ter o que esconder.

## (f) Nome da loja e SEO

1. Nome da loja: trocar `Nimbus` por `NIMBUS`. Corrige o título da aba
   ("Loja online de Nimbus"), o `og:site_name` e o texto alternativo do logo.
   A linha de copyright do rodapé só acompanha se o campo de razão social do
   painel estiver vazio; se estiver preenchido, é ele que aparece ali, e razão
   social e CNPJ são dado legal: ficam como o dono decidir.
2. SEO da página inicial (os mesmos da vitrine):
   - Título: `NIMBUS | Streetwear católico premium`
   - Descrição: `Streetwear católico premium, feito no Brasil. A coleção está sendo remontada, peça por peça. 10% do lucro vai para o projeto social que você escolher.`
3. SEO das páginas (campo de SEO de cada página, em **Loja online > Páginas**):
   - Sobre a NIMBUS: `Fé tratada com reverência, design tratado com rigor. Conheça a NIMBUS, streetwear católico premium feito no Brasil.`
   - Projetos Sociais: `A cada pedido, 10% do lucro vai para um projeto social que você escolhe no checkout. Veja como funciona.`
   - Contato: `Fale com a NIMBUS: dúvidas sobre tamanhos, produtos, pedidos ou projetos sociais.`

Hoje a descrição da home é a automática da plataforma ("Compre produtos de
Nimbus por internet. Temos nuvem, relÍquia e mais."), com erro de caixa.

## (a) Menus, com a loja fechada

Caminho: **Loja online > Menus**. Os nomes e os destinos são os mesmos da
landing e da vitrine (`src/data/marca.json`). Link interno leva `ref=loja`,
nunca `utm_*`.

**Menu principal** (aparece no topo, no menu do celular e na coluna "A marca"
do rodapé). Deixar exatamente estes sete itens, nesta ordem:

| Nome | Leva a (URL) | Onde aparece |
|---|---|---|
| Manifesto | `https://nimbuswear.com.br/loja/manifesto/?ref=loja` | topo e rodapé |
| Impacto | `https://nimbuswear.com.br/loja/impacto/?ref=loja` | topo e rodapé |
| Gravuras | `https://nimbuswear.com.br/gravuras/?ref=loja` | topo e rodapé |
| Loja | `https://nimbuswear.com.br/loja/?ref=loja` | só no topo, com a etiqueta "em breve" |
| Instagram | `https://www.instagram.com/nimbuswear.br/` | só no rodapé |
| TikTok | `https://www.tiktok.com/@nimbuswear.br` | só no rodapé |
| Quero ser avisado | `mailto:nimbuswearbr@gmail.com?subject=Aviso%3A%20abertura%20da%20NIMBUS&body=Quero%20ser%20avisado%20quando%20as%20pe%C3%A7as%20da%20NIMBUS%20chegarem.` | só no topo, como pílula |

O CSS decide onde cada item aparece olhando o destino do link: assim um menu
só deixa o topo e o rodapé iguais aos da landing. "Quero ser avisado" é a
pílula de contorno do topo: pílula no computador (a partir de 900px de
largura) e a pílula navy da capa no menu do celular. O endereço é o mesmo
do botão da capa, item (b). **Se o painel recusar link `mailto:` no menu,
pular esse item:** nada quebra, só não há pílula no topo.

Saem do menu: Início, Produtos, STREET, RELÍQUIA, NUVEM, Sobre, Projetos
Sociais, Contato, Trocas e devoluções, Envios e prazos, Fale com a NIMBUS. As
páginas Sobre, Projetos Sociais e Contato continuam publicadas; só saem do menu.

**Menu do rodapé** (a segunda lista do rodapé, a que hoje tem Sobre, Projetos
Sociais, Contato, Trocas e devoluções, Envios e prazos, Privacidade; vira a
coluna "Ajuda"). Deixar exatamente estes quatro itens, nesta ordem:

| Nome | Leva a (URL) |
|---|---|
| Trocas e devoluções | `https://nimbuswear.com.br/loja/trocas/?ref=loja` |
| Envios e prazos | `https://nimbuswear.com.br/loja/envios/?ref=loja` |
| Privacidade | `https://nimbuswear.com.br/loja/privacidade/?ref=loja` |
| Fale com a NIMBUS | a página Contato da loja (`/contato/`) |

**CSS na mesma sessão: nenhuma regra precisa mudar.** O rodapé antigo
posicionava cada link por `nth-child` de 1 a 11 e quebrava em silêncio a cada
mudança de menu; a camada nova olha o destino do link e monta as colunas com as
duas listas que o tema entrega. Ela foi medida com o menu de hoje e com o menu
acima simulado, nas cinco larguras, sem nenhum achado.

Cinco cuidados, porque cinco regras olham o menu:

1. **"Loja" não pode ser o primeiro item do menu principal.** O primeiro item
   com destino `/loja/?ref=loja` some (é o "Início" de hoje, que só repete o
   logo).
2. **Não pôr link de contato no menu principal.** Link com destino `/contato/`
   some da coluna "A marca" do rodapé, porque o contato mora na coluna "Ajuda".
3. **O topo mostra no máximo oito itens** do menu principal; do nono em diante
   some (eram os links de suporte de hoje). Os sete acima cabem.
4. **"Quero ser avisado" é sempre o último item**, e o único com destino
   `mailto:`: qualquer item do menu principal com esse tipo de destino vira
   pílula no topo e some do rodapé.
5. **Instagram e TikTok só aparecem no rodapé.** Item do menu principal com
   destino `instagram.com` ou `tiktok.com` some do topo e do menu do celular.

Ficam inertes depois da troca e podem sair numa limpeza posterior, sem pressa:
em `css-nimbus-responsive-header-footer-2026-07-20.css`, a regra
`nth-of-type(n + 9)`, os blocos "Rodapé, coluna A marca" e "Rodapé, coluna
Ajuda" e as duas regras que renomeiam "Contato" para "Fale com a NIMBUS"; no
bloco ESTADO FECHADO, as regras de `#colecoes` e `/loja/c/`.

Para reabrir a loja: refazer o menu principal com as coleções, tirar o item
"Quero ser avisado" e apagar o bloco ESTADO FECHADO do CSS (ver
[`instrucoes.md`](instrucoes.md)). Sem o bloco, "Loja" volta sozinho ao rodapé.

## (b) Capa da home

Caminho: **Loja online > Layout > Página inicial**, seção da mensagem
institucional (a que hoje diz "Fé com propósito. Design com presença.").

- Título: `Acima de tudo.`
- Texto: `Estamos remontando a coleção, peça por peça. As primeiras peças chegam em breve, feitas no Brasil, para você.`
- Botão, texto: `Quero ser avisado`
- Botão, link: `mailto:nimbuswearbr@gmail.com?subject=Aviso%3A%20abertura%20da%20NIMBUS&body=Quero%20ser%20avisado%20quando%20as%20pe%C3%A7as%20da%20NIMBUS%20chegarem.`

É o mesmo botão da landing, e o mesmo endereço do último item do menu, item
(a). Com o botão apontando para um `mailto:`, o CSS escreve logo abaixo dele
a linha da landing: "O botão abre o seu e‑mail com a mensagem pronta. É só enviar."
Se o painel recusar link `mailto:`, usar o texto `Ler o manifesto` com o link
`https://nimbuswear.com.br/loja/manifesto/?ref=loja`; aí a linha de baixo não
aparece.

**Segundo botão, se a seção tiver.** A landing e a vitrine têm dois botões na
capa. Se a seção da mensagem institucional oferecer um segundo botão:

- Segundo botão, texto: `Ler o manifesto`
- Segundo botão, link: `https://nimbuswear.com.br/loja/manifesto/?ref=loja`

O CSS desenha o segundo botão em contorno, ao lado do primeiro. Se a seção
só tiver um botão, fica como está.

O rótulo pequeno acima do título ("Streetwear católico premium") vem do CSS,
assim como o lema do rodapé ("Streetwear católico premium. Acima de tudo."),
os títulos das colunas do rodapé ("A marca" e "Ajuda"), a etiqueta "em breve"
ao lado de "Loja" e a linha debaixo do botão: nenhum deles se digita no painel.
Enquanto o bloco ESTADO FECHADO existir, o CSS já mostra a frase "Estamos
remontando..." no lugar do texto do painel; com o texto certo no painel, as
duas regras "Home: a frase da capa" podem sair do bloco.

## (c) Banners de categorias: desligar. Selos: trocar os textos

Mesmo caminho, seção de banners de categorias (título "COLEÇÕES NIMBUS", com
STREET, RELÍQUIA e NUVEM). Desligar a seção, sem apagar as imagens: os três
banners levam às grades da loja, que estão vazias. O CSS já esconde a seção;
desligar no painel tira também do HTML.

Os três selos ("Feito no Brasil", "Compra segura", "Propósito real") ficam,
com as palavras da landing. Na seção de banners informativos, trocar por:

| Título | Descrição |
|---|---|
| Feita no Brasil, | para você |
| 10% do lucro | vai para o projeto social que você escolher |
| Aviso por e‑mail | quando as peças chegarem |

Título e descrição saem na mesma linha e no mesmo peso, então cada selo lê
como uma frase só, igual à landing. **Fazer este item antes de colar o CSS:**
com os textos de hoje, sem a diferença de peso, os selos leem emendados
("Compra segura Pix, cartão e boleto").

O terceiro selo é o do estado da loja: selo de checkout numa loja fechada
promete o que não existe. Quando a loja reabrir, ele volta a ser
`Compra pelo checkout da Nuvemshop:` com a descrição `Pix, cartão e boleto`.

## (d) Faixa de anúncio

Caminho: **Loja online > Layout > Editar layout > Cabeçalho**. Desligar a
barra de anúncio enquanto a loja estiver fechada: o texto "Conheça as coleções
na vitrine Nimbus" aponta para coleções fechadas, e a landing não tem faixa. O
CSS já esconde. Ao reabrir, religar com o texto da vitrine aberta.

## (e) Página de contato

A página mostra a frase do tema "Para o contato via telefone, entre em contato
via Whatsapp por favor." A loja não atende por telefone nem por WhatsApp. No
campo dessa frase (fica junto dos dados de contato, item g, ou na edição da
página Contato; conferir onde o painel mostra), trocar a frase por esta linha,
igual à linha legal da landing:

`CNPJ 53.977.834/0001-18 · Brasília DF`

O e‑mail escrito já aparece sem o painel: com a loja fechada, o parágrafo de
"Fale com a NIMBUS" (texto do CSS) termina em "Se preferir, escreva para
nimbuswearbr@gmail.com."

A linha do CNPJ só aparece depois da limpeza do item (g). Hoje o CSS esconde
essa coluna inteira, porque é nela que estão a frase do WhatsApp e os dados
pessoais. Feitos (e) e (g), avisar: sai do CSS a regra que esconde a coluna
(`.template-contact .contact-page .col-md-4`) junto com o bloco "Contato
pessoal", e a linha entra debaixo do parágrafo.

## (k) Páginas que falam como loja aberta

Quatro páginas falavam como se já houvesse venda. Duas se resolvem no CSS e
duas no painel. Ao reabrir a loja, as quatro voltam ao texto de hoje.

**Contato e Login: nada a fazer no painel.** O texto ao lado do formulário é
do CSS, e o bloco ESTADO FECHADO já troca:

- Contato, fechada: "Dúvidas sobre a marca, as peças que estão chegando ou os
  projetos sociais? Envie sua mensagem e responderemos pelo e‑mail informado.
  Se preferir, escreva para nimbuswearbr@gmail.com."
- Contato, aberta (volta sozinha): "Dúvidas sobre tamanhos, produtos, pedidos
  ou projetos sociais? Envie sua mensagem e responderemos pelo e-mail
  informado. Se você já comprou, inclua o número do pedido para facilitar o
  atendimento."
- Login, fechada: "As primeiras peças chegam em breve. Quando a loja abrir, é
  aqui que você acompanha seus pedidos e o rastreio."
- Login, aberta (volta sozinha): "Acompanhe seus pedidos, retome pagamentos
  pendentes e consulte o rastreio em um só lugar."

No menu do celular, "Iniciar sessão" e "Criar uma conta" também somem
enquanto a loja estiver fechada.

**Sobre a NIMBUS** (**Loja online > Páginas**). Trocar duas frases:

| Hoje | Com a loja fechada |
|---|---|
| `Cada peça é produzida no Brasil, com cuidado e acabamento premium. O prazo de produção e envio aparece na página de cada produto.` | `Cada peça é produzida no Brasil, com cuidado e acabamento premium. As primeiras peças chegam em breve.` |
| `De cada pedido, 10% do lucro vai para um projeto social que você escolhe no checkout.` | `De cada pedido, 10% do lucro vai para o projeto social que você escolher.` |

**Projetos Sociais** (mesmo caminho). Trocar o parágrafo de abertura e um
subtítulo; os quatro passos ficam como estão, porque passam a descrever o que
vai acontecer:

| Hoje | Com a loja fechada |
|---|---|
| `Toda peça NIMBUS deixa algo além da roupa. A cada pedido, 10% do lucro vai para um projeto social que você escolhe no checkout. Esta página explica como funciona, sem letra miúda.` | `Toda peça NIMBUS deixa algo além da roupa. De cada pedido, 10% do lucro vai para o projeto social que você escolher. A loja ainda não abriu: esta página explica como vai funcionar, sem letra miúda.` |
| `Como funciona` | `Como vai funcionar` |

As duas páginas também têm cópia em `nuvemshop/pagina-sobre.html` e
`nuvemshop/pagina-projetos-sociais.html`: quem trocar no painel avisa, para a
cópia acompanhar.

## (l) Foto do projeto Fazenda da Esperança

O modal do projeto, na página Projetos Sociais, abre com uma foto em que há
pessoas identificáveis, recortada e sem crédito. Recomendação: trocar pelo
logotipo da instituição ou por uma imagem autorizada por ela, com o crédito
escrito. É decisão do dono; o CSS não muda com a troca.

## (h) Teste único: Fraunces 300 sobrevive ao painel?

A landing e a vitrine usam título em Fraunces 300. O tema só carrega 400 e
700, então a loja usa 400. O arquivo de fonte que o tema já baixa é variável
(medido em 11/11: com a regra abaixo o peso 300 rende mais fino), falta saber
se o painel deixa a regra passar. O build recusa `@font-face` de propósito:
este teste se cola à mão, uma vez, e não entra no arquivo canônico.

1. Colar o CSS canônico (item i) e, no FIM do campo, estas duas linhas:

```css
@font-face{font-family:"Fraunces";font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/fraunces/v38/6NUu8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib14c7qv8.woff2) format("woff2")}
html body .page-header h1{font-weight:300!important}
```

2. Testar CSS, Publicar alterações, conferir o POST 200.
3. Abrir `https://loja.nimbuswear.com.br/search/?q=teste-fonte`, ver o
   código-fonte (Ctrl+U) e procurar `@font-face`.
   - **Não achou:** o painel apagou a regra. Resultado: não sobrevive. A loja
     fica em 400.
   - **Achou:** abrir `/sobre-a-nimbus/` e comparar o título com o de antes
     (traço mais fino). Para tirar a dúvida, no console do navegador:
     `[...document.fonts].some(f => f.family.replace(/"/g, "") === "Fraunces" && f.weight === "300" && f.status === "loaded")`
     tem que responder `true`.
4. Nos dois casos, apagar as duas linhas do campo e publicar de novo. Anotar o
   resultado. Se sobreviveu, a mudança de verdade entra pelas fontes do CSS e
   pelo build, depois de liberar `@font-face` nas duas listas de sintaxe
   proibida (`scripts/build_nimbus_publication_css.mjs` e
   `scripts/verifica-css-loja.mjs`).

## (i) Colar o CSS

Protocolo vigente: [`docs/fluxos/site-css-e-hover.md`](../docs/fluxos/site-css-e-hover.md).

1. `npm run loja:css` tem que passar.
2. **Loja online > Layout > Personalizar > Edição de CSS avançada.** Copiar o
   conteúdo atual do campo para um arquivo (backup).
3. Substituir tudo pelo conteúdo de
   `nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css` (Ctrl+V de verdade).
4. **Testar CSS.** Sem isso o botão Publicar não grava. Olhar a prévia: o céu
   tem que ficar ATRÁS do texto. Se o céu cobrir a página, o painel derrubou o
   `z-index:-1`: não publicar, restaurar o backup e avisar.
5. **Publicar alterações** e conferir, na aba Rede, o
   `POST /admin/themes/settings/active/` com resposta **200**.
6. Provar numa página que não passa pelo cache: abrir
   `https://loja.nimbuswear.com.br/search/?q=x`, ver o código-fonte e procurar
   `bg-ceu.webp`. Tem que estar lá.
7. Conferir na loja pública, no computador e no celular: `/produtos/` com a
   frase da marca e nenhum "Produto de exemplo"; um endereço que não existe
   mostrando "Esta página não existe."; os três projetos da página Projetos
   Sociais abrindo com o fundo escurecido; nenhuma rolagem para o lado; no
   computador, a pílula "Quero ser avisado" no fim do topo, sem seta ao lado
   do menu; na home, cada selo começando onde começa uma coluna do rodapé.

**Sem prova de que passam pelo painel.** O CSS que está no ar hoje não usa
nada igual a estes trechos, então só a colagem diz se sobrevivem. O build já
recusa o que se sabe que o painel apaga; estes são os que faltam testar. Cada
um tem um sintoma visível:

| Trecho da camada | Se o painel apagar, o que se vê |
|---|---|
| `z-index:-1` (o céu) | o céu cobre a página inteira: não publicar (passo 4) |
| `[class*=-huge]` | algum título volta ao tamanho gigante do tema |
| `[href*="/loja/?ref=loja"]` (com `?` e `=`) | some a etiqueta "em breve" ao lado de "Loja", e "Loja" entra no rodapé |
| `[href*="mailto:"]` | "Quero ser avisado" vira link comum no topo e entra na coluna "A marca" do rodapé; some a linha debaixo do botão da capa |
| `[href*="instagram.com"]` e `[href*="tiktok.com"]` | Instagram e TikTok aparecem também no topo |
| `[href*="#colecoes"]` e `:nth-of-type(1)` | só com o menu de hoje: "Início" e "Produtos" voltam ao topo |
| `display:inline` e `vertical-align` | nos selos, título e descrição em linhas separadas |
| `12vh` e `6vh` no respiro da capa | o texto da capa encosta no topo |
| `[data-swiper-slide-index="1"]` | no celular, o selo do meio volta a quebrar em "que você / escolher" |
| `::placeholder` | volta o exemplo "ex.: Maria Perez" dentro dos campos |
| `:not([data-product-id])` | nada com a loja fechada; é a trava do produto de exemplo para a loja aberta |
| `-webkit-backdrop-filter` | topo e cartões sem vidro fosco no iPhone antigo |

Apareceu um sintoma: anotar qual, restaurar o backup se for o do céu, e avisar.
Os outros não quebram a loja e se consertam trocando a sintaxe na fonte.

## (j) O que fica diferente da landing, e por quê

Nem o CSS nem os itens acima resolvem estes pontos. Ficam registrados para
ninguém procurar o conserto no lugar errado.

A segunda revisão (12/11) fechou, só com CSS: título e cartão das páginas no
eixo da marca do topo, sem a trilha do tema; capa da home na altura da capa
da vitrine, sem a faixa de céu vazio antes do rodapé; menu do celular no azul
do topo, com "Quero ser avisado" em pílula navy; botão "Enviar" navy; fio em
cima do rodapé em toda página; "Loja" marcado na home; rótulo "Erro 404"; e a
quebra dos selos igual à da landing.

1. **Linha legal.** A landing escreve "© 2026 NIMBUS · CNPJ ... · Brasília DF";
   a loja escreve "Copyright ... Todos os direitos reservados.", com o CNPJ
   sem pontuação. O texto é do tema e leva dado legal: o CSS só muda a roupa
   dele (pequeno, à esquerda, sobre um fio).
2. **Selos só na home.** Na landing e na vitrine os três selos abrem o rodapé
   de toda página; na loja o tema só entrega os banners informativos na
   página inicial, e CSS não cria item de lista. O fio que abre o rodapé
   existe em toda página.
3. **Topo transparente no alto da página.** Na landing o topo só vira vidro
   quando a página rola; na loja ele é vidro sempre, porque o tema não conta
   ao CSS se a página rolou.
4. **Pílula "Quero ser avisado" no celular.** Na landing a pílula fica no
   topo também no celular, ao lado do Menu. Na loja ela aparece no topo só a
   partir de 900px; abaixo disso é a pílula navy dentro do Menu. Levar a
   pílula ao topo do celular é trabalho de CSS para uma próxima rodada, se o
   dono quiser.
5. **Clique no logo.** Na landing leva à landing; na loja leva à vitrine, por
   código do tema.
6. **Pesos de letra.** A landing usa Fraunces 300 nos títulos e Inter 500 e
   600 no texto de apoio e nos botões. O tema só carrega Fraunces 400 e 700 e
   Inter 400 e 700, então a loja usa 400 e 700. O título mais fino depende do
   teste do item (h).
7. **Página que não existe sem botão.** A landing tem dois botões no 404. Na
   loja a mensagem do 404 é texto de CSS: manda usar o menu, porque CSS não
   cria botão. O segundo botão da capa depende de a seção do painel ter um
   (item b).
8. **Maiúsculas do tema.** O Baires grita em maiúsculas por uma opção de
   tipografia do editor de tema. O CSS desfaz em todo título; se o editor
   tiver a opção de desligar as maiúsculas, desligar lá também.
9. **Produto de exemplo no HTML.** `/produtos/` e `/product/example/` ainda
   entregam o produto de exemplo no código da página; o CSS só não deixa
   aparecer. Some de vez quando existir um produto publicado.
10. **Fecho da página.** A landing encerra cada página com a frase "As
    primeiras peças chegam em breve.", o botão do aviso e o endereço escrito
    ("Se preferir, escreva para ..."). A loja não tem esse bloco: as grades e
    a busca vazia mostram a frase do estado da loja ("Estamos remontando a
    coleção..."), e o caminho escrito é a página Contato, no rodapé.
11. **Quebra de linha.** A landing equilibra títulos e evita palavra sozinha
    na última linha com `text-wrap`, que o painel não conhece. Na loja as
    frases que o CSS escreve têm largura medida para quebrar no mesmo lugar;
    texto digitado no painel quebra como o navegador decidir.
