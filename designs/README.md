# designs/ — arquivos de estampa prontos (POD)

Arquivos-mestre **portáveis** das estampas NIMBUS, 1 pasta por item. Servem pra subir na
HotPrinti hoje e pra migrar pra qualquer outro POD depois (Montink, Youdraw, Reserva INK,
Printful) sem retrabalho. Prompts pra gerar tudo: `../nimbus-designs-roupas-higgsfield.md`.

## Regras dos arquivos
- Gere no Higgsfield em **qualidade máxima (2K)** + **fundo transparente** + o **aspect ratio**
  da pasta (ver tabela). O Higgsfield não define px/DPI — quem resolve é o `finalize`.
- Nome: `<item>-<posição>-<colorway>.png` — ex.: `camiseta-costas-preto.png`,
  `camiseta-frente-offwhite.png`, `chinelo-laser-icone.png`.
- Sempre manter um **backup espelhado no Google Drive** (fonte de verdade).

## Finalizar pra impressão
Salve o PNG na pasta certa e rode na raiz do projeto:
```
npm run finalize
```
Faz **upscale** (se preciso) pro tamanho de impressão e marca **300 DPI** in-place. Alvo + aspect:

| Pasta | Tamanho | Aspect ratio (Higgsfield) |
|---|---|---|
| `costas/` | 33×40 cm | 3:4 |
| `frente/` | 30×35 cm | 3:4 |
| `peito/` | 9×9 cm | 1:1 |
| `manga/` | 9×9 cm | 1:1 |
| `laser/` | ~15 cm (1 cor) | ícone 1:1 · wordmark 16:9 |

## Colorways do 1º drop
- **Preto** → estampa com preenchimento branco/azul-céu (contorno navy).
- **Off-white** → estampa com contorno navy/escuro (mesma arte costuma servir nos dois).

## Estrutura
```
camiseta-oversized/  costas/ frente/ peito/ manga/ mockups/   (DTF)
moletom-canguru/     costas/ frente/ peito/ mockups/          (DTF)
chinelo-nuvem/       laser/ mockups/                           (laser, 1 cor)
_mestres/            arquivos-fonte / variações / backup
```

## Posicionamento (confirmar com as fotos detalhadas da HotPrinti)
- Camiseta: costas ~33×40 cm · peito esq. ~9 cm · manga ~8 cm.
- Moletom: costas grande · peito esq. acima do bolso canguru.
- Chinelo: gravação a laser na tira (1 cor).

## Métodos por item
- Camiseta Oversized → **DTF** (+ versão off-white) · 1 peça de arte em **DTG**.
- Moletom Canguru → **DTF**.
- Chinelo Nuvem → **Laser** (ícone + wordmark, preto sólido).
