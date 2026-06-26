# NIMBUS — Prompts lifestyle / try-on (Higgsfield)

Modelo brasileiro vestindo as peças, pra **foto de produto** e **vídeo de redes**. A ideia destes
prompts é serem **gerais por coleção**: você anexa **qualquer mockup da YouDraw** (camiseta,
oversized, moletom careca ou canguru, com qualquer emblema) como referência, e o prompt **padroniza**
o resultado no visual daquela coleção. O que muda é só a **peça + estampa** (vem da referência); o
resto (modelo, cenário, luz, enquadramento, color grade) fica **fixo** — é isso que deixa todas as
fotos parecendo a mesma campanha.

## Como gerar
- **Foto:** Nano Banana 2 (ou GPT Image 2). **Anexe o mockup da peça da YouDraw como reference image**
  — é o que mantém a estampa fiel. Escolha o prompt da coleção da peça e cole como está.
- **Mesmo modelo em tudo (opcional):** pra a loja inteira parecer um ensaio só, **trave o modelo** —
  anexe também uma **foto de referência do rosto** (ou reuse o mesmo *Higgsfield Soul*/personagem) em
  todas as gerações. Sem isso, o modelo mantém o **tipo** (BR, meados dos 20), mas o rosto varia.
- **Formato:** os prompts pedem **4:5** (serve loja + feed). Pra card quadrado da loja troque por
  `1:1`; pra story/Reels, `9:16`. É só trocar a última linha.
- **Vídeo:** Seedance 2.0, **image-to-video** usando a **foto aprovada** como primeiro frame.
- **Regras (valem pra tudo):** não distorça a estampa; rosto e mãos naturais; **tom sincero** (sem
  ironia, sem zoar a fé); sem logos de outras marcas.

---

## FOTOS — 1 prompt geral por coleção

### STREET (urbano · graffiti · concreto)
```
Estilo NIMBUS STREET. A Brazilian model wearing the exact garment and printed graphic from the attached reference image (keep the garment type, fit, color and the print faithful and undistorted; it may be a t-shirt, oversized tee, crewneck or hoodie). Young Brazilian model, mid-20s, natural relatable look, calm confident streetwear attitude. Setting: a raw concrete wall with graffiti, urban back-alley and brutalist Niemeyer-style architecture, hard natural daylight, gritty premium mood. Framing: eye-level, 3/4 to full body, model centered, 35-50mm lens look, mild depth of field. Color grade: punchy but premium, slight contrast, true colors. Photoreal editorial lookbook, realistic hands and face, no other brand logos. Vertical 4:5. Keep the same model type, framing, light direction and color grade across all STREET shots so every photo looks like one cohesive campaign, regardless of the garment or print in the reference.
```

### RELÍQUIA (devocional · vintage · luz dourada)
```
Estilo NIMBUS RELÍQUIA. A Brazilian model wearing the exact garment and printed graphic from the attached reference image (keep the garment type, fit, color and the print faithful and undistorted; it may be a t-shirt, oversized tee, crewneck or hoodie). Young Brazilian model, mid-20s, natural relatable look, calm and reverent expression. Setting: in front of a Brazilian church or cathedral facade (or warm interior with soft candlelight) at golden hour, warm devotional light, subtle vintage film grain, solemn and premium streetwear lookbook mood. Framing: eye-level, 3/4 to full body, model centered, 35-50mm lens look, mild depth of field. Color grade: warm golden tones, gentle film grain, slightly muted. Photoreal editorial lookbook, realistic hands and face, no other brand logos, respectful never ironic. Vertical 4:5. Keep the same model type, framing, light direction and color grade across all RELÍQUIA shots so every photo looks like one cohesive campaign, regardless of the garment or print in the reference.
```

### NUVEM (celestial · céu · luz suave)
```
Estilo NIMBUS NUVEM. A Brazilian model wearing the exact garment and printed graphic from the attached reference image (keep the garment type, fit, color and the print faithful and undistorted; it may be a t-shirt, oversized tee, crewneck or hoodie). Young Brazilian model, mid-20s, natural relatable look, serene light expression. Setting: against a bright blue sky with soft white clouds, open and airy, gentle natural backlight, ethereal premium mood. Framing: eye-level, 3/4 to full body, model centered, 35-50mm lens look, mild depth of field. Color grade: airy pastel, soft highlights, clean and light. Photoreal editorial lookbook, realistic hands and face, no other brand logos. Vertical 4:5. Keep the same model type, framing, light direction and color grade across all NUVEM shots so every photo looks like one cohesive campaign, regardless of the garment or print in the reference.
```

> Dica: o emblema/peça vêm **só da referência**. Não cite o nome do design no prompt — deixa o
> Higgsfield copiar a estampa anexa, que é o que mantém tudo fiel e padronizado.

---

## VÍDEOS (Seedance 2.0 · image-to-video · 9:16 pra Reels/TikTok)
Gere a **foto primeiro** (com o prompt da coleção acima), aprove, e use essa foto como **primeiro
frame** do vídeo — assim peça/rosto ficam coerentes entre foto e vídeo.

### STREET
```
Animate the attached image: the model walks a few steps through the concrete graffiti alley and turns to reveal the back graphic, urban daylight, slight handheld energy, gritty premium streetwear editorial. Keep the garment and print faithful and undistorted. 9:16, ~6s.
```

### RELÍQUIA
```
Animate the attached image: the model stands near the church facade at golden hour, slow camera tilt up revealing the graphic, warm devotional light, subtle film grain, solemn and premium, respectful. Keep the garment and print faithful and undistorted. 9:16, ~6s.
```

### NUVEM
```
Animate the attached image: the model against a blue sky with soft clouds drifting behind in a gentle timelapse, light breeze moving the fabric, airy slow-motion, ethereal premium mood. Keep the garment and print faithful and undistorted. 9:16, ~6s.
```

### Marca (abertura / fechamento de Reels)
```
Animate: soft clouds part to reveal the NIMBUS cloud-and-halo logo glowing, then a couple of quick cuts of the pieces on the model. Heavenly, premium, cinematic, sincere. 9:16, ~10s.
```

> **Hero do site (opcional):** pra um loop de fundo no site, peça a mesma cena em **16:9**, câmera
> mais **quieta**, movimento lento e contínuo, **sem texto** e pensado pra **repetir em loop** (sem
> corte brusco no fim). Ex.: trocar `9:16, ~6s` por `16:9, ~8s, seamless loop, no text`.
