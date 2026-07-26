import { gen } from "./generate.mjs";

const REFS = "C:/Users/rober/Nimbus/nuvemshop/assets/piloto-352722685-refs";
const OUT = "C:/Users/rober/AppData/Local/Temp/claude/C--Users-rober/2bcae487-e316-4831-b74d-af7824ac2479/scratchpad/pilot-352722685";

// Referências:
//   Image 1 = mockup YouDraw: arte exata + peça + ESCALA correta
//   Image 2 = capa lifestyle atual: modelo, pose, cor da peça e cenário (arte pequena demais)
const prompt = `Editorial premium fashion photograph, back view of a model wearing a cream/off-white hooded sweatshirt (Moletom Canguru com Capuz).

You are given two reference images:
- Image 1 is the official garment mockup. It shows the EXACT back artwork ("São Miguel Celeste": a line-art archangel over clouds with a halo, blue/navy linework, and the word "NIMBUS" in a small banner at the bottom) at the CORRECT size and position on the hoodie back.
- Image 2 is a real lifestyle photo of the same product on a model, in a modernist white concrete setting with a bright sky (Oscar Niemeyer architecture). In Image 2 the back print is printed too small.

Task: recreate the lifestyle photo of Image 2 (same model, same pose, same cream hoodie, same Niemeyer concrete + sky background, same natural editorial lighting), but print the back artwork at the SAME large scale and position as in Image 1. The artwork must fill most of the upper-back width, centered between the shoulder blades, exactly matching the proportion shown in Image 1.

Critical fidelity rules:
- Reproduce the artwork from Image 1 EXACTLY. Do not redraw, restyle, or reinterpret it. Keep every line, the halo, the clouds, the archangel figure, the colors, and the "NIMBUS" banner text identical and legible.
- Keep it a faithful garment print on fabric: it should follow the folds and lighting of the hoodie, not look like a flat sticker.
- Photorealistic, high-end streetwear catalog quality. Natural daylight. No text or watermark added by you.`;

const out = await gen({
  model: "gemini-3.1-flash-image",
  prompt,
  refs: [
    `${REFS}/ref-mockup-youdraw__arte-produto-escala.webp`,
    `${REFS}/ref-lifestyle-atual__modelo-e-cenario.webp`,
  ],
  outDir: OUT,
  prefix: "v1",
  n: 3,
});

for (const r of out) console.log(JSON.stringify(r));
