# E1 ficou BLOQUEADO: o mockup plano não é obtenível sem login

Registrado em 25/07/2026, logo depois do plano de portabilidade ser aprovado.
Corrige uma premissa desse plano, então vem antes de qualquer código construído
em cima dela.

## O que o plano assumia

> Nenhum fornecedor de POD entrega produto sem mockup plano — é o que ele mostra
> ao lojista. Então é a única fonte que sobrevive à troca de fornecedor.

A primeira metade continua verdadeira. A segunda não: **mostrar ao lojista não é
o mesmo que publicar.**

## O que foi medido

Varredura das **49 páginas de produto** da loja pública, cada imagem própria do
produto baixada em 1024px e classificada por fração de borda branca (mockup
plano tem fundo branco; foto lifestyle tem cenário).

| | |
|---|---|
| Imagens classificadas | **105** |
| Produtos cobertos | **49 de 49** |
| Mockups planos encontrados | **0** |
| Histograma de borda branca | 97 imagens ≤10%, 8 imagens entre 10% e 20% |

Nenhuma imagem chega perto do limiar de 85%. Não é caso de limiar mal escolhido:
a distribuição inteira está no outro extremo. Inventário em
`inventario-imagens-loja.json`.

Isso também **corrige o `CLAUDE.md`**, que afirmava "dentro da página do produto,
os mockups reais da YouDraw continuam visíveis". Não continuam.

## Onde os mockups estão

O site público da YouDraw é uma SPA sem API de catálogo: o bundle JavaScript não
referencia nenhum endpoint de produto, só `dashboard.youdraw.com.br/login` e
`/criar_conta`. O catálogo com mockups vive atrás de autenticação.

Confirmado também que **Chromium não tem egress neste ambiente**
(`ERR_CONNECTION_RESET` com e sem proxy), então renderizar a SPA aqui não é
alternativa.

## Consequência para o desenho

O mockup plano **não pode ser a fundação portátil**. Ele continua sendo a melhor
régua quando existe — resolve o datum, a tabela de medidas e a posição de uma vez
— mas depende de o dono exportar do painel, e isso é exatamente a dependência
que o plano queria eliminar.

O que sobrevive sem nenhum insumo do fornecedor, em ordem de força:

1. **Registro da arte na foto** (E2). Não precisa de mockup nem de tabela: só da
   própria arte, que é o insumo que a marca sempre tem. É o que remove a
   anotação humana e ataca a margem de 8 pp.
2. **Consistência interna do catálogo.** Com a arte em cm e várias fotos da mesma
   peça, o comprimento implícito deve se agrupar; quem foge do grupo está errado.
   Detecta inconsistência sem saber a medida verdadeira — mais fraco que veredito
   absoluto, e totalmente portátil.
3. **Tabela do fornecedor**, quando publicada, como *cross-check* e para o
   veredito duro de impossibilidade física.

E1 fica **suspenso**, não descartado: assim que houver dois mockups planos do
mesmo tipo de peça com artes de cm bem diferentes, o teste roda em minutos.

## O que peço ao dono, e só isso

Exportar do painel da YouDraw **um mockup plano por tipo de peça** (Camiseta
Premium, Oversized, Moletom Canguru, Blusão Moletom), de preferência de produtos
cujas artes tenham alturas bem diferentes. Com isso E1 roda e a ficha de régua
fica completa — inclusive para o Blusão Moletom, que hoje não tem tabela nenhuma
e sai como `INDISPONIVEL`.

Não é bloqueio: o caminho 1 acima está em execução e não depende disso.
