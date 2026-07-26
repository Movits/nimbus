import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const REFS = "C:/Users/rober/Nimbus/nuvemshop/assets/piloto-352722685-refs";
const CAND = "C:/Users/rober/AppData/Local/Temp/claude/C--Users-rober/2bcae487-e316-4831-b74d-af7824ac2479/scratchpad/pilot-352722685";
const OUT = path.join(CAND, "comparativo-piloto.jpg");

const tiles = [
  { file: `${REFS}/ref-lifestyle-atual__modelo-e-cenario.webp`, label: "CAPA ATUAL (arte pequena) - REFAZER" },
  { file: `${REFS}/ref-mockup-youdraw__arte-produto-escala.webp`, label: "MOCKUP YOUDRAW (escala correta 35,2x39,7cm)" },
  { file: `${CAND}/v1-02.png`, label: "NOVO v1-02 (Nano Banana 2, sem marca)" },
  { file: `${CAND}/v1-03.png`, label: "NOVO v1-03 (Nano Banana 2, sem marca)" },
];

const T = 620;
const LABEL = 46;
const cols = 4;
const width = cols * T;
const height = T + LABEL + 60;

const comps = [];
comps.push({
  input: Buffer.from(`<svg width="${width}" height="60"><rect width="100%" height="100%" fill="#0b2360"/><text x="16" y="40" font-family="Arial" font-size="28" fill="#f7fbff" font-weight="bold">PILOTO 352722685 - Sao Miguel Celeste | Moletom Canguru</text></svg>`),
  top: 0, left: 0,
});
for (let i = 0; i < tiles.length; i++) {
  const img = await sharp(tiles[i].file).resize(T, T, { fit: "contain", background: "#ffffff" }).png().toBuffer();
  comps.push({ input: img, top: 60 + LABEL, left: i * T });
  comps.push({
    input: Buffer.from(`<svg width="${T}" height="${LABEL}"><rect width="100%" height="100%" fill="#dcebfa"/><text x="8" y="30" font-family="Arial" font-size="17" fill="#1b2733">${tiles[i].label}</text></svg>`),
    top: 60, left: i * T,
  });
}

await sharp({ create: { width, height, channels: 3, background: "#ffffff" } })
  .composite(comps).jpeg({ quality: 88 }).toFile(OUT);
console.log("ok:", OUT);
