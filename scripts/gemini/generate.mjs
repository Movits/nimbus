import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { loadKey, API } from "./_env.mjs";

const key = loadKey();

// Converte qualquer imagem para PNG base64 (a API aceita png/jpeg com segurança).
async function toPngB64(p) {
  const buf = await sharp(p).png().toBuffer();
  return buf.toString("base64");
}

/**
 * gen({ model, prompt, refs:[paths], outDir, prefix, n })
 * Gera n candidatos. Cada candidato é uma chamada separada (variação natural).
 * Retorna [{index, ok, file|error}].
 */
export async function gen({ model = "gemini-3.1-flash-image", prompt, refs = [], outDir, prefix = "cand", n = 1 }) {
  fs.mkdirSync(outDir, { recursive: true });
  const refParts = [];
  for (const r of refs) {
    refParts.push({ inline_data: { mime_type: "image/png", data: await toPngB64(r) } });
  }
  const results = [];
  for (let i = 1; i <= n; i += 1) {
    const generationConfig = { responseModalities: ["TEXT", "IMAGE"] };
    if (arguments[0].aspectRatio) generationConfig.imageConfig = { aspectRatio: arguments[0].aspectRatio };
    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }, ...refParts] }],
      generationConfig,
    };
    try {
      const resp = await fetch(`${API}/models/${model}:generateContent`, {
        method: "POST",
        headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const status = resp.status;
      const txt = await resp.text();
      if (status !== 200) {
        results.push({ index: i, ok: false, error: `HTTP ${status}: ${txt.slice(0, 400)}` });
        continue;
      }
      const j = JSON.parse(txt);
      const parts = j?.candidates?.[0]?.content?.parts || [];
      const imgPart = parts.find((p) => p.inlineData || p.inline_data);
      const inline = imgPart?.inlineData || imgPart?.inline_data;
      if (!inline) {
        const textPart = parts.find((p) => p.text)?.text || "(sem texto)";
        results.push({ index: i, ok: false, error: "sem imagem na resposta. texto=" + textPart.slice(0, 200) });
        continue;
      }
      const outFile = path.join(outDir, `${prefix}-${String(i).padStart(2, "0")}.png`);
      fs.writeFileSync(outFile, Buffer.from(inline.data, "base64"));
      results.push({ index: i, ok: true, file: outFile });
    } catch (e) {
      results.push({ index: i, ok: false, error: String(e).slice(0, 300) });
    }
  }
  return results;
}

// Execução direta: node generate.mjs <configJson>
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("generate.mjs")) {
  const cfgPath = process.argv[2];
  if (cfgPath) {
    const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf8"));
    const out = await gen(cfg);
    for (const r of out) console.log(JSON.stringify(r));
  }
}
