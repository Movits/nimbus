// Quais capas STREET estao FORA do beco de grafite.
//
// Classificador confiavel, ao contrario da tentativa por saturacao: as capas
// PUBLICADAS da colecao sao todas beco de grafite, entao elas servem de
// exemplar. Para cada blank, distancia do FUNDO contra a melhor capa publicada
// do proprio produto. Perto = mesmo cenario; longe = o agente trocou.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const D = "nuvemshop/assets/producao-capas";
const LIVE = "nuvemshop/auditoria/2026-07-21/implementacao/auditoria-imagens-2026-07-22/live";
const plano = JSON.parse(fs.readFileSync("nuvemshop/producao/plano.json", "utf8"));
const street = new Set(plano.filter((p) => p.collection === "STREET").map((p) => p.product_id));

const faixa = async (p) => {
  const r = await sharp(p).resize(256, 256, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const v = [];
  for (let y = 20; y < 236; y += 4) for (const x of [8, 16, 24, 232, 240, 248]) {
    const o = (y * 256 + x) * 3; v.push(r.data[o], r.data[o + 1], r.data[o + 2]);
  }
  return v;
};
const mad = (a, b) => { let s = 0; for (let i = 0; i < a.length; i += 1) s += Math.abs(a[i] - b[i]); return s / a.length; };

const publicadas = new Map();
for (const f of fs.readdirSync(LIVE)) {
  const full = path.join(LIVE, f);
  if (fs.statSync(full).size < 60000) continue;
  const id = f.split("-")[0];
  if (!publicadas.has(id)) publicadas.set(id, []);
  publicadas.get(id).push(full);
}

const norm = (s) => s.toLowerCase().replace(/-/g, "");
const linhas = [];
for (const d of fs.readdirSync(D)) {
  const dir = path.join(D, d);
  if (!/^\d+$/.test(d) || !street.has(d) || !fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^(\d+)-([a-z-]+?)-blank\.png$/);
    if (!m) continue;
    const cands = publicadas.get(d) ?? [];
    if (!cands.length) { linhas.push({ id: d, cor: m[2], status: "sem capa publicada" }); continue; }
    const a = await faixa(path.join(dir, f));
    let melhor = null;
    for (const c of cands) {
      const v = mad(a, await faixa(c));
      if (!melhor || v < melhor.mad) melhor = { mad: +v.toFixed(1), ref: path.basename(c) };
    }
    const p = plano.find((x) => x.product_id === d && norm(x.cor) === norm(m[2]));
    linhas.push({ id: d, cor: m[2], titulo: p?.title ?? "", ...melhor, grafite: melhor.mad < 25 });
  }
}

linhas.sort((a, b) => (b.mad ?? -1) - (a.mad ?? -1));
const fora = linhas.filter((l) => l.grafite === false);
console.log("capas STREET FORA do beco de grafite (refazer):", fora.length, "de", linhas.length);
for (const l of fora) console.log(`   ${l.id} ${l.cor.padEnd(10)} MAD ${String(l.mad).padStart(6)}  ${l.titulo}`);
console.log("\njá em beco de grafite:", linhas.filter((l) => l.grafite).length);
fs.writeFileSync("nuvemshop/producao/street-refazer.json", JSON.stringify(fora, null, 1));
