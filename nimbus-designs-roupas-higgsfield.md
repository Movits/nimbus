# NIMBUS — Designs de estampas (Higgsfield → HotPrinti)

Prompts pra gerar as **estampas** no Higgsfield e publicar na **HotPrinti**. Cada prompt é
**copy-paste e 100% autossuficiente** (o Higgsfield não tem memória — então o estilo completo
vai escrito em TODO prompt, pra padronizar os designs).

---

## ⚠️ Sempre: FUNDO VERDE + qualidade máxima + aspect ratio

O "transparente" do Higgsfield vem achatado (xadrez nos pixels) e quebra arte de contorno fino.
Por isso geramos com **fundo verde sólido** (chroma key) — verde não existe na nossa arte, então
o recorte fica perfeito.

1. Higgsfield: **modelo Nano Banana 2** (ilimitado no seu plano → poupa créditos pros vídeos) +
   **qualidade máxima (2K)** + **aspect ratio** da peça (tabela) + o prompt já termina pedindo o
   **fundo verde**. **Anexe uma arte aprovada como reference image** (ex.: Sagrado Coração ou
   Cristo) pra travar o estilo. *(Só use GPT Image 2 se o TEXTO sair errado num design tipográfico
   — ex.: EST-01/04/11/13/23/24/25.)*
2. Salve em **`designs/_inbox/`** → rode **`npm run cutout:inbox`** (tira o verde + prévia magenta).
3. Eu organizo nas pastas e rodo **`npm run finalize`** (upscale + 300 DPI).

| Posição | Tamanho | Aspect ratio |
|---|---|---|
| Costas (hero) | 33×40 cm | **3:4** |
| Frente/arte | 30×35 cm | **3:4** |
| Peito / ícone / crest | 9×9 cm | **1:1** |
| Manga / pocket | 9×9 cm | **1:1** |
| Regata (vertical) | alto/estreito | **9:16** |
| Laser (chinelo) | ~15 cm, 1 cor | ícone **1:1** · wordmark **16:9** |

**Colorway:** o contorno navy grosso + preenchimento claro fazem a arte ler no **preto** e no
**off-white**.

---

## 📐 Convenção de nomes + revisão

- Arquivo: **`<item>-<posição>-<conceito>-<colorway>-vN.png`**
  (ex.: `camiseta-costas-catedral-preto-v1.png`, `moletom-costas-cristo-v1.png`).
- **Toda review eu confiro o conteúdo de cada geração × o rótulo** e corrijo nomes errados/
  divergências antes de organizar.

## ✅ Status (1ª leva)
**Prontas (recortadas + 300 DPI, nas pastas):** ícone (`camiseta/peito`, `moletom/peito` v1/v2) ·
Sagrado Coração (`camiseta/frente` v1/v2) · Cristo (`moletom/costas` v1).
**Regenerar com FUNDO VERDE:** EST-01 Catedral (hero, v1/v2) e EST-04 v2 (Cristo linha).

> **Tagline da marca: "Acima de tudo".**

---

## LEVA 1 — prompts

### EST-01 · Camiseta costas (hero, Catedral) · Nano Banana 2 · 3:4 · 2K
```
Large back-print: the white hyperboloid crown of the Cathedral of Brasília bursting up through fluffy clouds, a glowing golden halo above it, soft golden light rays, and the puffy cloud wordmark "NIMBUS" in cloud letters below. The letters must read N-I-M-B-U-S exactly. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

### EST-02 · Peito / ícone · Nano Banana 2 · 1:1 · 2K  ✅
```
A single fluffy cloud with a golden halo floating above it, iconic and clean, no text. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

### EST-03 · Frente / Sagrado Coração · Nano Banana 2 · 1:1 · 2K  ✅
```
A sacred heart wrapped in fluffy clouds, with a crown of thorns, a small flame and a cross on top, a golden halo and soft light rays behind. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

### EST-04 · Moletom costas / Cristo Redentor · Nano Banana 2 · 3:4 · 2K  ✅ v1
```
Christ the Redeemer with open arms standing on a cloud, framed by a white Niemeyer-style curved concrete arch and a golden halo with light rays, fluffy clouds at the base, a ribbon banner reading "NIMBUS" in cloud letters (must read N-I-M-B-U-S). Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

### EST-07 · Chinelo (laser, 1 cor) · Nano Banana 2 · ícone 1:1 / wordmark 16:9
```
A clean single-color (solid black) vector-style mark for laser engraving: the NIMBUS cloud-and-halo icon — a fluffy puffy cloud with a small halo — bold simple silhouette, minimal internal detail, no gradient, high contrast, on a SOLID FLAT white background. (Gerar também, no mesmo padrão, o wordmark "NIMBUS" em letras de nuvem puffy, preto sólido.)
```
> Laser é 1 cor → fundo branco serve (não usa verde).

---

## LEVA 2 — catálogo (vários designs por peça)

Todos Nano Banana 2 · 2K · fundo verde. Aspect ratio indicado em cada um.

### Costas (3:4)

**EST-10 · São Miguel Arcanjo**
```
Saint Michael the Archangel as a warrior angel with large wings, holding a sword, standing victorious over a defeated dragon among fluffy clouds, with a golden halo and divine light rays. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-11 · Nossa Senhora Aparecida**
```
Our Lady of Aparecida (dark-robed Madonna) with a golden crown and halo, radiating light, surrounded by fluffy clouds, with a ribbon banner reading "NIMBUS" in cloud letters below (must read N-I-M-B-U-S). Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-12 · Igreja da Pampulha**
```
Oscar Niemeyer's Pampulha church (a row of white curved parabolic concrete vaults with the blue azulejo panel and the tall thin bell tower) floating on fluffy clouds under a golden halo of light. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-13 · "ACIMA DE TUDO" (tipográfico)**
```
Bold streetwear typographic back-print: the phrase "ACIMA DE TUDO" in big puffy cloud letters, with a golden halo and small light rays, fluffy clouds around. The text must read exactly "ACIMA DE TUDO". Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

### Frente / peito (1:1)

**EST-14 · Pomba do Espírito Santo**
```
The Holy Spirit dove descending with spread wings, radiating golden light rays, emerging from fluffy clouds. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-15 · Mãos em oração com terço**
```
Two hands clasped in prayer holding a rosary, emerging from fluffy clouds, with a soft golden halo of light behind. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-16 · Cordeiro de Deus (Agnus Dei)**
```
The Lamb of God (Agnus Dei) lying with a victory banner and a cross, a golden halo and light rays, on fluffy clouds. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-17 · Cálice + hóstia radiante**
```
A chalice with a radiant Eucharist host above it, golden light rays and a halo, with fluffy clouds at the base. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-18 · Cruz radiante nas nuvens**
```
A glowing cross rising from fluffy clouds, with golden light rays and a soft halo. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-19 · Chaves de São Pedro**
```
Two crossed keys of Saint Peter (one gold, one silver) tied with a ribbon, over a fluffy cloud with a small golden halo. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

### Pequenos — peito / manga / pocket (1:1)

**EST-20 · Coroa de espinhos circular**
```
A small circular emblem: a crown of thorns forming a ring, with a tiny fluffy cloud and a small halo accent in the center. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-21 · Terço em círculo**
```
A rosary arranged in a perfect circle with a small cross at the bottom and a tiny fluffy cloud at the top. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-22 · Cruz-na-nuvem mini**
```
A tiny mark: a small cross inside a fluffy cloud with a mini golden halo. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-23 · Selo "NIMBUS · BRASIL"**
```
A small circular brand seal: a fluffy cloud-and-halo icon in the center, the text "NIMBUS" arched on top and "BRASIL" along the bottom inside a thin ring. Text must read exactly NIMBUS and BRASIL. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

### Tipografia / latim

**EST-24 · "SOLI DEO GLORIA" · 1:1 ou 3:4**
```
A typographic emblem: the words "SOLI DEO GLORIA" in clean premium lettering inside a sunburst of golden rays, with a small fluffy cloud and a halo. Text must read exactly SOLI DEO GLORIA. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-25 · Versículo Salmo 19 · 3:4 (costas/manga)**
```
A clean typographic print reading "OS CÉUS PROCLAMAM A GLÓRIA DE DEUS" with a small "Sl 19" and a delicate fluffy cloud + light-ray motif. Text exact and legible in Portuguese. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

### Padrões / extras

**EST-26 · Padrão all-over (nuvens + auréolas) · tile 1:1**
```
A seamless repeating pattern of small fluffy clouds, tiny golden halos and little crosses, evenly scattered and tileable. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-27 · Vitral Dom Bosco (geométrico) · tile 1:1**
```
A seamless geometric stained-glass pattern inspired by the Dom Bosco Sanctuary: a tileable grid of cobalt and sky-blue glass panes glowing with light. Estilo NIMBUS: bold clean illustration with thick dark-navy outline, cloud-white and sky-blue and cobalt with soft gold accents, flat print-ready colors (no photoreal, no 3D); premium yet playful streetwear; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene, no garment, no mockup).
```

**EST-28 · Regata (estampa vertical) · 9:16**
```
A tall, narrow vertical graphic for a tank top: a glowing cross rising through a column of fluffy clouds with a golden halo and light rays. Estilo NIMBUS: bold cartoon/sticker streetwear illustration with thick clean dark-navy outlines and flat print-ready colors (no photoreal, no 3D, no heavy gradients); draw the MAIN SUBJECT clearly and recognizable — do NOT turn the subject into clouds; fluffy puffy cumulus clouds appear only as the surrounding setting and small accents; any brand lettering (e.g. NIMBUS) uses puffy cloud letters; cloud-white fills with soft sky-blue cel-shading, soft golden halo and light rays; palette = cloud-white + sky-blue + navy outline + soft gold only; the whole design on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene photo, no garment, no mockup).
```

**EST-29 · Boné (bordado, ícone) · 1:1**
```
A simple compact emblem for cap embroidery (max ~6 flat colors, no fine gradients): the NIMBUS cloud-and-halo icon — a fluffy puffy cloud with a small golden halo — bold clean shapes, thick dark-navy outline, cloud-white + sky-blue + soft gold; on a SOLID FLAT chroma-green (#00B140) background (not transparent, no checkerboard, no scene, no garment, no mockup).
```

---

## Pastas e workflow
```
designs/
  _inbox/            <- solte as gerações (verde); rode npm run cutout:inbox
  camiseta-oversized/  costas/ frente/ peito/ manga/ mockups/
  moletom-canguru/     costas/ frente/ peito/ mockups/
  chinelo-nuvem/       laser/ mockups/
  _mestres/            backup (Drive)
```
Gerar (2K + aspect ratio + **verde**) → `_inbox/` → `npm run cutout:inbox` → eu organizo +
`npm run finalize` → subir na HotPrinti → mockup na peça → `mockups/`.

> As imagens de design **não vão pro GitHub** (repo público) — ficam local + Drive. O repo
> guarda só estrutura, docs e scripts.

## Pendência
Me manda as **fotos detalhadas** (cores + área/posição de impressão) de Camiseta Oversized,
Moletom Canguru e Chinelo Nuvem pra eu travar tamanho/posição exatos por item.
