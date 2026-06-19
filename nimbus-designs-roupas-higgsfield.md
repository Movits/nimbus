# NIMBUS — Designs de estampas (Higgsfield → HotPrinti)

Prompts pra gerar as **estampas** no Higgsfield e publicar na **HotPrinti**, com fluxo pra
deixar tudo **transparente e no tamanho certo** sem dor. Cada prompt é copy-paste.

---

## ⚠️ Mudança importante: gere com FUNDO VERDE (não "transparente")

O "transparente" do Higgsfield vem **achatado** (xadrez gravado nos pixels) e, em arte de
contorno fino, o recorte automático **come as nuvens/letras**. Solução robusta: gerar com
**fundo verde sólido** (chroma key). Verde não existe na nossa arte (branco/azul/dourado/navy),
então o recorte fica **perfeito em qualquer desenho**.

**Fluxo (sempre):**
1. No Higgsfield: **qualidade máxima (2K)** + **aspect ratio** da peça + termine o prompt com
   *"on a solid flat chroma-green (#00B140) background"*.
2. Salve os PNGs em **`designs/_inbox/`**.
3. Rode **`npm run cutout:inbox`** → tira o verde (transparência real) + gera prévia sobre
   magenta em `designs/_inbox/transparent/_debug/` pra conferir.
4. Eu organizo nas pastas dos itens e rodo **`npm run finalize`** (upscale + 300 DPI).

### Aspect ratio por posição
| Posição | Tamanho impressão | Aspect ratio |
|---|---|---|
| Costas (hero) | 33×40 cm | **3:4** |
| Frente/arte | 30×35 cm | **3:4** |
| Peito / ícone / crest pequeno | 9×9 cm | **1:1** |
| Manga / pocket | 9×9 cm | **1:1** |
| Laser (chinelo) | ~15 cm, 1 cor | ícone **1:1** · wordmark **16:9** |
| Regata (vertical) | alto e estreito | **9:16** |

**Colorway:** contorno **navy** grosso + preenchimento claro fazem a arte ler no **preto** e no
**off-white**. (Tudo decidido: itens Camiseta Oversized · Moletom Canguru · Chinelo Nuvem;
DTF padrão + 1 peça DTG de arte + laser no chinelo.)

---

## ✅ Status das artes (1ª leva)

**Prontas (recortadas + 300 DPI, nas pastas):**
- `camiseta-oversized/peito/` — ícone nuvem+auréola (v1, v2)
- `camiseta-oversized/frente/` — Sagrado Coração (v1, v2)
- `moletom-canguru/costas/` — Cristo Redentor crest (v1)
- `moletom-canguru/peito/` — ícone (v1, v2)

**Regenerar com FUNDO VERDE** (o recorte do xadrez comeu as nuvens):
- **EST-01 Catedral (hero das costas)** — v1 e v2
- **EST-04 v2** (Cristo, versão linha)

---

## LEVA 1 — prompts (atualizados p/ fundo verde)

### EST-01 · Camiseta costas (hero) · GPT Image 2 · 3:4 · 2K
```
Large back-print streetwear graphic: the white hyperboloid crown of the Cathedral of Brasília bursting up through fluffy cartoon clouds, a glowing golden halo above, soft light rays, and the puffy cloud wordmark "NIMBUS" in cloud letters below. The letters must read N-I-M-B-U-S exactly. NIMBUS style: bold thick navy-outlined cartoon-cloud illustration, sky-blue + cloud-white + soft gold, premium streetwear, on a SOLID FLAT chroma-green (#00B140) background (not transparent).
```

### EST-02 · Peito / ícone · GPT Image 2 · 1:1 · 2K  ✅ pronto
```
Small logo: a single fluffy cloud with a golden halo above it, bold navy outline, white and light sky-blue fill, iconic and clean, no text. NIMBUS style on a SOLID FLAT chroma-green (#00B140) background (not transparent).
```

### EST-03 · Frente / Sagrado Coração · GPT Image 2 · 1:1 · 2K  ✅ pronto
```
Chest crest: a sacred heart wrapped in fluffy clouds with a crown of thorns, a flame and a small cross on top, golden halo and soft light rays. NIMBUS style: bold navy-outlined illustration, sky-blue + white + soft gold, premium streetwear, on a SOLID FLAT chroma-green (#00B140) background (not transparent).
```

### EST-04 · Moletom costas / Cristo Redentor · GPT Image 2 · 3:4 · 2K  ✅ v1 pronto
```
Devotional back-print crest: Christ the Redeemer with open arms on a cloud, framed by a white Niemeyer-style curved concrete arch and a golden halo with light rays, fluffy clouds at the base, a ribbon banner reading "NIMBUS" in cloud letters (must read N-I-M-B-U-S). NIMBUS style: bold navy-outlined illustration, sky-blue + white + soft gold, on a SOLID FLAT chroma-green (#00B140) background (not transparent).
```

### EST-07 · Chinelo (laser, 1 cor) · GPT Image 2 · ícone 1:1 / wordmark 16:9
```
A clean single-color (solid black) vector-style mark for laser engraving: the NIMBUS cloud-and-halo icon — bold simple silhouette, no gradient, high contrast, on a SOLID FLAT white background. (Gerar também o wordmark "NIMBUS" puffy em preto sólido, mesmo padrão.)
```
> Laser é 1 cor; aqui fundo branco serve (a HotPrinti usa o contorno). Não precisa de verde.

---

## LEVA 2 — catálogo (vários designs por peça)

Mesmo padrão: termine cada prompt com *"on a SOLID FLAT chroma-green (#00B140) background"*.
Todos GPT Image 2 · 2K. Aspect ratio indicado.

### Costas (3:4) — back prints fortes
**EST-10 · São Miguel Arcanjo**
```
Epic back-print: Saint Michael the Archangel as a warrior angel with large wings, holding a sword, standing victorious over a dragon among fluffy clouds, golden halo and divine light rays. NIMBUS style: bold navy-outlined cartoon-cloud illustration, sky-blue + white + soft gold, premium streetwear, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-11 · Nossa Senhora Aparecida**
```
Devotional back crest: Our Lady of Aparecida (dark-robed Madonna) with a golden crown and halo, radiating light, surrounded by fluffy clouds, a ribbon banner reading "NIMBUS" in cloud letters below. NIMBUS style: bold navy outline, sky-blue + white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-12 · Igreja da Pampulha**
```
Architectural back-print: Oscar Niemeyer's Pampulha church (row of white curved parabolic concrete vaults with the blue azulejo panel and the tall thin bell tower) floating on fluffy clouds under a halo of light. NIMBUS style: bold navy-outlined illustration, sky-blue + white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-13 · "VISTA O CÉU" (tipográfico)**
```
Bold streetwear typographic back-print: the phrase "VISTA O CÉU" in big puffy cloud letters with a golden halo and small light rays, fluffy clouds around. The text must read exactly "VISTA O CÉU". NIMBUS style: navy-outlined cloud lettering, sky-blue + white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```

### Frente / peito — crests (1:1, alguns 3:4)
**EST-14 · Pomba do Espírito Santo**
```
Chest crest: the Holy Spirit dove descending with spread wings, radiating golden light rays through fluffy clouds. NIMBUS style: bold navy outline, sky-blue + white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-15 · Mãos em oração com terço**
```
Chest crest: two hands clasped in prayer holding a rosary, emerging from fluffy clouds, soft halo of light behind. NIMBUS style: bold navy outline, sky-blue + white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-16 · Cordeiro de Deus (Agnus Dei)**
```
Chest crest: the Lamb of God (Agnus Dei) lying with a victory banner and a cross, golden halo and light rays, fluffy clouds. NIMBUS style: bold navy outline, sky-blue + white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-17 · Cálice + hóstia radiante**
```
Chest crest: a chalice with a radiant Eucharist host above it, golden rays and a halo, fluffy clouds at the base. NIMBUS style: bold navy outline, sky-blue + white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-18 · Cruz radiante nas nuvens**
```
Chest/front graphic: a glowing cross rising from fluffy clouds with golden light rays and a soft halo. NIMBUS style: bold navy outline, sky-blue + white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-19 · Chaves de São Pedro**
```
Chest crest: two crossed keys of Saint Peter (gold and silver) tied with a ribbon, over a fluffy cloud with a small halo. NIMBUS style: bold navy outline, sky-blue + white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```

### Pequenos (1:1) — peito / manga / pocket
**EST-20 · Coroa de espinhos circular**
```
Small circular emblem: a crown of thorns ring with a tiny cloud and halo accent in the center. NIMBUS style: bold navy outline, white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-21 · Terço em círculo**
```
Small circular emblem: a rosary arranged in a perfect circle with a small cross at the bottom and a tiny cloud at the top. NIMBUS style: bold navy outline, sky-blue + white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-22 · Cruz-na-nuvem mini**
```
Tiny sleeve/pocket mark: a small cross inside a fluffy cloud with a mini halo. NIMBUS style: bold navy outline, white + sky-blue + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-23 · Selo "NIMBUS · BRASIL"**
```
Small circular brand seal: a cloud-and-halo icon in the center, the text "NIMBUS" arched on top and "BRASIL" at the bottom inside a thin ring. Text must read NIMBUS and BRASIL. NIMBUS style: bold navy outline, white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```

### Tipografia / latim
**EST-24 · "SOLI DEO GLORIA" (1:1 ou 3:4)**
```
Typographic emblem: the words "SOLI DEO GLORIA" in clean premium lettering inside a sunburst of golden rays with a small cloud and halo. Text must read exactly SOLI DEO GLORIA. NIMBUS style: navy + soft gold on white, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-25 · Versículo Salmo 19 (3:4, costas/manga)**
```
Clean typographic back/sleeve print: "OS CÉUS PROCLAMAM A GLÓRIA DE DEUS" with a small "Sl 19" and a delicate cloud + light ray motif. Text exact and legible in Portuguese. NIMBUS style: navy + soft gold, sky-blue accents, on a SOLID FLAT chroma-green (#00B140) background.
```

### Padrões / extras
**EST-26 · Padrão all-over (nuvens + auréolas)**
```
Seamless repeating pattern of small fluffy clouds, tiny golden halos and little crosses, evenly scattered. NIMBUS style: navy outline, sky-blue + white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-27 · Vitral Dom Bosco (geométrico)**
```
Seamless geometric stained-glass pattern inspired by the Dom Bosco Sanctuary: a grid of cobalt and sky-blue glass tiles glowing, premium. NIMBUS style, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-28 · Regata (estampa vertical) · 9:16**
```
Tall vertical tank-top graphic: a glowing cross rising through a column of fluffy clouds with a golden halo and light rays, narrow composition. NIMBUS style: bold navy outline, sky-blue + white + soft gold, on a SOLID FLAT chroma-green (#00B140) background.
```
**EST-29 · Boné (bordado, ícone) · 1:1**
```
Simple compact emblem for cap embroidery (max ~6 colors): the NIMBUS cloud-and-halo icon, bold clean shapes, no fine gradients. NIMBUS style: navy + white + gold, on a SOLID FLAT chroma-green (#00B140) background.
```

---

## Pastas (1 por item) e workflow
```
designs/
  _inbox/            <- solte aqui as gerações (verde); rode npm run cutout:inbox
  camiseta-oversized/  costas/ frente/ peito/ manga/ mockups/
  moletom-canguru/     costas/ frente/ peito/ mockups/
  chinelo-nuvem/       laser/ mockups/
  _mestres/            backup (Drive)
```
1. Gerar (2K + aspect ratio + **fundo verde**) → `designs/_inbox/`.
2. `npm run cutout:inbox` (tira o verde + prévia magenta).
3. Eu organizo nas pastas + `npm run finalize` (upscale + 300 DPI).
4. Subir na HotPrinti (DTF/DTG/laser) na posição/cor certas.
5. Mockup na peça (skill higgsfield-product-photoshoot) → `mockups/`.

> As imagens de design **não vão pro GitHub** (ficam no Drive; o repo é público). O repo guarda
> só a estrutura de pastas, os docs e os scripts.

## Pendência
Me manda as **fotos detalhadas** (cores + área/posição de impressão) de Camiseta Oversized,
Moletom Canguru e Chinelo Nuvem pra eu travar tamanho/posição exatos por item.
