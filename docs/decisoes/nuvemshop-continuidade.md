---
status: ativo
---
# Continuidade Nuvemshop → vitrine (especificação para o painel)

Escrita em 30/07 a pedido do dono, depois do teste da sacola: os itens chegam ao
carrinho, mas quem navega pelas páginas da Nuvemshop fica preso lá, sem caminho
de volta para a vitrine. Este documento é a especificação prevista na tarefa 17
do prompt da v2 (escrever, não executar). **Execução é no painel da Nuvemshop,
pelo dono**; nada aqui é executável por Git.

Fontes: central de ajuda oficial da Nuvemshop (links no fim). Itens marcados
"a confirmar" não estão cobertos pela documentação e precisam de teste ao vivo.

## Por que acontece

O menu, o logo e os botões das páginas da loja são do tema Baires e apontam para
dentro da própria loja. Nada disso vive no nosso repositório. O que é
configurável fica no painel; o resto é código do tema.

## Parte 1 · Menu principal apontando para a vitrine (resolve o caso relatado)

O menu do cabeçalho aparece em todas as páginas da loja, inclusive no carrinho.
A central de ajuda confirma que itens de menu aceitam "links que direcionam
para sites e páginas externos", pelo campo "Leva a" na opção "URL".

**Caminho: Painel > Loja online > Menus > Menu principal.** Editar cada item
(ou remover e recriar com "+ Adicionar link"), com esta tabela:

| Item atual | Novo destino |
|---|---|
| Início | `https://nimbuswear.com.br/loja-preview/?utm_source=loja&utm_medium=menu` |
| Produtos | `https://nimbuswear.com.br/loja-preview/?utm_source=loja&utm_medium=menu#colecoes` |
| STREET | `https://nimbuswear.com.br/loja-preview/c/street/?utm_source=loja&utm_medium=menu` |
| RELÍQUIA | `https://nimbuswear.com.br/loja-preview/c/reliquia/?utm_source=loja&utm_medium=menu` |
| NUVEM | `https://nimbuswear.com.br/loja-preview/c/nuvem/?utm_source=loja&utm_medium=menu` |
| Sobre | manter, ou apontar para `https://nimbuswear.com.br/` (manifesto) |
| Projetos Sociais | manter interno (a página vive na loja) |
| Contato | manter interno (Ajuda da vitrine aponta para cá) |

O UTM `utm_source=loja` separa, no analytics, quem voltou da loja para a
vitrine. Reordenar é arrastar e soltar; salvar no fim da página.

**A confirmar no primeiro teste**: se o clique abre na mesma aba (provável no
cabeçalho do Baires) ou em nova aba (no rodapé, o tema base usa nova aba para
URL externa). Testar com um item antes de trocar todos.

## Parte 2 · Rede de segurança persistente (recomendado, painel)

- **Barra de anúncio** (Loja online > Layout > Editar layout > Cabeçalho):
  aceita até 3 mensagens com texto e link; a própria doc recomenda UTM. Sugestão
  de mensagem: "Conheça as coleções na vitrine NIMBUS" com o link da vitrine.
- **Banner rotativo da home** (Layout > Página inicial): aceita link no banner;
  um banner "Voltar à vitrine" cobre quem cair na home da loja pelo Google (a
  vitrine é noindex; quem busca acha a loja). Home pode ficar enxuta: seções
  opcionais sem conteúdo não aparecem.
- **Mensagem na página de seguimento** (Opções de checkout): texto pós-compra
  convidando a voltar à vitrine. É texto, não redirecionamento.

## Parte 2b · Header da loja lendo como a vitrine (CSS, já pronto)

Decisão do dono (30/07): a **vitrine é a referência de design**; o header da loja
deve ler como o dela. Isso foi feito **só com CSS** (a loja já usa um kit de CSS
nosso, colado em Loja online → Layout → Personalizar → Edição de CSS avançada) e
está pronto para colar:

- Some com **Buscar** e **Conta/Login** no desktop (a vitrine não tem nenhum dos dois).
- **Carrinho** vira a **pill "Sacola"** com o badge de contagem, igual ao CTA da vitrine.
- Navegação ganha **sublinhado dourado no hover**.

Arquivo a colar: `nuvemshop/css-nimbus-publicacao-compacta-2026-07-20.css`
(regenerado em 30/07, "Rodada 8"; fonte legível em
`css-nimbus-responsive-header-footer-2026-07-20.css`). Reaplicar pelo passo a
passo de `nuvemshop/instrucoes.md`. Isto é aparência; **não muda para onde o logo
clica** (ver Parte 3).

O que o CSS **não** alcança e fica para o painel/tema: o **conteúdo** do menu
(quais itens aparecem) é a Parte 1 (o dono aponta os itens para a vitrine); e um
link "Manifesto" no header, se quiser, é um item de menu novo apontando para a
landing.

## Parte 3 · O que continua interno à loja, e por quê

- **"Seguir comprando" / "Ver todos os produtos" do carrinho** e **o clique no
  logo**: destino fixo no código do tema. **Nem a API nem o CSS mudam um `href`**
  (confirmado na doc da Nuvemshop em 30/07: a API REST não expõe menu nem tema, e
  a Edição de CSS não altera destino de link). Mudar exige abrir a edição de
  código (FTP). O plano Impulso permite, mas **abrir o FTP trava a troca de
  layout, corta atualizações do Baires e não tem backup da Nuvemshop**. Com o
  menu apontado para a vitrine (Parte 1) e o header já lendo como a vitrine
  (Parte 2b), esses dois viram caminhos secundários.

  **Se o dono decidir abrir o editor de código**, as edições são estas (base: o
  tema base público da Nuvemshop; os nomes exatos do Baires se confirmam no
  editor ao vivo):
  - **Logo** → no template do cabeçalho o logo é um `<a href="{{ store.url }}">`
    (tema clássico) ou está dentro de `{{ component('logos/logo', ...) }}` (tema
    novo). Trocar o destino por
    `https://nimbuswear.com.br/loja-preview/?utm_source=loja&utm_medium=logo`. No
    tema novo, envolver o logo com um `<a href="...">` próprio, porque `store.url`
    nem aparece ali.
  - **"Seguir comprando"** → em `snipplets/cart-totals.tpl` (e `cart-panel.tpl`),
    trocar `{{ store.products_url }}` por
    `https://nimbuswear.com.br/loja-preview/?utm_source=loja&utm_medium=carrinho`;
    `templates/cart.tpl` inclui esses snipplets.
  - Renomear o rótulo "Carrinho" do botão para "Sacola" de forma definitiva
    também é template (o CSS da Parte 2b já faz a troca visual).

  Nenhuma dessas edições é executável desta sessão (sem acesso ao painel e sem
  token de API da loja). Ficam prontas para quando o dono abrir o editor, ou para
  ele me passar os arquivos do tema para eu editar e devolver.
- **Checkout inteiro** (da tela de pagamento ao /success/): bloqueado por
  segurança pela plataforma, para todo mundo. E é onde o cliente deve mesmo
  ficar até pagar.
- **Redirecionamento 301 do painel não serve**: só aceita caminho interno; a
  doc avisa que URL completa ali pode derrubar a loja. Não usar.

## Teste de aceite (depois de configurar)

1. Adicionar um produto ao carrinho pela vitrine.
2. Abrir o carrinho da loja e clicar em Início, STREET e Produtos no menu:
   os três devem levar à vitrine, idealmente na mesma aba.
3. Conferir a barra de anúncio em uma página de produto da loja.
4. Registrar o resultado em `docs/ESTADO.md` (data e o que ficou pendente).

## Continuidade visual (contexto)

A vitrine já foi alinhada à loja em 30/07 (`2026-07-30-visual-loja-e-sacola.md`):
cores medidas do tema batem com os tokens da marca. O que resta do lado da loja
(fontes de título do tema, detalhes do header) fica para o mesmo lote único no
painel, junto com este pacote de navegação.

## Fontes (central de ajuda Nuvemshop, lidas em 30/07)

- Menu do cabeçalho: `atendimento.nuvemshop.com.br/pt_BR/menu-do-cabecalho/como-adicionar-um-menu-no-cabecalho-da-loja`
- Menu do rodapé e campo "Leva a": `.../rodape/como-adicionar-categorias-ou-paginas-no-rodape-da-sua-loja`
- Ordem do menu: `.../barra-de-navegacao-rodape-do-layout/como-alterar-ordem-do-menu-na-barra-de-navegacao`
- Cabeçalho e barra de anúncio: `.../12343-personalizacao-basica-do-layout/como-configurar-o-cabecalho-do-layout`
- Banners rotativos: `.../banners-e-logo-do-layout/como-adicionar-banner-rotativo-na-minha-loja`
- Opções de checkout (bloqueio + mensagem de seguimento): `.../12311-opcoes-de-checkout/tudo-sobre-as-opcoes-de-checkout`
- Edição de código e avisos do FTP: `.../personalizacao-avancada-do-layout/como-editar-o-codigo-do-layout-da-minha-loja`
- Carrinho no tema (Seguir comprando = código): `docs.nuvemshop.com.br/help/carttpl`
- Redirecionamento 301: `.../12315-redirecionamento-301/como-fazer-um-redirecionamento-na-minha-loja`
