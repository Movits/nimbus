# Protocolo de anotação de landmarks

Quem anota devolve **coordenadas**, não vereditos. Não opine sobre qualidade da peça: marque
pontos e declare o que não conseguiu ver. O veredito sai da matemática depois.

## Coordenadas

Tudo em **porcentagem da imagem original**, 0 a 100, `x` da esquerda para a direita e `y` de cima
para baixo. A folha de anotação já vem com grade: linhas finas a cada 2%, linhas grossas rotuladas
a cada 10%. Os rótulos continuam em % da imagem original mesmo nos recortes ampliados.

Para ampliar qualquer região, de `/home/user/nimbus`:

```
node scripts/geometry/annotate.mjs <foto.jpg> <saida.jpg> --zoom x0,x1,y0,y1
```

`x0,x1,y0,y1` são frações de 0 a 1. Use quantos recortes precisar — precisão importa mais que
velocidade. Salve os recortes fora do repositório (no diretório de scratchpad indicado na tarefa).

## Os pontos

### A estampa

Marque a borda **externa da mancha de tinta**. Se a arte tiver moldura desenhada (azulejo, moldura
rococó), use a borda externa da moldura.

- `tl`, `tr`, `br`, `bl` — os quatro cantos da caixa envolvente da tinta.
- `mt`, `mb`, `ml`, `mr` — os pontos médios das arestas de cima, de baixo, da esquerda e da direita.

**Declare o tipo de arte**, porque ele muda o cálculo:

- `"shape": "rect_frame"` — existe moldura ou borda desenhada, e os pontos médios caem sobre ela.
  Aqui os pontos médios são o que dá a precisão de ±2 pontos percentuais: numa peça vestida a
  aresta é curva, e o meio dela está na mesma profundidade da gola e da barra, enquanto os cantos
  estão na parte curva do dorso, mais perto da câmera.
- `"shape": "irregular"` — ilustração livre, spray, stencil. Não existe aresta: a tinta no meio
  horizontal não alcança o topo da caixa. Nesse caso os pontos médios descrevem o contorno do
  desenho e **não** são usados para medir altura; a medição cai para a caixa envolvente, com
  margem de ±6 pontos percentuais.

Nunca calcule um ponto médio como média dos cantos. Olhe a imagem e marque onde a borda passa.

### A peça

- `collar_center` — base da gola nas costas (ou na frente, se a vista for frontal), no centro:
  onde a ribana encontra o corpo da peça.
- `hem_center` — a barra inferior, no centro.
- `side_left`, `side_right` — as bordas do **tronco** na altura do meio da estampa. Se o braço
  estiver colado ao corpo, marque o vinco entre manga e tronco, não a silhueta externa: a silhueta
  com mangas desloca o centro aparente e é justamente o que engana o olho.

## Para cada ponto

- `sigma_pct`: sua incerteza, em pontos percentuais. `0.3` se está nítido, `2.0` se está estimando.
- `status`: `ok`, `occluded_hair`, `occluded_hood`, `low_contrast`, `out_of_frame`,
  `indeterminate`, `no_seam`.

**Ponto que você não viu não vira número.** Declare o status honesto e dê a melhor estimativa com
sigma alto, ou omita. O medidor prefere devolver "inconclusivo" a devolver um número inventado —
foi exatamente o número inventado que invalidou as duas auditorias anteriores.

## Formato

```json
{
  "photo": "<arquivo>.jpg",
  "annotator": "<seu id>",
  "imageSize": { "w": 1600, "h": 1600 },
  "art": {
    "tl": [x,y], "tr": [x,y], "br": [x,y], "bl": [x,y],
    "mt": [x,y], "mb": [x,y], "ml": [x,y], "mr": [x,y],
    "shape": "rect_frame" | "irregular",
    "sigma_pct": 0.5
  },
  "collar_center": { "xy": [x,y], "sigma_pct": 1.0, "status": "ok" },
  "hem_center":    { "xy": [x,y], "sigma_pct": 1.0, "status": "ok" },
  "side_left":     { "xy": [x,y], "sigma_pct": 1.0, "status": "ok" },
  "side_right":    { "xy": [x,y], "sigma_pct": 1.0, "status": "ok" },
  "flags": [],
  "notes": "o que foi difícil de ver e por quê"
}
```

## Dupla anotação

O padrão é **um anotador por foto**. Uma segunda anotação independente é obrigatória quando:

- o resultado cai a menos de 3 pontos percentuais de um limite de veredito;
- qualquer ponto tem `status` diferente de `ok`;
- a anisotropia medida indica pose forte.

Anotadores não leem o trabalho um do outro. A discordância entre eles é registrada no resultado e
é a fonte de erro que a validação sintética não cobre — no piloto ficou em 0,05 ponto percentual
na caixa da arte.
