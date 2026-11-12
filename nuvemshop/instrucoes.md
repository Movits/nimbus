---
status: vigente
atualizado: 2026-11-11
---

# Loja Nuvemshop — estado e guia de aplicação

> [!info] Atualizado em 11/08/2026. O estado ATUAL da loja vive em
> [`docs/ESTADO.md`](../docs/ESTADO.md); este arquivo guarda o operacional
> (como colar CSS, alertas do painel). **O protocolo vigente para recolar CSS
> está em [`docs/fluxos/site-css-e-hover.md`](../docs/fluxos/site-css-e-hover.md)**
> (resumo: `npm run loja:css` antes; colar → **Testar CSS** → Publicar →
> conferir `POST /admin/themes/settings/active/` 200 na rede → provar em página
> DYNAMIC tipo `/search/?q=x`; CSS por último na sessão de tema). O
> [`cowork-publicar-css.md`](cowork-publicar-css.md) é registro concluído de
> 03/08, não roteiro a executar.

**Plano Impulso · tema Baires · baseline revisado em 24/07/2026.**

A Nuvemshop não tem deploy por git. Esta pasta é um kit: o CSS e as páginas são **colados à mão** no
painel. Por isso o repo não é a fonte de verdade da loja, a loja é. Este arquivo diz o que está no ar.

## Leia isto antes de colar qualquer CSS

⚠️ **A "Edição de CSS avançada" da Nuvemshop remove silenciosamente todas as CSS custom properties**,
tanto as definições em `:root` quanto qualquer uso de `var(--...)`. Um CSS baseado em variáveis fica
**inerte** na loja: cola, salva, e não acontece nada. Todo CSS daqui tem que ser literal (hex resolvido).

⚠️ **Medido em 11/11/2026: nem `var()` com fallback sobrevive.** A declaração inteira some (a antiga
`font-family: var(--body-font, "Inter", ...)` não chegou à loja). O arquivo versionado tinha 50.721
caracteres e a loja servia 47.579. O painel derruba em silêncio: `clamp()`, a propriedade `inset`,
`aspect-ratio`, hex de 8 dígitos (`#rrggbbaa`), toda regra cujo seletor tenha `:focus-visible`, os blocos
`@media (prefers-reduced-motion)`, `text-underline-offset`, `text-decoration-thickness`, `var()` e custom
properties. Nunca testados, portanto proibidos: `:has()`, `:is()`, `:where()`, `@import`, `@font-face`,
`lvh/svh/dvh` e nesting. O build recusa gravar saída com qualquer um deles e o portão `npm run loja:css`
confere o arquivo colado.

## Fonte local mais recente e estado da loja

| O quê | Onde |
|---|---|
| **CSS local consolidado mais recente** (é o que se cola) | `css-nimbus-publicacao-compacta-2026-07-20.css` |
| Fonte 1: peças permanentes (cards, modais dos projetos, contato pessoal escondido) | `css-nimbus-correcoes-2026-07-17.css` |
| Fonte 2: estrutura de header e footer (o que some do topo e de cada lista do rodapé) | `css-nimbus-responsive-header-footer-2026-07-20.css` |
| Fonte 3: camada "Um só céu" (céu, tipo, vidro, pílulas, páginas, estado fechado) | `css-nimbus-um-so-ceu-2026-11-11.css` |
| Gerador da saída consolidada | `../scripts/build_nimbus_publication_css.mjs` |
| O que só o painel resolve (menus, capa, nome da loja, SEO, contato) | [`painel-um-so-ceu-2026-11-11.md`](painel-um-so-ceu-2026-11-11.md) |
| Página Projetos Sociais | `pagina-projetos-sociais.html` |
| Página Sobre | `pagina-sobre.html` |
| Tiles das coleções | `assets/tile-nuvem.jpg`, `tile-reliquia.jpg`, `tile-street.jpg` |

Os arquivos de 16/07 e 17/07 são históricos e não devem ser colados
isoladamente. A Nuvemshop sanitiza o CSS ao salvar, portanto a loja pública e o
editor são a fonte de verdade. Antes de publicar, gere ou confira a composição
de 20/07 e valide o resultado real.

O CSS **não é um tema completo**: é uma camada sobre o Baires, que continua configurado no editor (as
fontes Fraunces 400/700 e Inter 400/700 são as que ele carrega; o CSS não pode pedir peso 300, 500 ou 600).

**Rodada 9 (11/11/2026): um só céu.** A loja passa a ler como a landing e a vitrine. A camada nova
(`css-nimbus-um-so-ceu-2026-11-11.css`) põe toda página sobre a foto de céu da landing, refaz o topo
(vidro fosco, navegação em caixa baixa), os títulos (Fraunces 400, caixa baixa), os botões (pílulas), os
campos, o rodapé (sem régua dourada e sem barra navy) e o aviso de cookies, e dá mensagem ao 404, que era
uma página em branco. O produto de exemplo do tema nunca mais aparece.

O rodapé não depende mais da ordem do menu: a marca e o lema são um bloco, a coluna "A marca" é a lista do
menu principal e a coluna Ajuda é a lista do menu do rodapé. As regras que escondem link olham o destino
(`href`), não a posição. Trocar o menu no painel não pede CSS novo; os cuidados que restam estão no
checklist do painel. Um item do menu principal com destino `mailto:` vira a pílula de contorno do topo
("Quero ser avisado") a partir de 900px; no menu do celular é uma linha comum, e não entra no rodapé.
Instagram e TikTok entram pelo mesmo menu e só aparecem no rodapé.

Em 12/11 a camada repetiu a revisão da landing e da vitrine: topo em vidro azulado, "em breve" como
etiqueta, três linhas antes de "Menu", selos na mesma grade do rodapé e debaixo de um fio, coluna
"A marca", linha legal à esquerda, "chegam em breve" e os tamanhos de título e de lede em degraus (o
painel apaga `clamp()`).

Na segunda revisão do mesmo dia: título e cartão das páginas internas no eixo da marca do topo (sem a
trilha do tema), capa da home na altura da capa da vitrine, menu do celular no azul do topo com a pílula
navy, fio em cima do rodapé em toda página, "Loja" marcado na home, rótulo "Erro 404" e a quebra dos
selos medida para repetir a da landing. Os textos de contato e de login que falavam como loja aberta
trocam dentro do bloco ESTADO FECHADO.

Três regras do dono (11/11) valem para qualquer mudança aqui: imagem nunca esticada, irmãos sempre num
mesmo eixo ou numa mesma borda, e vãos iguais entre blocos parecidos. Elas se medem, não se olham: a
função `mede` de `../scripts/vitrine/olho.mjs`, apontada para a loja com o CSS novo injetado, tem que dar
zero achado nas cinco larguras (1440, 1024, 768, 390 e 320).

A loja não vende nada agora, de propósito. Tudo o que só vale enquanto ela está fechada mora num bloco
único da fonte 3, entre os comentários "ESTADO FECHADO: apagar este bloco quando o catálogo voltar" e "FIM
DO ESTADO FECHADO": some a faixa de anúncio, os links do menu e do rodapé para coleções, a sacola e o
carrossel de categorias da home; as grades mostram a frase da marca no lugar dos cards.
**Reabrir é apagar esse bloco, regenerar e recolar.** Para ver antes como fica aberta, sem tocar o arquivo
canônico: `node scripts/build_nimbus_publication_css.mjs --aberta --saida=<arquivo>`.

Regenerar: `node scripts/build_nimbus_publication_css.mjs`, da raiz do repositório (não é mais preciso
ajustar caminho nenhum). O build falha, sem gravar, se faltar uma regra obrigatória ou se a saída tiver
sintaxe que o painel derruba.

**Rodada 8 (30/07/2026) — loja como funil, header lendo como a vitrine.** Decisão do dono: a vitrine é a
referência de design. A camada nova (fonte legível em `css-nimbus-responsive-header-footer-2026-07-20.css`,
já no consolidado) esconde Buscar e Conta no header, transforma o Carrinho na pill "Sacola" com badge, e
põe sublinhado dourado no hover da navegação. É só aparência: o destino do clique no logo e do "Seguir
comprando" continua sendo código do tema (ver `../docs/decisoes/nuvemshop-continuidade.md`). Regenerar o
consolidado com `scripts/build_nimbus_publication_css.mjs` (ajustar o `root` para o caminho local antes de
rodar). Conferido por screenshot offline em desktop 1440 e mobile 390.

`pagina-projetos-sociais.html` **depende do CSS consolidado**. Os modais são feitos por âncora `:target` (a
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

⚠️ **Ressalva**: o `live-verification.json` diz 49/49, mas ele valida só metadados (se a foto virou
capa, olhando `og:image` e `preload`). **Nunca olha o pixel.** Não confie no 49/49 como prova de que a
estampa está certa. A auditoria de escala vigente é a geométrica de 25/07
(`auditoria/2026-07-25-geometria/ACHADOS.md`). A contagem de 22–23/07
(25 APROVAR / 13 REVISAR / 11 REFAZER) é da auditoria **invalidada** e não deve ser usada. O caso da
tarja "PADROEIRA (BRAHL SAEBD)" do 352719728 foi corrigido pela substituição publicada em 22/07
(hoje o produto é APROVAR).

⚠️ **Defeitos no ar (atualizado pela auditoria ao vivo de 24/07 à tarde)** — não regenerar nada
sem aprovação do dono:

- 352702020 (Salmo 19 | Camiseta Premium): **RESOLVIDO** — a auditoria ao vivo confirmou que a
  `352702020-branca-v4i.jpg` ESTÁ publicada (slug `branca-v4i` no ar) e o par Preta/Branca usa o
  mesmo modelo. O registro anterior ("nunca foi publicada") estava errado.
- 352890896 (Aparecida Barroca | Oversized): a galeria mudou em 24/07 — capa agora é a off-white e
  a foto Preta no ar tem hash diferente da `preta-v4d` que continha "BRASIL SRCNO". O texto da
  foto atual NÃO foi verificado em pixel; conferir com crop dedicado antes de qualquer veredito.
- 352407196 (São Miguel Vintage | Premium, foto Branca): assinatura "NPMBUS" em vez de "NIMBUS" —
  **confirmado ainda no ar em 24/07** (slug `branca-v4g`).
- 352407182 (São Miguel Vintage | Oversized, Preta): escala ~12% acima do mockup (arquivo inalterado).
- Capas novas publicadas pela outra sessão em 24/07, fora do protocolo um-produto-por-vez:
  352618837, 352727545, 352726673 (medidas em pixel em 24/07 com escala calibrada: ok/limítrofe,
  faltando checagem de microtexto) e 352898175, 352718943, 352728451, 352728524, 352727892,
  352718275 (sem inspeção de pixel; o veredito antigo da auditoria por cm não vale para a foto
  nova). Nenhuma conta como versão final antes do ciclo completo.

A "regra da distância" (aceitar texto corrompido por ficar ilegível em miniatura) está revogada; ver
o protocolo um-produto-por-vez no `CLAUDE.md`.

Decisão do dono (24/07, após o artefato da auditoria ao vivo): os defeitos de MICROTEXTO existentes
(assinatura "NPMBUS" no 352407196, cartucho do 352890896, microtipografias em itens REVISAR) estão
APROVADOS como resíduo — NÃO refazer. A fila de correção cobre apenas escala/peça/modelo/cenário.

✅ **MEDIÇÃO DE ESCALA VÁLIDA (25/07, tarde)** — existe medidor validado e fila de correção real.
As duas auditorias antigas continuam invalidadas; o que mudou é que há substituto medido.

Por que as antigas caíram, para não repetir:

- A auditoria por cm (22-23/07) comparava mockup plano com peça vestida (cilindro visto de frente,
  laterais fogem da câmera) e corrigia com um "fator de caimento 1,52" medido em um único produto.
- A re-derivação física (24-25/07) usou comprimentos de peça errados (68-72 cm para canguru,
  74-80 cm para oversized; os reais são 60-70 e 78-86), com erro em direções opostas conforme a
  peça — foi isso que fabricou o resultado "nenhuma estampa mede maior que o oficial".

O medidor está em `scripts/geometry/` e passa no teste de verdade conhecida
(`node scripts/geometry/validate.mjs`, sai com código 1 se falhar). **Nenhum veredito sai com esse
portão vermelho.**

**Tolerância** (decisão do dono, 25/07): OK até 5%, aceitável de 5% a 8%, fila acima de 8%. Com
piso mecânico: o limiar efetivo nunca fica abaixo da margem medida do método no modo de anotação
daquela foto — 4 pp com moldura desenhada, 8 pp com caixa envolvente. Hoje o ±5% só alcança as 3
fotos de São Jorge Neobarroco; nas outras 38 o piso é 8%. Apertar exige derrubar a margem, não
reescrever o número.

Resultado em 41 fotos de 31 produtos, detalhado em
`nuvemshop/auditoria/2026-07-25-geometria/ACHADOS.md`: 21 OK, 2 aceitáveis, 11 fora do alvo,
2 reprovadas por impossibilidade física, 3 sem veredito, 2 sem tabela de medidas.

**Fila de correção: 13 fotos, 11 produtos.** Doze com estampa MENOR que o alvo, o oposto do que se
acreditava. As quatro mais firmes (faixa inteira de incerteza fora da tolerância): Salmo 19 Moletom
`[352619175]` −19,9% · São Jorge Vintage Moletom `[352618878]` −15,0% · Querubim Spray Oversized
`[352725749]` preta −12,9% · Acima de Tudo Gótico Oversized `[352720257]` −12,5%. A lista completa,
com a coluna `band_decisive`, está no ACHADOS.

A fila era de 6 e cresceu por correção de defeito, não por medição nova: os dois eixos de veredito
dividiam o mesmo `if/else`, e um "não sei" do eixo duro silenciava um "fora do alvo" do eixo de
catálogo.

**NÃO refazer** `352726673`, `352727545` e `352728357`: a lista REFAZER antiga condenava e a
medição aprova. `352718787` saiu dessa lista — a aprovação é POR FOTO, e só a branca (−4,1%) passa;
a preta mede −11,9% e está na fila.

**Posição** continua sem veredito nas 41, e agora se sabe por quê de forma medida. O estimador bom
(tangência da silhueta do tronco) não tem onde ser aplicado: em 41 de 41 fotos o contorno externo
na altura da estampa é a MANGA, não o tronco. É limite de oclusão, não de matemática. Centralização
fina se confere no mockup plano, onde não há enrolamento nem pose.

**Requisito de foto: só o piso.** A peça inteira no quadro, barra visível, e **ou** a linha do
ombro **ou** a base da gola legível. Pose livre.

A versão anterior exigia gola sempre visível e braço afastado do tronco; o dono derrubou as duas em
25/07 e estava certo. A gola é só uma das referências de topo possíveis, e a posição não precisa
ser medida numa foto gerada — composta por homografia, ela fica certa por construção.

⚠️ **Questão aberta que vale 3 a 5%**, aberta por essa discussão: a tabela da YouDraw dá "largura x
altura" de peça plana, e não está documentado se a altura sai do ombro (o usual) ou da base da gola.
Se sair do ombro, o medidor compara uma distância contra outra, com 2 a 4 cm de diferença de datum.
O erro empurraria os desvios para o lado positivo, então a fila atual é conservadora. Resolve com
uma pergunta à YouDraw. Detalhe em `scripts/geometry/README.md`.

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

Loja online → Layout → Personalizar → **Edição de CSS avançada** → confirmar que
o editor está atualizado → substituir pelo conteúdo completo de
`css-nimbus-publicacao-compacta-2026-07-20.css` → Testar CSS → salvar.

Depois, conferir na loja pública, no desktop e no celular (390 e 320 px): o céu ATRÁS do conteúdo em toda
página (se ele cobrir o texto, o painel derrubou o `z-index:-1`: não publicar); os três modais da página
Projetos Sociais abrindo com o fundo escurecido e fechando sem salto; `/produtos/` com a frase da marca e
nenhum "Produto de exemplo"; um endereço que não existe mostrando "Esta página não existe."; ausência de
rolagem horizontal; e que nada comercial mudou.

Se o editor impedir equivalência exata com a prévia, **não improvisar mudança estrutural**: relatar a
diferença concreta.

## Até onde dá no Impulso

O Impulso dá CSS + módulos do tema, não dá pra colar HTML custom nem editar o DOM. Fidelidade 100% a um
mockup só no plano **Escala** (código-fonte do tema) ou headless. Não vale a pena agora.

## Camada de overrides via Scripts API — RETIRADO em 29/07

Registro do mecanismo tentado em 28/07, guardado porque explica o
`nimbusloja.js` e a exceção do 404 no `link-check-docs.allow.json`.

A ideia: além do CSS colado, o app parceiro NIMBUS Capas (37697) teria um
script na aba Scripts do Portal de Parceiros (o loader, hoje guardado em
`nuvemshop/nimbusloja.js`), injetando na vitrine a folha
`https://nimbuswear.com.br/loja/nimbus-loja.css`, servida pelo GitHub Pages a
partir de `public/loja/nimbus-loja.css`. O painel guardaria o CSS base e a
camada do Pages os overrides incrementais, entrando por git sem colar nada.

O que barrou: a plataforma bloqueou a criação com evento **onload** ("É
necessário permissão para criar scripts onload. Solicite em
api@nuvemshop.com.br"); `onfirstinteraction` só aplicaria estilo após a
primeira interação do visitante, quebra-galho de teste, não solução. **O ticket
foi retirado em 29/07 e o mecanismo está bloqueado até nova ordem**
(`docs/ESTADO.md`). O script nunca foi criado no Portal e a folha
`public/loja/nimbus-loja.css` nunca existiu na `main` de propósito: o 404 dela
é a prova cadastrada no allowlist.

## Histórico

- **Auditoria de escala (22–23/07/2026) — INVALIDADA**: 49 produtos comparados
  com o mockup plano. Resultado registrado: 25 APROVAR, 13 REVISAR, 11 REFAZER.
  **Os vereditos não valem**: o método comparava a razão estampa/peça entre
  mockup plano e foto vestida, e peça vestida sempre parece mais estreita porque
  o tecido enrola no dorso. Do arquivo
  `auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte.csv` continuam
  válidas apenas as colunas `front_*_cm` e `back_*_cm`, que são a régua oficial
  em uso pelo medidor. O DOCX e o PDF do mesmo lote são históricos.
- **Substituições de capa (22/07/2026)**: 13 arquivos corrigidos publicados em
  9 produtos (registro em `auditoria/2026-07-21/implementacao/auditoria-imagens-2026-07-22/`).
  Atenção: essas "correções" foram reduções de estampa guiadas pelo método
  invalidado, e a medição de 25/07 mostra que o defeito real do catálogo é
  estampa PEQUENA demais. 352727545 é o exemplo: foi reduzida por sobrecorreção
  e hoje mede −4,3%, dentro do alvo. **O veredito vigente é
  `auditoria/2026-07-25-geometria/ACHADOS.md`**, não o CSV de dimensões.
- **Baires (20–21/07/2026)**: consolidação atual de header, footer, manifesto,
  modais, responsividade e hover em
  `css-nimbus-publicacao-compacta-2026-07-20.css`.

- **Baires (15–16/07/2026)**: tema atual. Direção em `previews/auditoria-e-direcao-baires-2026-07-15.md`,
  prévia aprovada em `previews/ajustes-finais-preview-2026-07-16.html`, registro da publicação em
  `publicacao-2026-07-16.md`.
- **Morelia (02–04/07/2026)**: era anterior, morta. O `css-nimbus.css` e os `cowork-loja-v*-prompt.md`
  foram **removidos do repo** porque mandavam colar um CSS inerte via URL raw do GitHub, o que apagaria o
  estilo da loja publicada. Estão no histórico do git se precisar (`git log --all -- nuvemshop/css-nimbus.css`).
