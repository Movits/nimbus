// Deriva as imagens editoriais da vitrine a partir do repo privado nimbus-assets.
//
// Regras (decisão do dono + conselho, 29/07, docs/decisoes/2026-07-29-...):
//   NUNCA prancha de identidade, board de casting ou mockup cru como foto de
//   site. NUNCA estampa como cara de coleção. A cara de cada coleção é o
//   CENÁRIO canônico (lugar real como base, foto documental, sem pessoas).
//   casting/editorial: máximo 1600 px, WebP, alvo <= 200 KB, sem alpha.
//
// Uso: node scripts/vitrine/build-media.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const ASSETS = process.env.NIMBUS_ASSETS || path.resolve(RAIZ, "..", "nimbus-assets");
const SAIDA = path.join(RAIZ, "public/loja/media");
fs.mkdirSync(SAIDA, { recursive: true });

const VITRINE = path.join(ASSETS, "marketing/2026-07-29-vitrine");

async function editorial(entrada, saida, largura, qualidade = 78) {
  if (!fs.existsSync(entrada)) throw new Error(`fonte ausente: ${entrada}`);
  await sharp(entrada)
    .resize({ width: largura, height: 1600, fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#f7fbff" }).webp({ quality: qualidade }).toFile(saida);
}

const jobs = [];

// 1) hero editorial: remix B com casting (escolha do dono no GATE C, 29/07)
jobs.push(editorial(path.join(VITRINE, "hero-casting-remix-b.png"), path.join(SAIDA, "hero-editorial-1600.webp"), 1600));

// 2) cenários canônicos das coleções (grão de filme comprime mal: qualidade menor)
//    STREET é a cena do beco de SP desde 29/07 (escolha do dono no GATE B)
jobs.push(editorial(path.join(VITRINE, "cenario-street-sp.png"), path.join(SAIDA, "cenario-street-1600.webp"), 1600, 68));
for (const c of ["reliquia", "nuvem"]) {
  jobs.push(editorial(path.join(VITRINE, `cenario-${c}.png`), path.join(SAIDA, `cenario-${c}-1600.webp`), 1600, 68));
}

// manifesto da home: beco em sombra, escolha do dono no GATE C em 29/07
jobs.push(editorial(path.join(VITRINE, "manifesto-beco-sombra.png"), path.join(SAIDA, "manifesto-1600.webp"), 1600, 68));

// 3) candidatas e alternativas em espera: aparecem só em /gates/, nunca nas páginas da loja
for (const c of ["cenario-street-brasilia", "hero-editorial-niemeyer", "hero-casting-curva",
  "hero-casting-planalto", "hero-casting-remix-a", "manifesto-beco-luz"]) {
  jobs.push(editorial(path.join(VITRINE, `${c}.png`), path.join(SAIDA, `gate-${c}-1600.webp`), 1600, 68));
}

await Promise.all(jobs);

// derivados de gerações antigas que a v2 aposentou: se sobraram, é lixo de build
const APOSENTADOS = [
  "hero-casting-1600.webp", "editorial-street-1200.webp", "editorial-reliquia-1200.webp",
  "editorial-nuvem-1200.webp", "caimento-costas-1400.webp",
  "colecao-street-900.webp", "colecao-reliquia-900.webp", "colecao-nuvem-900.webp",
  "gate-cenario-street-sp-1600.webp", "gate-hero-casting-remix-b-1600.webp",
  "gate-manifesto-beco-sombra-1600.webp",
];
for (const f of APOSENTADOS) {
  const p = path.join(SAIDA, f);
  if (fs.existsSync(p)) { fs.unlinkSync(p); console.log(`removido (aposentado): ${f}`); }
}

// auditoria de saída: teto de tamanho, teto de pixels, zero alpha
let falhas = 0;
for (const f of fs.readdirSync(SAIDA).filter((f) => f.endsWith(".webp"))) {
  const p = path.join(SAIDA, f);
  const kb = fs.statSync(p).size / 1024;
  const m = await sharp(p).metadata();
  const problemas = [];
  if (kb > 200) problemas.push(`${kb.toFixed(0)} KB > 200`);
  if (Math.max(m.width, m.height) > 1600) problemas.push(`${m.width}x${m.height} > 1600`);
  if (m.hasAlpha) problemas.push("tem alpha");
  console.log(`${f}: ${m.width}x${m.height} ${kb.toFixed(0)} KB${problemas.length ? "  !! " + problemas.join(", ") : ""}`);
  if (problemas.length) falhas++;
}
process.exit(falhas ? 1 : 0);
