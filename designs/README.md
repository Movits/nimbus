# designs/ — artes das estampas (POD)

Prompts em `../nimbus-designs-roupas-higgsfield.md`. As **imagens não vão pro GitHub** (repo
público) — ficam local + Drive.

## Estrutura (por COLEÇÃO)
```
originais/                       TODAS as fontes, nomeadas (verde / magenta / xadrez) — backup
prontos/
  STREET/{costas,peito,mockups}     graffiti      (G*)
  RELIQUIA/{costas,peito,mockups}   gótico+halftone (B*, H*)
  GLORIA/{costas,peito,mockups}     Y2K/angelcore (Y*)
  PADROEIRA/{costas,peito,mockups}  Brasil sacro  (S*) — geradas no MAGENTA
  NUVEM/{costas,peito,mockups}      artes antigas de nuvem
  _marca/                           logo (peito em qualquer coleção)
```
Organizar/recortar: `node scripts/organize-designs.mjs` — lê `originais/`, auto-detecta o fundo
(**verde** `#00B140` / **magenta** `#FF00FF` / xadrez), recorta, 300 DPI e separa por coleção.

## Coleções ↔ código
**G** STREET (graffiti) · **B/H** RELÍQUIA (blackletter + halftone) · **Y** GLÓRIA (Y2K) ·
**S** PADROEIRA (Brasil sacro). Nomes descritivos (catedral-nuvem etc.) = coleção NUVEM (antigas).

## Fundo de geração
Tudo no **VERDE** `#00B140`, **exceto PADROEIRA** → **MAGENTA** `#FF00FF` (a arte dela tem verde,
que brigaria com o chroma verde). Gere sempre no **Nano Banana 2**.

## ⚠️ Colorway (preto + off-white) — auditoria depois do teste na YouDraw
Cada design idealmente tem versão pra **camiseta preta** (arte clara/colorida) **e off-white**
(arte escura). Gerar a inversa com sufixo `-branco`/`-preto`. Levantamento inicial (revisar quando
tivermos mais coleções): falta BRANCA p/ G2, G5, nimbus-spray, B1, B5 · falta ESCURA p/ G4, B2.
