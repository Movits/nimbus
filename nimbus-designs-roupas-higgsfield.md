# NIMBUS — Designs de estampas (Higgsfield → HotPrinti)

Prompts pra gerar as **estampas** no Higgsfield e publicar na **HotPrinti**. Cada prompt é
**copy-paste e 100% autossuficiente** (o Higgsfield não tem memória).

O **norte de estilo é a EST-03 (Sagrado Coração)** que aprovamos: tatuagem neo-tradicional /
gravura fine-line, traço azul-marinho, sombreado de linhas finas, paleta **azul-céu + branco +
dourado**, assunto **emoldurado por coroa de nuvens**, **anel de auréola dourado** atrás +
**raios finos**. Nem cartoon chapado, nem foto.

---

## ⚠️ Como gerar (sempre)

1. **Modelo Nano Banana 2** (ilimitado → poupa créditos pros vídeos) · **2K** · **aspect ratio**
   da peça · o prompt já pede **fundo verde**.
2. **Reference image = SEMPRE a EST-03 v1 (Sagrado Coração)** pra travar o estilo. Arquivo:
   `designs/camiseta-oversized/frente/camiseta-frente-sagrado-coracao-v1.png`. Pros assuntos que
   precisam de semelhança (Cristo, Maria, São Miguel, Catedral…), anexe **também** uma **foto
   real** do assunto (estilo vem da EST-03, semelhança vem da foto).
3. Salve em **`designs/_inbox/`** → **`npm run cutout:inbox`** (tira o verde + prévia magenta).
4. Eu organizo + **`npm run finalize`** (upscale + 300 DPI).

**Cabeçalho:** `EST · nome · 🖼️ Imagem · Nano Banana 2 · aspect ratio · ref`.

| Posição | Tamanho · Aspect ratio |
|---|---|
| Costas | 33×40 cm · **3:4** · Frente 30×35 cm **3:4** · Peito/manga 9 cm **1:1** · Regata **9:16** · Laser ícone **1:1**/wordmark **16:9** |

**Bloco de estilo (já embutido em cada prompt):**
> Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line
> ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching),
> detailed and recognizable, NOT flat cartoon and NOT a photo; strict palette = sky-blue +
> cloud-white + gold only; the subject cradled by a wreath of stylized white clouds, a thin GOLD
> halo ring behind it and slender radiating gold-and-blue rays; symmetrical, emblematic, premium
> streetwear; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard,
> no garment, no mockup).

---

## Estampas (assunto ilustrado — estilo EST-03)

### EST-03 · Sagrado Coração (o NORTE de estilo) · 🖼️ Imagem · Nano Banana 2 · 1:1 · ✅ pronto
```
A Sacred Heart of Jesus (heart with a crown of thorns, a flame and a small cross on top, radiating rays), cradled by a wreath of stylized white clouds with a thin gold halo ring behind. Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), detailed and recognizable, NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; a thin GOLD halo ring behind it and slender radiating gold-and-blue rays; symmetrical, emblematic, premium streetwear; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-04 · Cristo Redentor (moletom costas) · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: EST-03 (estilo) + foto real do Cristo Redentor
```
The Christ the Redeemer statue (arms open, recognizable as the real Rio statue), cradled by a wreath of stylized white clouds, a banner reading "NIMBUS" in cloud letters at the base (must read N-I-M-B-U-S). Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), detailed and recognizable, NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; a thin GOLD halo ring behind it and slender radiating gold-and-blue rays; symmetrical, emblematic, premium streetwear; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-01 · Catedral de Brasília (camiseta costas) · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: EST-03 (estilo) + foto da Catedral de Brasília
```
The Cathedral of Brasília (Niemeyer's white hyperboloid crown of curved columns, recognizable as the real building), cradled by a wreath of stylized white clouds, the puffy cloud wordmark "NIMBUS" below (must read N-I-M-B-U-S). Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), detailed and recognizable, NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; a thin GOLD halo ring behind it and slender radiating gold-and-blue rays; symmetrical, emblematic, premium streetwear; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-10 · São Miguel Arcanjo · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: EST-03 (estilo) + imagem clássica de São Miguel
```
Saint Michael the Archangel as a winged warrior angel in armor, holding a sword, victorious over a defeated dragon, cradled by a wreath of stylized white clouds. Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), detailed and recognizable, NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; a thin GOLD halo ring behind it and slender radiating gold-and-blue rays; symmetrical, emblematic, premium streetwear; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-11 · Nossa Senhora Aparecida · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: EST-03 (estilo) + imagem de N. Sra. Aparecida
```
Our Lady of Aparecida (the dark-robed Madonna with a golden crown and ornate mantle, recognizable as the real devotional image), cradled by a wreath of stylized white clouds, a banner reading "NIMBUS" in cloud letters below (must read N-I-M-B-U-S). Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), detailed and recognizable, NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; a thin GOLD halo ring behind it and slender radiating gold-and-blue rays; symmetrical, emblematic, premium streetwear; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-12 · Igreja da Pampulha · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: EST-03 (estilo) + foto da Igreja da Pampulha
```
Niemeyer's Pampulha church (row of white curved parabolic vaults with the blue azulejo panel and the tall thin bell tower, recognizable as the real building), cradled by a wreath of stylized white clouds. Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), detailed and recognizable, NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; a thin GOLD halo ring behind it and slender radiating gold-and-blue rays; symmetrical, emblematic, premium streetwear; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-14 · Pomba do Espírito Santo · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: EST-03 (estilo)
```
The Holy Spirit dove descending with spread wings, radiating rays, cradled by a wreath of stylized white clouds. Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), detailed and recognizable, NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; a thin GOLD halo ring behind it and slender radiating gold-and-blue rays; symmetrical, emblematic, premium streetwear; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-15 · Mãos em oração com terço · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: EST-03 (estilo)
```
Two hands clasped in prayer holding a rosary, cradled by a wreath of stylized white clouds. Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), detailed and recognizable, NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; a thin GOLD halo ring behind it and slender radiating gold-and-blue rays; symmetrical, emblematic, premium streetwear; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-16 · Cordeiro de Deus (Agnus Dei) · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: EST-03 (estilo)
```
The Lamb of God (Agnus Dei) with a victory banner and a cross, cradled by a wreath of stylized white clouds. Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), detailed and recognizable, NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; a thin GOLD halo ring behind it and slender radiating gold-and-blue rays; symmetrical, emblematic, premium streetwear; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-17 · Cálice + hóstia radiante · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: EST-03 (estilo)
```
A golden chalice with a radiant Eucharist host above it, cradled by a wreath of stylized white clouds. Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), detailed and recognizable, NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; a thin GOLD halo ring behind it and slender radiating gold-and-blue rays; symmetrical, emblematic, premium streetwear; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-18 · Cruz radiante · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: EST-03 (estilo)
```
A glowing cross, cradled by a wreath of stylized white clouds. Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), detailed and recognizable, NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; a thin GOLD halo ring behind it and slender radiating gold-and-blue rays; symmetrical, emblematic, premium streetwear; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-19 · Chaves de São Pedro · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: EST-03 (estilo)
```
The two crossed keys of Saint Peter (one gold, one silver) tied with a ribbon, cradled by a wreath of stylized white clouds. Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), detailed and recognizable, NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; a thin GOLD halo ring behind it and slender radiating gold-and-blue rays; symmetrical, emblematic, premium streetwear; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-20 · Coroa de espinhos circular · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: EST-03 (estilo)
```
A circular crown of thorns ring with a small cloud and gold halo accent in the center. Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; slender radiating gold-and-blue rays; symmetrical, emblematic; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-28 · Regata (vertical, cruz radiante) · 🖼️ Imagem · Nano Banana 2 · 9:16 · ref: EST-03 (estilo)
```
A tall narrow vertical composition: a glowing cross rising through a column of stylized white clouds with a gold halo ring and slender rays. Estilo NIMBUS (mesmo do Sagrado Coração aprovado): premium neo-traditional TATTOO / fine-line ENGRAVING illustration; confident dark-blue ink outlines and fine line-hatch shading (etching), NOT flat cartoon and NOT a photo; strict palette = sky-blue + cloud-white + gold only; symmetrical, emblematic; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

---

## Tipográficos (mesma paleta/moldura, texto legível)

### EST-13 · "ACIMA DE TUDO" · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: EST-03 (estilo) + logo NIMBUS
```
A premium typographic emblem reading exactly "ACIMA DE TUDO" in puffy cloud letters, framed by stylized white clouds, a thin gold halo ring behind and slender radiating gold-and-blue rays. Same look as the NIMBUS Sacred Heart art: fine-line engraving/tattoo feel, dark-blue ink linework, strict palette sky-blue + cloud-white + gold; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-23 · Selo "NIMBUS · BRASIL" · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: EST-03 (estilo) + logo NIMBUS
```
A circular brand seal: a cloud-and-halo icon in the center, "NIMBUS" arched on top and "BRASIL" along the bottom inside a thin gold ring (text exact). Same look as the NIMBUS Sacred Heart art: fine-line engraving/tattoo feel, dark-blue ink linework, strict palette sky-blue + cloud-white + gold; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-24 · "SOLI DEO GLORIA" · 🖼️ Imagem · Nano Banana 2 · 1:1 ou 3:4 · ref: EST-03 (estilo)
```
A typographic emblem reading exactly "SOLI DEO GLORIA" inside a sunburst of slender gold rays with a small cloud and gold halo. Same look as the NIMBUS Sacred Heart art: fine-line engraving/tattoo feel, dark-blue ink linework, strict palette sky-blue + cloud-white + gold; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-25 · Salmo 19 (costas/manga) · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: EST-03 (estilo)
```
A typographic print reading "OS CÉUS PROCLAMAM A GLÓRIA DE DEUS" with a small "Sl 19" and a delicate cloud + gold-ray motif (text exact, legible in Portuguese). Same look as the NIMBUS Sacred Heart art: fine-line engraving/tattoo feel, dark-blue ink linework, strict palette sky-blue + cloud-white + gold; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

---

## Marca / utilitários (mantêm o jeito do logo)

### EST-02 · Ícone nuvem (peito) · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: ícone/logo NIMBUS · ✅ pronto
```
The NIMBUS brand icon: a single fluffy cloud with a gold halo above it, clean and iconic, dark-blue line-shading, sky-blue + cloud-white + gold, no text. On a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-07 · Chinelo (laser, 1 cor) · 🖼️ Imagem · Nano Banana 2 · ícone 1:1 / wordmark 16:9 · ref: logo/ícone
```
A single-color (solid black) vector mark for laser engraving: the NIMBUS cloud-and-halo icon — bold simple silhouette, no gradient, high contrast, on a SOLID FLAT white background. (Gerar também o wordmark "NIMBUS" em letras de nuvem puffy, preto sólido.)
```
> Laser é 1 cor → fundo branco serve.

### EST-29 · Boné (bordado, ícone) · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: ícone/logo
```
A compact emblem for cap embroidery (max ~6 flat colors): the NIMBUS cloud-and-halo icon, bold clean shapes, dark-blue outline, sky-blue + cloud-white + gold; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-26 · Padrão all-over · 🖼️ Imagem · Nano Banana 2 · tile 1:1 · ref: ícone (opcional)
```
A seamless tileable pattern of small clouds, tiny gold halos and little crosses, evenly scattered. Same look as the NIMBUS art: fine-line dark-blue ink, sky-blue + cloud-white + gold; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-27 · Vitral Dom Bosco (padrão) · 🖼️ Imagem · Nano Banana 2 · tile 1:1 · ref: foto do vitral do Dom Bosco
```
A seamless geometric stained-glass pattern inspired by the Dom Bosco Sanctuary: a tileable grid of cobalt and sky-blue glass panes with dark-navy leading lines and soft gold accents; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

---

## Pastas e workflow
```
designs/
  _inbox/   <- solte as gerações (verde); rode npm run cutout:inbox
  camiseta-oversized/  costas/ frente/ peito/ manga/ mockups/
  moletom-canguru/     costas/ frente/ peito/ mockups/
  chinelo-nuvem/       laser/ mockups/
  _mestres/            backup (Drive)
```
Gerar (Nano Banana 2 + verde + **EST-03 como reference** + aspect ratio) → `_inbox/` →
`npm run cutout:inbox` → eu organizo + `npm run finalize` → HotPrinti → mockup → `mockups/`.

> Imagens de design **não vão pro GitHub** (repo público) — ficam local + Drive.

## Pendência
Fotos detalhadas (cores + área de impressão) de Camiseta Oversized, Moletom Canguru e Chinelo
Nuvem pra travar tamanho/posição por item.
