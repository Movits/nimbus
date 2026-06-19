# NIMBUS — Designs de estampas (Higgsfield → HotPrinti)

Prompts pra gerar as **estampas** dos primeiros itens no Higgsfield e publicar na **HotPrinti**.
Cada prompt já vem montado: copie o bloco e cole no Higgsfield. Guarde os arquivos prontos na
pasta `designs/` (1 pasta por item) — assim a gente migra de POD sem retrabalho.

---

## Avaliação rápida da HotPrinti (pra decidir)

**Vale pra lançar.** Grátis (plano free até **15 produtos**), sem estoque, produção 24–48h,
e tem itens muito on-brand (Chinelo Nuvem, oversized/heavy/pima, moletom canguru).

| Método | Bom pra | Observações |
|---|---|---|
| **DTF** | Roupas, qualquer cor, gráficos vibrantes | Dura ~100 lavagens; **sem gradiente/transparência**; frente/costas/manga |
| **DTG** | Algodão claro, arte com **gradiente/transparência**, toque macio | Melhor em peça clara; ideal pra "peça de arte" |
| **Laser** | Chinelo, copo, óculos | Gravação em **1 cor** (etch), alto contraste |

**Contras:** só Brasil · precificação confusa · não integra com nosso site (loja própria) ·
plano popular ~R$99/mês. **Por isso:** mantemos os **arquivos-mestre portáveis** (PNG 300dpi,
transparente, tamanho real) em `designs/` + backup no Drive. HotPrinti = lançamento, não prisão.

**Decidido:** itens = Camiseta Oversized · Moletom Canguru · Chinelo Nuvem · cores = **Preto +
Off-white** · impressão = **DTF padrão + 1 peça DTG de arte + laser no chinelo**.

---

## Specs de arquivo (vale pra qualquer POD)
- **PNG transparente**, **300 DPI**, **RGB**, no **tamanho real** de impressão.
- Tamanhos-mestre (confirmar exato com as fotos detalhadas dos itens):
  - Costas (hero): ~33×40 cm → ~**3500×4500 px**
  - Peito esquerdo: ~9×9 cm → ~**1100×1100 px**
  - Frente central / arte DTG: ~30×35 cm
  - Manga: ~8×8 cm · Laser (chinelo): vetor 1-cor, alto contraste, ~1500×1500 px
- **Dica de colorway:** contorno **navy** + preenchimento **branco** fazem a arte ler tanto no
  **preto** quanto no **off-white**. Pra arte só-branca, gere também uma variante de contorno
  escuro pro off-white.

---

## CAMISETA OVERSIZED — DTF (preto + off-white)

### EST-01 · Costas (hero) · `🖼️ Imagem` · GPT Image 2 · transparente · ~3500×4500
```
Large back-print streetwear graphic: the white hyperboloid crown of the Cathedral of Brasília bursting up through fluffy cartoon clouds, a glowing golden halo above it, soft divine light rays, and the puffy cloud wordmark "NIMBUS" in cloud letters below. The letters must read N-I-M-B-U-S exactly. Style: premium streetwear print graphic, NIMBUS world — fluffy cartoon cloud forms, golden halo, white modernist Niemeyer concrete; sky-blue and cloud-white fills with navy outline and soft gold accents; bold clean illustration for DTF screen print; isolated on a fully transparent background, crisp edges, no garment, no mockup, no scene.
```

### EST-02 · Peito esquerdo (ícone) · `🖼️ Imagem` · GPT Image 2 · transparente · ~1100×1100
```
Small left-chest logo: a single fluffy cloud with a golden halo floating above it, navy outline, white and light sky-blue fill, iconic and clean, no text. Style: premium streetwear print graphic, NIMBUS world; isolated on a fully transparent background, crisp edges, no garment, no mockup, no scene.
```

### EST-03 · Frente central / alternativa · `🖼️ Imagem` · GPT Image 2 · transparente
```
Chest crest graphic: a sacred heart wrapped in fluffy clouds with a golden halo and soft light rays, navy outline with white, sky-blue and soft-gold fills, clean premium streetwear crest, no text. Style: premium streetwear print graphic, NIMBUS world; isolated on a fully transparent background, crisp edges, no garment, no mockup, no scene.
```

---

## MOLETOM CANGURU — DTF (preto + off-white)

### EST-04 · Costas (crest devocional) · `🖼️ Imagem` · GPT Image 2 · transparente · grande
```
Devotional back-print crest: Christ the Redeemer (Cristo Redentor) with open arms standing on a cloud, framed by a white Niemeyer-style curved concrete arch and a golden halo, soft divine light rays, fluffy clouds at the base, and a ribbon banner reading "NIMBUS" in cloud letters. The letters must read N-I-M-B-U-S exactly. Premium illustrated emblem. Style: premium streetwear print graphic, NIMBUS world — navy outline with white, sky-blue and soft-gold fills; bold clean illustration for DTF; isolated on a fully transparent background, crisp edges, no garment, no mockup, no scene.
```

### EST-05 · Peito · `🖼️ Imagem` · GPT Image 2 · transparente
> Reaproveitar o **EST-02** (ícone nuvem+auréola) no peito esquerdo, acima do bolso canguru.

---

## PEÇA DE ARTE — DTG (off-white) · aproveita gradiente/transparência

### EST-06 · Frente inteira (arte) · `🖼️ Imagem` · Nano Banana 2 · ~30×35 cm
```
Painterly full-front art print for a light/off-white garment: an ethereal sky world — white curved Niemeyer concrete cathedral rising from soft volumetric clouds into a pale blue heaven, gentle godrays and a faint golden halo. Rich soft gradients, dreamy and premium, centered composition that fades softly at the edges with no hard frame. Print-ready, high detail. NIMBUS world palette: sky-blue and cloud-white with soft gold. Transparent background outside the artwork.
```
> DTG segura os gradientes que o DTF não faz. Em peça off-white, as bordas suaves "somem" no tecido.

---

## CHINELO NUVEM — Laser (1 cor)

### EST-07 · Gravação a laser · `🖼️ Imagem` · GPT Image 2 · transparente · 1-cor alto contraste
```
A clean single-color (solid black) vector-style mark for laser engraving: the NIMBUS cloud-and-halo icon — bold simple silhouette, minimal internal detail, no gradient, high contrast, isolated on a transparent background. Optimized for 1-color laser etch.
```
```
A clean single-color (solid black) vector-style wordmark for laser engraving reading exactly "NIMBUS" in simplified puffy cloud letters, bold solid silhouette, no gradient, high contrast, isolated on a transparent background. Optimized for 1-color laser etch.
```
> Laser é monocromático (grava o material). Gere **2 arquivos** (ícone + wordmark) em preto sólido.

---

## Opcionais (próximas levas)
- **EST-08 — Manga:** cruz dentro de uma nuvem, ou uma curva Niemeyer minimalista (pequena, 1-2 cores).
- **EST-09 — Nossa Senhora Aparecida:** crest devocional premium pras costas (mesma linguagem).
- **Padrão all-over:** vitral azul do Dom Bosco como textura geométrica (camiseta/forro de capuz).

---

## Workflow (repetir por estampa)
1. Gerar no Higgsfield (modelo indicado), **fundo transparente**, alta resolução.
2. Exportar **PNG 300dpi no tamanho real** → salvar em `designs/<item>/<posição>/`.
3. Espelhar no **Drive** (backup + portabilidade entre PODs).
4. Subir na HotPrinti no método/posição/cor corretos (DTF/DTG/laser).
5. Gerar **mockup** (skill higgsfield-product-photoshoot, ou o mock da HotPrinti) → `mockups/`.

## Pendência
Pra travar **dimensões e posição exatas** por item, me manda as **fotos detalhadas** (cores
disponíveis + área/posição/tamanho de impressão) de: Camiseta Oversized, Moletom Canguru e
Chinelo Nuvem. A HotPrinti não publica esses specs.
