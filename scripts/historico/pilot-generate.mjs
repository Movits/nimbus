import { pathToFileURL, fileURLToPath } from "node:url";
// Piloto de geracao pela API do Google AI Studio, UM PRODUTO POR VEZ.
//
// Diferenca para os geradores v1-v4: a trava de composicao nao e estimada, ela
// vem de `derive-composicao.mjs`, que a calcula dos cm oficiais da arte e do
// comprimento real da peca no tamanho G. E a tolerancia e SIMETRICA — os
// prompts antigos mandavam, na duvida, renderizar a estampa menor, e a medicao
// mostrou que 12 das 13 fotos da fila estao pequenas demais. A trava empurrava
// na direcao do defeito.
//
// Uso:
//   node scripts/pilot-generate.mjs --produto 352619175 --tentativa 1 \
//     --cena foto.webp --arte arte.png --out saida.png [--extra "correcao"]

import fs from "node:fs";
import path from "node:path";

const arg = (n, d = null) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};

const KEY = process.env.GOOGLE_AI_KEY;
if (!KEY) throw new Error("GOOGLE_AI_KEY ausente no ambiente");

const MODELO = arg("--modelo", "gemini-3-pro-image");

/** Bloco de composicao, em espaco vazio. Ver `derive-composicao.mjs`. */
export function compositionLock(c, garment) {
  return [
    `SCALE AND COMPOSITION LOCK — the printed artwork size is the single most important requirement of this image, and it is specified as a fraction of the garment, not by eye.`,
    `Divide the back of the ${garment}, from the BASE OF THE COLLAR down to the BOTTOM HEM, into 100 parts.`,
    `The artwork must occupy the middle ${Math.round(c.alt)} parts. Above it, exactly ${Math.round(c.sup)} parts of EMPTY fabric. Below it, exactly ${Math.round(c.inf)} parts of EMPTY fabric.`,
    `This means the artwork is LARGE: it starts just below the shoulder blades and its lowest element ends slightly past the middle of the back.`,
    `The tolerance is SYMMETRIC. Printing it SMALLER than specified is exactly as wrong as printing it larger. Do NOT shrink it "to be safe" — the known defect in this catalogue is prints that came out too small.`,
  ].join(" ");
}

const GARMENT_LOCK = {
  "Moletom Canguru":
    "GARMENT LOCK — this is a PULLOVER KANGAROO HOODIE: it has a HOOD gathered against the nape and falling over the upper back, a kangaroo pocket at the front, LONG sleeves and ribbed cuffs at the wrists, plus a ribbed hem band. It is FORBIDDEN to render it without a hood, as a crewneck, with a zipper, or with short sleeves.",
  "Camiseta Premium":
    "GARMENT LOCK — this is a REGULAR-FIT SHORT-SLEEVE T-SHIRT. Sleeves end at mid-bicep, forearms and elbows completely BARE. No hood, no zipper.",
  "Camiseta Oversized Premium":
    "GARMENT LOCK — this is an OVERSIZED BOXY SHORT-SLEEVE T-SHIRT. The shoulder seam drops onto the upper arm; sleeves are wide but SHORT, ending above the elbow, forearms BARE.",
};

const CENA = {
  RELIQUIA:
    "Portuguese-tiled cloister with blue-and-white azulejos, weathered limestone columns and warm daylight raking across the stone floor",
  STREET: "white modernist concrete architecture with hard sunlight and deep shadow",
  NUVEM: "soft high-key sky-lit space, pale walls, diffuse cloudlike light",
};

export function buildPrompt({ garment, color, colecao, composicao, extra }) {
  const partes = [
    `Create one square photorealistic ecommerce lifestyle photograph, rear view, of a person wearing a ${color} ${garment}.`,
    `REFERENCE 1 is the approved photograph of this exact product. Keep the SAME model (same person, same build, same haircut), the SAME scene, the SAME framing, the SAME pose and the SAME natural light. Change ONLY the SIZE of the printed artwork on the back.`,
    `REFERENCE 2 is the artwork itself, shown at close range so every letter is readable.`,
    GARMENT_LOCK[garment] ?? "",
    compositionLock(composicao, garment),
    `TEXT IS SACRED: the artwork reads "OS CÉUS PROCLAMAM A GLÓRIA DE DEUS" in arched gothic blackletter over two lines, then an ornate cross, then "Sl 19". Every letter, accent and ornament must be copied EXACTLY as in REFERENCE 2, including the acute accents on CÉUS and GLÓRIA. Never invent, substitute, mirror or scramble glyphs.`,
    `PRINT-ON-FABRIC REALISM: the print is ink on fabric, not a sticker. It follows every fold and wrinkle, fabric texture shows through the ink, ink brightness never exceeds the brightest scene light, and there is no cut-out halo, no rectangle and no separate background behind the art.`,
    `SCENE: ${CENA[colecao] ?? CENA.RELIQUIA}.`,
    `MEASURABLE FRAMING: the whole garment must be in frame from the top of the shoulders down to the ribbed hem, with the hem clearly visible against the background, and with either the shoulder line or the base of the collar readable. The pose is free and should look natural.`,
    `No other logos, no added text, no watermark, no duplicate person, no mannequin, no AI-looking skin. Hands, when visible, have five separate fingers.`,
  ];
  if (extra) partes.push(`CORRECTION FROM THE PREVIOUS ATTEMPT — this is the defect to fix, do not repeat it: ${extra}`);
  partes.push(
    `BEFORE YOU FINISH, verify and fix if any answer is no: (1) Does the artwork fill the middle ${Math.round(composicao.alt)} percent of the collar-to-hem length — not less? (2) Is there a wide band of empty fabric below it, about ${Math.round(composicao.inf)} percent? (3) Is every letter spelled exactly as in REFERENCE 2, accents included? (4) Does the ink follow the fabric folds? (5) Are the hem and a readable top edge of the garment inside the frame?`,
  );
  return partes.filter(Boolean).join(" ");
}

const b64 = (p) => fs.readFileSync(p).toString("base64");
const mime = (p) => (/\.png$/i.test(p) ? "image/png" : /\.webp$/i.test(p) ? "image/webp" : "image/jpeg");

export async function gerar({ prompt, refs, out }) {
  const parts = [
    ...refs.map((r) => ({ inline_data: { mime_type: mime(r), data: b64(r) } })),
    { text: prompt },
  ];
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent?key=${KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] }),
    },
  );
  const j = await r.json();
  if (j.error) throw new Error(`API ${j.error.status}: ${j.error.message}`);
  const cand = j.candidates?.[0];
  const img = cand?.content?.parts?.find((p) => p.inline_data ?? p.inlineData);
  if (!img) {
    const txt = cand?.content?.parts?.map((p) => p.text).filter(Boolean).join(" ") ?? "";
    throw new Error(`sem imagem na resposta. finishReason=${cand?.finishReason} texto="${txt.slice(0, 200)}"`);
  }
  const data = (img.inline_data ?? img.inlineData).data;
  fs.writeFileSync(out, Buffer.from(data, "base64"));
  return { out, finishReason: cand.finishReason };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const produto = arg("--produto");
  const tentativa = arg("--tentativa", "1");
  const cena = arg("--cena");
  const arte = arg("--arte");
  const out = arg("--out", `/tmp/piloto-${produto}-t${tentativa}.png`);
  const extra = arg("--extra");

  const comp = JSON.parse(
    (await import("node:child_process")).execFileSync("node",
      [path.resolve("scripts/derive-composicao.mjs"), "--product", produto], { encoding: "utf8" }),
  )[0];

  const prompt = buildPrompt({
    garment: comp.garment,
    color: arg("--cor", "black"),
    colecao: arg("--colecao", "RELIQUIA"),
    composicao: comp.composicao,
    extra,
  });
  fs.writeFileSync(out.replace(/\.png$/, ".prompt.txt"), `${prompt}\n`);
  console.log(`modelo: ${MODELO}`);
  console.log(`composicao: sup ${comp.composicao.sup}% | alt ${comp.composicao.alt}% | inf ${comp.composicao.inf}%`);
  const res = await gerar({ prompt, refs: [cena, arte].filter(Boolean), out });
  console.log(`gerado: ${res.out} (${res.finishReason})`);
}
