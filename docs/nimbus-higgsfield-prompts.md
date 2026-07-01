# NIMBUS — Biblioteca de Prompts Higgsfield (Fase 0)

> **Escopo:** **assets 3D do site** (hero, fundos, parallax, emblema). Estampas de produto → `nimbus-designs-roupas-higgsfield.md`. Fotos com modelo → `nimbus-lifestyle-higgsfield.md`.

Artes ilustradas do site, estilo **render 3D cinematográfico etéreo** — "mundo céu":
azul clarinho, nuvens brancas, concreto branco curvo modernista (Niemeyer) subindo pro
céu, luz divina suave. Limpo, premium, alto padrão.

Cada prompt abaixo já está **montado por completo** (com a identidade visual embutida) —
é só copiar o bloco de código e colar no Higgsfield.

---

## Como usar (leia antes)

**Estratégia de 2 modelos:**
- **Nano Banana 2** (Pro, se disponível) → cenas fotorreais cheias (hero, fundos de seção,
  loja). Melhor coerência fotoreal e consistência via *reference image*.
- **GPT Image 2** → recortes com **fundo transparente** (nuvens/godray/arco isolados,
  emblema, selo) e qualquer coisa com **texto**.
- **Opcional:** testar **Soul Cinema** (`soul_cinema_studio`) no hero pra um A/B do look.

**Fluxo recomendado (consistência):**
1. Gere o **HERO-01** primeiro no Nano Banana 2.
2. Quando aprovar, use essa imagem como **reference image** nas outras cenas (e/ou fixe a
   *seed*) → trava paleta, luz e o "mundo NIMBUS".

**Tipo de geração:** todos os prompts desta leva são **Imagem** (modo Image do Higgsfield),
**não vídeo** — cada bloco abaixo traz a etiqueta `Imagem`.
_(Depois dá pra animar o hero/fundos em vídeo loop via image-to-video — Seedance/Kling —
quando quiser dar vida ao scroll. Isso é uma fase futura.)_

**Na UI do Higgsfield:** defina a **proporção** (16:9, 9:16, 1:1, 4:5) e marque **fundo
transparente** nos prompts indicados. Prompts em inglês de propósito (melhor controle).

---

## 1) HERO

### HERO-01 — Hero desktop · `🖼️ Imagem` · `Nano Banana 2` · 16:9 _(exportar crop 21:9 também)_
> Peça **4 variações** e escolha a com mais "ar" no topo pro título. Peça central da landing.

```
A breathtaking hero shot: the white hyperboloid crown of the Cathedral of Brasília — Oscar Niemeyer's sweeping curved concrete ribs — rising out of an infinite sea of soft volumetric clouds into a luminous pale sky-blue heaven. Thin divine godrays break between the ribs; soft warm rim-light grazes the white concrete. The structure sits in the lower third; vast luminous open sky fills the top two-thirds, clean for a headline. Sacred, serene, aspirational. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette, white curved Brazilian modernist concrete, soft volumetric clouds, gentle divine godrays, premium high-fashion editorial mood, minimalist, ultra-clean, generous negative space, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no letters, no logos, no watermark, no crowds of people, no clutter, no kitsch, no cheesy religious clip-art, no harsh saturated colors.
```

### HERO-02 — Hero mobile · `🖼️ Imagem` · `Nano Banana 2` · 9:16

```
A vertical hero composition: the white hyperboloid crown of the Cathedral of Brasília (Niemeyer's curved concrete ribs) emerging from a sea of soft volumetric clouds in the lower third, a towering luminous pale sky-blue cloud sky rising above it with gentle divine godrays, clean empty space in the upper half for a headline. Sacred, serene, aspirational. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette, white curved Brazilian modernist concrete, soft volumetric clouds, gentle divine godrays, premium high-fashion editorial mood, minimalist, ultra-clean, generous negative space, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no letters, no logos, no watermark, no crowds of people, no clutter, no kitsch, no cheesy religious clip-art, no harsh saturated colors.
```

---

## 2) FUNDOS DE SEÇÃO (parallax / scroll 3D)

_Cenas cheias (BG-01 a BG-04): **Nano Banana 2**. Recortes isolados (BG-05 a BG-07): **GPT Image 2**, fundo transparente._

### BG-01 — Céu base · `🖼️ Imagem` · `Nano Banana 2` · 16:9 _(gerar 3 variações)_
> Camada de fundo / transições entre seções.

```
An endless dreamlike sky of soft sculptural cumulus clouds in pale sky-blue and cloud-white, gentle gradient from a soft white horizon to a serene blue zenith, delicate godrays, no hard horizon line, calm and infinite, empty clean composition meant as a background layer. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette, soft volumetric clouds, gentle divine godrays, premium editorial mood, minimalist, ultra-clean, generous negative space, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no logos, no watermark, no people, no clutter, no harsh saturated colors.
```

### BG-02 — Cristo Redentor nas nuvens · `🖼️ Imagem` · `Nano Banana 2` · 16:9

```
The Christ the Redeemer statue standing serenely with open arms, low reverent camera angle, half-emerging from a luminous bank of clouds, backlit by soft divine light that haloes the silhouette, distant and ethereal; the statue is offset to one side leaving open sky for content. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette, soft volumetric clouds, gentle divine godrays, premium high-fashion editorial mood, minimalist, ultra-clean, generous negative space, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no logos, no watermark, no crowds of people, no clutter, no kitsch, no cheesy religious clip-art, no harsh saturated colors.
```

### BG-03 — Igreja da Pampulha flutuando · `🖼️ Imagem` · `Nano Banana 2` · 16:9

```
Oscar Niemeyer's Church of Saint Francis of Assisi at Pampulha — its iconic row of white curved concrete parabolic vaults — reimagined floating on a mirror-still cloud lake under a pale blue sky, a perfect reflection below, soft drifting mist. Architectural, poetic, minimalist. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette, white curved Brazilian modernist concrete, soft volumetric clouds, gentle divine godrays, premium high-fashion editorial mood, minimalist, ultra-clean, generous negative space, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no logos, no watermark, no people, no clutter, no kitsch, no harsh saturated colors.
```

### BG-04 — Vitral azul do Santuário Dom Bosco · `🖼️ Imagem` · `Nano Banana 2` · 16:9
> Seção "joia" mais escura — traz o azul profundo de acento.

```
Immersive interior of the Dom Bosco Sanctuary in Brasília: towering walls of cobalt and sky-blue stained glass glowing with backlit light, a vast geometric grid casting deep blue luminescence, scattered points of light like stars, profound awe and stillness — a cathedral of blue light. Deeper blue jewel tones. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic, premium high-fashion editorial mood, minimalist, ultra-clean, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no logos, no watermark, no people, no clutter, no kitsch, no cheesy religious clip-art.
```

### BG-05 — Nuvens isoladas (parallax) · `🖼️ Imagem` · `GPT Image 2` · 1:1 · **fundo transparente (PNG)** · gerar 5

```
A single sculptural cumulus cloud, soft and volumetric, pale white with subtle sky-blue shadow, photoreal 3D render, isolated on a fully transparent background, clean cutout edges, no scene. No text, no logo, no watermark, no background.
```

### BG-06 — Feixe de luz / godray (parallax) · `🖼️ Imagem` · `GPT Image 2` · 9:16 · **transparente**

```
A single soft volumetric beam of divine light / godray, warm-white with a faint blue tint, isolated on a fully transparent background, clean soft edges, no scene. No text, no logo, no watermark, no background.
```

### BG-07 — Arco branco Niemeyer (parallax) · `🖼️ Imagem` · `GPT Image 2` · 1:1 · **transparente**

```
A single smooth white curved Niemeyer-style concrete arch element, photoreal 3D render, soft even light, isolated on a fully transparent background, clean cutout edges, no scene. No text, no logo, no watermark, no background.
```

> **BG-05/06/07** são camadas isoladas pra empilhar como profundidade no scroll 3D
> (foreground/midground). Sempre marque **fundo transparente** na UI.

---

## 3) CENÁRIO DA LOJA

### STORE-01 — Backdrop da loja · `🖼️ Imagem` · `Nano Banana 2` · 16:9
> ✅ Gerado e aprovado. Uso: **fundo da seção "Coleção/Loja"** (ambiente), não como card de produto.

```
A serene sky studio: a minimalist floating platform of smooth white curved concrete (Niemeyer curve) hovering among soft clouds in a pale blue void, soft even studio light, generous clean empty space to showcase products, a premium "boutique in the clouds" atmosphere. Empty, no products. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette, white curved Brazilian modernist concrete, soft volumetric clouds, premium high-fashion editorial mood, minimalist, ultra-clean, generous negative space, hyper-detailed, soft global illumination, subtle film grain, 8k. No text, no logos, no watermark, no people, no clutter, no harsh saturated colors.
```

### STORE-02 — Backdrop de card de produto · ~~`Nano Banana 2`~~ · ❌ DESCARTADO
> Ficou ruim na prática e não é necessário. No mock os cards de produto serão **superfícies
> CSS limpas** (gradiente céu + a nuvem recortada `BG-05` ao fundo). Prompt mantido só por histórico.

```
A clean product pedestal: a small smooth white curved concrete plinth resting on a soft cloud, in a pale sky-blue softbox studio with a gentle gradient and a faint halo of light behind, centered empty space where a garment will be placed, premium e-commerce backdrop, soft realistic shadows. Empty, no product. Style: cinematic photoreal 3D render, NIMBUS sky-world aesthetic — pale sky-blue and cloud-white palette, premium editorial mood, minimalist, ultra-clean, generous negative space, hyper-detailed, soft global illumination, 8k. No text, no logos, no watermark, no people, no clutter, no harsh saturated colors.
```

---

## 4) EMBLEMA NIMBUS — Leva 2 (direção puffy/comic) ✅ ATUAL

_Direção nova definida pelo usuário: wordmark **"NIMBUS" em letras infladas (puffy)**, estilo
comic/desenhado/fofo. Substitui a direção minimalista da Leva 1 (histórico no fim da seção).
Tudo em **GPT Image 2** (melhor com texto)._

### EMBLEM-A — Wordmark "NIMBUS" puffy/comic (principal) · `🖼️ Imagem` · `GPT Image 2` · 16:9 · **transparente**

```
A hand-drawn comic-style brand wordmark that reads exactly "NIMBUS" in fluffy puffy cloud letters — soft rounded bubbly typography where each letter looks like a little plump cloud, clean confident outline, friendly cozy sticker/cartoon vibe, a small simple golden halo arc floating above the word. Flat illustration, soft white fill with light sky-blue soft shading, on a fully transparent background, crisp clean edges. The letters must spell N-I-M-B-U-S exactly. No extra text, no watermark.
```

### EMBLEM-B — Variante 3D marshmallow (alternativa) · `🖼️ Imagem` · `GPT Image 2` · 16:9 · **transparente**

```
A premium playful 3D wordmark reading exactly "NIMBUS" in soft inflated marshmallow/cloud puffy letters, smooth rounded volumetric typography, soft studio light and gentle shadows, a tiny minimalist golden halo floating above the word, cute but high-quality. Soft-white puffy letters with subtle sky-blue shading on a fully transparent background. The letters must spell N-I-M-B-U-S exactly. No extra text, no watermark.
```

### EMBLEM-C — Ícone companheiro (favicon/avatar/selo) · `🖼️ Imagem` · `GPT Image 2` · 1:1 · **transparente**

```
A single fluffy puffy cloud icon with a small simple golden halo floating just above it, hand-drawn comic/sticker style, soft white with light sky-blue shading, clean bold outline, cozy and friendly, centered on a fully transparent background. No text, no watermark.
```

> **Notas:** gere também uma versão **preta sólida** do wordmark (pra usar sobre fundos claros).
> Se o modelo errar as letras, regere ou ajuste o lettering num editor vetorial. O EMBLEM-C
> combina com o wordmark e resolve favicon/avatar (onde o wordmark inteiro não cabe).

<details>
<summary>Histórico — Leva 1 (direção minimalista, descartada)</summary>

A direção anterior era um símbolo monoline (nuvem + auréola + arco Niemeyer) minimalista e
"sacro-moderno". Foi trocada pela direção puffy/comic acima a pedido do usuário.
</details>

---

## Dicas globais

- Gere **3–4 variações** por prompt e escolha a melhor.
- Depois de aprovar o **HERO**, use-o como **reference image** nos demais pra travar a paleta.
- Exporte em **2x**. **WebP** pros fundos cheios; **PNG** pras camadas transparentes.
- **Nomenclatura sugerida** (facilita trocar o placeholder pela arte final depois):

  | Asset | Nome do arquivo |
  |---|---|
  | Hero desktop / mobile | `hero-desktop` · `hero-mobile` |
  | Fundos | `bg-ceu` · `bg-cristo` · `bg-pampulha` · `bg-dombosco` |
  | Parallax | `cloud-01`…`cloud-05` · `godray` · `arco` |
  | Loja | `store-backdrop` |
  | Marca | `wordmark-nimbus` · `wordmark-black` · `icon-cloud` (favicon) |

---

## Próximo passo

Hero e fundos já gerados ✅. Agora gere o **EMBLEM-A** (wordmark puffy) no Higgsfield e salve
como `wordmark-nimbus.png`. O layout das seções está em **`nimbus-landing-storyboard.md`**.
Depois seguimos pra **Fase 1** (landing scroll-3D em Next.js + R3F + GSAP).
