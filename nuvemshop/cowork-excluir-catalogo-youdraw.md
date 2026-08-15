---
status: vigente
atualizado: 2026-08-14
---

# Prompt para o Cowork: EXCLUIR o catálogo da era YouDraw (Nuvemshop + YouDraw)

Ordem do dono (14/08), depois de os 49 produtos já terem sido ocultados: ele
quer **remover de verdade**, na Nuvemshop e também na plataforma da YouDraw.

## ⚠️ O que se perde, para o dono ler antes

Exclusão de produto é **irreversível** e leva junto:

- os **IDs Nuvemshop** (`352…`), que aparecem em toda a documentação do
  projeto: `catalogo.json`, `docs/fluxos/de-para-izzyprint.md`, o mapeamento de
  artes, as receitas de capa e o `item_id` do GA4;
- o **histórico** do produto no painel e qualquer relatório ligado a ele;
- os **SKUs** e as variantes, com as fotos hospedadas na CDN.

Nada disso é perda real **se** o catálogo vai ser remontado do zero na
IzzyPrint, que é a decisão vigente: os produtos novos nascem com IDs novos e a
documentação vira registro histórico. Só não dá para desfazer depois.

Uma alternativa mais barata, se o dono quiser pensar: os produtos já estão
**ocultos**, invisíveis para qualquer cliente, e nada obriga a excluir hoje.
Ocultos não geram custo nem confusão, e a exclusão pode acontecer no dia em
que os produtos novos entrarem.

**Se ele confirmar a exclusão, siga o roteiro abaixo. Se ele hesitar, pare.**

---

Você está no computador do Roberto, no Chrome logado. **Ele autorizou a
exclusão** dos produtos antigos, em duas plataformas. Trabalhe sozinho e
relate no fim.

## Regras que não se negociam

1. **Antes de excluir qualquer coisa, EXPORTE a lista de produtos** da
   Nuvemshop (Produtos → Exportar, ou o print da lista completa com nome e ID).
   Salve em `C:\nimbus-backup\catalogo-youdraw-2026-08-14.csv`. Sem esse
   arquivo, não comece.
2. **Não mexa** em preço, frete, checkout, dados fiscais, páginas
   institucionais, tema, CSS nem domínio.
3. **Não cancele nem altere plano, assinatura ou meio de pagamento** em
   nenhuma das duas plataformas. Cancelar conta não é a tarefa.
4. Print de cada etapa que o relatório menciona.
5. Se o painel travar (já aconteceu na rodada anterior), pare, releia a página
   e confirme o que ficou feito antes de repetir.

## Parte 1: Nuvemshop (loja.nimbuswear.com.br/admin)

1. Exportar a lista completa dos 49 produtos (passo 1 das regras).
2. Excluir os 49, um a um ou em massa se o painel permitir (Produtos →
   selecionar → Eliminar).
3. Conferir que a lista fica em 0 produtos e que nenhuma categoria ficou com
   contagem residual.
4. **Não excluir** o cupom ECOBAG (já está desativado e serve de histórico).

## Parte 2: YouDraw (app.youdraw.com.br)

A YouDraw foi encerrada como fornecedora em 07/08; a produção migrou para a
IzzyPrint. O objetivo aqui é tirar os produtos NIMBUS de lá.

1. Entrar em <https://app.youdraw.com.br/> com a conta do dono.
2. Em Produtos (ou Meus produtos), **exportar ou printar a lista** antes de
   apagar, para ficar registro do que existia.
3. Excluir os produtos NIMBUS. Se a plataforma **não** oferecer exclusão, faça
   o mais próximo disponível (desativar, arquivar, despublicar do marketplace)
   e **diga isso no relatório** em vez de forçar.
4. Se houver integração ativa com a Nuvemshop na conta, **desconectar**.
5. **Não cancele a conta nem o plano** sem ordem específica do dono: pode
   haver histórico de custos que ele ainda queira consultar.

## Relatório final

- Nuvemshop: print da lista em 0 produtos e o caminho do CSV exportado.
- YouDraw: o que foi excluído, o que só deu para desativar, e se a integração
  foi desconectada.
- Qualquer coisa que não deu para fazer, com o motivo.
