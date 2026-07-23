import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "designs", "prontos", "_marca", "logo-icone-nuvem-v2.png");
const outDir = path.join(root, "marketing", "social", "lancamento-2026-07-22");
const colors = {
  sky: "#dcebfa",
  cloud: "#f7fbff",
  navy: "#0b2360",
  gold: "#e9c46a",
};

await fs.mkdir(outDir, { recursive: true });

async function buildAvatar(size, filename) {
  const markSize = Math.round(size * 0.704);
  const mark = await sharp(source)
    .resize(markSize, markSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  const offset = Math.round((size - markSize) / 2);
  return sharp({
    create: { width: size, height: size, channels: 4, background: colors.sky },
  })
    .composite([{ input: mark, left: offset, top: offset }])
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, filename));
}

await buildAvatar(1080, "perfil-nimbus-universal-1080.png");
await buildAvatar(512, "perfil-nimbus-google-512.png");
await buildAvatar(320, "perfil-nimbus-mini-320.png");

const avatar = await sharp(path.join(outDir, "perfil-nimbus-universal-1080.png"))
  .resize(520, 520)
  .png()
  .toBuffer();
const circleMask = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520"><circle cx="260" cy="260" r="258" fill="white"/></svg>',
);
const roundAvatar = await sharp(avatar)
  .composite([{ input: circleMask, blend: "dest-in" }])
  .png()
  .toBuffer();

const previewText = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720">
    <rect width="1200" height="720" fill="${colors.cloud}"/>
    <text x="650" y="225" fill="${colors.navy}" font-family="Georgia, serif" font-size="58" font-weight="700">NIMBUS</text>
    <text x="650" y="286" fill="#294776" font-family="Arial, sans-serif" font-size="28">Foto de perfil universal</text>
    <line x1="650" y1="326" x2="1070" y2="326" stroke="${colors.gold}" stroke-width="6"/>
    <text x="650" y="385" fill="#294776" font-family="Arial, sans-serif" font-size="24">Instagram  •  TikTok  •  Google</text>
    <text x="650" y="438" fill="#294776" font-family="Arial, sans-serif" font-size="22">Símbolo original, sem redesenho</text>
    <text x="650" y="478" fill="#294776" font-family="Arial, sans-serif" font-size="22">Recorte circular protegido</text>
    <text x="650" y="518" fill="#294776" font-family="Arial, sans-serif" font-size="22">Fundo céu NIMBUS #dcebfa</text>
  </svg>
`);

await sharp(previewText)
  .composite([{ input: roundAvatar, left: 70, top: 100 }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(outDir, "preview-perfil-nimbus.png"));

const outputs = [
  "perfil-nimbus-universal-1080.png",
  "perfil-nimbus-google-512.png",
  "perfil-nimbus-mini-320.png",
  "preview-perfil-nimbus.png",
];

const metadata = [];
for (const filename of outputs) {
  const file = path.join(outDir, filename);
  const info = await sharp(file).metadata();
  metadata.push({ filename, width: info.width, height: info.height, format: info.format });
}

await fs.writeFile(
  path.join(outDir, "manifest.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), source: path.relative(root, source).replaceAll("\\", "/"), colors, outputs: metadata }, null, 2)}\n`,
  "utf8",
);

console.log(JSON.stringify(metadata, null, 2));
