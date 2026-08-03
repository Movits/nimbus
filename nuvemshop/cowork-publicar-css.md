---
status: vigente
atualizado: 2026-08-03
---

# Prompt para o Cowork: publicar o CSS corrigido no painel

Cole o texto abaixo da linha numa sessão do Cowork, na máquina do Roberto.

**Onde isto parou.** Na rodada de 03/08 o Cowork fez tudo, menos o último
clique: achou o campo, guardou o backup, conferiu o hash e carregou o CSS novo
no campo. O clique em **Publicar alterações** não salva quando é feito por
script — no clique saem só chamadas de analytics, nenhuma com `css_code`. O
painel roda em `nimbus40.lojavirtualnuvem.com.br`, domínio para o qual a
extensão do navegador não tem permissão, então clique de verdade e screenshot
são negados ali.

Ele **não forçou um POST na mão**, e essa foi a decisão certa: seria mexer por
baixo do aplicativo numa loja ativa sem enxergar o resultado. **Essa regra
continua valendo.**

**O que ele descobriu de quebra**, e que confirma o conserto: o CSS guardado no
painel não tem `\A10%`, tem o caractere gurmukhi já resolvido, cru. O
minificador comeu o escape e **gravou o caractere**. Por isso recolar é o único
caminho, e por isso o arquivo novo usa `\00000A`, de seis dígitos, que dispensa
o delimitador.

---

Você está no computador do Roberto. **Ele não está por perto**, então trabalhe
sozinho e relate no fim. Onde eu digo "pare", pare de verdade e escreva o motivo
em vez de contornar.

Falta **um clique** para consertar o rodapé da loja, que hoje mostra "feito no
Brasil.**ਐ**% do lucro" em todas as páginas. O `ਐ` é a letra AI do alfabeto
punjabi, U+0A10.

## Regras que não se negociam

1. **Não force um POST na mão** para salvar o CSS. Se o clique não funcionar,
   pare e relate. Mexer por baixo do aplicativo numa loja ativa, sem enxergar o
   resultado, é pior que deixar o rodapé torto mais um dia.
2. **Não mexa em nada além do campo de CSS.** Nem produto, nem preço, nem
   variante, nem frete, nem checkout, nem dado fiscal.
3. **Backup antes de sobrescrever.** Se o backup de 02/08 não existir mais,
   refaça antes de apagar qualquer coisa.
4. Print de cada tela que o relatório menciona.

## Caminho A: a aba que ficou aberta

Na rodada anterior a aba do painel ficou aberta com o CSS **já colado no campo**.

1. Procure essa aba. O endereço tem `nimbus40.lojavirtualnuvem.com.br` e a tela
   é **Layout → Editar layout atual → Edição de css avançada**.
2. Se ela ainda estiver aberta e o campo ainda tiver o conteúdo novo (procure a
   sequência `feito no Brasil.\00000A10% do lucro` dentro do campo), **peça ao
   Roberto para clicar em Publicar alterações**, ou clique você se tiver
   permissão para o domínio.
3. Pule para "Conferir".

Se a aba fechou ou o campo voltou ao conteúdo antigo, siga para o caminho B.

## Caminho B: refazer com permissão

1. **Dê à extensão permissão para `nimbus40.lojavirtualnuvem.com.br`.** Sem
   isso, o clique não sai e você vai parar no mesmo lugar. Se não conseguir dar
   a permissão, **pare aqui** e diga isso no relatório: a partir daí é o Roberto
   quem clica.
2. Abra <https://loja.nimbuswear.com.br/admin> → **Loja online → Layout →
   Editar layout atual → Edição de css avançada**.
3. **Backup.** Selecione todo o conteúdo atual do campo, copie e salve em
   `C:\nimbus-ftp\backup-css-painel-2026-08-03.txt`. Confirme que não está
   vazio. O backup de 02/08, com 54.029 bytes, deve estar em
   `C:\nimbus-ftp\backup-css-painel-2026-08-02.txt`; se existir e o novo bater
   com ele, melhor ainda.
4. **O arquivo novo** está em `C:\Users\rober\Downloads\css-novo-para-painel.css`.
   Se não estiver, pegue de `Movits/nimbus`, branch `main`:
   `nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css`, pelo botão
   **Copy raw file**.

   Confira: **50.754 bytes**, MD5 `f67d4375c2abfa21a0a2bfc74900132d`, e a
   sequência literal `feito no Brasil.\00000A10% do lucro` presente. Se aparecer
   `\A 10%` ou `\A10%`, é a versão velha: **pare**.
5. Selecione tudo no campo, apague, cole o novo e **Publicar alterações**.

## Conferir

Abra <https://loja.nimbuswear.com.br/> e olhe o rodapé. O certo é:

> Streetwear católico premium, feito no Brasil.
> 10% do lucro é destinado ao projeto social escolhido por você.

Duas linhas, e nenhum símbolo estranho colado no `%`.

Se ainda aparecer o `ਐ`, pode ser cache da plataforma: espere 10 minutos,
recarregue com Ctrl+F5 e olhe de novo antes de concluir que não funcionou.

Confira o mesmo rodapé em mais duas páginas, porque ele é igual em todas:
<https://loja.nimbuswear.com.br/produtos/wildstyle/> e
<https://loja.nimbuswear.com.br/comprar/>.

## Olhar se nada mais quebrou

O arquivo mexe no cabeçalho e no rodapé inteiros:

- **Cabeçalho**: logo à esquerda, botão do carrinho escrito **Sacola**.
- **Grade da home**: cards alinhados, sem foto esticada.
- **Rodapé**: os links Trocas e devoluções, Envios e prazos e Fale com a NIMBUS.

Torto? Relate com print. Muito errado? Cole o backup de volta no campo e salve.

---

# Relatório final

- Qual caminho usou, A ou B.
- Conseguiu dar permissão para o domínio? O clique de publicar funcionou?
- Onde ficou o backup e com quantos bytes.
- O rodapé ficou em duas linhas e sem o `ਐ`, nas três páginas?
- Cabeçalho, grade e rodapé: algo torto?
- Qualquer mensagem de erro, copiada na íntegra.

Se travou, diga em que passo e o que apareceu na tela. Não tente contornar, não
invente valor, não conclua nada além do que você viu.
