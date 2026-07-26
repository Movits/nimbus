---
status: vigente
atualizado: 2026-07-26
---

# Handoff para a sessão na nuvem

Cole o bloco abaixo como **primeira mensagem** da sessão nova. Ele é escrito para
o agente, não para você.

---

Você assume o projeto NIMBUS, uma marca brasileira de streetwear católico premium
com produção sob demanda pela YouDraw e loja na Nuvemshop (tema Baires).

## Antes de qualquer coisa

Clone os dois repositórios, lado a lado, e ligue-os:

```bash
git clone https://github.com/Movits/nimbus.git
git clone https://github.com/Movits/nimbus-assets.git
cd nimbus && npm install
node scripts/setup-assets.mjs
```

O de assets é **privado** e guarda o que é imagem: as artes oficiais, os blanks e
os mockups. Sem ele você não compõe nada.

O `setup-assets.mjs` mescla as duas árvores (copia só o que falta, é
idempotente). Sem ele os caminhos `designs/prontos/...` não existem.

**Se o clone do privado falhar por autenticação**, peça ao dono para conectar a
conta GitHub `Movits` nesta sessão. O repositório pertence a ela; não é preciso
convidar ninguém, é a mesma conta GitHub do repositório público. Não peça, não
receba e não guarde token em texto.

Peça ao dono uma **chave nova** do Google AI Studio e ponha em `.env` como
`GEMINI_API_KEY`. A chave antiga rodou em dezenas de sessões de agente e não deve
ser reaproveitada. **Nunca commite o `.env`** — o repositório principal é público.

Depois disso, leia **apenas** `docs/00-COMECE-AQUI.md`. Ele é o roteador: acha a
sua tarefa e manda para o fluxo certo. Não leia o projeto inteiro.

Confira que a base está sã:

```bash
npm run typecheck
node scripts/geometry/validate.mjs      # 38.880 casos sintéticos, tem que passar
node scripts/producao/inventario.mjs    # quantas capas existem
```

## O estado, em três frases

77 das 78 capas existem em disco, e **o lote está reprovado pelo dono**. O
compositor foi reescrito em 26/07 para aplicar a arte no tecido em vez de por
cima dele, e três pilotos com ele foram aprovados. O trabalho seguinte é
reconstruir o catálogo, **uma capa por vez**.

Detalhe em `docs/ESTADO.md`. Leia antes de agir.

## Três regras que não se negociam

**Uma capa por vez.** Lote sempre produziu erro repetido. Gerar, auditar tudo,
corrigir, auditar de novo, e só então a próxima. Após duas falhas equivalentes no
mesmo produto, pare e mude de método em vez de gastar crédito.

**Instrumento cego não vira veredito.** Quando um check acusa, ou você conserta o
instrumento ou prova que o alarme é falso. **Nunca rebaixe o check para
informativo.** Cinco dos sete defeitos catalogados nasceram disso, e a estampa
torta passou em 77 capas porque o check de centro tinha sido rebaixado.

**A imagem manda no número.** Se a medição diz que está certo e o olho diz que
está errado, o olho está certo e falta instrumento. O lote de 77 foi aprovado por
gate e reprovado pelo dono.

## O que o gate NÃO enxerga

Fidelidade de traço e texto, sinal do yaw, compressão sutil, e integração com o
tecido. Leia `docs/verdades/limites-conhecidos.md` **antes** de confiar em
qualquer número — é a página mais importante do projeto.

## O que não fazer sem autorização explícita

Publicar qualquer coisa na loja. Mexer em preço, custo, domínio, checkout, dados
legais, integração YouDraw, produtos ou variantes. Executar pedido pago. Remover
foto oficial da YouDraw (só as fotos de modelo desatualizadas saem).

O repositório principal é **público**: nunca exponha CPF, endereço, senha,
cookie, token ou dado de cliente.

## Tom da marca

Curto, humano, específico e reverente. Sem texto genérico ou exagerado.
**Não use travessão em copy pública.**

---

## Nota para o dono (não colar)

### Como dar acesso ao repositório privado

O acesso é do **GitHub**, não da conta Claude. O repositório pertence à conta
GitHub `Movits`, que é a sua — a mesma do repositório público.

**Caminho normal, e provavelmente o único que você precisa:** na sessão nova,
conecte a integração do GitHub com a conta `Movits`. Ela passa a enxergar os dois
repositórios, e nenhum convite é necessário.

**Se você quiser usar outra conta GitHub** (por exemplo uma criada para o email
`nimbuswearbr`), aí sim precisa convidar:

`github.com/Movits/nimbus-assets` → Settings → Collaborators → Add people →
o usuário → permissão **Read** basta para produzir; **Write** só se ela for
subir artes novas.

**Token pessoal é o último recurso.** Se a integração não estiver disponível,
crie um *fine-grained token* com acesso **só a `nimbus-assets`**, permissão
**Contents: Read-only**, e validade curta. Cole direto na sessão e **nunca o
commite** — o repositório principal é público. Eu não devo pedir, receber nem
guardar esse token.

### O que eu não tenho acesso

Não tenho acesso à sua conta Claude nova, nem a Google nenhum. Criei o
repositório privado usando o `gh` que já estava autenticado como `Movits` nesta
máquina, ou seja a sua própria credencial local. Nada foi criado em nome de
outra conta.


O que a sessão na nuvem consegue fazer depende de ela ter sistema de arquivos e
conseguir clonar o repositório privado. Se o clone do privado falhar por
autenticação, a alternativa é você subir os assets por lá uma vez, ou trabalhar
só com o que é texto.

O Google Drive ficou de fora por decisão de 26/07: o conector entrega arquivo
passando pelo contexto da conversa, o que inviabiliza arte de 30 MB, e duas
fontes sincronizadas foi como nasceram os dois CSV rivais de medidas que
sequestraram uma auditoria inteira.
