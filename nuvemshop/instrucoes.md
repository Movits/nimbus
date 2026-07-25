# Loja Nuvemshop — estado e guia de aplicação

**Plano Impulso · tema Baires · baseline revisado em 24/07/2026.**

A Nuvemshop não tem deploy por git. Esta pasta é um kit: o CSS e as páginas são **colados à mão** no
painel. Por isso o repo não é a fonte de verdade da loja, a loja é. Este arquivo diz o que está no ar.

## Leia isto antes de colar qualquer CSS

⚠️ **A "Edição de CSS avançada" da Nuvemshop remove silenciosamente todas as CSS custom properties**,
tanto as definições em `:root` quanto qualquer uso de `var(--...)`. Um CSS baseado em variáveis fica
**inerte** na loja: cola, salva, e não acontece nada. Todo CSS daqui tem que ser literal (hex resolvido).

Exceção segura: `var()` **com fallback**, tipo `var(--body-font, "Inter", Arial, sans-serif)`. Se a
plataforma remover, o fallback assume e nada quebra. O CSS de produção usa isso em 6 lugares.

## Fonte local mais recente e estado da loja

| O quê | Onde |
|---|---|
| **CSS local consolidado mais recente** | `css-nimbus-publicacao-compacta-2026-07-20.css` |
| Fonte legível de header/footer responsivo | `css-nimbus-responsive-header-footer-2026-07-20.css` |
| Gerador da saída consolidada | `../scripts/build_nimbus_publication_css.mjs` |
| Página Projetos Sociais | `pagina-projetos-sociais.html` |
| Página Sobre | `pagina-sobre.html` |
| Tiles das coleções | `assets/tile-nuvem.jpg`, `tile-reliquia.jpg`, `tile-street.jpg` |

Os arquivos de 16/07 e 17/07 são históricos e não devem ser colados
isoladamente. A Nuvemshop sanitiza o CSS ao salvar, portanto a loja pública e o
editor são a fonte de verdade. Antes de publicar, gere ou confira a composição
de 20/07 e valide o resultado real.

O CSS **não é um tema completo**: é uma camada de correção. O Baires é configurado nativamente no editor
(as fontes Fraunces e Inter são nativas dele), e o CSS só corrige o que o editor não alcança: header em
linha única no desktop, logo no centro geométrico no mobile, três coleções simultâneas, modais dos
projetos, footer editorial. Por isso ele começa direto em "Cabecalho:" e não estiliza `body`.

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
estampa está certa. A auditoria visual das 49 foi concluída em 22–23/07 (25 APROVAR / 13 REVISAR /
11 REFAZER — fonte: `auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte.csv`). O caso da
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
(`node scripts/geometry/validate.mjs`, sai com código 1 se falhar). Margem publicada de escala:
3 pontos percentuais com anotação de 8 pontos. **Nenhum veredito sai com esse portão vermelho.**

Resultado em 41 fotos de 31 produtos, detalhado em
`nuvemshop/auditoria/2026-07-25-geometria/ACHADOS.md`: 19 OK, 3 reprovadas por impossibilidade
física, 3 fora do alvo, 14 sem veredito, 2 sem tabela de medidas.

**Fila de correção** (todas com estampa MENOR que o alvo, o oposto do que se acreditava):
Salmo 19 Moletom `[352619175]` −19,9% · Querubim Spray Oversized `[352725749]` −12,9% ·
Acima de Tudo Gótico Oversized `[352720257]` −12,5% · São Miguel Vintage Premium `[352407196]`
−9,7% · Brasão NIMBUS Premium `[352717837]` −8,5% · Espírito Santo Spray Premium `[352721477]` −8,1%.

**NÃO refazer** `352726673`, `352727545`, `352718787` e `352728357`: a lista REFAZER antiga
condenava as quatro e a medição aprova.

**Posição** continua sem veredito nas 41, e isso é limite medido do método, não falta de dado:
ele confirma centralização abaixo de ~2 cm e reprova acima de ~7 cm. Centralização fina se confere
no mockup plano, onde não há enrolamento nem pose.

**Requisito de produção novo:** foto de Moletom Canguru precisa mostrar a base da gola. Capuz caído
sobre as costas torna a peça impossível de medir, e foi a causa de 11 dos 14 sem veredito.

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

Depois, conferir na loja pública: home no desktop, os três modais da página Projetos Sociais, e mobile em
390 e 320 px. Checar centro do logo, ausência de rolagem horizontal, hero sem corte, coleções com largura
certa, modais fechando sem salto, e que nada comercial mudou.

Se o editor impedir equivalência exata com a prévia, **não improvisar mudança estrutural**: relatar a
diferença concreta.

## Até onde dá no Impulso

O Impulso dá CSS + módulos do tema, não dá pra colar HTML custom nem editar o DOM. Fidelidade 100% a um
mockup só no plano **Escala** (código-fonte do tema) ou headless. Não vale a pena agora.

## Histórico

- **Auditoria de escala (22–23/07/2026)**: 49 produtos comparados com as
  dimensões da YouDraw. Fonte em
  `auditoria/2026-07-22-dimensoes-arte/auditoria-dimensoes-arte.csv`; documento
  visual em `auditoria-dimensoes-arte-nimbus.docx` e
  `auditoria-dimensoes-arte-nimbus-qa.pdf`. Resultado: 25 APROVAR, 13 REVISAR e
  11 REFAZER. Não gerar ou publicar substituições antes do feedback do dono.
- **Substituições de capa (22/07/2026)**: 13 arquivos corrigidos publicados em
  9 produtos (registro em `auditoria/2026-07-21/implementacao/auditoria-imagens-2026-07-22/`).
  Atenção: parte dessas correções foi reprovada de novo pela auditoria de
  dimensões (ex.: 352727545 ficou 15–20% MENOR que o mockup — sobrecorreção).
  O CSV de dimensões é o veredito vigente.
- **Baires (20–21/07/2026)**: consolidação atual de header, footer, manifesto,
  modais, responsividade e hover em
  `css-nimbus-publicacao-compacta-2026-07-20.css`.

- **Baires (15–16/07/2026)**: tema atual. Direção em `previews/auditoria-e-direcao-baires-2026-07-15.md`,
  prévia aprovada em `previews/ajustes-finais-preview-2026-07-16.html`, registro da publicação em
  `publicacao-2026-07-16.md`.
- **Morelia (02–04/07/2026)**: era anterior, morta. O `css-nimbus.css` e os `cowork-loja-v*-prompt.md`
  foram **removidos do repo** porque mandavam colar um CSS inerte via URL raw do GitHub, o que apagaria o
  estilo da loja publicada. Estão no histórico do git se precisar (`git log --all -- nuvemshop/css-nimbus.css`).
