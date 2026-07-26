// A CENA DO BLANK VEIO MESMO DE UMA CAPA PUBLICADA DESTE PRODUTO?
//
// A versao anterior comparava contra o campo `cena` do plano, mas em varios
// blocos eu passei a cena por cor direto nos argumentos do workflow, entao a
// referencia do plano ficou desatualizada e 15 capas boas apareceram como
// suspeitas. Aqui o blank e comparado contra TODAS as fotos lifestyle
// publicadas do proprio produto, e vence a de menor distancia. Se a melhor
// bate, a cena e legitima, independentemente de qual das cores o agente
// escolheu como referencia.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const D = "nuvemshop/assets/producao-capas";
const LIVE = "nuvemshop/auditoria/2026-07-21/implementacao/auditoria-imagens-2026-07-22/live";
const MIN_BYTES = 60000;   // abaixo disso e mockup plano, nao capa lifestyle

/** Assinatura do FUNDO: faixas laterais, fora da silhueta da peca. */
const faixa = async (p) => {
  const r = await sharp(p).resize(256, 256, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const v = [];
  for (let y = 20; y < 236; y += 4) for (const x of [8, 16, 24, 232, 240, 248]) {
    const o = (y * 256 + x) * 3;
    v.push(r.data[o], r.data[o + 1], r.data[o + 2]);
  }
  return v;
};
const mad = (a, b) => { let s = 0; for (let i = 0; i < a.length; i += 1) s += Math.abs(a[i] - b[i]); return s / a.length; };

const publicadas = new Map();
for (const f of fs.readdirSync(LIVE)) {
  const full = path.join(LIVE, f);
  if (fs.statSync(full).size < MIN_BYTES) continue;
  const id = f.split("-")[0];
  if (!publicadas.has(id)) publicadas.set(id, []);
  publicadas.get(id).push(full);
}

const linhas = [];
for (const d of fs.readdirSync(D)) {
  const dir = path.join(D, d);
  if (!/^\d+$/.test(d) || !fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    // so os blanks de verdade; zoom/grade/crop nao sao capas
    if (!/^\d+-[a-z-]+?-blank\d?(-capuz)?\.png$/.test(f)) continue;
    const cands = publicadas.get(d) ?? [];
    if (!cands.length) { linhas.push({ id: d, arq: f, status: "produto sem foto publicada >60KB" }); continue; }
    try {
      const a = await faixa(path.join(dir, f));
      let melhor = null;
      for (const c of cands) {
        const v = mad(a, await faixa(c));
        if (!melhor || v < melhor.mad) melhor = { mad: +v.toFixed(1), ref: path.basename(c) };
      }
      linhas.push({ id: d, arq: f, ...melhor, ok: melhor.mad < 25 });
    } catch (e) { linhas.push({ id: d, arq: f, status: `erro: ${e.message.slice(0, 40)}` }); }
  }
}

linhas.sort((a, b) => (b.mad ?? -1) - (a.mad ?? -1));
console.log("blank vs a MELHOR capa publicada do mesmo produto (MAD do fundo)\n");
for (const l of linhas) {
  const marca = l.ok === false ? "DIVERGE" : l.ok === true ? "  ok   " : "   ?   ";
  console.log(`${marca} ${l.id} ${String(l.arq).padEnd(34)} MAD ${String(l.mad ?? "-").padStart(6)}  ${l.ref ?? l.status ?? ""}`);
}
const fora = linhas.filter((l) => l.ok === false);
console.log(`\ntotal ${linhas.length} blanks | divergem de TODA capa publicada do produto: ${fora.length}`);
for (const l of fora) console.log(`   ${l.id} ${l.arq} (melhor MAD ${l.mad} contra ${l.ref})`);
