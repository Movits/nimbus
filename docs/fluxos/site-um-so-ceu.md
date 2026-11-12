---
status: vigente
atualizado: 2026-11-12
---

# Fluxo: o desenho único do site (landing, vitrine e loja)

A landing, a vitrine e a loja Nuvemshop têm que parecer feitas pela mesma mão.
Em 11/11/2026 não pareciam: o dono apontou a diferença, 16 revisores mediram
(marca igual 5 de 10, confiança 3,2 de 10) e o desenho foi unificado. Este
fluxo diz onde cada coisa mora, para a diferença não voltar.

## O desenho, em onze regras

1. **Um só céu.** Toda página mora no céu da landing. Na landing é a cena 3D; na
   vitrine e na loja é a mesma foto (`/img/bg-ceu.webp`), parada atrás do
   conteúdo. Sem faixa branca, sem bloco navy, sem régua dourada.
2. **Uma voz de título.** Fraunces 300, caixa baixa, navy `#0b2360`, frase
   curta com ponto. Maiúscula só em rótulo pequeno (`.kicker`).
3. **Um topo.** Marca à esquerda, que leva à landing. Navegação em caixa baixa.
   Uma pílula de contorno à direita. No celular a navegação recolhe em "Menu".
   Ao rolar, o topo vira vidro AZULADO (`rgba(203, 221, 237, 0.9)`), nunca
   quase branco: a marca tem letras brancas e some no branco.
4. **Um rodapé.** Abre com um fio e os três selos de ponto dourado, na mesma
   grade das três colunas (marca com o lema, "A marca", "Ajuda"), e fecha com
   outro fio e a linha legal. Tudo no eixo esquerdo. Fica sobre o céu.
5. **Vidro** para texto corrido e cards (`.vidro`): é o que garante leitura
   sobre as nuvens.
6. **Um botão.** Pílula navy; a secundária é a mesma pílula em contorno.
7. **Navy é ação e título; ouro é a auréola**: o ponto dos selos e o fio
   embaixo do link. Texto dourado sobre fundo claro não se usa (contraste 1,4:1).
8. **Imagem é lugar real, pessoa ou gravura de museu.** O dono reprovou em
   11/11/2026 a arquitetura inventada nas nuvens ("cara de IA"). Nada de cenário
   que não existe. Gravura aparece inteira, aparada na folha (`recorte` no
   `gravuras.json`), com cantos retos.
9. **Um eixo esquerdo.** Marca do topo, título da página, painel de texto,
   fecho e rodapé começam na mesma borda. Página de leitura não centraliza a
   coluna: é a composição da landing, cartão à esquerda e céu à direita.
10. **Uma página termina no fecho.** Uma pergunta na voz de título ("Quer saber
    quando as peças chegam?"), o botão do aviso, que a responde, e a linha que
    diz o que o botão faz, com o endereço escrito uma única vez. Depois dele,
    só o rodapé. Na capa, debaixo do botão, vai só a linha curta, sem endereço.
11. **No celular o monumento anda com o texto dele.** Abaixo de 768px a Catedral,
    o Cristo e a Pampulha são imagens do fluxo da página, de borda a borda, cada
    uma logo acima do cartão da seção (`Monumento` em `src/sections/Overlay.tsx`,
    contas das faixas em `src/styles/global.css`), e a cena 3D fica só com o
    céu. Parado atrás do texto, o monumento era coberto pelo cartão ao rolar e
    sobravam telas inteiras de céu vazio entre as seções (os seis compradores
    da revisão de 12/11/2026 apontaram as duas coisas). No computador o cartão
    fica ao lado do monumento, e a cena 3D continua como era.

## Onde cada coisa mora

| O quê | Arquivo | Quem usa |
|---|---|---|
| Topo, rodapé, título, botão, vidro, selos, link, fecho | `public/css/marca.css` | landing (`index.html`) e vitrine (`build-paginas.mjs`) ligam o MESMO arquivo |
| Palavras e destinos repetidos (aviso, estado da loja, selos, navegação, rodapé, linha legal) e se a loja está aberta (`lojaAberta`) | `src/data/marca.json` | `src/data/content.ts` e `build-paginas.mjs` leem o MESMO arquivo |
| Quando cada monumento aparece e some na landing (patamar e queda, por tela) | `src/scene/scrollStore.ts` | landing |
| Nuvens que cobrem o pé de um monumento, remendo e deslocamento das fotos | `src/scene/Backgrounds.tsx` | landing, só no computador |
| Monumentos no celular (imagens do fluxo, com o alto e o pé esfumados) | `Monumento` em `src/sections/Overlay.tsx` + bloco "Celular: monumentos no fluxo" de `src/styles/global.css` | landing, abaixo de 768px |
| Tokens (cores, fontes) | `:root` de `src/styles/global.css` e de `public/loja/css/tokens.css` | o portão `vitrine:tokens` exige valores iguais |
| Só da landing (cena, seções de tela cheia, cards do impacto, modal) | `src/styles/global.css` | landing |
| Só da vitrine (páginas de leitura, capa, grade, PDP, sacola) | `public/loja/css/loja.css` | vitrine |
| A loja Nuvemshop | `nuvemshop/css-nimbus-um-so-ceu-2026-11-11.css` + painel | repete os valores à mão, em literal: o painel apaga custom properties e não aceita arquivo de fora. Ver [`site-css-e-hover.md`](site-css-e-hover.md) |

Mudou o topo, o rodapé, o título ou o botão? É no `marca.css`, uma vez. Depois
repita na camada da loja, que é a única cópia que sobrou.

## Loja fechada e loja aberta

Enquanto nada está à venda, a ação única do site é **"Quero ser avisado"** (um
mailto com a mensagem pronta; o clique dispara `generate_lead`). Nenhum topo,
rodapé ou faixa fala em coleção, sacola ou pedido. O terceiro selo do rodapé
depende do estado (`seloDoEstado` no `marca.json`): fechada, é o aviso por
e-mail; aberta, é o checkout. As políticas (impacto, trocas, envios) abrem com
o recado de que valem para os pedidos a partir da reabertura. Reabrir é uma
virada só, nunca uma superfície sozinha:

- `VITRINE_ABERTA = true` em `scripts/vitrine/build-paginas.mjs` (voltam as
  coleções no topo, a Sacola, a faixa de anúncio e a coluna Loja do rodapé) E
  `"lojaAberta": true` em `src/data/marca.json`, juntos: o build falha se os
  dois discordarem;
- a navegação e o aviso da landing em `src/data/marca.json`;
- na loja, apagar o bloco "ESTADO FECHADO" da camada de CSS e refazer o menu no
  painel.

## Como conferir antes de publicar

```bash
npm run dev                 # em uma aba
npm run vitrine:olho        # em outra: mede 10 páginas em 5 larguras de tela
```

O `vitrine:olho` mede o que o olho cansado não mede: imagem esticada, itens
desalinhados, rolagem horizontal, alvo de toque pequeno, texto cortado. Contra o
site que estava no ar em 11/11 ele achou a marca do topo esticada de 8% a 21% no
celular e os pontos dos selos desalinhados, defeitos que ninguém tinha visto.

Ele não vê gosto. Imagem com cara de IA e espaçamento feio mas regular
continuam sendo olho: abra a página no celular e no computador e olhe a página
inteira, não só a primeira tela. Na landing do computador, olhe também o MEIO
da rolagem entre duas seções: é ali que um monumento fica de fantasma atrás do
título da seção seguinte.

A pendência de gosto que ficou com o dono em 12/11/2026: os três monumentos da
landing (Catedral, Cristo e Pampulha nas nuvens) receberam de 6 a 8 em 10 de
"cara de render ou de IA" dos revisores. São a assinatura da landing e não
foram trocados; trocar por foto real é decisão dele.

Regra da casa que saiu dessa revisão: toda `<img>` com `width` e `height` no
HTML precisa de `height: auto` no CSS (as duas folhas-base já têm). Sem isso o
atributo estica a foto.
