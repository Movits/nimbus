# Loja Nuvemshop — Guia de aplicação v3 (Impulso · tema Morelia)

Redesign v3 (feedback de 2026-07-02): loja **clara do início ao fim** (céu), **sem newsletter**,
hero curto que cabe na tela (e não copia a landing), tiles das 3 coleções, rodapé claro, fontes
corrigidas. Arquivos desta pasta: `css-nimbus.css` (v3), `pagina-projetos-sociais.html`,
`pagina-sobre.html`, `prompts-higgsfield-loja.md` e **`assets/`** (logo + hero + 3 tiles + 2
banners). Pra aplicar tudo via navegador, use o prompt em `../cowork-loja-v3-prompt.md`.

⚠️ **Regra da marca:** NUNCA usar "troca fácil" em nenhum texto (POD encarece devolução).

## 1. CSS v3 (substitui o v2 inteiro)
Loja online → Layout → Personalizar seu layout atual → **Edição de CSS avançada** → apague o CSS
antigo e cole TODO o `css-nimbus.css` → Testar CSS → salvar/publicar.
O v3 já faz: fontes Fraunces/Inter via `@font-face` (**sem `@import`** — era isso que quebrava as
fontes no v2), barra de anúncio céu claro, trava de altura do hero, texto do slider em navy, fix do
hover dos cards (a foto não desliza mais), esconde toda newsletter, rodapé claro, estilos de
produto/categoria/carrinho.
**Se o validador reclamar de algo, NÃO apague as `@font-face` — me mande o erro que eu ajusto.**

## 2. Logo no header
Já aplicado no v2 (`assets/logo-nimbus.png`). Se não: Loja online → Layout → seção **Logo**.

## 3. Montar a HOME (editor do Morelia, nesta ordem)
Ritmo: hero curto → serviços → coleções → prateleira → banner → prateleira → banner → prateleira.
1. **Slider principal** (1 slide): `assets/banner-hero-desktop.jpg` + `assets/banner-hero-mobile.jpg`.
   Título: `A coleção de estreia` · Subtítulo: `Peças de fé, desenhadas no Brasil.` ·
   Botão: `Ver coleção` → catálogo completo. **Texto à esquerda** (o banner tem o lado esquerdo
   limpo; o CSS deixa o texto navy).
2. **Banners de serviços** (3 itens só texto): `Feito sob demanda no Brasil` ·
   `Pagamento seguro: Pix, cartão e boleto` · `10% do lucro doado`.
3. **Tiles das coleções** — seção de banners/categorias com **3 imagens lado a lado**:
   `assets/tile-street.jpg` → categoria STREET · `assets/tile-reliquia.jpg` → categoria RELÍQUIA ·
   `assets/tile-nuvem.jpg` → categoria NUVEM. (Os títulos já estão nas imagens — não repita texto
   na seção.) *Pré-requisito: as 3 categorias criadas e com produtos.*
4. **Prateleira 1** — título `Os essenciais` (curadoria manual: 4 produtos com melhor foto,
   misturando coleções).
5. **Banner com texto**: `assets/banner-fe.jpg` (Cristo à direita; **texto à ESQUERDA**).
   Título `Feito de fé` · Sub `Cada estampa nasce de um símbolo da fé católica brasileira.` ·
   Botão `Ver as peças` → coleção RELÍQUIA.
6. **Prateleira 2** — título `Coleção Relíquia` (4 produtos da RELÍQUIA).
7. **Banner com texto**: `assets/banner-impacto.jpg` (nuvens reais; **texto à ESQUERDA**).
   Título `Vestir também é servir` · Sub `10% do lucro vai para um projeto social. Quem escolhe
   qual é você, no checkout.` · Botão `Conhecer os projetos` → página Projetos Sociais.
8. **Prateleira 3** — título `Coleção Street` (4 produtos; se não encher, corte a prateleira).
9. **NEWSLETTER: desativar/remover** a seção da home **e** o campo de newsletter do rodapé
   (decisão de marca — o CSS também esconde, mas desative no editor pra não carregar à toa).
10. Desative/remova qualquer seção vazia que sobrar.

## 4. Barra de anúncio
> **10% do lucro do seu pedido vai para o projeto social que você escolher. Frete grátis acima de R$199.**
(O CSS deixa a barra **céu claro com texto navy**.)

## 5. Páginas + menu (se ainda não fez)
- Páginas → Criar → **"Projetos Sociais"** (modo HTML `< >`) = `pagina-projetos-sociais.html`.
- **"Sobre a NIMBUS"** = `pagina-sobre.html`. Crie a "Projetos Sociais" **antes**: copie a URL dela e
  troque o `href="/pagina/projetos-sociais"` do link interno pela URL real (o padrão já serve se o
  slug ficar `projetos-sociais`).
- Menu principal: Início · Produtos · Projetos Sociais · Sobre.
- Rodapé: telefone/e-mail/redes quando existirem. Tagline: `Fé, design e propósito. Acima de tudo.`

## 6. Campo do projeto social no checkout (se ainda não fez)
Configurações → Opções de checkout → habilitar **"Mensagem do cliente"** com o rótulo:
> **Qual projeto recebe 10% do lucro? Fazenda da Esperança, Cáritas Brasileira, Pequeno Cotolengo ou escreva outro**
(opcional, não obrigatório)

## 7. Favicon (se ainda não fez)
Loja online → Layout → Favicon → `public/img/favicon-nuvemshop-130.png`.

## 8. Produtos
- **Renomear pro padrão `Nome — Peça`** (hoje há 4 cards "São Miguel Vintage" idênticos na vitrine
  — cada peça precisa do sufixo: "São Miguel Vintage — Camiseta", "— Moletom" etc.). A folha pronta
  com nomes/preços/descrições dos 13 heroes é `../catalogo-lancamento.md`.
- Última linha de toda descrição: `Esta peça destina 10% do lucro ao projeto social da sua
  escolha, no checkout.`
- Tabela de medidas em cm por tamanho em todo produto (o CSS já estiliza a tabela).

## 9. Política de trocas (obrigação legal, sem promover)
Página discreta no rodapé: CDC art. 49 (7 dias de arrependimento em compra online) + troca por
defeito de fabricação. Nada além do mínimo legal.

## 10. Depois de aplicar
Tire prints (home desktop + mobile, página de produto, página de categoria) e me mande pra revisar
contra a spec — ajustes de seletor CSS são esperados na primeira passada (estilizamos o Morelia
"às cegas").

## 11. Upgrade das imagens (opcional, quando quiser)
Os banners/tiles atuais vêm do acervo do site. Pra gerar as versões definitivas no Higgsfield:
`prompts-higgsfield-loja.md` (um prompt por slot; me mande o resultado que eu recorto e aplico).

## Inventário do OURO (#e9c46a) — usar SÓ nisso
Auréola do logo · sublinhado hover do menu · traço sob títulos de prateleira/seção · traço dos
tiles de coleção (já nas imagens) · borda dos cards de Projetos Sociais. Nunca em preço, badge,
botão ou ícone.
