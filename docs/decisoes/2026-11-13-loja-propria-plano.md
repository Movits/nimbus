---
status: vigente
atualizado: 2026-11-13
aprovacao: aprovado-pelo-dono
---

# Loja própria da NIMBUS: o plano para o dono aprovar

> [!info] Aprovado pelo dono em 13/11/2026, no chat: "Pode aprovar tudo". Valem
> as sete recomendações da lista abaixo. A aprovação é do plano: cada passo da
> lista do fim continua esperando o sim dele, um por um. Ficou sem escolha o
> endereço do rodapé (decisão 3), que não tinha recomendação.

Em 12/11/2026 o dono decidiu sair da Nuvemshop e fazer loja própria
(`docs/ESTADO.md`, seção "Loja e funil"). Este documento planeja essa loja em
oito pontos, com opções, prós, contras e custo, e abre com a lista do que só ele
decide. **Nenhuma linha de código de pagamento começa antes do sim dele.**

> [!warning] Este plano não autoriza nada sozinho. Criar conta em gateway, gerar
> chave de API, fazer cobrança, trocar DNS e publicar: cada passo espera o sim
> explícito do dono, um de cada vez (lista no fim). Nada aqui muda preço,
> produto ou variante.

## O que o dono decide

1. **Gateway.** Mercado Pago Checkout Pro, com a conta no CNPJ (recomendado),
   ou PagBank, Pagar.me ou Stripe. Seção 1.
2. **Hospedagem.** Site e servidor na Cloudflare, plano grátis, com o DNS
   saindo da GoDaddy (recomendado). Isso aceita a leitura de que o checkout por
   redirecionamento não é "coletar cartão" no nosso site. A outra saída é pagar
   os planos da Cloudflare (de US$ 25 a 30 por mês) para não depender dessa
   leitura. Seção 2.
3. **Endereço no rodapé.** O Decreto 7.962 exige endereço físico na loja: o do
   CNPJ ou um endereço comercial contratado. Seção 7.
4. **Etiqueta.** Melhor Envio (recomendado) ou contrato direto com os Correios.
   Seção 5.
5. **E-mail do pedido.** Resend grátis, mandando de `pedidos@nimbuswear.com.br`
   (recomendado). Seção 4.
6. **Estorno na desistência.** Quando o cliente desiste (recomendado: é o que
   diz a lei) ou quando ele posta a peça de volta. Seção 4.
7. **O teste final.** Um produto oculto de valor baixo e uma peça de verdade,
   comprados por ele. Seção 8.

O fornecedor (IzzyPrint ou Gubo) segue em aberto em outra frente. O plano serve
aos dois, mas sair da Nuvemshop pesa nessa escolha: a Gubo publica API para
loja própria, sem pedido mínimo, e a IzzyPrint não publica integração nenhuma
fora da Nuvemshop (seção 6).

## Como a compra vai funcionar

```
vitrine            sacola no navegador, como hoje
/loja/finalizar/   contato, endereço e projeto social
servidor           refaz preço e frete pelo catálogo e grava o pedido
resumo             o cliente vê itens, frete e total antes de pagar
gateway            Pix, cartão ou boleto na página do gateway
aviso (webhook)    o servidor confere e marca o pedido como pago
e-mails            ao cliente e ao dono
/admin/            o dono repassa o pedido e lança o rastreio
e-mail de envio    com o rastreio
```

O número do cartão nunca passa pelo site nem pelo servidor da NIMBUS: o cliente
digita na página do gateway.

## 1. Meio de pagamento

**O que o gateway tem que ter:**

- Pix, cartão e boleto na mesma página dele, com o cartão em até 12x e juros
  pagos pelo comprador, que é o que o site já promete;
- checkout por redirecionamento, sem campo de cartão no nosso domínio (seção 2);
- aviso de pagamento assinado, consulta do pagamento por API, estorno por API e
  ambiente de teste;
- nenhuma mensalidade.

**As quatro opções**, pelas páginas oficiais lidas em 12 e 13/11/2026:

| | Mercado Pago Checkout Pro | PagBank Checkout | Pagar.me Essencial | Stripe Checkout |
|---|---|---|---|---|
| Pix | 0,99% | 1,89% (o Link de pagamento diz 0,99%) | 0,99% | 1,19%, "disponível somente por convite" na página de preços |
| Cartão à vista | 4,98% na hora; 4,48% em 14 dias; em 30 dias a mesma página dá 2,95% na tabela e 3,98% no FAQ | 4,99% + R$ 0,40 em 14 dias; 3,99% + R$ 0,40 em 30 | 4,19%, no dia seguinte | 3,99% + R$ 0,39, em 30 dias |
| 12x com juros do comprador | sim (o vendedor escolhe quem paga) | sim, é o padrão (até 18x) | até 21x; quem paga não está publicado | parcelamento em conta brasileira não publicado |
| Boleto | R$ 3,99 | publicado com as mesmas taxas do cartão | não publicado | R$ 3,45 |
| Mensalidade | não | não consta | não | não |
| Aviso assinado | sim, `x-signature` (HMAC SHA-256) | sim, mas duas páginas da documentação dão métodos diferentes | a API atual (v5) não documenta assinatura | sim, `Stripe-Signature` |
| Estorno por API | total e parcial, até 180 dias | total e parcial | total e parcial | total e parcial; boleto contraditório na documentação |
| Teste | contas e cartões de teste | sandbox | chaves de teste | sandbox |
| Conta | MEI e CPF não estão nas páginas abertas | CPF ou CNPJ; homologação obrigatória antes de produção | CNPJ ou MEI, com site | pessoa física ou jurídica, MEI incluído |
| Pontos de atenção | conta nova pode receber em 7 dias; o estorno sai do saldo da conta; transferência para o banco grátis | contestação de R$ 6,72 a R$ 13,66 | dinheiro de vendedor novo pode ficar retido até 30 dias | contestação de R$ 55 |

**Quanto fica num pedido de R$ 200:**

| | Pix | Cartão à vista | Boleto |
|---|---|---|---|
| Mercado Pago | R$ 1,98 | R$ 9,96 na hora; R$ 8,96 em 14 dias | R$ 3,99 |
| PagBank | R$ 3,78 | R$ 10,38 em 14 dias; R$ 8,38 em 30 | igual ao cartão, se valer o publicado |
| Pagar.me | R$ 1,98 | R$ 8,38 | não publicado |
| Stripe | R$ 2,38, se o Pix for liberado | R$ 8,37 | R$ 3,45 |

**Recomendação: Mercado Pago Checkout Pro, no modo redirecionamento**, com a
conta no CNPJ do MEI.

- **Por quê:** é o único dos quatro que fecha tudo o que o site já promete (Pix,
  boleto e 12x com juros do comprador) com o aviso assinado documentado de um
  jeito só. Tem o Pix mais barato (empatado com o Pagar.me). O comprador
  brasileiro conhece a página e pode pagar com o saldo da conta dele. Não tem
  mensalidade, e a transferência para o banco é grátis.
- **Contra:** o cartão "na hora" é o mais caro (4,98%); receber em 14 ou 30 dias
  baixa a taxa. A própria página dá dois números para o cartão em 30 dias:
  conferir no painel da conta antes de abrir. Conta nova pode receber em 7
  dias. O estorno sai do saldo, então a conta precisa ter saldo para devolver.
  Se aceita MEI e CPF não está nas páginas abertas: confirma-se ao abrir a conta.
- **Por que não os outros:** o Stripe tem Pix só por convite e não publica
  parcelamento no Brasil. O Pagar.me não documenta assinatura do aviso na API
  atual e pode reter o dinheiro de vendedor novo por 30 dias. O PagBank cobra
  quase o dobro no Pix do checkout e exige homologação antes de produção.

## 2. Hospedagem

### O que os termos dizem

- **GitHub Pages proíbe.** A documentação diz que o Pages não pode servir de
  hospedagem grátis para negócio online, e-commerce ou site voltado
  principalmente a facilitar transação comercial, e que não deve receber
  transação sensível, como número de cartão. Os termos de produtos adicionais
  do GitHub repetem a regra. É por isso que a vitrine sai do Pages, e não só o
  checkout.
- **Vercel Hobby proíbe uso comercial** (conselho de 28/10, no ESTADO).
- **Cloudflare permite, com uma condição.** O contrato do plano grátis
  (Self-Serve Subscription Agreement) não proíbe uso comercial nem e-commerce, e
  os termos do Workers e do Pages também não. Mas o §2.2.1(h) proíbe processar
  ou coletar dados de cartão em site que use serviço grátis. Conferido no texto
  do contrato em 13/11/2026.

**O que a condição obriga.** O checkout é por redirecionamento: o cliente sai
para a página do gateway e digita o cartão lá, no domínio dele. Nunca campo de
cartão, iframe ou janela embutida do gateway no site da NIMBUS. E o servidor não
guarda nada do cartão, nem no banco nem no log, nem os últimos dígitos nem o
nome impresso: só o número do pagamento e o meio (Pix, cartão ou boleto).

**A dúvida que sobra.** A Cloudflare não diz por escrito se mandar o cliente
para um checkout de terceiro conta como "coletar". A nossa leitura é que não
conta, porque o cartão nunca passa pelo domínio da NIMBUS. Se o dono quiser
tirar a dúvida pagando, a saída é tirar o site do grátis: plano Pro na zona
(US$ 20 por mês no anual, US$ 25 no mensal) e Workers Paid (a partir de US$ 5
por mês).

A página de planos da Cloudflare descreve o Free como "para projetos pessoais
ou hobby". É texto de venda, não cláusula do contrato. A restrição antiga a
vídeo e arquivo grande hoje vale só para o CDN e não alcança a vitrine: o maior
arquivo do site tem 485 KB, e o limite do Workers é de 25 MiB por arquivo e 20
mil arquivos (o build tem 140).

### As opções

| Opção | Prós | Contras | Custo |
|---|---|---|---|
| **A. Cloudflare Workers** (site e servidor no mesmo projeto) | um projeto e um deploy; arquivo estático grátis e sem limite de requisição; banco, login do painel, antirrobô e e-mail de entrada na mesma conta; é o que a Cloudflare indica para projeto novo | o DNS tem que ir para a Cloudflare (no Free só existe troca de nameservers); a função tem 10 ms de CPU por requisição e 100 mil requisições por dia, que sobram para a loja mas vetam trabalho pesado (gerar PDF, mexer em imagem); tudo num fornecedor; a cláusula do cartão | R$ 0 |
| **B. Cloudflare Pages com Functions** | aceita subdomínio por CNAME sem mudar o DNS | a raiz `nimbuswear.com.br` exige os nameservers do mesmo jeito; a documentação do Pages manda começar projeto novo em Workers; a mesma cláusula | R$ 0 |
| **C. Site no GitHub Pages, só o servidor fora** | menos mudança agora | a vitrine com preço, sacola e botão de pagar continua sendo loja servida pelo Pages: não resolve o que os termos proíbem | R$ 0 |

**Recomendação: A.**

### Como mudar sem derrubar nada

Como está hoje (consulta pública de DNS, 12/11/2026): domínio comprado na
GoDaddy e DNS na GoDaddy (nameservers `domaincontrol.com`), com TTL de 10
minutos. A raiz aponta para os quatro endereços do GitHub Pages, o `www` para
`movits.github.io` e o `loja` para a Nuvemshop. Não há registro de e-mail (MX)
nem TXT na raiz.

**A GoDaddy guarda o nome e o DNS; quem serve o site é o GitHub Pages** (o
servidor responde "GitHub.com"). O dono perguntou em 13/11 por que a Cloudflare
entra "se o site está na GoDaddy": não está. Depois da mudança, o domínio
continua registrado na GoDaddy; só o DNS passa a ser respondido pela
Cloudflare, porque o plano grátis dela exige isso para ligar o servidor e o
login do painel ao nosso domínio (seção 2, opção A).

1. **Inventário.** O dono confere no painel de DNS da GoDaddy se há registro
   além desses: a consulta pública não lista subdomínio que ninguém pediu.
2. **Zona na Cloudflare, sem mudar nada no ar.** Conta do dono, zona
   `nimbuswear.com.br` no plano Free, os mesmos registros copiados e todos em
   "DNS only", sem o proxy. O GitHub Pages continua servindo, com o certificado
   dele.
3. **DNSSEC.** Se estiver ligado na GoDaddy, desligar antes de trocar os
   nameservers e religar depois, já na Cloudflare.
4. **Nameservers.** Trocar, na GoDaddy, pelos dois que a Cloudflare indicar.
   Durante a propagação os dois DNS respondem a mesma coisa, então nada cai. A
   zona fica ativa quando a Cloudflare confirmar.
5. **Site no Worker, num endereço de teste** (`*.workers.dev`). Rodar os
   portões, o `vitrine:olho` e uma comparação página a página com o que o GitHub
   Pages serve, inclusive o `404.html` e os redirecionamentos de
   `/loja-preview/`.
6. **Virada.** O domínio do Worker não aceita nome que já tenha registro, então
   no mesmo minuto: apagar os registros do GitHub Pages da raiz e do `www` e
   ligar os dois nomes no Worker. Para desfazer, desligar o domínio do Worker e
   recolocar os registros anotados no passo 1: volta em minutos.
7. **Reserva.** O GitHub Pages fica de pé por duas semanas, sem tráfego. Depois,
   desligar o Pages, tirar o `public/CNAME` e conferir que nenhum registro aponta
   mais para `github.io`.
8. **`loja.nimbuswear.com.br`.** Quando a Nuvemshop acabar, o registro vira um
   redirecionamento da Cloudflare (grátis) para `nimbuswear.com.br/loja/`, para
   o link antigo não morrer.

O `public/sw.js` não atrapalha a virada: o domínio é o mesmo e o HTML já vem
"rede primeiro". Falta só ele não guardar `/api/` nem `/admin/` (seção 7).

O deploy passa a ser `wrangler deploy` no mesmo GitHub Actions de hoje, depois
dos mesmos portões. O token da Cloudflare fica nos segredos do GitHub, nunca no
repositório.

## 3. Servidor

Uma função só (um Worker da Cloudflare, seção 2), com as rotas abaixo, as do
painel (seção 4) e uma tarefa agendada. Tudo o que vale dinheiro é decidido
nela, nunca no navegador.

**`POST /api/checkout`, o pedido.**

- Recebe de cada item só o SKU e a quantidade, mais contato, endereço e projeto
  social. Preço e frete vindos do navegador são ignorados.
- Lê o preço no `catalogo.json` que entrou no mesmo deploy da vitrine (o mesmo
  commit gera as duas coisas). SKU desconhecido ou indisponível, ou quantidade
  fora de 1 a 10, recusa o pedido.
- Calcula o frete pela regra da seção 5 a partir do CEP e confere se a UF
  informada bate com a faixa do CEP.
- Soma em centavos, com número inteiro. Grava o pedido como "aguardando
  pagamento" e cria o pagamento no gateway com o número do pedido como
  referência externa e como chave de idempotência (repetir o pedido não cria
  dois pagamentos).
- Devolve o resumo calculado (itens, frete, total) e o link do checkout. A
  página mostra o resumo antes do botão de pagar: é o "sumário do contrato" do
  Decreto 7.962 (seção 7).
- Contra robô: o Turnstile da Cloudflare no formulário (grátis, sem
  quebra-cabeça de imagem) e um limite de pedidos por IP.

**`POST /api/webhook/<gateway>`, o aviso de pagamento.**

- Confere a assinatura do aviso com o segredo do webhook (seção 1). Sem
  assinatura válida, recusa.
- Não confia no conteúdo do aviso: consulta o pagamento na API do gateway e lê
  dali o status, o valor, a moeda e a referência externa.
- Valor ou moeda diferente do pedido não libera nada: o pedido fica
  "divergente" e o dono recebe um e-mail.
- Idempotência: cada par (pagamento, status) é gravado uma vez só, com chave
  única no banco; a troca de status do pedido só acontece se o status anterior
  for o esperado; e o e-mail só sai quando a troca aconteceu. Aviso repetido não
  manda e-mail duas vezes.
- Responde em seguida; o e-mail sai depois da resposta.

**`GET /api/pedido` e `POST /api/pedido/desistir`, o acompanhamento.** Os dois
recebem o código do pedido e um token aleatório que só vai no e-mail do
cliente.

- O primeiro mostra o status ("pagamento confirmado", "preparando seu pedido",
  "enviado", com o rastreio). Nunca "em produção": a regra do de-para (seção 4
  dele) continua.
- O segundo é o botão "Quero desistir". O Decreto 7.962 manda aceitar a
  desistência pela mesma ferramenta da compra (seção 7). Ele grava a
  desistência, confirma na hora por e-mail ao cliente e avisa o dono. Quem
  confere o prazo de 7 dias é o dono, no painel.

**Conciliação de hora em hora** (tarefa agendada do Worker; o plano grátis dá
cinco). Pedido aguardando pagamento há mais de uma hora é conferido na API do
gateway. Pega o aviso que se perdeu.

**Segredos** (token do gateway, segredo do webhook, chave do e-mail, segredo do
GA4) ficam só no cofre do Worker (`wrangler secret`), nunca no repositório, que é
público. Um portão novo procura padrão de chave no repositório antes de cada
deploy.

**Portão novo, `loja:teste`.** Uma matriz de sacolas e CEPs com o total
esperado de cada uma; aviso com assinatura falsa recusado; aviso repetido sem
segundo e-mail; valor adulterado bloqueado. Entra no `vitrine:portoes` e no CI.
Ele substitui o `vitrine:variantes`, que compara a vitrine com a Nuvemshop e
perde o objeto. Não é rebaixar o portão: o novo confere a mesma coisa (o preço
que o cliente vê é o preço cobrado) na arquitetura nova.

## 4. Pedido

### Banco

O D1, banco SQLite da Cloudflare, na conta do dono e fora de qualquer
repositório. O plano grátis dá 5 GB (até 500 MB por banco), 5 milhões de linhas
lidas e 100 mil escritas por dia: um pedido escreve poucas dezenas de linhas.

- **Tabelas:** pedidos; itens; eventos (cada mudança de status, com a data);
  avisos recebidos (a idempotência da seção 3).
- **Cópia:** o D1 restaura qualquer ponto dos últimos 7 dias no grátis (Time
  Travel). Além disso, um export mensal (`wrangler d1 export`) guardado pelo
  dono fora de qualquer git, inclusive do brain.
- **Guarda:** pedido pago fica pelo prazo fiscal (5 anos é o usual; confirmar
  com o contador). Pedido que nunca foi pago é apagado em 30 dias.

### E-mails

| Quando | Para quem | O que diz |
|---|---|---|
| Pedido criado | cliente | o resumo e o link para pagar (confirmação imediata, Decreto 7.962, art. 4º, III) |
| Pagamento aprovado | cliente | a confirmação, o prazo, o link de acompanhamento e como desistir em 7 dias |
| Pagamento aprovado | dono | o pedido a repassar e o link do painel |
| Enviado | cliente | o código de rastreio |
| Desistência registrada | cliente | a confirmação de que a desistência chegou (art. 5º, §4º) e a etiqueta de devolução |
| Desistência registrada | dono | o pedido, o estorno a fazer e a devolução |
| Divergência ou erro | dono | o que aconteceu e em qual pedido |

Quem manda os e-mails:

| Opção | Prós | Contras | Custo |
|---|---|---|---|
| **Resend, plano grátis** | API simples, chamada direto da função | mais um fornecedor; 100 e-mails por dia e 3 mil por mês; só manda depois de o domínio ser verificado | R$ 0 |
| **Email Service da Cloudflare** | mesma conta, sem fornecedor novo | o envio está em beta e só existe no Workers Paid; a cota diária de conta nova não é publicada | US$ 5 por mês, com 3 mil e-mails |

**Recomendação: Resend grátis.** Cem e-mails por dia são uns trinta pedidos por
dia, longe do volume do começo.

O remetente tem que ser do domínio da marca (`pedidos@nimbuswear.com.br`), com
os registros SPF e DKIM no DNS: nenhum serviço manda em nome de um Gmail. A
resposta do cliente vai para o e-mail de hoje. Receber em
`contato@nimbuswear.com.br` e encaminhar para o Gmail sai de graça pelo Email
Routing da Cloudflare, se o dono quiser.

### Painel mínimo

`/admin/`, protegido pelo Cloudflare Access, grátis até 50 usuários, que
protege um caminho só do domínio. O dono entra com um código que chega no
e-mail dele (o "one-time PIN", que se liga à mão na configuração): não existe
senha nossa para guardar. Ligar o Zero Trust pede um cartão de pagamento mesmo
no plano grátis, sem cobrança: é passo do dono. O servidor também
confere o token do Access em cada pedido ao painel, para o caso de a regra do
Access ser mexida por engano.

O que o painel faz:

- lista os pedidos por status;
- mostra o pedido com a receita de repasse, tirada do de-para: peça IzzyPrint,
  arquivo da arte, vista, tamanho em cm e gola→arte;
- três botões:
  - "Repassado", com o número do pedido na IzzyPrint e o custo real cobrado;
  - "Enviado", com o rastreio, que dispara o e-mail ao cliente;
  - "Desistência", para a que chegar por e-mail e não pelo botão, com a mesma
    confirmação ao cliente;
- exporta CSV para a contabilidade e para o Diário de Repasses dos 10%.

O projeto social do pedido passa a ser escolhido numa lista no formulário de
compra (Fazenda da Esperança, Cáritas Brasileira, Pequeno Cotolengo ou outro),
e não mais escrito no "campo mensagem" da Nuvemshop. A conta dos 10% sai do
CSV.

### Reembolso

Na primeira versão, o estorno é feito no painel do próprio gateway, que já faz
isso. O aviso de "reembolsado" chega pelo webhook e atualiza o pedido sozinho.
Botão de estorno no nosso painel fica para uma segunda versão: é menos código
nosso mexendo em dinheiro.

No Mercado Pago o estorno é total ou parcial, até 180 dias depois da aprovação.
O Pix volta para a conta de quem pagou, e o dinheiro do estorno sai do saldo da
conta.

**Quando estornar na desistência é decisão do dono:**

- **Quando o cliente desiste (recomendado).** É o que dizem o CDC (art. 49,
  parágrafo único: os valores pagos "serão devolvidos, de imediato") e o
  Decreto 7.962 (art. 5º, §3º). O risco é a peça não voltar; com o volume do
  começo, é pequeno.
- **Quando o cliente posta a devolução.** É prática comum e protege contra peça
  que não volta, mas a lei não prevê essa espera.

Nos dois casos, a etiqueta de devolução vai junto com a confirmação da
desistência, e a página de trocas passa a dizer o prazo do estorno.

## 5. Frete

**A regra não muda** (28/10/2026): grátis fora da região Norte; no Norte,
R$ 19,90, e grátis a partir de R$ 399,90 em produtos.

**O cálculo é do servidor**, pela faixa de CEP dos sete estados do Norte, sem
API de fora:

| Estado | Faixa de CEP |
|---|---|
| Pará | 66000-000 a 68899-999 |
| Amapá | 68900-000 a 68999-999 |
| Amazonas | 69000-000 a 69299-999 e 69400-000 a 69899-999 |
| Roraima | 69300-000 a 69399-999 |
| Acre | 69900-000 a 69999-999 |
| Rondônia | 76800-000 a 76999-999 |
| Tocantins | 77000-000 a 77999-999 |

Juntas, são duas faixas contínuas: **66000-000 a 69999-999** e **76800-000 a
77999-999**. Só a do Acre está confirmada em página dos Correios (o manual da
API Busca CEP); as outras seis vêm da Wikipedia e do pacote `geobr` do IPEA,
que batem entre si. Conferir as sete na Busca Faixa de CEP dos Correios antes
de abrir.

A mesma tabela vai no `catalogo.json`, para a sacola mostrar o mesmo número que
o servidor vai cobrar. Se os dois discordarem, vale o do servidor, que é o que
aparece no resumo antes de pagar.

> [!warning] O site de hoje não diz a regra de 28/10. A página `/loja/envios/`
> diz "frete grátis para todo o Brasil" a partir de R$ 399,90 e "R$ 19,90"
> abaixo disso. A sacola diz "faltam R$ X para frete grátis", e a página de
> produto e a faixa do topo, "frete grátis a partir de R$ 399,90". Para quem
> está fora do Norte o frete já é grátis em qualquer valor. Está inerte com a
> loja fechada, mas tem que ser corrigido antes de abrir (seção 7).

**Quanto a regra custa.** Fora do Norte a NIMBUS paga a etiqueta inteira: o PAC
cotado em 26/10 de São Paulo para Rio, BH, Brasília, Porto Alegre e Salvador
ficou entre R$ 22,32 e R$ 24,99. Isso já está na conta de margem do ESTADO
(semana de 20 a 26/10).

**A etiqueta.** A IzzyPrint pede a etiqueta no nome da marca, com o endereço
dela como remetente (11/08).

| Opção | Prós | Contras | Custo |
|---|---|---|---|
| **Melhor Envio** | sem mensalidade; carteira pré-paga (o Pix entra na hora); API pública, com modo de teste, que aceita loja própria; aceita envio com nota fiscal (a etiqueta leva a chave) ou com declaração de conteúdo eletrônica (DC-e); com a empresa cadastrada como "loja", a etiqueta leva o nome fantasia e o telefone dela, e não os dados pessoais do dono; tem devolução pelos Correios: o cliente recebe um código, imprime a declaração e posta numa agência (o código vale 7 dias, e o frete é da loja) | os termos proíbem informar remetente diferente do titular da conta e exigem o CEP de origem verdadeiro (cl. 7.1, "d"); a conta aceita outros endereços de origem, mas não está escrito se o de um terceiro pode ser um deles; a central de ajuda se contradiz sobre o MEI: um artigo de 2024 diz que ele pode usar declaração de conteúdo na venda a pessoa física, e o de abril de 2026 diz que o MEI que vende deve emitir nota; o cadastro começa pelo CPF do dono, e o CNPJ entra depois como "loja" | o frete de cada etiqueta; R$ 6,90 por saque da carteira |
| **Correios direto** | sem intermediário | tarifa e API de contrato exigem contrato comercial com os Correios (a própria API de CEP deles pede contrato); sem contrato, é preço de balcão; não pesquisado a fundo nesta rodada | a cotar |

**Recomendação: Melhor Envio**, à mão no painel dele no começo, e pela API
quando o volume pedir. Antes da fase 6, confirmar com o Melhor Envio que a
etiqueta pode sair no nome da NIMBUS com o endereço da IzzyPrint como origem.
Se não puder, a pergunta volta para a IzzyPrint: como ela despacha para quem
não usa a integração da Nuvemshop.

A nota fiscal mexe na etiqueta: envio com nota leva a chave dela, então a nota
sai antes da etiqueta. Ver "Nota fiscal", na seção 7.

## 6. Repasse

Até a integração existir, o repasse é manual, pelo checklist da seção 5 do
[`de-para-izzyprint.md`](../fluxos/de-para-izzyprint.md), com o painel no lugar
da Nuvemshop:

1. O e-mail "pedido pago" chega ao dono.
2. No painel, a receita do pedido (peça, arte, vista, tamanho, gola→arte).
3. Na IzzyPrint, montar o item, fazer as quatro conferências do de-para e pagar.
   É o pagamento que dispara a produção (até 4 dias úteis).
4. No painel, "Repassado", com o número do pedido deles e o custo real.
5. A nota fiscal do cliente (seção 7).
6. A etiqueta no nome da NIMBUS, com o endereço da IzzyPrint como origem
   (condição de 11/08) e a chave da nota, comprada como diz a seção 5 e enviada
   a eles.
7. O rastreio no painel, que manda o e-mail ao cliente.

Custo fixo do repasse, confirmado pela IzzyPrint em 11/08: R$ 3,50 de expedição
por pedido e R$ 1,00 por peça de etiqueta interna. O blank e a estampa seguem a
tabela do de-para (seção 6 dele).

**O que muda quando a integração abrir.** A integração que a IzzyPrint
confirmou é com a Nuvemshop, e só liga com 5 peças por dia. Para a loja
própria, a pergunta que falta fazer a eles é se existe API, ou outro caminho
fora da Nuvemshop, e com que mínimo. O site dela não publica API nem integração
nenhuma (sitemap e páginas varridos em 12/11/2026). Quando houver:

- o aviso de pagamento aprovado cria o pedido na IzzyPrint sozinho, com um mapa
  do SKU nosso para o SKU deles (eles têm gerador de SKU próprio), conferido por
  portão;
- a etiqueta sai pela API do serviço de etiqueta no mesmo passo;
- o rastreio volta pela API e dispara o e-mail de envio;
- o painel fica para a exceção: cor ou tamanho sem blank, erro, devolução.

O pagamento à IzzyPrint segue pedido a pedido: na integração deles "só é
preciso fazer o pagamento" (11/08).

**A Gubo muda essa conta.** Ela publica integração com Nuvemshop, WooCommerce
e uma API própria para loja própria (pedido por SKU, webhooks e modo de teste),
sem mensalidade e sem pedido mínimo, com saldo pré-pago na carteira dela. A
documentação da API pede login, então os detalhes ficam a confirmar. Com a
Gubo, o repasse automático pode existir desde o primeiro pedido; com a
IzzyPrint, fica manual até ela abrir um caminho. O que pesava contra a Gubo
continua (conselho de 28/10): a estampa em DTF, que o dono achou plastificada
na YouDraw, e a amostra que decide. A escolha é do dono, na outra frente.

## 7. O que muda no site, nos textos legais e no CLAUDE.md

### No código do site

- **`scripts/vitrine/build-catalogo.mjs` e `public/loja/catalogo.json`.**
  `loja.base` sai. O catálogo passa a ser a fonte do preço cobrado, e não só do
  preço mostrado. Hoje ele nasce da planilha da Nuvemshop (o `variant_id`, a URL
  do produto lá e as fotos na CDN dela). A fonte nova é uma planilha nossa, com
  SKU, preço, cor, tamanho e disponibilidade, e as fotos moram no próprio site.
- **`public/loja/js/ui.js`.** Sai o `urlCarrinho` e toda a ponte com a
  Nuvemshop: o POST num iframe escondido, os cookies `nimbus_sacola_alvo` e
  `nimbus_sacola_loja`, a sincronia e a validade de 48 horas, que existiam porque
  o carrinho de verdade era o da loja. Sai também o código da Ecobag e do cupom
  ECOBAG, sem uso desde 13/08. O botão da sacola leva para `/loja/finalizar/`.
- **`public/loja/js/produto.js`.** "Adicionar à sacola" passa a só gravar no
  navegador.
- **`scripts/vitrine/build-paginas.mjs`.** A constante `SACOLA` e o `destino()`;
  o "Acompanhar pedido" do rodapé aberto, que vai para `/loja/pedido/`; as notas
  da página de produto que falam em "carrinho da loja"; as páginas novas
  `/loja/finalizar/`, `/loja/pedido/obrigado/` e `/loja/pedido/`.
- **`src/data/marca.json`.** `seloDoEstado.aberta` ("Compra pelo checkout da
  Nuvemshop") e o `_leia`, que cita a Nuvemshop. A linha `legal` ganha o que o
  Decreto pede (abaixo).
- **Landing.** `src/data/content.ts` (o comentário sobre a loja) e
  `src/sections/Overlay.tsx` (o `?ref=landing` dos links para a loja).
- **Scripts que batem na loja.** `scripts/vitrine/monitor-ar.mjs` (o monitor
  diário vai acusar erro quando a Nuvemshop sair do ar),
  `scripts/vitrine/parity-variantes.mjs` (o portão `vitrine:variantes`, trocado
  pelo `loja:teste` da seção 3) e `scripts/vitrine/link-check.mjs`. Os de
  auditoria antiga que citam a loja já são superados.
- **`public/sw.js`.** Não guardar `/api/` nem `/admin/` no cache.
- **`docs/fluxos/tracking-plan.md`.** O `purchase` deixa de ser "planejado na
  Nuvemshop" e passa a sair do servidor, pelo Measurement Protocol do GA4, quando
  o pagamento é aprovado (o cliente que paga Pix e fecha a aba conta do mesmo
  jeito). O `begin_checkout` passa a ser a abertura de `/loja/finalizar/`.

### Nos textos legais

- **Privacidade** (`/loja/privacidade/`). Sai "ambiente da loja (Nuvemshop)".
  Entra: o que o formulário de compra coleta (nome, e-mail, telefone, endereço
  e o CPF, que a nota por pedido deve exigir); para que serve cada dado; com quem é
  compartilhado (gateway, Cloudflare, provedor de e-mail, IzzyPrint, serviço de
  etiqueta e transportadora); por quanto tempo fica; e como pedir para apagar.
  Saem os dois cookies da sacola, que deixam de existir.
- **Trocas** (`/loja/trocas/`). Como pedir (e-mail, como hoje); a etiqueta de
  devolução paga pela NIMBUS; o estorno pelo mesmo meio de pagamento, e quando
  (decisão do dono). Falta decidir para onde a devolução vai (a IzzyPrint, de
  onde a peça saiu, ou o dono) e confirmar com a IzzyPrint o que ela faz com a
  peça que chega lá.
- **Envios** (`/loja/envios/`). A regra de 28/10 escrita certa (seção 5: hoje a
  página diz outra coisa); o frete aparece na finalização, antes de pagar; o
  rastreio chega por e-mail e na página do pedido.
- **Impacto** (`/loja/impacto/`). "No checkout, no campo mensagem do pedido"
  vira a escolha do projeto no formulário.
- **Decreto 7.962/2013.** O que vira tarefa:
  - **rodapé** (art. 2º, I e II): nome empresarial e CNPJ, endereço físico e
    e-mail. Hoje a linha legal diz só "Brasília DF"; o endereço é a decisão 3
    do dono;
  - **página de produto** (art. 2º, III e V): características, medidas,
    pagamento, disponibilidade e prazo. Já existe; revisar no catálogo novo;
  - **resumo antes de pagar** (art. 2º, IV, e art. 4º, I e II): itens, frete à
    parte, total, prazo e política de troca, com o caminho para corrigir a
    sacola e o endereço antes de pagar;
  - **e-mail do pedido** (art. 4º, III e IV): confirmação na hora, com o
    resumo, num formato que o cliente pode guardar;
  - **atendimento** (art. 4º, V e VI, e parágrafo único): o e-mail de
    atendimento confirma na hora que recebeu a mensagem, pelo mesmo meio
    (resposta automática), e responde de verdade em até 5 dias;
  - **desistência pela mesma ferramenta da compra** (art. 5º, §1º): o botão
    "Quero desistir" na página do pedido (seção 3). A confirmação sai na hora
    (§4º), e o estorno no cartão é pedido de imediato à operadora (§3º), que é o
    que o estorno pelo gateway faz.
- **Nota fiscal.** A IzzyPrint emite só a nota do serviço dela; a do cliente é
  da NIMBUS (11/08).
  - Até 31/12/2026, o MEI está dispensado de nota na venda a consumidor pessoa
    física (Resolução CGSN 140/2018, art. 106, II, "a", 1).
  - A partir de 01/01/2027, a Resolução CGSN 190/2026 manda o MEI emitir
    documento fiscal nas vendas, de preferência pela Nota Fiscal Fácil. A CGSN
    195/2026 deixa a DASN-Simei valer como documento fiscal da venda a pessoa
    física sem CNPJ.
  - O pacote precisa viajar com nota ou com declaração de conteúdo, e o artigo
    de abril de 2026 do Melhor Envio diz que o MEI que vende deve emitir nota.
  - **O plano trata cada pedido como pedido com nota, desde o primeiro**: o dono
    emite a nota depois do pagamento e antes da etiqueta, pelo emissor que o
    contador indicar. A loja deve abrir já em 2027, e este é o caminho que
    serve nos dois anos. Fechar com o contador antes da fase 6, inclusive se a
    DASN-Simei dispensa a nota por pedido.
  - O teto do MEI conta a venda cheia, não a margem: R$ 81 mil por ano hoje. A
    Lei Complementar 238/2026 leva o teto a R$ 110 mil em 2027 e a R$ 140 mil a
    partir de 2028, desde que o orçamento preveja.

### No CLAUDE.md e nos outros documentos

- **`CLAUDE.md`.** A primeira linha ("loja na Nuvemshop, plano Impulso, tema
  Baires congelado"). Os "três entregáveis": a loja deixa de ser um kit colado no
  painel e vira o servidor deste repositório. A frase "A Nuvemshop não faz deploy
  por Git" e o protocolo de CSS do painel. Os endereços (saem Loja e Painel
  Nuvemshop; entram `/admin/` e o painel do gateway). E os limites ganham três
  linhas: segredo só no cofre do Worker; dado de cliente só no banco; e, como o
  checkout passa a ser código deste repositório público, todo preço novo entra
  por commit que o dono aprova.
- **`README.md`**: a tabela dos entregáveis e a linha de deploy.
- **`docs/00-COMECE-AQUI.md`**: as duas linhas da Nuvemshop viram histórico; entra
  uma linha "Repassar um pedido".
- **`docs/fluxos/de-para-izzyprint.md`**: o checklist da seção 5 troca a
  Nuvemshop pelo painel.
- **`docs/fluxos/publicar-na-loja.md`, `docs/fluxos/site-css-e-hover.md` e a
  pasta `nuvemshop/`**: viram histórico, com o motivo.

## 8. Fases

Esforço em sessões de trabalho como as deste projeto. A loja segue fechada
(`VITRINE_ABERTA = false`) do começo ao fim: abrir é outra decisão, que depende
do catálogo novo.

| Fase | O que entrega | Esforço | O que precisa do dono | Como desfaz |
|---|---|---|---|---|
| 0. Aprovação | as decisões da lista acima | 1 hora dele | todas | nada a desfazer |
| 1. DNS na Cloudflare | o mesmo site, com o DNS na Cloudflare | meia sessão, mais até 48 h de propagação | criar a conta na Cloudflare; trocar os nameservers na GoDaddy | voltar os nameservers da GoDaddy |
| 2. Site na Cloudflare | landing e vitrine servidas pelo Worker, deploy pelo GitHub Actions | 1 sessão | o token da Cloudflare no GitHub; o sim da virada | religar os registros do GitHub Pages |
| 3. Servidor | checkout, webhook, conciliação, banco e portão `loja:teste`, com o gateway em modo de teste | 2 sessões | as credenciais de teste do gateway | não fica ligado a página nenhuma |
| 4. Páginas e textos | finalizar, obrigado e acompanhar; `ui.js` e `produto.js` sem a Nuvemshop; os textos legais novos | 1 e meia sessão | os textos e o endereço publicado | a loja segue fechada |
| 5. Painel e e-mails | `/admin/`, os e-mails da seção 4 e o de-para atualizado | 1 sessão | o Access e o domínio de e-mail | nada a desfazer |
| 6. Ponta a ponta | o teste completo, primeiro de mentira e depois de verdade | de meia a 1 sessão | as credenciais de produção, a nota fechada com o contador e a compra | estorno |

Total: de 6 e meia a 7 sessões. A fase 1 espera a propagação enquanto a fase 3
anda num endereço de teste da Cloudflare (`workers.dev`), então as duas correm
juntas.

### A fase 6 em detalhe

No modo de teste do gateway, cada um destes casos tem que dar o resultado
certo, com o pedido, o painel e os e-mails conferidos:

- pagamento aprovado no cartão, no Pix e no boleto;
- cartão recusado;
- Pix que vence sem pagar;
- aviso repetido (um e-mail só);
- aviso com assinatura falsa (recusado);
- valor adulterado no navegador (o servidor cobra o do catálogo);
- CEP do Norte abaixo e acima de R$ 399,90, e CEP de fora do Norte;
- estorno total e estorno parcial feitos no painel do gateway;
- desistência pelo botão do pedido, com a confirmação na hora;
- aviso perdido de propósito, recuperado pela conciliação.

Depois, com o sim do dono para cada passo, em produção:

1. **Um produto oculto de teste**, de valor baixo, aberto só por link. O dono
   paga com Pix. Confere os e-mails, o painel e o estorno feito no gateway.
2. **Uma peça de verdade do catálogo novo**, comprada pelo dono para o próprio
   endereço. Confere o caminho inteiro: repasse à IzzyPrint, nota, etiqueta,
   rastreio e entrega.

Só depois disso a loja pode abrir.

## Custo fixo, antes e depois

| | Na Nuvemshop | Na loja própria |
|---|---|---|
| Plataforma | R$ 156 por mês (Impulso) | R$ 0 (planos grátis da Cloudflare, seção 2) |
| Pagamento | Nuvem Pago | sem mensalidade; tarifa por venda (seção 1) |
| E-mail do pedido | incluído | R$ 0 até 100 por dia (Resend grátis) |
| Etiqueta | cotação no checkout | paga por envio (seção 5) |
| Domínio | já pago | já pago |

## Riscos que ficam

- **Erro no checkout passa a ser nosso.** Diminuem o risco: o checkout
  hospedado, o preço refeito no servidor, o portão `loja:teste`, a conciliação
  de hora em hora e o volume baixo do começo.
- **Tudo num fornecedor só.** Se a conta da Cloudflare parar, param o site e a
  loja. O código e o catálogo estão no git; o banco tem o export mensal.
- **A leitura da cláusula do cartão.** Se a Cloudflare entender que o
  redirecionamento conta como coletar cartão, sair do grátis custa de US$ 25 a
  30 por mês (seção 2).
- **Dado pessoal sob a nossa guarda.** Fica o mínimo, por prazo definido, atrás
  de login, e nunca neste repositório.

## Passos que esperam o sim do dono, um por um

1. As decisões da lista do começo.
2. Criar a conta dele na Cloudflare.
3. Trocar os nameservers na GoDaddy.
4. Criar a conta do gateway no CNPJ e gerar as credenciais de **teste**.
5. Gerar o token da Cloudflare para o GitHub Actions e guardá-lo nos segredos
   do GitHub.
6. Virar o domínio do GitHub Pages para o Worker.
7. Ligar o Zero Trust (pede cartão, sem cobrança) e o login do `/admin/`.
8. Criar a conta no provedor de e-mail e verificar o domínio (registros no DNS).
9. Criar a conta no Melhor Envio (começa pelo CPF; o CNPJ entra como loja).
10. Fechar a nota fiscal com o contador.
11. Aprovar os textos legais novos e o endereço que vai ser publicado.
12. Gerar as credenciais de **produção** do gateway.
13. Criar o produto oculto de teste e fazer as duas compras da fase 6.
14. Desligar o GitHub Pages.

## Fontes

Lidas em 12 e 13/11/2026, quase todas em página oficial; as exceções são duas
fontes de CEP, ditas na seção 5. As tarifas mudam: conferir de novo no painel de
cada conta antes de abrir a loja.

**Hospedagem**

- GitHub Pages, uso proibido: <https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits>
  e <https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features>
- Cloudflare, contrato do plano grátis (§2.2.1(h), cartão): <https://www.cloudflare.com/terms/>
- Cloudflare, termos do Workers e do Pages: <https://www.cloudflare.com/service-specific-terms-developer-platform/>
- Cloudflare, termos do CDN (vídeo e arquivo grande): <https://www.cloudflare.com/service-specific-terms-application-services/>
- Cloudflare, planos e preços: <https://www.cloudflare.com/plans/>
- Workers, limites e arquivos estáticos: <https://developers.cloudflare.com/workers/platform/limits/>
  e <https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/>
- Pages, recomendação de usar Workers: <https://developers.cloudflare.com/pages/>
- Domínio próprio no Worker e setup parcial: <https://developers.cloudflare.com/workers/configuration/routing/custom-domains/>
  e <https://developers.cloudflare.com/dns/zone-setups/partial-setup/>
- D1, limites e Time Travel: <https://developers.cloudflare.com/d1/platform/limits/>
  e <https://developers.cloudflare.com/d1/reference/time-travel/>
- Access, plano grátis, código por e-mail e ativação: <https://www.cloudflare.com/sase/products/access/>,
  <https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/>
  e <https://developers.cloudflare.com/cloudflare-one/setup/>
- E-mail pela Cloudflare: <https://developers.cloudflare.com/email-service/platform/pricing/>
- Segredos do Worker: <https://developers.cloudflare.com/workers/configuration/secrets/>
- Turnstile, plano grátis: <https://developers.cloudflare.com/turnstile/plans/>
- Resend: <https://resend.com/pricing>

**Pagamento**

- Mercado Pago, tarifas: <https://www.mercadopago.com.br/ferramentas-para-vender/check-out>
- Mercado Pago, checkout por redirecionamento: <https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/overview>
- Mercado Pago, aviso assinado: <https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications>
- Mercado Pago, estorno: <https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/additional-settings/refunds-and-cancellations>
- Mercado Pago, teste: <https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/integration-test/test-purchases>
- PagBank: <https://pagbank.com.br/para-seu-negocio/online/checkout>,
  <https://developer.pagbank.com.br/docs/checkout> e
  <https://developer.pagbank.com.br/devpagbank/reference/confirmar-autenticidade-da-notificacao>
- Pagar.me: <https://www.pagar.me/ofertas>, <https://docs.pagar.me/docs/checkout-about>
  e <https://docs.pagar.me/docs/webhooks>
- Stripe: <https://stripe.com/br/pricing>, <https://docs.stripe.com/payments/pix>,
  <https://docs.stripe.com/payments/installments> e <https://docs.stripe.com/webhooks>

**Frete**

- Melhor Envio, sem mensalidade: <https://centraldeajuda.melhorenvio.com.br/hc/pt-br/articles/31220727703700-O-Melhor-Envio-cobra-mensalidade>
- Melhor Envio, termos de uso (cl. 7.1, "d", o remetente): <https://static.melhorenvio.com.br/termos-de-uso.pdf>
- Melhor Envio, declaração de conteúdo e MEI, artigo de 2024: <https://centraldeajuda.melhorenvio.com.br/hc/pt-br/articles/31220462592276-O-que-%C3%A9-declara%C3%A7%C3%A3o-de-conte%C3%BAdo-dos-Correios-Quem-pode-usar>
- Melhor Envio, DC-e e MEI, artigo de abril de 2026: <https://centraldeajuda.melhorenvio.com.br/hc/pt-br/articles/41306548209300-Declara%C3%A7%C3%A3o-de-Conte%C3%BAdo-Eletr%C3%B4nica-DC-e-o-que-voc%C3%AA-precisa-saber>
- Melhor Envio, outros endereços de origem e nome fantasia: <https://centraldeajuda.melhorenvio.com.br/hc/pt-br/articles/31220439899412-Como-editar-as-informa%C3%A7%C3%B5es-de-remetente-para-inserir-os-dados-da-minha-loja>
- Melhor Envio, devolução: <https://centraldeajuda.melhorenvio.com.br/hc/pt-br/articles/31220449351700-Como-fa%C3%A7o-para-gerar-um-envio-quando-eu-precisar-receber-uma-encomenda>
- Melhor Envio, carteira e cadastro: <https://centraldeajuda.melhorenvio.com.br/hc/pt-br/articles/31220463176980-Posso-inserir-cr%C3%A9ditos-no-Melhor-Envio-Como-funciona-a-carteira-da-plataforma>
  e <https://centraldeajuda.melhorenvio.com.br/hc/pt-br/articles/31220442331924-Posso-cadastrar-a-minha-empresa-no-Melhor-Envio>
- Melhor Envio, API: <https://docs.melhorenvio.com.br/reference/inserir-fretes-no-carrinho>
- Faixas de CEP: <https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep>,
  <https://buscacepinter.correios.com.br/app/faixa_cep_uf_localidade/index.php>,
  <https://pt.wikipedia.org/wiki/C%C3%B3digo_de_Endere%C3%A7amento_Postal> e
  <https://github.com/ipeaGIT/geobr/blob/master/r-package/R/cep_to_state.R>

**Lei e nota fiscal**

- Decreto 7.962/2013: <https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm>
- CDC, art. 49: <https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm>
- Resolução CGSN 140/2018, consolidada: <https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=92278>
- Resolução CGSN 190/2026 (nota do MEI a partir de 2027): <https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=152832>
- Resolução CGSN 195/2026 (DASN-Simei como documento fiscal): <https://normas.receita.fazenda.gov.br/sijut2consulta/link.action?idAto=154194>
- Lei Complementar 238/2026 (teto do MEI): <https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp238.htm>

**Fornecedor**

- Gubo: <https://gubo.com.br/integracoes> e <https://gubo.com.br/precos>
- IzzyPrint, páginas varridas: <https://izzyprint.com.br/wp-sitemap.xml> e
  <https://izzyprint.com.br/print-on-demand/>

O DNS de hoje foi lido por consulta pública (`nslookup`) em 12/11/2026.
