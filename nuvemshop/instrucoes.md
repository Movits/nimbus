# Loja Nuvemshop — Guia de aplicação v2 (Impulso · tema Morelia)

Redesign completo: a loja vira a "porta comercial" da landing (mesma catedral, mesmas fontes,
mesmo mundo). Arquivos desta pasta: `css-nimbus.css` (v2), `pagina-projetos-sociais.html`,
`pagina-sobre.html`, e **`assets/`** (logo + 5 banners). Pra aplicar tudo sozinho via navegador,
use o prompt em `cowork-loja-v2-prompt.md`.

⚠️ **Regra da marca:** NUNCA usar "troca fácil" em nenhum texto (POD encarece devolução). Um dos
agentes sugeriu isso e foi corrigido aqui — os textos abaixo são os corretos.

## 1. CSS v2 (substitui o v1 inteiro)
Loja online → Layout → Personalizar seu layout atual → **Edição de CSS avançada** → apague o CSS
antigo e cole TODO o `css-nimbus.css` → Testar CSS → salvar/publicar.
O CSS já faz: botões pill, cards com elevação, header sticky com logo, newsletter navy com botão
ouro, divisórias de nuvem (hero e rodapé), esconde o selo "criado com Nuvemshop"*, esconde
breadcrumb da home, recolore o WhatsApp flutuante.
*\*ressalva: sem opção oficial pra tirar o selo; se a Nuvemshop reclamar, apague o bloco 16.*

## 2. Logo no header
Loja online → Layout → seção **Logo** → suba `assets/logo-nimbus.png`. (O texto "Nimbus" some e
entra o wordmark em nuvens com auréola.)

## 3. Montar a HOME (editor do Morelia, nesta ordem)
Ritmo: banner grande → 1 linha de produtos → banner grande. Nunca duas prateleiras coladas.
1. **Slider principal** (1 slide só): `assets/banner-hero-desktop.jpg` + `assets/banner-hero-mobile.jpg`.
   Título: `Acima de tudo` · Subtítulo: `Streetwear católico premium, desenhado no Brasil.` ·
   Botão: `Ver coleção` → link pro catálogo completo.
2. **Banners de serviços** (3 itens de texto, sem ícone colorido):
   `Feito sob demanda no Brasil` · `Pagamento seguro: Pix, cartão e boleto` · `10% do lucro doado`.
3. **Prateleira 1** — título `Os essenciais` (curadoria manual: os 4 produtos com melhor foto,
   misturando coleções).
4. **Banner com texto**: `assets/banner-fe.jpg` (Cristo à direita; texto à ESQUERDA).
   Título `Feito de fé` · Sub `Cada estampa nasce de um símbolo da fé católica brasileira.` ·
   Botão `Ver as peças` → coleção RELÍQUIA.
5. **Prateleira 2** — título `Coleção Relíquia` (4 produtos da RELÍQUIA).
6. **Banner com texto**: `assets/banner-design.jpg` (Pampulha).
   Título `Traço brasileiro` · Sub `Linhas inspiradas na arquitetura de Niemeyer, do concreto às
   nuvens.` · Botão `Ver a coleção Street` → coleção STREET.
7. **Prateleira 3** — título `Coleção Street` (4 produtos; se não encher, corte a prateleira — o
   botão do banner acima já resolve).
8. **Banner com texto**: `assets/banner-impacto.jpg` (nuvem+auréola à direita; texto à ESQUERDA).
   Título `Vestir também é servir` · Sub `10% do lucro vai para um projeto social. Quem escolhe
   qual é você, no checkout.` · Botão `Conhecer os projetos` → página Projetos Sociais.
9. **Newsletter** — Título `Estamos só começando` · Sub `Deixe seu e-mail e saiba dos lançamentos
   em primeira mão. Só o essencial, sem spam.` · Botão `Quero receber`.
10. Desative/remova qualquer seção vazia de template que sobrar.

## 4. Barra de anúncio
> **10% do lucro do seu pedido vai para o projeto social que você escolher. Frete grátis acima de R$199.**
(Alternativa pra alternar de vez em quando: `Acima de tudo. Streetwear católico feito no Brasil.`)

## 5. Páginas + menu (se ainda não fez)
- Páginas → Criar → **"Projetos Sociais"** (modo HTML `< >`) = `pagina-projetos-sociais.html`.
- **"Sobre a NIMBUS"** = `pagina-sobre.html`. Crie a "Projetos Sociais" **antes**: copie a URL dela e troque o `href="/pagina/projetos-sociais"` do link interno pela URL real (o padrão já serve se o slug ficar `projetos-sociais`).
- Menu principal: Início · Produtos · Projetos Sociais · Sobre.
- Rodapé: telefone/e-mail/redes quando existirem. Tagline: `Fé, design e propósito. Acima de tudo.`

## 6. Campo do projeto social no checkout (se ainda não fez)
Configurações → Opções de checkout → habilitar **"Mensagem do cliente"** com o rótulo:
> **Qual projeto recebe 10% do lucro? Fazenda da Esperança, Cáritas Brasileira, Pequeno Cotolengo ou escreva outro**
(opcional, não obrigatório)

## 7. Favicon (se ainda não fez)
Loja online → Layout → Favicon → `public/img/favicon-nuvemshop-130.png`.

## 8. Produtos (padrão pra TODA descrição)
- Última linha de toda descrição: `Esta peça destina 10% do lucro ao projeto social da sua
  escolha, no checkout.`
- Tabela de medidas em cm por tamanho em todo produto (reduz erro de tamanho = menos troca).

## 9. Política de trocas (obrigação legal, sem promover)
Página discreta no rodapé: CDC art. 49 (7 dias de arrependimento em compra online) + troca por
defeito de fabricação. Nada além do mínimo legal. **Não usar "troca fácil" em texto nenhum.**

## 10. Depois de aplicar
Tire prints (home desktop + mobile, página de produto) e mande pro Claude revisar contra a spec —
ajustes de seletor CSS são esperados na primeira passada.

## Inventário do OURO (#e9c46a) — usar SÓ nisso
Auréola do logo · sublinhado hover do menu · traço sob títulos de prateleira · botão da newsletter ·
borda dos cards de Projetos Sociais · o "10%" no banner de impacto. Nunca em preço, badge ou ícone.
