---
status: vigente
atualizado: 2026-07-27
---
# Prompts do piloto Nano Banana (registro exato)

## v1 — tecnico com centimetros (PERDEU: +22% a +63% de escala)
Refs: [arte oficial PNG, blank]
```
Task: apply the artwork from the FIRST reference image as a screen print on the back of the garment in the SECOND reference image. Keep the second photo EXACTLY as it is: same person, same pose, same garment and folds, same lighting, same background, same framing. Change nothing except adding the print. Print geometry, follow precisely: the artwork is {W} cm wide by {H} cm tall. The garment's back length from collar seam to hem is {L} cm. The top edge of the print sits {P} cm below the collar seam. The print is centered on the back panel, on the wearer's spine line (follow the garment's center-back, respecting the body's rotation in the photo). The print is silk-screened ON the fabric: it bends with the folds, inherits the fabric's lighting and shadows, and slightly wraps with the body's curvature. Reproduce the artwork faithfully: every letter, line and ornament exactly as in the reference. Do not redraw, restyle, crop or add anything to the artwork.
```

## A — minimo (PERDEU: +79%; o instinto do modelo e estampa gigante)
Refs: [arte oficial PNG, blank]
```
Add the artwork from the first image as a back print on the t-shirt in the second image. Keep everything else unchanged.
```

## B — produto como referencia (VENCEU; sem numero nenhum)
Refs: [mockup das COSTAS do produto (gallery certa!), blank]
```
The first image is the real product: the BACK of the t-shirt with its print. The second image is a person wearing the same t-shirt, still blank. Show the person wearing the real product: same print, same size and same position on the garment as in the product photo. Keep the person, pose, folds, lighting and background exactly as they are.
```
Armadilha: gallery errada = produto errado reproduzido fielmente. Selecionar o
mockup de costas pelo REGISTRO com a arte, nunca pelo indice.

## v2 — 3 referencias, desenhado pelo dono (VIGENTE para pose sem capuz)
Refs: [arte oficial PNG, blank, mockup de COSTAS escolhido por registro]
```
The first image is the artwork. The second image is a person wearing the blank garment, with no print. The third image is the official product photo, showing the real print on the back of this same garment.

Add the print to the person's garment in the second image. Use the artwork from the first image, at the same size and the same position on the garment as shown in the third image. Keep the person, pose, folds, lighting and background of the second image exactly as they are.
```
Medido (27/07): tee 352618935 +3%/+5,6% de escala na 1a rodada; moletom
+2,9%/−8,3%; oversized 352728019 ainda +23%/+21%.

### v2b — rodada de correcao (1 frase de feedback por erro)
- Letras: "Reproduce the lettering of the artwork exactly as drawn, stroke by
  stroke, without redrawing or thickening the letters."
- Oversized grande: "make the print clearly smaller… it covers less than half
  the width of the back panel" → escala caiu de +23% para **+0,3%**.
  "Keep the gold halo flat and simple" → tirou a re-texturizacao do halo.
- Capuz: "its top part is hidden under the hood" → **NAO obedece** (piorou:
  +15,9% e +63%). Capuz e falha dura da IA; usar a via geometrica com oclusao.

Melhores: tee v2b-2 (escala +0,2%, dV −0,4 cm, dH +1,4 cm), oversized v2b-1
(escala +0,3%, dV −2,0 cm, acompanha o corpo girado). Moletom: todas reprovadas.
