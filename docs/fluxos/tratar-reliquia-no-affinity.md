---
status: vigente
atualizado: 2026-08-07
---

# Tratar as imagens da RELÍQUIA no Affinity

Vale para o retrabalho manual das 40 escolhidas de 06/08, feito pelo dono. A
passada automática (`tratadas-v1`) recortou demais algumas peças (n25, n33 e
n70 entre as apontadas por ele em 07/08), e o conserto certo parte **sempre do
original**, nunca da tratada.

No caso da n33, a "página que falta" está **dentro do original**: o scan de
4.228×3.196 px é a dupla página completa das Horas de Catarina de Cleves (Boca
do Inferno à esquerda, Absolvição Final com o texto à direita, fols. 168v–169r).
A tratada é que cortou fora a página direita. Conferido em 07/08: essa é a maior
resolução pública que existe (Google Art Project via Wikimedia); cada página
sozinha rende ~17,8 cm a 300 DPI, a dupla inteira ~35,8 cm de largura.

## A ferramenta

**Affinity (Canva, versão unificada, gratuita).** Um aplicativo, três estúdios:

| Estúdio | Serve para | No nosso caso |
|---|---|---|
| **Pixel** | imagem rasterizada (foto, scan) | **as 40 da RELÍQUIA**, que são scans |
| **Vector** | desenho vetorial, Image Trace | emblema B1, wordmark, lettering |
| **Layout** | diagramação multipágina | não usamos |

Ao abrir o app e se perder nas opções: **File → Open** direto no arquivo da
imagem já cai no lugar certo. Só escolha estúdio na mão quando criar documento
do zero.

**Vetorização (Image Trace, menu Vector):** existe e funciona, com prévia ao
vivo. Usar para logo, emblema e lettering chapado. **Não usar nas 40**: scan de
gravura e meio-tom de época vira sopa de curvas; elas ficam raster mesmo.

**Onde os arquivos ficam:** o Affinity é offline-first. O `.af` fica **na
máquina em que foi salvo**; entrar com a mesma conta Canva em outro computador
**não** traz os arquivos junto. Para trabalhar em casa e no trabalho, carregue o
`.af` você mesmo (Drive pessoal ou pendrive). O `.af` é arquivo de trabalho e
**não entra no repositório**; o que entra é o PNG final.

## Onde estão os originais

- **Máquina com o clone:** `nimbus-assets/designs/referencias/reliquia-escolhidas-2026-08/`
  (dar `git pull` antes). JPG e PNG são binários, o `autocrlf` não os toca.
- **Qualquer outra máquina:** o catálogo-artefato das 40 tem, em cada carta, o
  link "Baixar original" apontando para o arquivo cheio na fonte (Wikimedia,
  Rijksmuseum, Gallica). As URLs também estão no `FONTES.json` da pasta acima.
  Salvar o link, não a miniatura da página do acervo, e nunca print de tela.

## O fluxo, peça a peça

1. **Abrir o original** no Affinity (estúdio Pixel).
2. **Recortar e endireitar** com a ferramenta Crop. Recorte na moldura que a
   peça pede; menos é mais, dá para recortar de novo, mas não dá para inventar
   de volta o que o recorte tirou.
3. **Ajustes, só se precisar**, por camada de ajuste (Levels, White Balance):
   não destrói pixel e dá para desfazer depois. A direção é documento de época
   **como é**, então a mão aqui é leve.
4. **Exportar PNG em 100%**, sem redimensionar para cima. Nome:
   `nXX-tratada-v2.png`.
5. **Conferir o tamanho de impressão**: largura em px ÷ 300 × 2,54 = cm na
   peça. O padrão da política de 06/08 é 25 a 30 cm, ou seja, 3.000 a 3.550 px
   de largura. Abaixo disso a peça imprime menor, o que a política permite.
6. **Salvar o `.af`** de trabalho fora do repositório, e **entregar o PNG** para
   a pasta `tratadas-v2-manual/` do `nimbus-assets` (uma sessão ou o Cowork
   commita).

## O que perde e o que não perde qualidade

- **Não perde:** zoom na tela, camada de ajuste, salvar `.af`, exportar PNG em
  100%, recortar (os pixels que ficam continuam intactos).
- **Perde:** exportar menor que o original, **ampliar** (upscale não cria
  detalhe), salvar JPG por cima de JPG repetidas vezes, print de tela.

## O caso do fundo verde, para não repetir

O chroma verde da STREET falhou porque o dourado divide muito canal verde com o
fundo: o removedor comeu partes do ouro e deixou borda verde pixelada
(diagnóstico do dono, confirmado nas amostras de 06/08). A decisão vigente é
**não usar mais chroma**: arte nova nasce em PNG com fundo transparente nativo.
Para recorte manual de imagem já existente, o estúdio Pixel do Affinity resolve
com seleção por cor amostrada e refinamento de borda, sem depender de chave de
cor.

## Relacionados

- Decisão e política: `../decisoes/2026-08-06-nova-direcao-colecoes.md`
- Ata da escolha: `nimbus-assets/designs/referencias/reliquia-escolhidas-2026-08/ESCOLHA-DO-DONO-2026-08-06.md`
- Régua de export: `../verdades/receita-export-300dpi.md`
