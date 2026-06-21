# NIMBUS — Designs de estampas (Higgsfield → HotPrinti)

Prompts pra gerar as **estampas** no Higgsfield e publicar na **HotPrinti**. Cada prompt é
**copy-paste e 100% autossuficiente** (o Higgsfield não tem memória → o estilo completo vai
escrito em TODO prompt).

---

## ⚠️ Sempre: Nano Banana 2 + FUNDO VERDE + aspect ratio + reference image

1. Higgsfield: **modelo Nano Banana 2** (ilimitado no seu plano → poupa créditos pros vídeos) +
   **qualidade máxima (2K)** + **aspect ratio** da peça + o prompt já pede **fundo verde**.
   *(Só use GPT Image 2 se o TEXTO sair errado num design tipográfico.)*
2. **Anexe uma reference image** (ver "ref:" no cabeçalho de cada um). Pros designs **realistas**,
   a melhor ref é uma **foto real do assunto** (ex.: foto do Cristo Redentor); pros **fluffy**,
   uma arte NIMBUS aprovada.
3. Salve em **`designs/_inbox/`** → rode **`npm run cutout:inbox`** (tira o verde + prévia magenta).
4. Eu organizo nas pastas + **`npm run finalize`** (upscale + 300 DPI).

**Cabeçalho de cada prompt:** `EST · nome · estilo · 🖼️ tipo · modelo · aspect ratio · ref`.

| Posição | Tamanho | Aspect ratio |
|---|---|---|
| Costas | 33×40 cm | **3:4** · Frente/arte 30×35 cm **3:4** · Peito/manga/pocket 9 cm **1:1** · Regata **9:16** · Laser ícone **1:1**/wordmark **16:9** |

---

## 🎨 Os dois modos de estilo (use o certo por design)

**☁️ FLUFFY** (ícone de nuvem, símbolos, texto/wordmark, padrões) — cole no fim do prompt:
> Estilo NIMBUS fluffy: bold cartoon/sticker streetwear illustration, thick clean dark-navy
> outlines, flat print-ready colors (no photoreal, no 3D); subject stays simple and recognizable;
> fluffy puffy cumulus clouds as soft accents; soft golden halo and light rays; any NIMBUS
> lettering in puffy cloud letters; palette = cloud-white + sky-blue + navy outline + soft gold;
> the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no
> checkerboard, no garment, no mockup).

**✝️ REALISTA DEVOCIONAL** (figuras, santos, arquitetura — Cristo, Maria, São Miguel, Catedral…):
> Estilo NIMBUS devocional realista: a detailed premium semi-realistic illustration of the
> subject, TRUE to its real-life likeness (the actual statue / traditional holy image / real
> building), with rich shading, depth and refined linework (engraving/painterly), NOT flat
> cartoon and NOT made of clouds; set in the NIMBUS sky world — soft stylized white clouds
> around it, a golden halo and gentle divine light rays, deep-navy line accents; palette =
> cloud-white + sky-blue + soft gold + deep navy; any NIMBUS lettering in puffy cloud letters;
> the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no
> checkerboard, no garment, no mockup).

> **Regra:** figura humana / santo / estátua / prédio = **Realista**. Nuvem / ícone / símbolo /
> texto / padrão = **Fluffy**. (Cada prompt abaixo já vem com o bloco certo embutido.)

## 📐 Convenção de nomes + revisão
Arquivo: **`<item>-<posição>-<conceito>-<colorway>-vN.png`**. Em toda review eu confiro o
conteúdo de cada geração × o rótulo e corrijo nomes errados.

## ✅ Status (1ª leva)
Prontas: ícone (`camiseta/peito`, `moletom/peito` v1/v2) · Sagrado Coração (`camiseta/frente`
v1/v2) · Cristo (`moletom/costas` v1). **Tagline da marca: "Acima de tudo".**

---

## LEVA 1

### EST-01 · Camiseta costas (Catedral) · ✝️ Realista · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: foto da Catedral de Brasília + logo NIMBUS
```
Large back-print: a detailed realistic depiction of the Cathedral of Brasília (Niemeyer's white hyperboloid crown of curved concrete columns), true to the real building, rising through soft stylized clouds, a glowing golden halo above and gentle divine light rays, and the puffy cloud wordmark "NIMBUS" in cloud letters below (must read N-I-M-B-U-S). Estilo NIMBUS devocional realista: a detailed premium semi-realistic illustration of the subject, TRUE to its real-life likeness (the actual building), with rich shading, depth and refined linework (engraving/painterly), NOT flat cartoon and NOT made of clouds; set in the NIMBUS sky world — soft stylized white clouds around it, a golden halo and gentle divine light rays, deep-navy line accents; palette = cloud-white + sky-blue + soft gold + deep navy; NIMBUS lettering in puffy cloud letters; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-02 · Peito / ícone nuvem · ☁️ Fluffy · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: ícone aprovado (opcional) · ✅
```
A single fluffy cloud with a golden halo floating above it, iconic and clean, no text. Estilo NIMBUS fluffy: bold cartoon/sticker streetwear illustration, thick clean dark-navy outlines, flat print-ready colors (no photoreal, no 3D); subject stays simple and recognizable; fluffy puffy cumulus clouds as soft accents; soft golden halo and light rays; any NIMBUS lettering in puffy cloud letters; palette = cloud-white + sky-blue + navy outline + soft gold; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-03 · Frente / Sagrado Coração · ✝️ Realista · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: imagem clássica do Sagrado Coração · ✅
```
A detailed Sacred Heart of Jesus (traditional devotional image: a realistic heart with a crown of thorns, a flame and a small cross, radiating golden rays), framed by soft stylized clouds and a golden halo. Estilo NIMBUS devocional realista: a detailed premium semi-realistic illustration, TRUE to the traditional holy image, with rich shading, depth and refined linework (engraving/painterly), NOT flat cartoon and NOT made of clouds; set in the NIMBUS sky world — soft stylized white clouds around it, a golden halo and gentle divine light rays, deep-navy line accents; palette = cloud-white + sky-blue + soft gold + deep navy; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-04 · Moletom costas / Cristo Redentor · ✝️ Realista · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: foto real do Cristo Redentor + logo NIMBUS · ✅ v1
```
A detailed realistic depiction of the Christ the Redeemer statue (true to the real Rio de Janeiro statue, correct proportions and likeness), arms open, standing above soft stylized clouds, framed by a white Niemeyer-style curved concrete arch, a golden halo and divine light rays, with a ribbon banner reading "NIMBUS" in cloud letters (must read N-I-M-B-U-S). Estilo NIMBUS devocional realista: a detailed premium semi-realistic illustration of the subject, TRUE to its real-life likeness (the actual statue), with rich shading, depth and refined linework (engraving/painterly), NOT flat cartoon and NOT made of clouds; set in the NIMBUS sky world — soft stylized white clouds around it, a golden halo and gentle divine light rays, deep-navy line accents; palette = cloud-white + sky-blue + soft gold + deep navy; NIMBUS lettering in puffy cloud letters; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-07 · Chinelo (laser, 1 cor) · 🖼️ Imagem · Nano Banana 2 · ícone 1:1 / wordmark 16:9 · ref: logo/ícone NIMBUS
```
A clean single-color (solid black) vector-style mark for laser engraving: the NIMBUS cloud-and-halo icon — a fluffy puffy cloud with a small halo — bold simple silhouette, minimal internal detail, no gradient, high contrast, on a SOLID FLAT white background. (Gerar também o wordmark "NIMBUS" em letras de nuvem puffy, preto sólido.)
```
> Laser é 1 cor → fundo branco serve (não usa verde).

---

## LEVA 2 — catálogo

### EST-10 · São Miguel Arcanjo · ✝️ Realista · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: imagem clássica de São Miguel Arcanjo
```
A detailed realistic depiction of Saint Michael the Archangel as a classical warrior angel with large wings and armor, holding a sword and victorious over a defeated dragon, true to traditional sacred art, above soft stylized clouds with a golden halo and divine light rays. Estilo NIMBUS devocional realista: a detailed premium semi-realistic illustration of the subject, TRUE to traditional sacred art, with rich shading, depth and refined linework (engraving/painterly), NOT flat cartoon and NOT made of clouds; set in the NIMBUS sky world — soft stylized white clouds around it, a golden halo and gentle divine light rays, deep-navy line accents; palette = cloud-white + sky-blue + soft gold + deep navy; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-11 · Nossa Senhora Aparecida · ✝️ Realista · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: imagem de N. Sra. Aparecida + logo NIMBUS
```
A detailed realistic depiction of Our Lady of Aparecida (the traditional dark-robed Madonna with the golden crown and ornate mantle), true to the real devotional image, radiating golden light, above soft stylized clouds, with a ribbon banner reading "NIMBUS" in cloud letters below (must read N-I-M-B-U-S). Estilo NIMBUS devocional realista: a detailed premium semi-realistic illustration of the subject, TRUE to the real devotional image, with rich shading, depth and refined linework (engraving/painterly), NOT flat cartoon and NOT made of clouds; set in the NIMBUS sky world — soft stylized white clouds around it, a golden halo and gentle divine light rays, deep-navy line accents; palette = cloud-white + sky-blue + soft gold + deep navy; NIMBUS lettering in puffy cloud letters; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-12 · Igreja da Pampulha · ✝️ Realista · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: foto da Igreja da Pampulha
```
A detailed realistic depiction of Niemeyer's Pampulha church (the row of white curved parabolic concrete vaults with the blue azulejo panel and the tall thin bell tower), true to the real building, floating above soft stylized clouds under a golden halo of light. Estilo NIMBUS devocional realista: a detailed premium semi-realistic illustration of the subject, TRUE to its real-life likeness (the actual building), with rich shading, depth and refined linework (engraving/painterly), NOT flat cartoon and NOT made of clouds; set in the NIMBUS sky world — soft stylized white clouds around it, a golden halo and gentle divine light rays, deep-navy line accents; palette = cloud-white + sky-blue + soft gold + deep navy; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-13 · "ACIMA DE TUDO" (tipográfico) · ☁️ Fluffy · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: logo NIMBUS
```
Bold streetwear typographic back-print: the phrase "ACIMA DE TUDO" in big puffy cloud letters, with a golden halo and small light rays, fluffy clouds around. The text must read exactly "ACIMA DE TUDO". Estilo NIMBUS fluffy: bold cartoon/sticker streetwear illustration, thick clean dark-navy outlines, flat print-ready colors (no photoreal, no 3D); fluffy puffy cumulus clouds as soft accents; soft golden halo and light rays; puffy cloud letters; palette = cloud-white + sky-blue + navy outline + soft gold; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-14 · Pomba do Espírito Santo · ✝️ Realista · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: imagem clássica da pomba do Espírito Santo
```
A detailed realistic depiction of the Holy Spirit dove descending with spread wings, radiating golden light rays, true to traditional sacred art, emerging from soft stylized clouds. Estilo NIMBUS devocional realista: a detailed premium semi-realistic illustration of the subject, with rich shading, depth and refined linework (engraving/painterly), NOT flat cartoon and NOT made of clouds; set in the NIMBUS sky world — soft stylized white clouds around it, a golden halo and gentle divine light rays, deep-navy line accents; palette = cloud-white + sky-blue + soft gold + deep navy; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-15 · Mãos em oração com terço · ✝️ Realista · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: foto de mãos em oração com terço
```
A detailed realistic depiction of two hands clasped in prayer holding a rosary, true-to-life anatomy, emerging from soft stylized clouds with a golden halo of light behind. Estilo NIMBUS devocional realista: a detailed premium semi-realistic illustration of the subject, with rich shading, depth and refined linework (engraving/painterly), NOT flat cartoon and NOT made of clouds; set in the NIMBUS sky world — soft stylized white clouds around it, a golden halo and gentle divine light rays, deep-navy line accents; palette = cloud-white + sky-blue + soft gold + deep navy; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-16 · Cordeiro de Deus (Agnus Dei) · ✝️ Realista · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: imagem clássica do Agnus Dei
```
A detailed realistic depiction of the Lamb of God (Agnus Dei) with a victory banner and a cross, a golden halo and light rays, true to traditional sacred art, resting on soft stylized clouds. Estilo NIMBUS devocional realista: a detailed premium semi-realistic illustration of the subject, with rich shading, depth and refined linework (engraving/painterly), NOT flat cartoon and NOT made of clouds; set in the NIMBUS sky world — soft stylized white clouds around it, a golden halo and gentle divine light rays, deep-navy line accents; palette = cloud-white + sky-blue + soft gold + deep navy; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-17 · Cálice + hóstia radiante · ✝️ Realista · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: imagem de cálice eucarístico
```
A detailed realistic depiction of a golden chalice with a radiant Eucharist host above it, golden light rays and a halo, true to traditional sacred art, with soft stylized clouds at the base. Estilo NIMBUS devocional realista: a detailed premium semi-realistic illustration of the subject, with rich shading, depth and refined linework (engraving/painterly), NOT flat cartoon and NOT made of clouds; set in the NIMBUS sky world — soft stylized white clouds around it, a golden halo and gentle divine light rays, deep-navy line accents; palette = cloud-white + sky-blue + soft gold + deep navy; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-18 · Cruz radiante nas nuvens · ☁️ Fluffy · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: ícone aprovado
```
A glowing cross rising from fluffy clouds, with golden light rays and a soft halo. Estilo NIMBUS fluffy: bold cartoon/sticker streetwear illustration, thick clean dark-navy outlines, flat print-ready colors (no photoreal, no 3D); fluffy puffy cumulus clouds as soft accents; soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-19 · Chaves de São Pedro · ✝️ Realista · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: imagem das chaves de São Pedro
```
A detailed realistic depiction of the two crossed keys of Saint Peter (one gold, one silver) tied with a ribbon, true to heraldic sacred art, over soft stylized clouds with a small golden halo. Estilo NIMBUS devocional realista: a detailed premium semi-realistic illustration of the subject, with rich shading, depth and refined linework (engraving/painterly), NOT flat cartoon and NOT made of clouds; set in the NIMBUS sky world — soft stylized white clouds around it, a golden halo and gentle divine light rays, deep-navy line accents; palette = cloud-white + sky-blue + soft gold + deep navy; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-20 · Coroa de espinhos circular · ☁️ Fluffy · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: ícone aprovado
```
A small circular emblem: a crown of thorns forming a ring, with a tiny fluffy cloud and a small halo accent in the center. Estilo NIMBUS fluffy: bold cartoon/sticker streetwear illustration, thick clean dark-navy outlines, flat print-ready colors (no photoreal, no 3D); fluffy puffy cumulus clouds as soft accents; soft golden halo; palette = cloud-white + sky-blue + navy outline + soft gold; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-21 · Terço em círculo · ☁️ Fluffy · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: ícone aprovado
```
A rosary arranged in a perfect circle with a small cross at the bottom and a tiny fluffy cloud at the top. Estilo NIMBUS fluffy: bold cartoon/sticker streetwear illustration, thick clean dark-navy outlines, flat print-ready colors (no photoreal, no 3D); fluffy puffy cumulus clouds as soft accents; soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-22 · Cruz-na-nuvem mini · ☁️ Fluffy · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: ícone aprovado
```
A tiny mark: a small cross inside a fluffy cloud with a mini golden halo. Estilo NIMBUS fluffy: bold cartoon/sticker streetwear illustration, thick clean dark-navy outlines, flat print-ready colors (no photoreal, no 3D); fluffy puffy cumulus clouds; soft golden halo; palette = cloud-white + sky-blue + navy outline + soft gold; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-23 · Selo "NIMBUS · BRASIL" · ☁️ Fluffy · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: logo NIMBUS + ícone
```
A small circular brand seal: a fluffy cloud-and-halo icon in the center, the text "NIMBUS" arched on top and "BRASIL" along the bottom inside a thin ring. Text must read exactly NIMBUS and BRASIL. Estilo NIMBUS fluffy: bold cartoon/sticker streetwear illustration, thick clean dark-navy outlines, flat print-ready colors (no photoreal, no 3D); fluffy puffy cumulus clouds; puffy cloud letters; soft golden halo; palette = cloud-white + sky-blue + navy outline + soft gold; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-24 · "SOLI DEO GLORIA" · ☁️ Fluffy · 🖼️ Imagem · Nano Banana 2 · 1:1 ou 3:4 · ref: logo NIMBUS
```
A typographic emblem: the words "SOLI DEO GLORIA" in clean premium lettering inside a sunburst of golden rays, with a small fluffy cloud and a halo. Text must read exactly SOLI DEO GLORIA. Estilo NIMBUS fluffy: bold cartoon/sticker streetwear illustration, thick clean dark-navy outlines, flat print-ready colors (no photoreal, no 3D); fluffy puffy cumulus clouds as soft accents; soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-25 · Versículo Salmo 19 (costas/manga) · ☁️ Fluffy · 🖼️ Imagem · Nano Banana 2 · 3:4 · ref: logo NIMBUS
```
A clean typographic print reading "OS CÉUS PROCLAMAM A GLÓRIA DE DEUS" with a small "Sl 19" and a delicate fluffy cloud + light-ray motif. Text exact and legible in Portuguese. Estilo NIMBUS fluffy: bold cartoon/sticker streetwear illustration, thick clean dark-navy outlines, flat print-ready colors (no photoreal, no 3D); fluffy puffy cumulus clouds as soft accents; soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-26 · Padrão all-over (nuvens + auréolas) · ☁️ Fluffy · 🖼️ Imagem · Nano Banana 2 · tile 1:1 · ref: ícone (opcional)
```
A seamless repeating pattern of small fluffy clouds, tiny golden halos and little crosses, evenly scattered and tileable. Estilo NIMBUS fluffy: bold cartoon/sticker streetwear illustration, thick clean dark-navy outlines, flat print-ready colors (no photoreal, no 3D); fluffy puffy cumulus clouds; soft golden halo; palette = cloud-white + sky-blue + navy outline + soft gold; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-27 · Vitral Dom Bosco (geométrico) · 🖼️ Imagem · Nano Banana 2 · tile 1:1 · ref: foto do vitral do Dom Bosco
```
A seamless geometric stained-glass pattern inspired by the Dom Bosco Sanctuary: a tileable grid of cobalt and sky-blue glass panes glowing with light, true to the real stained glass. Bold clean illustration with thick dark-navy leading lines between panes, cloud-white + sky-blue + cobalt with soft gold accents, flat print-ready colors; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-28 · Regata (estampa vertical) · ☁️ Fluffy · 🖼️ Imagem · Nano Banana 2 · 9:16 · ref: ícone aprovado
```
A tall, narrow vertical graphic for a tank top: a glowing cross rising through a column of fluffy clouds with a golden halo and light rays. Estilo NIMBUS fluffy: bold cartoon/sticker streetwear illustration, thick clean dark-navy outlines, flat print-ready colors (no photoreal, no 3D); fluffy puffy cumulus clouds; soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
```

### EST-29 · Boné (bordado, ícone) · ☁️ Fluffy · 🖼️ Imagem · Nano Banana 2 · 1:1 · ref: ícone aprovado
```
A simple compact emblem for cap embroidery (max ~6 flat colors, no fine gradients): the NIMBUS cloud-and-halo icon — a fluffy puffy cloud with a small golden halo — bold clean shapes, thick dark-navy outline, cloud-white + sky-blue + soft gold; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no garment, no mockup).
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
Gerar (Nano Banana 2 + aspect ratio + **verde** + reference image) → `_inbox/` →
`npm run cutout:inbox` → eu organizo + `npm run finalize` → HotPrinti → mockup → `mockups/`.

> Imagens de design **não vão pro GitHub** (repo público) — ficam local + Drive.

## Pendência
Me manda as **fotos detalhadas** (cores + área de impressão) de Camiseta Oversized, Moletom
Canguru e Chinelo Nuvem pra eu travar tamanho/posição por item.
