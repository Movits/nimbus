---
status: vigente
atualizado: 2026-07-26
substitui: Nimbus brain/wiki/concepts/geracao-capas-lifestyle.md
---

# Fluxo: produzir uma capa de produto

A capa é a foto de modelo vestindo a peça, com a estampa oficial aplicada.

**A ideia central, e o motivo de tudo:** a IA gera a peça **em branco**, sem
estampa nenhuma, e a arte oficial entra depois por composição. Assim não existe
escala para a IA errar — ela fica certa por construção. Pedir à IA que desenhe a
estampa falhou duas vezes seguidas sem mover a escala um pixel, porque com uma
foto de referência no pedido o modelo copia o tamanho errado junto.

---

## 1. Peça em branco

```bash
node scripts/produce-cover.mjs blank \
  --produto <id> --peca "<peça>" --vista costas|frente \
  --cor black|white|off-white --colecao RELIQUIA|STREET|NUVEM \
  --cena <capa publicada do produto> --out <blank.png>
```

A cena de referência é a **capa publicada daquele produto e daquela cor**. O
prompt trava a peça (`GARMENT_LOCK`) e proíbe estampa de várias formas — a
repetição é necessária, o modelo tende a desenhar a arte junto.

Abra o blank e rejeite se: a IA desenhou estampa, a peça está errada, a pose
ficou torcida, ou na vista de frente os braços cobrem o peito. Regere **uma** vez.

Barra cortada no quadro **não** é motivo de rejeição sozinha: várias cenas
publicadas cortam a barra e o modelo copia o enquadramento.

## 2. Landmarks

São quatro, e cada um tem uma armadilha conhecida.

**Barra** — `node scripts/geometry/detect-hem.mjs <blank>`. O degrau mais forte
**não** é a barra quando a peça é escura sobre calça escura (pega a calça, mais
abaixo), quando há pesponto ~2 cm acima da borda, ou em moletom (pega a calça).
O teste que resolve: leia o perfil de luminância da coluna central e veja se
**abaixo** do degrau o campo continua plano — se continua, é a barra.

**Gola** — a costura, base da ribana, não o topo dela. Em moletom com capuz o
marco é a junção capuz/corpo. Na vista de frente use a costura na **lateral do
pescoço**: o fundo do decote desce 3 a 5 cm a mais e jogaria a estampa para baixo.

**Torso** — largura visível **na altura da estampa**. Confira contra 2R da
tabela. `measure-torso.mjs` serve de segunda opinião, nunca de autoridade.

**Centro** — o **eixo do painel**, medido pelos vincos de cava. Não é o meio da
imagem nem o meio da silhueta. Um cilindro girado em torno do próprio eixo tem a
mesma silhueta, então o meio do tronco continua sendo o eixo mesmo com o modelo
de lado; o que atrapalha é braço e manga cobrindo a borda.

## 3. Composição

```bash
node scripts/produce-cover.mjs compor \
  --produto <id> --peca "<peça>" --foto <blank> --arte <arte oficial> \
  --gola <g> --barra <b> --centro <eixo> --torso <t> \
  --placement <cm do produto> --arte-cm <LxA> \
  [--yaw <graus>] [--oclusao "x,y x,y ..."] --out <capa.png>
```

O `placement` vem de [`../verdades/placement.md`](../verdades/placement.md) e é
**por produto**, nunca padrão de família.

A arte é deformada e sombreada pelas **dobras do próprio tecido** (`--relevo`,
padrão 3). Sem isso ela sai como retângulo de bordas retas sobre pano amassado, e
lê como adesivo — foi por isso que o lote de 77 foi reprovado. Texto pode
distorcer um pouco numa dobra real: é aceitável, e é o que faz parecer roupa.

**Moletom com capuz:** o capuz cai sobre as costas e cobre o topo da estampa.
Isso é o produto real e tem que aparecer. Trace o polígono da borda do capuz e
passe em `--oclusao`; ele fica guardado na receita. Cubra o capuz **inteiro**,
não só a faixa da borda — cobrir só a interseção já abriu buraco no meio do
desenho.

Cada composição grava `<capa>.receita.json` com todos os parâmetros. É o que
permite recompor sem re-derivar landmarks.

## 4. Gate e checagem visual

Rode o gate ([`auditoria-capa.md`](auditoria-capa.md)) e depois **abra a capa**.
O gate não vê fidelidade de traço, sinal de yaw nem integração com o tecido.

Se reprovar por escala, o erro está em gola ou barra. Se reprovar por posição,
confira o placement e, na vista de frente, se a gola foi lida na lateral do
pescoço. Corrija **uma** vez.

---

## O que mudou e por quê

Cada trava aqui nasceu de um defeito medido. O histórico completo está em
[`../../nuvemshop/assets/producao-capas/REGISTRO.md`](../../nuvemshop/assets/producao-capas/REGISTRO.md).
