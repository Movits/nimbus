---
status: vigente
atualizado: 2026-08-08
---

# Consertos da loja: o que é real, o que era falso alarme

Substitui o roteiro `cowork-consertos-painel-2026-08-08.md`, que saiu com três
itens fantasma. Esta versão foi conferida contra o HTML servido da loja, contra
o CSS publicado versionado no repositório e contra a documentação oficial da
Nuvemshop, em 08/08/2026.

## A correção que muda a lista

Os itens 1, 2 e 3 do roteiro anterior (**"Atenção, última peça!"**,
**"- 0 % OFF"**, **"0% de desconto pagando com"** e o **selo de frete grátis**)
**não aparecem para o cliente**. Todos são placeholders de template que o
JavaScript do tema só revela quando existe dado real, e não existe dado real:

| Evidência (PDP São Miguel Vintage, 08/08) | Valor |
|---|---|
| `<div class="js-last-product" style="display: none;">` | oculto |
| `js-free-shipping-minimum-label` | oculto |
| `"stock":null` nas 10 variantes | estoque infinito, nunca "última peça" |
| `"has_promotional_price":false` nas 10 | nenhum desconto configurado |
| `"promotions":[]` no carrinho inicial | nenhuma promoção ativa |

A auditoria anterior leu o código-fonte da página, não a página renderizada. O
dono estava certo ao dizer que não via nada disso. **Nada a fazer nesses três
itens**, além de conferir a olho depois que houver promoção de verdade.

Mesma coisa com o **telefone**: ele está no HTML, mas o nosso próprio CSS o
esconde desde 16/07, com o comentário literal `/* Telefone pessoal: remove
contato publico e redistribui o footer. */`. Por isso o dono não o via. Removê-lo
do painel continua valendo como higiene, não como conserto visível.

## O que é real, em ordem de execução

A ordem importa: mexer no CSS antes dos menus quebra o rodapé, porque os títulos
das colunas são injetados por `nth-child`.

### Fase A, painel, sem tocar em CSS

1. **Home da loja é uma loja paralela.** Os 3 banners apontam para
   `loja.nimbuswear.com.br/street/` e irmãs. Repontar para
   `https://nimbuswear.com.br/loja/c/street/?ref=loja` (idem relíquia e nuvem) e
   desligar a seção "Essenciais NIMBUS". O menu já está certo.
2. **Nome da loja: "Nimbus" → "NIMBUS".** Corrige de uma vez o `<title>` ("Loja
   online de Nimbus"), o `og:site_name` e o rodapé ("Copyright Nimbus - 2026").
   Preencher o SEO da home: "NIMBUS | Streetwear católico premium".
3. **Barra de anúncio**: hoje só "Conheça as coleções na vitrine Nimbus".
   Acrescentar a segunda: "Frete grátis e Ecobag de brinde a partir de R$399,90".
4. **Faixa dos 10%** na home ("Propósito real"): trocar "10% do lucro destinado a
   projetos sociais" por "10% do lucro doado ao projeto que você escolher".
5. **SEO errado em 2 produtos**: `/produtos/wildstyle/` é **Ecobag** e o título
   diz "Camiseta"; `/produtos/sao-jorge-vintage1/` é **Moletom Canguru** e diz
   "Camiseta". Corrigir, e tirar os fechos de infomercial ("Compre já!",
   "Garanta já a sua!").
6. **SEO das 3 categorias**: descrição automática quebrada ("Compre online STREET
   **por .**"). Preencher com os resumos da vitrine:
   - STREET: "Grafite, spray e stencil. Fé com energia de rua."
   - RELÍQUIA: "Band-tee devocional: halftone, barroco e ouro."
   - NUVEM: "Céu, nuvens e auréolas. O DNA da marca."
7. **Despublicar os 4 legados** (ordem do dono, 08/08; a produção migra para a
   IzzyPrint). Régua para não errar: **Blusão Moletom R$269,90 sai; Moletom
   Canguru R$299,90 fica.** São `/produtos/sao-jorge-vintage/`,
   `/produtos/aparecida-barroca/`, `/produtos/azulejo/` e
   `/produtos/sao-miguel-celeste/`. Despublicar, **não apagar**.
8. **Remover o telefone** dos dados de contato (some do HTML e da página
   `/contato/`; do rodapé ele já estava escondido por CSS).

### Fase B, menus

9. **Repontar "Sobre" e "Projetos Sociais"** para as páginas da vitrine, que
   existem e respondem 200: `https://nimbuswear.com.br/loja/manifesto/?ref=loja`
   e `https://nimbuswear.com.br/loja/impacto/?ref=loja`, renomeando para
   "Manifesto" e "10% do lucro". **Despublicar em seguida** as páginas locais
   `/sobre-a-nimbus/` e `/projetos-sociais/`, senão viram conteúdo órfão
   indexável (a loja Nuvemshop **é** indexável; a vitrine não).

### Fase C, reauditoria do rodapé, obrigatória antes do CSS

Os títulos das colunas do rodapé não vêm do painel: são injetados por CSS em
posição fixa (`.footer-menu-item:nth-child(2)`, `(6)` e `(9)`). Renomear rótulo é
seguro; **acrescentar, remover ou reordenar item joga os títulos em cima do item
errado**. Depois da Fase B, contar os itens e confirmar que 2, 6 e 9 continuam
sendo os mesmos.

### Fase D, uma única edição de CSS

Os quatro itens abaixo tocam o mesmo campo (Loja online → Layout → Edição de CSS
avançada), que é substituído inteiro a cada colagem. Fazer **uma** colagem só.

> **A fonte não é o arquivo compacto.** `css-nimbus-publicacao-compacta-2026-07-20.css`
> é **gerado** por `scripts/build_nimbus_publication_css.mjs` a partir de
> `css-nimbus-correcoes-2026-07-17.css` e
> `css-nimbus-responsive-header-footer-2026-07-20.css`. Editar só o compacto é
> trabalho perdido na próxima execução do script.

10. **Selo powered-by volta** (decisão de 08/08: ocultar pode ferir os termos do
    plano Impulso). São **duas** regras, não uma: tirar `.powered-by-logo`,
    `.powered-by`, `.footer-powered-by` e `a[href*="nuvemshop.com.br"]` do
    seletor de grupo, **e** apagar a regra
    `html body footer.js-footer>.text-left.text-md-center .powered-by-logo`.
11. **CNPJ no rodapé.** Preencher no painel **não resolve**: a mesma regra de
    grupo esconde `.contact-info`. Duas saídas, o dono escolhe: tirar
    `.contact-info` do grupo (só depois de o telefone sair, senão ele reaparece),
    ou acrescentar o CNPJ ao texto que o CSS já injeta em
    `html body footer.js-footer>.row:before`.
12. **Fundo do rodapé chapado**: apagar a declaração
    `background:linear-gradient(180deg,#f7fbff,#dcebfa)` (única ocorrência de
    `linear-gradient` no arquivo); o `background-color:#dcebfa` já está lá.
13. **Logo na régua da vitrine**: o desktop já tem 154px em duas regras, mas há
    um `max-width:170px` posterior que vence na cascata. Corrigir é ajustar o
    170px, não somar outro 154px. No mobile hoje é `132px` e `108px` abaixo de
    360px; a régua da vitrine é 110px.

### Fase E, FTP, por último (a escrita menos reversível)

14. **"Carrinho" → "Sacola".** **Não existe editor de textos de tema na
    Nuvemshop**: a troca é em `config/translations.txt`, e o truque de CSS
    (`font-size: 0` + `:after`) sai junto na Fase D.
15. **"aquí" → "aqui".** Não está no `cart.tpl`. Está em
    `config/translations.txt`, na linha **pt** do bloco `es "ver otros acá"`.
    Mexer só na linha pt: `acá` e `aquí` estão corretos em espanhol.
16. **Botão no carrinho vazio**: `cart.tpl`, ramo do carrinho vazio, botão "Ver
    as coleções" para
    `https://nimbuswear.com.br/loja/?utm_source=loja&utm_medium=carrinho`.
17. **Pesos das fontes**: não existe link literal do Google Fonts. Em
    `layouts/layout.tpl` há `google_fonts_url('400,700')` na linha 18 e
    `font_weights: '400,700'` nas linhas 36 a 39. Trocar nos **dois** pontos para
    `'300,400,600,700'`. O filtro aplica a mesma lista às duas famílias: não dá
    para pedir pesos diferentes para Fraunces e Inter.

### Resolvido, só confirmar

18. **A div `#nimbus-aviso-ecobag` já existe**, em `cart.tpl` linha 68, dentro do
    ramo de carrinho **não vazio**. Conferir com carrinho vazio dá falso
    negativo. Montar um carrinho acima de R$399,90 com uma Ecobag, **sem
    finalizar**, e olhar. O texto que já está lá difere do que o roteiro antigo
    propunha; o dono escolhe qual fica.

## Portão de hash, antes de qualquer FTP

Os itens 15 a 17 **editam** arquivos, então o hash de chegada é
obrigatoriamente diferente. Use o hash conhecido como portão de **partida**:

1. Baixe o arquivo do servidor para a pasta de backup do dia.
2. Confira que bate com o esperado (`cart.tpl` no ar: 12.168 bytes, MD5
   `6a664b1a367f6e533a514dfb439a20ba`). Se não bater, **pare**: alguém mexeu.
3. Edite a partir do arquivo **baixado**, nunca do checkout do git (não há
   `.gitattributes`, e o `autocrlf` do Windows muda os bytes sem mudar a versão).
4. Anote o hash novo, suba, baixe de novo e confirme.

Transferência sempre **binária**. A senha do FTP nunca é digitada por agente: a
sessão do WinSCP está salva, e `option batch abort` suprime confirmação, não
credencial.

## Não é bug: a vitrine fora do Google

`Disallow: /loja/` no robots.txt é decisão registrada, não acidente: a constante
`VITRINE_INDEXAVEL = false` em `scripts/vitrine/build-paginas.mjs` linha 47
governa o `<meta robots>` e o sitemap ao mesmo tempo, e o comentário explica que
a vitrine só entra no índice quando houver fotos com modelo. Para abrir, é uma
linha. Enquanto isso, a camada indexável é a Nuvemshop, o que **aumenta** a
importância dos itens 5 e 6 desta lista.

## Relacionados

- Auditoria de copy: `nimbus-brain/wiki/syntheses/auditoria-copy-site-2026-08.md`
- Doutrina do painel: `../docs/HANDOFF-SESSAO.md` seções 8 e 9
- FTP: `nimbus-assets/nuvemshop/tema-baires/INSTRUCOES-FTP.md`
