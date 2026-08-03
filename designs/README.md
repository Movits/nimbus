# designs/ — artes das estampas (POD)

> ⚠️ **Nota (24/07/2026): o canal vigente de geração é a API do Google AI Studio (Nano Banana / Nano Banana Pro), não mais o Higgsfield. O restante do fluxo (chroma, organize-designs, 300 DPI) segue válido.**

Prompts em `../nimbus-designs-roupas-higgsfield.md`. As **imagens não vão pro GitHub** (repo
público) — ficam local + Drive.

## Estrutura (por COLEÇÃO)
```
originais/                       TODAS as fontes, nomeadas (verde / magenta / xadrez) — backup
prontos/
  STREET/{costas,peito,mockups}     graffiti        (G*)
  RELIQUIA/{costas,peito,mockups}   blackletter + halftone + barroco (B*, H*, S*)
  NUVEM/{costas,peito,mockups}      artes de nuvem cartoon
  _marca/                           logo/wordmark (peito em qualquer coleção)
```
Organizar/recortar: `node scripts/organize-designs.mjs` — lê `originais/`, auto-detecta o fundo
(**verde** `#00B140` / **magenta** `#FF00FF` / xadrez), recorta, 300 DPI e separa por coleção.

> ⚠️ **Tamanho de export PINADO (03/08/2026, P1-1c r4)**: arte nova nasce da fonte
> com pixel para 300 DPI no maior uso (costas em pé = **4724 px de altura**);
> régua completa em `docs/verdades/receita-export-300dpi.md`. O portão
> `npm run producao:dpi300` devolve arquivo abaixo disso.

## Coleções ↔ código
**G** STREET (graffiti) · **B/H** RELÍQUIA (blackletter + halftone) · **S** RELÍQUIA (barroco Brasil
sacro, gerado no MAGENTA) · nomes "…-nuvem" = NUVEM · "logo-…" = _marca.
(A coleção Y2K/GLÓRIA foi descartada por enquanto.)

## Fundo de geração
Tudo no **VERDE** `#00B140`, **exceto o barroco (S)** → **MAGENTA** `#FF00FF` (a arte tem verde, que
brigaria com o chroma verde). Gere sempre no **Nano Banana 2**.

## ⚠️ Colorway (preto + off-white) — auditoria depois do teste na YouDraw
Cada design idealmente tem versão pra **camiseta preta** (arte clara/colorida) **e off-white**
(arte escura). Gerar a inversa com sufixo `-branco`/`-preto`.
