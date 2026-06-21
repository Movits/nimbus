# designs/ — artes das estampas (POD)

Prompts em `../nimbus-designs-roupas-higgsfield.md`. As **imagens não vão pro GitHub** (repo
público) — ficam local + Drive.

## Estrutura
```
originais/       TODAS as fontes, nomeadas (como geradas: fundo verde ou xadrez) — backup
prontos/
  costas/        recortadas (sem fundo) + 300 DPI — gráficos grandes (back)
  peito/         recortadas + 300 DPI — gráficos pequenos / frente
```
Recortar/organizar: `node scripts/organize-designs.mjs` (auto-detecta fundo verde ou xadrez,
recorta, redimensiona pra 300 DPI). Gere sempre no **Nano Banana 2 + fundo verde**.

## Códigos / estilos
**G** graffiti · **B** blackletter · **H** halftone · (nomes descritivos = artes antigas "nuvem").

## Catálogo atual (recortado, pronto pro POD)
**Costas:** G1-tag (roxo/azul) · G2-anjo-stencil · G2-anjo-livro-stencil · G3-acima-de-tudo
(tags/azul) · G4-cristo-stencil (branco/ouro) · B1-nimbus-blackletter · B2-salmo19 · B3-cruz-crest
· B5-aparecida-halftone · catedral-nuvem · cristo-crest-azul.
**Peito/frente:** G5-icone-nuvem-spray · nimbus-spray-puffy · B4-acima-de-tudo-gotico (branco/preto)
· logo-icone-nuvem-v1/v2 · sagrado-coracao-azul.

## ⚠️ Regra de colorway (preto + off-white)
Cada design deveria ter versão pra **camiseta preta** (arte clara/colorida) **e off-white** (arte
escura). Faltam gerar (mesmo prompt, trocando a cor da arte, fundo verde; sufixo `-branco`/`-preto`):
- **Versão BRANCA (p/ camiseta preta):** G2-anjo · G5-icone-spray · nimbus-spray-puffy ·
  B1-nimbus-blackletter · B5-aparecida.
- **Versão ESCURA (p/ camiseta off-white):** G4-cristo · B2-salmo19.
- **Já OK nas duas:** G1, G3 (coloridos) · B4 (tem branco+preto).
