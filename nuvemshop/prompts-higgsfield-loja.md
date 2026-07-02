# NIMBUS — Prompts Higgsfield: imagens da LOJA (Nuvemshop v3)

As imagens atuais da loja v3 foram recortadas do acervo do site (`public/img/`) e já funcionam.
Estes prompts geram as **versões definitivas** de cada slot, feitas sob medida. Fluxo:

1. Gere no Higgsfield (mesma estratégia da biblioteca principal: **Nano Banana 2** pra cena cheia;
   use o HERO-01 da landing como *reference image* pra travar paleta/luz).
2. Salve a imagem gerada e **me mande** (ou dropa em `raw/` do brain) dizendo o slot.
3. Eu recorto na dimensão certa, aplico o texto/scrim quando for tile e substituo em
   `nuvemshop/assets/` — mesmos nomes de arquivo, zero retrabalho na loja (basta re-subir o banner).

**Importante:** gere SEM texto nenhum (os títulos entram pelo tema ou pelo meu pipeline).

---

## HERO-LOJA-01 — Hero da home (desktop) · `🖼️ Imagem` · `Nano Banana 2` · 21:9
> Slot: `banner-hero-desktop.jpg` (1920×620). O lado ESQUERDO precisa ficar limpo e claro
> (o título "A coleção de estreia" entra ali, em navy).

```
A wide cinematic banner of a serene sea of soft volumetric clouds under a luminous pale sky-blue heaven, gentle divine godrays falling from the upper right, the LEFT third of the frame kept bright, soft and almost empty for a headline, cloud peaks rising gently on the right side. Calm, premium, commercial but sacred. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette, soft volumetric clouds, gentle divine godrays, premium high-fashion editorial mood, minimalist, ultra-clean, generous negative space, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no letters, no logos, no watermark, no people, no landmarks, no buildings, no clutter, no harsh saturated colors.
```

## HERO-LOJA-02 — Hero da home (mobile) · `🖼️ Imagem` · `Nano Banana 2` · 4:5
> Slot: `banner-hero-mobile.jpg` (900×1000). Topo limpo pro título.

```
A vertical banner of a dreamy sea of soft volumetric clouds, the upper half a clean luminous pale sky-blue gradient kept empty for a headline, soft cloud peaks with gentle godrays in the lower half. Calm, premium, sacred. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette, soft volumetric clouds, gentle divine godrays, premium editorial mood, minimalist, ultra-clean, generous negative space, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no letters, no logos, no watermark, no people, no landmarks, no clutter, no harsh saturated colors.
```

## TILE-STREET — Tile da coleção STREET · `🖼️ Imagem` · `Nano Banana 2` · 4:5
> Slot: `tile-street.jpg` (900×1100). Eu aplico o scrim navy + "COLEÇÃO STREET" por cima.
> Conceito: o concreto urbano encontra o céu — a rua no paraíso.

```
A fragment of a white curved Brazilian modernist concrete wall floating among soft volumetric clouds, subtle urban texture on the concrete, a faint golden halo-shaped spray-paint mark glowing softly on the wall like sacred street art, gentle godrays, pale sky-blue heaven. Urban meets divine, streetwear attitude with reverence. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette, white curved modernist concrete, soft volumetric clouds, premium high-fashion editorial mood, minimalist, ultra-clean, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no letters, no logos, no watermark, no people, no clutter, no kitsch, no harsh saturated colors.
```

## TILE-RELIQUIA — Tile da coleção RELÍQUIA · `🖼️ Imagem` · `Nano Banana 2` · 4:5
> Slot: `tile-reliquia.jpg` (900×1100). Conceito: herança sacra — ouro, barroco, devoção.

```
A gilded baroque ornament fragment — carved golden filigree with a small cross — resting on a bank of soft luminous clouds, warm golden divine light grazing the gold against a pale sky-blue heaven, vintage sacred atmosphere like a relic kept in the sky. Reverent, precious, premium. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette with warm antique gold accents, soft volumetric clouds, gentle divine godrays, premium editorial mood, minimalist, ultra-clean, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no letters, no logos, no watermark, no people, no clutter, no kitsch, no cheesy religious clip-art, no harsh saturated colors.
```

## TILE-NUVEM — Tile da coleção NUVEM · `🖼️ Imagem` · `Nano Banana 2` · 4:5
> Slot: `tile-nuvem.jpg` (900×1100). Conceito: o céu leve e quase lúdico — puffy, sereno.

```
An almost playful composition of perfectly sculptural puffy cumulus clouds stacked like soft cotton forms, one small cloud floating alone in a clean pale sky-blue sky with a delicate soft glow above it suggesting a halo of light, serene and lighthearted yet premium. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette, soft volumetric clouds, gentle light, premium editorial mood, minimalist, ultra-clean, generous negative space, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no letters, no logos, no watermark, no people, no landmarks, no clutter, no harsh saturated colors.
```

## BANNER-FE-LOJA — Banner editorial "Feito de fé" · `🖼️ Imagem` · `Nano Banana 2` · 21:9
> Slot: `banner-fe.jpg` (1600×560). O atual (Cristo do acervo) já é bom — este é um upgrade opcional.
> Lado esquerdo limpo pro texto.

```
A wide cinematic banner: the Christ the Redeemer statue with open arms emerging from luminous clouds on the RIGHT side of the frame, backlit by warm divine light haloing the silhouette, the LEFT two-thirds a soft bright sea of clouds and pale sky kept clean for text. Reverent, serene, premium. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette with a warm golden backlight, soft volumetric clouds, gentle divine godrays, premium high-fashion editorial mood, minimalist, ultra-clean, generous negative space, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no letters, no logos, no watermark, no crowds, no clutter, no kitsch, no cheesy religious clip-art, no harsh saturated colors.
```

## BANNER-IMPACTO-LOJA — Banner "Vestir também é servir" · `🖼️ Imagem` · `Nano Banana 2` · 21:9
> Slot: `banner-impacto.jpg` (1600×600). Conceito: luz que se doa — sem rosto, sem clichê.
> Lado esquerdo limpo pro texto.

```
A wide cinematic banner of soft volumetric clouds with a single gentle column of warm golden divine light descending onto the cloud bank on the RIGHT side of the frame, like grace being given, the LEFT two-thirds bright, soft and clean for text, pale sky-blue heaven. Generous, warm, reverent, premium. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette with one warm golden light accent, soft volumetric clouds, premium editorial mood, minimalist, ultra-clean, generous negative space, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no letters, no logos, no watermark, no people, no hands, no clutter, no kitsch, no harsh saturated colors.
```

---

## Fotos de produto/lifestyle
Pra hero com peça vestida e faixas editoriais com modelo, use os prompts de
`../nimbus-lifestyle-higgsfield.md` (1 prompt geral por coleção + vídeos 9:16) — quando essas fotos
existirem, dá pra evoluir o hero da loja pra versão lifestyle (estilo Monte Leste).

## Relacionados
`../nimbus-higgsfield-prompts.md` (biblioteca principal) · `instrucoes.md` · `../cowork-loja-v3-prompt.md`
