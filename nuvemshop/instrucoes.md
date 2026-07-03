# Loja Nuvemshop — Guia de aplicação v3 (Impulso · tema Morelia)

Meta: deixar a loja o mais perto possível do artifact "NIMBUS — Loja v3.1" (claro e arejado).
No Impulso só dá pra usar **CSS + os módulos do Morelia** (não dá pra colar HTML), então casamos o
visual via CSS e montamos a home com os módulos do tema. Arquivos desta pasta: `css-nimbus.css` (v3),
`assets/` (logo, banners e tiles), `pagina-projetos-sociais.html`, `pagina-sobre.html`.
Pra aplicar sozinho via navegador: `cowork-loja-v3-prompt.md`.

⚠️ Nunca usar "troca fácil" em texto nenhum.

## 1. CSS v3 (substitui o anterior inteiro)
Loja online → Layout → Personalizar → **Edição de CSS avançada** → apague o CSS antigo e cole TODO o
`css-nimbus.css` → Testar CSS → salvar. (Ele já faz: barra de anúncio clara, rodapé claro com selos,
serviços em maiúsculas, cards com elevação, botões pill, esconde o selo "criado com Nuvemshop".)

## 2. Logo
Loja online → Layout → **Logo** → subir `assets/logo-nimbus.png`.

## 3. Montar a HOME (ordem do artifact)
1. **Slider principal** (1 slide): `assets/banner-hero-desktop.jpg` + `assets/banner-hero-mobile.jpg`.
   Título `A coleção de estreia` · Sub `Peças de fé, desenhadas no Brasil.` · Botão `Ver coleção` (→ catálogo).
2. **Serviços** (3 itens de texto, sem ícone): `Feito no Brasil` · `Pix, cartão e boleto` · `10% do lucro doado`.
3. **Tiles das coleções** (módulo de banners lado a lado, 3 imagens):
   - `assets/tile-street.jpg` → título `Street` → link coleção Street
   - `assets/tile-reliquia.jpg` → título `Relíquia` → link coleção Relíquia
   - `assets/tile-nuvem.jpg` → título `Nuvem` → link coleção Nuvem
4. **Prateleira** — título `Os essenciais` (4 produtos, curadoria mista).
5. **Banner com texto** `assets/banner-fe.jpg` (texto à esquerda): `Feito de fé` ·
   `Cada estampa nasce de um símbolo da fé católica brasileira.` · botão `Ver as peças` → Relíquia.
6. **Prateleira** — título `Coleção Relíquia`.
7. **Banner com texto** `assets/banner-impacto.jpg` (esquerda): `Vestir também é servir` ·
   `10% do lucro vai para um projeto social. Quem escolhe qual é você, no checkout.` ·
   botão `Conhecer os projetos` → página Projetos Sociais.
8. **Prateleira** — título `Coleção Street`.
9. Desative newsletter e seções de template vazias que sobrarem (o artifact não tem newsletter na home;
   se quiser manter captura de e-mail, o CSS já deixa ela clara e discreta).

## 4. Barra de anúncio
> **10% do lucro do seu pedido vai para o projeto social que você escolher. Frete grátis acima de R$199.**

## 5. Rodapé (claro, 3 colunas)
- **Loja:** Produtos · Coleção Street · Coleção Relíquia · Coleção Nuvem
- **A marca:** Sobre a NIMBUS · Projetos Sociais · Contato
- **Ajuda:** Trocas e devoluções · Política de privacidade · Prazo de produção e envio
- Tagline: `Fé, design e propósito. Acima de tudo.`

## 6. Páginas + menu (se ainda não fez)
Páginas → Criar → "Projetos Sociais" (modo HTML) = `pagina-projetos-sociais.html`;
"Sobre a NIMBUS" = `pagina-sobre.html` (ajustar o link interno). Menu: Início · Produtos ·
Projetos Sociais · Sobre.

## 7. Campo do projeto social no checkout (se ainda não fez)
Configurações → Opções de checkout → habilitar **"Mensagem do cliente"**, rótulo:
> **Qual projeto recebe 10% do lucro? Fazenda da Esperança, Cáritas Brasileira, Pequeno Cotolengo ou escreva outro**

## 8. Favicon (se ainda não fez)
Loja online → Layout → Favicon → `public/img/favicon-nuvemshop-130.png`.

## 9. Produtos
- Última linha de toda descrição: `Esta peça destina 10% do lucro ao projeto social da sua escolha, no checkout.`
- Tabela de medidas (cm) por tamanho em cada produto.

## 10. Categorias (coleções)
Crie 3 categorias — **Street**, **Relíquia**, **Nuvem** — e classifique os produtos. É o que faz os
tiles e as prateleiras por coleção funcionarem.

## Até onde dá no Impulso
Esse guia entrega ~85% do artifact (cores, cards, hero, rodapé, ritmo). Fidelidade 100% (o DOM exato
do artifact) só no plano **Escala** (acesso ao código-fonte do tema) ou headless — não vale a pena agora.
Depois de aplicar, me manda prints que eu comparo com o artifact e ajusto os seletores que não pegarem.
