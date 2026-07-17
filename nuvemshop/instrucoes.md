# Loja Nuvemshop — estado e guia de aplicação

**Plano Impulso · tema Baires · publicado em 16/07/2026.**

A Nuvemshop não tem deploy por git. Esta pasta é um kit: o CSS e as páginas são **colados à mão** no
painel. Por isso o repo não é a fonte de verdade da loja, a loja é. Este arquivo diz o que está no ar.

## Leia isto antes de colar qualquer CSS

⚠️ **A "Edição de CSS avançada" da Nuvemshop remove silenciosamente todas as CSS custom properties**,
tanto as definições em `:root` quanto qualquer uso de `var(--...)`. Um CSS baseado em variáveis fica
**inerte** na loja: cola, salva, e não acontece nada. Todo CSS daqui tem que ser literal (hex resolvido).

Exceção segura: `var()` **com fallback**, tipo `var(--body-font, "Inter", Arial, sans-serif)`. Se a
plataforma remover, o fallback assume e nada quebra. O CSS de produção usa isso em 6 lugares.

## O que está no ar (16/07/2026)

| O quê | Onde |
|---|---|
| **CSS de produção** | `css-nimbus-correcoes-2026-07-16.css` |
| Página Projetos Sociais | `pagina-projetos-sociais.html` |
| Página Sobre | `pagina-sobre.html` |
| Tiles das coleções | `assets/tile-nuvem.jpg`, `tile-reliquia.jpg`, `tile-street.jpg` |

Se houver mais de um CSS nesta pasta no futuro, **o mais recente por data no nome é o de produção**. É a
convenção. Hoje só existe um, de propósito.

O CSS **não é um tema completo**: é uma camada de correção. O Baires é configurado nativamente no editor
(as fontes Fraunces e Inter são nativas dele), e o CSS só corrige o que o editor não alcança: header em
linha única no desktop, logo no centro geométrico no mobile, três coleções simultâneas, modais dos
projetos, footer editorial. Por isso ele começa direto em "Cabecalho:" e não estiliza `body`.

`pagina-projetos-sociais.html` **depende deste CSS**. Os modais são feitos por âncora `:target` (a
Nuvemshop não permite JS na página), então sem o CSS eles aparecem todos abertos e empilhados. Os dois
andam juntos: publicar um sem o outro quebra a página.

## Também publicado em 16/07

- Menu de categorias (Street, Relíquia, Nuvem) e ordenação dos produtos.
- Footer v2 (faixa editorial, marca clara, fechamento navy).
- **Foto lifestyle em 49 produtos**: modelo real usando a peça, como imagem de capa.
  Manifest: `assets/product-lifestyle/2026-07-16/uploads/upload-manifest.json` (arquivo → produto → URL
  pública). Conferência: `uploads/live-verification.json`.
  As imagens **não estão no repo** (ficam no Drive, mesma doutrina de `designs/`). Estão servidas pela
  Nuvemshop, que é a fonte de verdade.

⚠️ **Ressalva aberta**: o `live-verification.json` diz 49/49, mas ele valida só metadados (se a foto virou
capa, olhando `og:image` e `preload`). **Nunca olha o pixel.** O produto 352719728 (Aparecida Barroca)
está no ar com a tarja escrita "PADROEIRA (BRAHL SAEBD)" quando a arte original diz "PADROEIRA (BRASIL
SACRO)". O prompt de geração trava escala (REF 3) e conteúdo (REF 4), mas nada trava **texto**. Auditoria
visual das 49 pendente. Não confie no 49/49 como prova de que a estampa está certa.

## Regras de conteúdo (valem sempre)

⚠️ **Nunca usar "troca fácil" em texto nenhum.** POD encarece devolução. Política de trocas = mínimo legal
(CDC art. 49).

- Última linha de toda descrição de produto:
  `Esta peça destina 10% do lucro ao projeto social da sua escolha, no checkout.`
- Tabela de medidas (cm) por tamanho em cada produto.
- Régua de nomes: `Arte | Peça`. Rótulos aprovados: Camiseta Premium, Camiseta Oversized Premium,
  Moletom Canguru, Blusão Moletom, Ecobag. Sem `v1`/`v2` em nome público.

## Configurações que já estão feitas

- **Campo do projeto social no checkout**: Configurações → Opções de checkout → "Mensagem do cliente",
  rótulo: *"Qual projeto recebe 10% do lucro? Fazenda da Esperança, Cáritas Brasileira, Pequeno Cotolengo
  ou escreva outro"*.
- **Favicon**: Loja online → Layout → Favicon → `public/img/favicon-nuvemshop-130.png`.
- **Categorias**: Street, Relíquia, Nuvem (é o que faz os tiles e as prateleiras por coleção funcionarem).

## Como reaplicar o CSS (se precisar)

Loja online → Layout → Personalizar → **Edição de CSS avançada** → apagar o antigo → colar TODO o
`css-nimbus-correcoes-2026-07-16.css` → Testar CSS → salvar.

Depois, conferir na loja pública: home no desktop, os três modais da página Projetos Sociais, e mobile em
390 e 320 px. Checar centro do logo, ausência de rolagem horizontal, hero sem corte, coleções com largura
certa, modais fechando sem salto, e que nada comercial mudou.

Se o editor impedir equivalência exata com a prévia, **não improvisar mudança estrutural**: relatar a
diferença concreta.

## Até onde dá no Impulso

O Impulso dá CSS + módulos do tema, não dá pra colar HTML custom nem editar o DOM. Fidelidade 100% a um
mockup só no plano **Escala** (código-fonte do tema) ou headless. Não vale a pena agora.

## Histórico

- **Baires (15–16/07/2026)**: tema atual. Direção em `previews/auditoria-e-direcao-baires-2026-07-15.md`,
  prévia aprovada em `previews/ajustes-finais-preview-2026-07-16.html`, registro da publicação em
  `publicacao-2026-07-16.md`.
- **Morelia (02–04/07/2026)**: era anterior, morta. O `css-nimbus.css` e os `cowork-loja-v*-prompt.md`
  foram **removidos do repo** porque mandavam colar um CSS inerte via URL raw do GitHub, o que apagaria o
  estilo da loja publicada. Estão no histórico do git se precisar (`git log --all -- nuvemshop/css-nimbus.css`).
