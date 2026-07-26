// Junta as receitas de tres fontes numa so, para que TODA capa possa ser
// recomposta sem re-derivar landmarks:
//   1. .receita.json ao lado da capa (as novas, a partir de 26/07)
//   2. diarios dos workflows (tmp_receitas-colhidas.json)
//   3. tmp_recompor11.mjs (o lote -v8, que rodei direto, fora de agente)
import fs from "node:fs";
import path from "node:path";

const D = "nuvemshop/assets/producao-capas";
const norm = (s) => s.toLowerCase().replace(/-/g, "");

// --- fonte 3: a tabela do recompor11, transcrita do proprio script
const V8 = [
  { id: "352619175", cor: "preta", arte: "designs/prontos/RELIQUIA/costas/B2-salmo19.png", cm: "35.2x28.8", gola: 0.29, barra: 0.893, centro: 0.515, torso: 0.564, sombra_min: 0.9, sombra_max: 1.12 },
  { id: "352618878", cor: "branca", arte: "designs/prontos/RELIQUIA/costas/H4-sao-jorge-halftone.png", cm: "30.6x40", gola: 0.28, barra: 0.856, centro: 0.53, torso: 0.467 },
  { id: "352725749", cor: "preta", arte: "designs/prontos/STREET/mockups/Querubim Spray [Camiseta+Oversized] [frente e verso]/costas - Querubim Spray.png", cm: "25.5x40", gola: 0.28, barra: 0.93, centro: 0.505, torso: 0.523, sombra_min: 0.9, sombra_max: 1.12 },
  { id: "352718787", cor: "preta", arte: "designs/prontos/RELIQUIA/costas/S6-sao-jorge-barroco-v1.png", cm: "31x40", gola: 0.295, barra: 0.95, centro: 0.496, torso: 0.4805, sombra_min: 0.9, sombra_max: 1.10, sufixo: "-semcapuz" },
  { id: "352721633", cor: "offwhite", arte: "designs/prontos/STREET/costas/G1-nimbus-tag-azul.png", cm: "35.1x37.5", gola: 0.281, barra: 0.932, centro: 0.322, torso: 0.5146, yaw: 20 },
  { id: "352407156", cor: "preta", arte: "designs/prontos/RELIQUIA/costas/H2-sao-miguel-halftone-v2.png", cm: "31.5x40", gola: 0.31, barra: 0.888, centro: 0.48, torso: 0.4375, sombra_min: 0.9, sombra_max: 1.12, sufixo: "-semcapuz" },
  { id: "352407156", cor: "branca", arte: "designs/prontos/RELIQUIA/costas/H2-sao-miguel-halftone-v2.png", cm: "31.5x40", gola: 0.305, barra: 0.899, centro: 0.485, torso: 0.464, sufixo: "-semcapuz" },
  { id: "352407196", cor: "branca", arte: "designs/prontos/RELIQUIA/costas/H2-sao-miguel-halftone-v2.png", cm: "31.5x40", gola: 0.347, barra: 0.949, centro: 0.505, torso: 0.40 },
  { id: "352718999", cor: "branca", arte: "designs/prontos/RELIQUIA/costas/S6-sao-jorge-barroco-v1.png", cm: "31x40", gola: 0.402, barra: 0.9727, centro: 0.49, torso: 0.44, sombra_max: 1.15 },
  { id: "352717837", cor: "preta", arte: "designs/prontos/RELIQUIA/costas/B3-cruz-crest.png", cm: "29.6x40", gola: 0.287, barra: 0.95, centro: 0.496, torso: 0.4805, yaw: -15, sombra_min: 0.9, sombra_max: 1.10 },
  { id: "352721477", cor: "branca", arte: "designs/prontos/STREET/costas/G8-pomba-stencil-preto.png", cm: "35.2x35.1", gola: 0.299, barra: 0.9639, centro: 0.505, torso: 0.55, opacidade: 0.96 },
];

const receitas = {};
// 2. diarios
const colhidas = JSON.parse(fs.readFileSync("nuvemshop/producao/receitas-colhidas.json", "utf8"));
for (const [arq, r] of Object.entries(colhidas)) receitas[arq] = { ...r, fonte: "diario" };
// 3. lote v8
for (const c of V8) {
  const arq = `${c.id}-${c.cor}-v8${c.sufixo ?? ""}.png`;
  receitas[arq] = {
    produto: c.id, foto: `${D}/${c.id}/${c.id}-${c.cor}-blank.png`, arte: c.arte, arte_cm: c.cm,
    gola: c.gola, barra: c.barra, centro: c.centro, torso: c.torso ?? null, yaw: c.yaw ?? 0,
    opacidade: c.opacidade ?? 0.93, sombra_min: c.sombra_min ?? 0.75, sombra_max: c.sombra_max ?? 1.25,
    out: `${D}/${c.id}/${arq}`, fonte: "recompor11",
  };
}
// 1. sidecars (vencem, sao o registro do que rodou)
for (const d of fs.readdirSync(D)) {
  const p = path.join(D, d);
  if (!/^\d+$/.test(d) || !fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p)) {
    if (!/\.receita\.json$/.test(f)) continue;
    const r = JSON.parse(fs.readFileSync(path.join(p, f), "utf8"));
    receitas[f.replace(".receita.json", ".png")] = { ...r, out: path.join(p, f.replace(".receita.json", ".png")), fonte: "sidecar" };
  }
}

// cobertura contra as capas finais
const finais = new Map();
for (const d of fs.readdirSync(D)) {
  const p = path.join(D, d);
  if (!/^\d+$/.test(d) || !fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p)) {
    const m = f.match(/^(\d+)-([a-z-]+?)-v(\d+)(-semcapuz)?\.png$/);
    if (!m || /blank/.test(f)) continue;
    const k = `${m[1]}|${norm(m[2])}`;
    if (!finais.has(k) || finais.get(k).v < Number(m[3])) finais.set(k, { v: Number(m[3]), f });
  }
}
const sem = [];
for (const [, o] of finais) if (!receitas[o.f]) sem.push(o.f);
const fontes = {};
for (const [, o] of finais) if (receitas[o.f]) fontes[receitas[o.f].fonte] = (fontes[receitas[o.f].fonte] ?? 0) + 1;

fs.writeFileSync("nuvemshop/producao/receitas.json", JSON.stringify(receitas, null, 1));
console.log(`capas finais ${finais.size} | com receita ${finais.size - sem.length} | sem ${sem.length}`);
console.log(`por fonte: ${JSON.stringify(fontes)}`);
if (sem.length) { console.log("SEM RECEITA:"); for (const s of sem) console.log(`   ${s}`); }
