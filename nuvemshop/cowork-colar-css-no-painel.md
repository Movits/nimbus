---
status: superado
atualizado: 2026-08-03
substituido-por: cowork-publicar-css.md
---

# Prompt para o Cowork: colar o CSS da loja no painel da Nuvemshop (SUPERADO)

> [!warning] Não cole este bloco. O protocolo VIGENTE para publicar CSS está
> em [`docs/fluxos/site-css-e-hover.md`](../docs/fluxos/site-css-e-hover.md)
> (o `cowork-publicar-css.md` também é registro concluído). E a doutrina do
> escape `\00000A` que este corpo ensina foi REVOGADA em 04/08: o painel come
> os zeros à esquerda, escape seguido de hexadecimal é inusável.
>
> Esta rodada já rodou em 02-03/08 e parou no último clique: **Publicar
> alterações não salva quando o clique é feito por script**, e a extensão não
> tem permissão para `nimbus40.lojavirtualnuvem.com.br`. O roteiro vigente
> incorpora esses aprendizados (não forçar POST, backup de 02/08 já existe,
> caminho pela aba aberta); este aqui mandaria repetir a falha. Fica como
> histórico.

Cole o texto abaixo da linha numa sessão do Cowork, na máquina do Roberto.

**Por que isto existe.** O CSS da loja **não sobe por Git**. A Nuvemshop não faz
deploy por repositório: o que vale é o que está colado no painel. O repositório
guarda a fonte, o painel guarda o que o cliente vê.

**O que esta rodada conserta.** O rodapé publicado diz "feito no
Brasil.**ਐ**% do lucro". O `ਐ` é a letra AI do alfabeto punjabi, U+0A10. A regra
tinha `content:"...Brasil.\A 10%..."`, onde o espaço depois do `\A` é o
delimitador do escape, não texto. O minificador do painel come espaço, entregou
`\A10%`, e o navegador leu `A10` como hexadecimal. O arquivo novo usa `\00000A`,
que tem seis dígitos e por isso dispensa delimitador. Está em todas as páginas
da loja, e a frase quebrada é justamente a dos 10% para projeto social.

---

Você está no computador do Roberto, com o navegador logado na Nuvemshop. **Ele
não está por perto**, então trabalhe sozinho e relate no fim. Onde eu digo
"pare", pare de verdade e escreva o motivo em vez de contornar.

## Regras que não se negociam

1. **Não mexa em nada além do campo de CSS.** Não toque em produto, preço,
   variante, frete, checkout, domínio ou dado fiscal. Se a tela oferecer, ignore.
2. **Backup antes de sobrescrever.** Você vai copiar o CSS que está lá hoje para
   um arquivo local ANTES de apagar qualquer coisa. Sem backup, não continue.
3. **Não publique nada além disso.** Salvar o CSS é o fim da tarefa.
4. Print de cada tela que o relatório menciona.

## Passo 1: pegar o arquivo novo

Repositório público `Movits/nimbus`, branch `main`:

```
nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css
```

Link direto:
<https://github.com/Movits/nimbus/blob/main/nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css>

Use o botão **Copy raw file** (o ícone de duas folhinhas no canto do bloco de
código) ou baixe o arquivo.

**Confira antes de colar:** o arquivo tem **50.754 bytes** e MD5
`f67d4375c2abfa21a0a2bfc74900132d`. No PowerShell:
`Get-FileHash -Algorithm MD5 css-nimbus-publicacao-compacta-2026-07-20.css`.
**Se o hash não bater, pare.** Colar a versão errada é pior que não colar.

Confira também, no conteúdo, que existe a sequência literal
`feito no Brasil.\00000A10% do lucro`. Se aparecer `\A 10%` ou `\A10%`, você
está com a versão velha: **pare**.

## Passo 2: abrir o campo certo no painel

1. Abra <https://loja.nimbuswear.com.br/admin>. O painel fica no domínio da
   própria loja; **não existe** `dashboard.nuvemshop.com.br`.
2. Vá em **Loja online → Layout**.
3. No tema **Baires**, abra as opções e procure **Edição de CSS avançada** (pode
   aparecer como "CSS avançado" ou dentro de "Personalizar"). É um campo grande
   de texto, não um editor de arquivos.

**Não achou esse campo?** Pare e descreva no relatório exatamente quais opções
apareceram na tela, com print. Não saia procurando em outros menus.

## Passo 3: backup

Selecione **todo** o conteúdo atual do campo, copie, e salve num arquivo local
`backup-css-painel-2026-08-02.txt`. Confirme que o arquivo salvo **não está
vazio** e anote o tamanho dele.

Sem esse arquivo com conteúdo, **pare aqui**.

## Passo 4: colar

1. Com o campo ainda selecionado por inteiro, apague tudo.
2. Cole o conteúdo do arquivo novo.
3. **Salve.**

O painel pode reescrever pedaços do que você colou; isso é esperado, ele
minifica. O arquivo novo foi feito para sobreviver a isso.

## Passo 5: conferir no ar

Abra <https://loja.nimbuswear.com.br/> e olhe o **rodapé**.

- Está escrito **"Streetwear católico premium, feito no Brasil."** numa linha e
  **"10% do lucro é destinado ao projeto social escolhido por você."** na linha
  de baixo? **Deu certo.** Print do rodapé.
- Ainda aparece `ਐ` ou algum símbolo estranho colado no `%`? Anote e **não tente
  consertar sozinho**: o cache da plataforma pode demorar. Espere 10 minutos,
  recarregue com Ctrl+F5 e olhe de novo. Se persistir, relate com print.

Confira o mesmo rodapé em mais duas páginas, porque ele é o mesmo em todas:
<https://loja.nimbuswear.com.br/produtos/wildstyle/> e
<https://loja.nimbuswear.com.br/comprar/>.

## Passo 6: olhar se nada mais quebrou

O CSS é grande e mexe no cabeçalho e no rodapé inteiros. Passe o olho em:

- **Cabeçalho**: logo à esquerda, e o botão do carrinho escrito **Sacola**.
- **Grade de produtos** na home: cards alinhados, sem foto esticada.
- **Rodapé**: os links Trocas e devoluções, Envios e prazos e Fale com a NIMBUS
  aparecendo normalmente.

Qualquer coisa visivelmente torta, **relate com print**. Se estiver muito
errado, o backup do passo 3 volta tudo: cole ele de volta no campo e salve.

---

# Relatório final

- **Passo 1:** o hash bateu? achou o `\00000A` no arquivo?
- **Passo 2:** achou o campo de CSS avançado? por qual caminho?
- **Passo 3:** o backup foi salvo? com quantos bytes? onde?
- **Passo 4:** salvou sem erro? apareceu alguma mensagem?
- **Passo 5:** o rodapé ficou em duas linhas e sem o `ਐ`? nas três páginas?
- **Passo 6:** cabeçalho, grade e rodapé, algo torto?
- Qualquer mensagem de erro, copiada na íntegra.

Não tente contornar, não invente valor, não conclua nada além do que você viu.
