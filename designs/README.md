# designs/ — artes das estampas (POD)

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
