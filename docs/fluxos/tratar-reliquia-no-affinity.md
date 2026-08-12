---
status: vigente
atualizado: 2026-08-08
---

# Tratar as imagens da RELÍQUIA no Affinity

Vale para o retrabalho manual das 40 escolhidas de 06/08, feito pelo dono. A
passada automática (`tratadas-v1`) recortou demais uma parte das peças, e o
conserto certo parte **sempre do original**, nunca da tratada.

Os nomes de menu deste documento foram conferidos na documentação oficial do
Affinity 3 em 08/08/2026, um a um, contra <https://www.affinity.studio/help/>.
O app é em inglês; os nomes aparecem como ele mostra.

## Quanto cada tratada perdeu

Medição de 08/08 sobre os arquivos de `tratadas-v1/` **como estão hoje**, ou
seja, já depois da segunda passada de 07/08 ("recortes exatos na moldura"), que
sobrescreveu os arquivos da primeira em vez de criar pasta nova. Compara a área
da tratada com a do original, e mostra a largura de impressão a 300 DPI que cada
uma entrega hoje contra o que o original permite.

**Este número é triagem, não veredito.** Recortar moldura vazia é ganho, e
aparece aqui como "perda". Quem decide é o olho, pela terceira regra do
projeto: se a medição diz que está certo e o olho diz que está errado, o olho
está certo.

**Refazer (perdeu mais de 20% da imagem):**

| Arte | Perdeu | Hoje | Pelo original |
|---|---|---|---|
| n64 Cor Iesu amanti sacrum, coração atingido | 72% | 12,4 cm | 27,7 cm |
| n25 Maria Mater Dei (Rijksmuseum) | 67% | 18,8 cm | 37,2 cm |
| n33 Horas de Catarina de Cleves, Boca do Inferno | 62% | 15,7 cm | 35,8 cm |
| n78 Novena de Posada, Juan Diego | 52% | 7,4 cm | 11,9 cm |
| n36 Grandes Horas de Ana da Bretanha, Trindade | 31% | 23,8 cm | 30,0 cm |
| n50 Missale Meldense, página de rosto | 29% | 16,0 cm | 21,3 cm |
| n70 Christus als Salvator Mundi | 24% | 28,1 cm | 33,3 cm |
| n24 Arma Christi com o véu de Verônica | 22% | 28,6 cm | 34,1 cm |

**Conferir (perdeu de 10% a 20%):** n51, n63, n49, n37, 07 (Sudário de Turim),
n65. **As outras 26 perderam menos de 10%**, quase sempre borda, não conteúdo.

Ressalva de tamanho: duas dessas artes têm original pequeno de nascença, então
refazer não as salva do tamanho menor — **n78** (1.411 px, no máximo 11,9 cm) e
**n63** (1.735 px, 14,7 cm). No **07** o corte foi só na altura, a largura já
era 20,8 cm.

## A ferramenta

**Affinity (Canva, versão unificada 3, gratuita).** Um aplicativo com vários
**Studios**, que são áreas de trabalho, não tipos de arquivo. Trocar de Studio
não converte nem rasteriza nada: só muda quais ferramentas e painéis aparecem.

| Studio | Serve para | No nosso caso |
|---|---|---|
| **Pixel** | imagem rasterizada (foto, scan) | **as 40 da RELÍQUIA** |
| **Vector** | desenho vetorial, Image Trace | emblema B1, wordmark, lettering |
| **Layout** | diagramação multipágina | não usamos |

Troca-se de Studio pelos ícones da barra superior (**Toolbar**) ou por
**File → Studios** no Windows. Existem outros Studios além desses três (Canva
AI, Slice, Retouching, Color Grading, Typography, Compositing), e vários nem
aparecem na barra até serem ativados. Ignore todos por enquanto.

**Vetorização (Vector → Image Trace):** existe, com prévia ao vivo e controles
de Edge Threshold e tolerância de curva. Usar para logo, emblema e lettering
chapado. **Não usar nas 40**: scan de gravura e meio-tom de época vira sopa de
curvas; elas ficam raster mesmo.

**O que é pago:** o Affinity é gratuito, mas as ferramentas de IA exigem
assinatura Canva Pro e vêm marcadas com um ícone de coroa. Isso inclui a
**remoção de fundo por IA** (`Pixel → Remove Background`) e o **upscale por IA**
(Super Resolution / Super Resolve). Nada disso é necessário para as 40, que são
documentos impressos como são.

## Onde os arquivos ficam (a resposta sobre trabalho e casa)

O Affinity é **offline-first**. O arquivo de trabalho tem extensão **`.af`** e
fica **na máquina em que foi salvo**. Não há documento em nuvem nem sincronismo
entre computadores: entrar com a mesma conta Canva em outra máquina **não** traz
os arquivos. A Canva declara que o conteúdo fica local e que ela não o acessa.
Precisa de conta Canva para baixar e ativar o app; depois disso ele funciona
offline.

Então: **o `.af` você carrega na mão** (Drive pessoal ou pendrive). Ele é
arquivo de trabalho e **não entra no repositório**. O que entra é o **PNG
final**, em `tratadas-v2-manual/` no `nimbus-assets` — esse sim abre em qualquer
máquina com `git pull`, e é a nossa fonte de verdade.

## Onde estão os originais

- **Máquina com o clone:** `nimbus-assets/designs/referencias/reliquia-escolhidas-2026-08/`
  (dar `git pull` antes). JPG e PNG são binários, o `autocrlf` não os toca.
- **Qualquer outra máquina:** o catálogo-artefato das 40 tem, em cada carta, o
  link "Baixar original" apontando para o arquivo cheio na fonte (Wikimedia,
  Rijksmuseum, Gallica). As URLs também estão no `FONTES.json` da pasta acima.
  Salvar o link, não a miniatura da página do acervo, e nunca print de tela.

Caso especial já resolvido: na **n33**, a "página que falta" está dentro do
próprio original. O scan de 4.228×3.196 px é a dupla página completa das Horas
de Catarina de Cleves (Boca do Inferno à esquerda, Absolvição Final à direita,
fols. 168v–169r); foi a tratada que cortou a página direita. É a maior resolução
pública existente: cada página sozinha rende ~17,8 cm a 300 DPI, a dupla inteira
~35,8 cm de largura.

## O fluxo, peça a peça

**0. Antes de tudo, duplique.** Trabalhe sempre numa cópia, com os originais
intocados numa pasta separada. O motivo está na armadilha do passo 4.

**1. Abrir o original.** Ignore os presets de página da tela inicial (A4 e
companhia servem para criar documento em branco no tamanho de uma folha, que
não é o nosso caso). O caminho é **File → Open** (`Ctrl+O`), ou arrastar o
arquivo para uma área **fora** da página. O documento nasce com as dimensões em
pixels da própria imagem, numa camada `Background` travada. Não é preciso
escolher Studio: o documento é o mesmo em qualquer um.

**2. Recortar.** Ferramenta **Crop Tool**, atalho **`C`**, que mora no Pixel
Studio. O recorte do Affinity é **não-destrutivo por padrão**: o que fica fora
é escondido, não apagado, e os pixels que ficam continuam intactos, sem
reamostragem. Dá para desfazer depois pelo checkbox **Reveal canvas** na barra
de contexto ou por **Document → Unclip Canvas**. Confirma com **Apply** ou
`Enter`; `Esc` cancela.

> **O único modo que destrói é `Mode = Resample`**, que reamostra de verdade e
> não volta atrás. Deixe o modo em **Unconstrained** e não encoste no Resample.

**3. Endireitar, se estiver torto.** Ainda no Crop Tool, há o modo
**Straighten**: clique nele e arraste uma linha sobre algo que deveria estar
reto (a borda da moldura, a linha de texto), ou segure `Ctrl` e arraste
direto na imagem. A caixa de corte se reajusta sozinha para excluir os cantos
transparentes da rotação.

**4. Salvar o trabalho — e a armadilha.** Com um JPG ou PNG aberto, apertar
`Ctrl+S` **regrava por cima do arquivo de imagem original**, recomprimindo. É a
única forma real de estragar um original neste fluxo. Faça, logo de cara,
**File → Save As** (`Ctrl+Shift+S`) e salve como **`.af`** numa pasta de
trabalho fora do repositório. Daí em diante `Ctrl+S` é seguro.

**5. Ajustar, só se precisar.** Por **camada de ajuste** (Levels, White Balance)
ou live filter (**Pixel → New Live Filter Layer**): nenhum dos dois altera o
pixel original e os dois se desfazem depois. A direção é documento de época
**como é**, então a mão aqui é leve. Evite **Pixel → Rasterize**, que é
destrutivo.

**6. Exportar o PNG.** **File → Export → Export**
(`Ctrl+Alt+Shift+W`), formato PNG. O campo de tamanho já vem preenchido com as
dimensões nativas: **confira que continuam iguais às do documento e não mexa**.
Não existe campo de porcentagem, mas **um preset da lista da esquerda pode
carregar um tamanho diferente** — é o jeito mais fácil de exportar menor sem
perceber. PNG não tem controle de qualidade (não há compressão com perda), e o
DPI da caixa de export não muda a contagem de pixels de um PNG. Nome do
arquivo: `nXX-tratada-v2.png`.

**7. Conferir o tamanho de impressão.** Largura em px ÷ 300 × 2,54 = cm na
peça. O padrão da política de 06/08 é 25 a 30 cm, ou seja, **3.000 a 3.550 px**
de largura. Abaixo disso a peça imprime menor, o que a política permite.
Exportar **não** degrada o documento: gera arquivo separado.

**8. Entregar.** O PNG vai para `tratadas-v2-manual/` no `nimbus-assets` (uma
sessão ou o Cowork commita). O `.af` fica com você.

## O que perde e o que não perde qualidade

- **Não perde:** zoom na tela, camada de ajuste, live filter, recorte
  não-destrutivo, salvar `.af`, exportar PNG no tamanho nativo, trocar de
  Studio, mudar as unidades da régua de px para cm.
- **Perde:** `Ctrl+S` por cima de um JPG aberto (recomprime o original),
  `Mode = Resample` no recorte, **ampliar** (upscale não cria detalhe),
  exportar menor que o original, rasterizar, salvar JPG por cima de JPG,
  print de tela.
- **Mexer no DPI** em `Document → Setup` só altera metadado enquanto o
  **Resample estiver desligado**; ligado, muda a contagem de pixels de verdade.

## O caso do fundo verde, para não repetir

O chroma verde da STREET falhou porque o dourado divide muito canal verde com o
fundo: o removedor comeu partes do ouro e deixou borda verde pixelada
(diagnóstico do dono, confirmado nas amostras de 06/08). A decisão vigente é
**não usar mais chroma**: arte nova nasce em PNG com fundo transparente nativo.
Para recorte de imagem já existente, o caminho no Affinity é seleção manual e
máscara; a remoção de fundo por IA do app é recurso pago (Canva Pro).

## Relacionados

- Decisão e política: `../decisoes/2026-08-06-nova-direcao-colecoes.md`
- Ata da escolha: `nimbus-assets/designs/referencias/reliquia-escolhidas-2026-08/arquivos/ESCOLHA-DO-DONO-2026-08-06.md`
  (movida para `arquivos/` na reorganização de 09/08)
- Régua de export: `../verdades/receita-export-300dpi.md`
