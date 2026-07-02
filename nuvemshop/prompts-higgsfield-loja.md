# NIMBUS — Prompts Higgsfield: imagens da LOJA (Nuvemshop v3.1)

Os slots da loja hoje usam peças interinas ("céu desenhado" + auréola, recortes do acervo). Estes
prompts geram as **versões definitivas** — em especial o **HERO LIFESTYLE**: carrossel de fotos de
modelo vestindo NIMBUS por Brasília (troca a cada ~3s no slider do tema). Fluxo:

1. Gere no Higgsfield (**Nano Banana 2**). Nos prompts de lifestyle, **anexe o mockup da peça**
   (YouDraw) como *reference image* — é o que mantém a estampa fiel (mesma técnica de
   `../nimbus-lifestyle-higgsfield.md`). Pra manter o MESMO modelo em todas, anexe também uma foto
   de referência do rosto (ou reuse o mesmo *Higgsfield Soul*).
2. Salve a imagem e **me mande** (ou dropa em `raw/` do brain) dizendo o slot.
3. Eu recorto na dimensão certa, aplico texto/scrim quando for tile e substituo em
   `nuvemshop/assets/` — mesmos nomes, zero retrabalho (só re-subir no editor).

**Importante:** gerar SEM texto/logo além da estampa da peça. Tom sincero, nunca irônico.

---

## HERO LIFESTYLE — carrossel da home (3 slides · 21:9 desktop + 4:5 mobile)
> Slots: `banner-hero-desktop.jpg` (1920×620) e `banner-hero-mobile.jpg` (900×1000), 1 par por
> slide. Modelo à DIREITA do quadro, terço esquerdo limpo e claro pro título. Pra versão mobile,
> troque a última linha por `Vertical 4:5, model centered`.

### HERO-LIFE-01 — Muro com pichação (STREET) · `🖼️ Imagem` · `Nano Banana 2` · 21:9
```
Estilo NIMBUS STREET, hero banner. A Brazilian model wearing the exact garment and printed graphic from the attached reference image (keep the garment, fit, color and print faithful and undistorted). Young Brazilian model, mid-20s, calm confident streetwear attitude, standing on the RIGHT side of a very wide frame, three-quarter body, looking off-camera. Setting: a raw concrete wall in Brasília covered with Brazilian pichação-style tags and spray graffiti, hard natural daylight, gritty premium mood; the LEFT two-thirds of the frame show the emptier concrete wall softly out of focus, clean space for a headline. 35mm lens look, editorial lookbook, photoreal, realistic hands and face, no other brand logos, punchy but premium color grade. Ultra-wide 21:9. Keep the same model, light and color grade across all NIMBUS hero shots so the carousel reads as one campaign.
```

### HERO-LIFE-02 — Catedral de Brasília (monumento) · `🖼️ Imagem` · `Nano Banana 2` · 21:9
```
Estilo NIMBUS, hero banner. A Brazilian model wearing the exact garment and printed graphic from the attached reference image (keep the garment, fit, color and print faithful and undistorted). Young Brazilian model, mid-20s, calm reverent expression, standing on the RIGHT side of a very wide frame, full body, small against the architecture. Setting: the white curved concrete columns of the Cathedral of Brasília under an open pale-blue sky with soft clouds, late afternoon light grazing the concrete; the LEFT two-thirds of the frame show sky and the sweep of the esplanade, clean space for a headline. 35mm lens look, editorial lookbook, photoreal, realistic hands and face, no other brand logos, airy premium color grade. Ultra-wide 21:9. Keep the same model, light and color grade across all NIMBUS hero shots so the carousel reads as one campaign.
```

### HERO-LIFE-03 — Rooftop no fim de tarde (urbano) · `🖼️ Imagem` · `Nano Banana 2` · 21:9
```
Estilo NIMBUS STREET, hero banner. A Brazilian model wearing the exact garment and printed graphic from the attached reference image (keep the garment, fit, color and print faithful and undistorted; if the back graphic is the highlight, show the model from behind, three-quarter turn). Young Brazilian model, mid-20s, relaxed streetwear stance, on the RIGHT side of a very wide frame. Setting: a concrete rooftop over the Brasília skyline at golden hour, long shadows, warm sun flare low on the horizon, a big open sky; the LEFT two-thirds of the frame are open glowing sky, clean space for a headline. 35mm lens look, editorial lookbook, photoreal, realistic hands and face, no other brand logos, warm premium color grade. Ultra-wide 21:9. Keep the same model, light and color grade across all NIMBUS hero shots so the carousel reads as one campaign.
```

---

## TILE-STREET v2 — Tile da coleção STREET · `🖼️ Imagem` · `Nano Banana 2` · 4:5
> Slot: `tile-street.jpg` (900×1100). Eu aplico o scrim navy + "COLEÇÃO STREET" por cima.
> (v2: saiu o conceito de arcos de concreto; entrou o muro urbano com pichação.)

```
A raw concrete wall in a Brazilian city covered with layered pichação tags and spray graffiti, and one striking golden spray-painted halo ring glowing softly among the tags like sacred street art, hard daylight from above, gritty texture, urban and reverent at once. Style: cinematic photoreal, NIMBUS aesthetic — concrete grey with pale sky-blue light and ONE warm gold accent (the halo), premium streetwear editorial mood, hyper-detailed, subtle film grain, 8k. No people, no readable words in the graffiti, no letters, no logos, no watermark, no clutter, no harsh saturated colors.
```

## BANNER-FE — "Feito de fé" (escolha 1 de 3) · `🖼️ Imagem` · `Nano Banana 2` · 21:9
> Slot: `banner-fe.jpg` (1600×560). Hoje está a Pampulha (acervo). Lado ESQUERDO limpo pro texto.
> O Cristo saiu deste banner de propósito (já aparece no tile RELÍQUIA — evitar repetição).

**(a) Terço dourado sobre nuvens (recomendado — macro, íntimo, inédito):**
```
A wide cinematic banner: an elegant golden rosary resting on a bank of soft luminous clouds on the RIGHT side of the frame, macro-like detail on the beads and crucifix catching warm divine light, the LEFT two-thirds a clean soft sea of pale sky-blue clouds kept empty for text. Reverent, precious, premium. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette with warm antique gold accents, soft volumetric clouds, gentle godrays, premium editorial mood, minimalist, generous negative space, hyper-detailed, subtle film grain, 8k. No text, no letters, no logos, no watermark, no people, no kitsch, no cheesy religious clip-art, no harsh saturated colors.
```

**(b) Vitral azul do Dom Bosco:**
```
A wide cinematic banner: a towering wall of cobalt and sky-blue stained glass (inspired by the Dom Bosco Sanctuary in Brasília) glowing with backlit divine light on the RIGHT side of the frame, scattered points of light like stars, the LEFT two-thirds dissolving into a soft pale-blue luminous haze kept clean for text. Awe, stillness, premium. Style: cinematic photoreal 3D render, NIMBUS aesthetic, premium editorial mood, minimalist, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no letters, no logos, no watermark, no people, no kitsch, no harsh saturated colors.
```

**(c) Aparecida etérea:**
```
A wide cinematic banner: the small dark statue of Our Lady of Aparecida in her ornate golden mantle and crown, emerging serenely from luminous clouds on the RIGHT side of the frame, backlit by a soft halo of warm light, treated with reverence and fidelity to the real devotional image; the LEFT two-thirds a clean soft sea of pale sky-blue clouds kept empty for text. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic with warm gold accents, premium editorial mood, minimalist, hyper-detailed, subtle film grain, 8k. No text, no letters, no logos, no watermark, no other people, no kitsch, no cheesy religious clip-art, no harsh saturated colors.
```

## BANNER-IMPACTO v2 — "Vestir também é servir" · `🖼️ Imagem` · `Nano Banana 2` · 21:9
> Slot: `banner-impacto.jpg` (1600×600). Hoje está a peça desenhada (auréola + luz). Estes dois
> trazem o gesto humano do SERVIR. Lado ESQUERDO limpo pro texto.

**(a) Mãos que se alcançam (recomendado):**
```
A wide cinematic banner: two hands gently reaching toward each other through soft luminous clouds on the RIGHT side of the frame — one hand offering, one receiving — warm divine light glowing between the almost-touching fingertips, evoking care and service; the LEFT two-thirds a clean soft sea of pale sky-blue clouds kept empty for text. Tender, reverent, premium, photoreal natural hands with realistic anatomy. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette with one warm gold light accent, soft volumetric clouds, premium editorial mood, minimalist, generous negative space, hyper-detailed, subtle film grain, 8k. No text, no letters, no logos, no watermark, no faces, no kitsch, no harsh saturated colors.
```

**(b) Mãos oferecendo a luz:**
```
A wide cinematic banner: open cupped hands rising from soft clouds on the RIGHT side of the frame, offering a small floating ring of warm golden light shaped like a halo, gentle rays spilling between the fingers; the LEFT two-thirds a clean soft sea of pale sky-blue clouds kept empty for text. Generous, warm, reverent, photoreal natural hands with realistic anatomy. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette with one warm gold accent, soft volumetric clouds, premium editorial mood, minimalist, hyper-detailed, subtle film grain, 8k. No text, no letters, no logos, no watermark, no faces, no kitsch, no harsh saturated colors.
```

---

## Fotos de produto/lifestyle por coleção
Continuam em `../nimbus-lifestyle-higgsfield.md` (1 prompt geral por coleção + vídeos 9:16).

## Relacionados
`../nimbus-higgsfield-prompts.md` (biblioteca principal) · `instrucoes.md` · `../cowork-loja-v3-prompt.md`
