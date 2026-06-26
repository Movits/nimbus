# NIMBUS — Prompt pro Claude Cowork: importar produtos YouDraw → Nuvemshop

Cole o bloco abaixo no **Claude Cowork** (agente de navegador), com a **YouDraw e a Nuvemshop já
logadas** na mesma sessão. Dica: rode com **poucos produtos** primeiro pra validar, depois solte o
lote inteiro. Se travar numa etapa, peça pro Cowork "me descrever o que vê na tela" e a gente ajusta.

---

```
Você é um agente de navegador. Objetivo: importar TODOS os meus produtos da YouDraw para minha loja
Nuvemshop e depois conferir se tudo chegou lá. Já estou logado nas duas plataformas neste navegador.
YouDraw e Nuvemshop já estão integradas.

REGRAS GERAIS
- Trabalhe com calma, um passo por vez, esperando cada ação carregar antes da próxima.
- NUNCA exclua produtos e NUNCA altere preço, descrição, imagens ou qualquer config — só dispare a
  importação para a Nuvemshop.
- Se algo pedir login, pagamento ou uma confirmação destrutiva, PARE e me pergunte.
- Mantenha um LOG enquanto trabalha: nome do produto + status (importado agora / já estava / erro X).

PASSO 0 — Procurar importação em massa
1. Abra a YouDraw → aba "Meus Produtos".
2. Veja se existe "selecionar todos" / "importar em massa" / seleção múltipla. Se existir, use isso
   para importar tudo de uma vez para a Nuvemshop e pule para o PASSO 3.

PASSO 1 — Confirmar o fluxo (1º produto)
3. Se não houver importação em massa, faça UM produto como teste: abra as ações do produto, clique
   em "Importar" e depois em "Nuvemshop", e confirme. Me diga o nome exato de cada botão/passo que
   você usou, e então siga para o lote.

PASSO 2 — Importar um a um (todas as páginas)
IMPORTANTE: a PÁGINA 1 da lista de "Meus Produtos" eu JÁ importei manualmente para a Nuvemshop.
Comece pela PÁGINA 2. (Mesmo assim, na varredura do PASSO 3, inclua a página 1 na conferência.)
4. Para CADA produto, em CADA página da lista (a partir da página 2): abra as ações → "Importar" →
   "Nuvemshop" → confirme; espere a confirmação de sucesso antes do próximo.
5. Se o produto já estiver importado/conectado (botão desabilitado ou "já importado"), PULE e
   registre como "já estava".
6. Avance pela paginação até o fim, sem repetir páginas. Se aparecer erro/tela inesperada, registre
   no log e siga para o próximo (não trave).

PASSO 3 — Varredura de conferência (nas DUAS plataformas)
7. Liste TODOS os produtos da YouDraw (todas as páginas) = conjunto A (nomes).
8. Vá para a Nuvemshop → Produtos e liste TODOS = conjunto B (nomes).
9. Compare por nome: (a) na YouDraw e NÃO na Nuvemshop = faltou importar; (b) na Nuvemshop e não na
   YouDraw = extra/duplicado; (c) confira se os totais batem.

RELATÓRIO FINAL
10. Me entregue: total na YouDraw, total na Nuvemshop, quantos importados agora / já estavam / com
    erro (com nomes), a lista do que FALTOU importar e a de divergências/duplicados, e se está tudo OK.
    Deixe as pendências separadas pra eu resolver manualmente.
```
