// PAR DE COR: a mesma foto, só que na outra cor.
//
// Requisito do dono (26/07): quando um produto tem preta e branca, as duas
// capas têm que ser a MESMA imagem — mesmo modelo, mesma pose, mesmo cenário,
// mesma peça — mudando só a cor do tecido.
//
// Isso NAO estava garantido: cada cor teve o blank gerado a partir da capa
// publicada daquela cor, e nada obrigava as duas a baterem.
//
// Duas medidas, porque as causas sao diferentes:
//   FUNDO  — faixas laterais, fora da silhueta: mede cenario e enquadramento.
//   CABECA — faixa do topo, onde fica a cabeca: mede modelo e pose.
// A cor do TECIDO e justamente o que deve diferir, entao o tronco fica fora.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const D = "nuvemshop/assets/producao-capas";
const LIVE = "nuvemshop/auditoria/2026-07-21/implementacao/auditoria-imagens-2026-07-22/live";
const plano = JSON.parse(fs.readFileSync("nuvemshop/producao/plano.json", "utf8"));

const amostra = async (p, regiao) => {
  const r = await sharp(p).resize(256, 256, { fit: "fill" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const v = [];
  if (regiao === "fundo") {
    for (let y = 20; y < 236; y += 4) for (const x of [6, 12, 18, 24, 232, 238, 244, 250]) {
      const o = (y * 256 + x) * 3; v.push(r.data[o], r.data[o + 1], r.data[o + 2]);
    }
  } else {
    for (let y = 8; y < 80; y += 2) for (let x = 80; x < 176; x += 2) {
      const o = (y * 256 + x) * 3; v.push(r.data[o], r.data[o + 1], r.data[o + 2]);
    }
  }
  return v;
};
const mad = (a, b) => { let s = 0; for (let i = 0; i < a.length; i += 1) s += Math.abs(a[i] - b[i]); return s / a.length; };

const norm = (s) => s.toLowerCase().replace(/-/g, "");
const porProduto = new Map();
for (const p of plano) {
  if (!porProduto.has(p.product_id)) porProduto.set(p.product_id, []);
  porProduto.get(p.product_id).push(p);
}

const acharBlank = (id, cor) => {
  const dir = path.join(D, id);
  if (!fs.existsSync(dir)) return null;
  const alvo = norm(cor);
  for (const f of fs.readdirSync(dir)) {
    const m = f.match(/^(\d+)-([a-z-]+?)-blank\.png$/);
    if (m && norm(m[2]) === alvo) return path.join(dir, f);
  }
  return null;
};
const acharPublicada = async (id, cor) => {
  const cands = fs.readdirSync(LIVE).filter((f) => f.startsWith(`${id}-`) && fs.statSync(path.join(LIVE, f)).size > 60000);
  if (!cands.length) return null;
  const escura = cor === "Preta" || cor.startsWith("Azul");
  for (const c of cands) {
    const r = await sharp(path.join(LIVE, c)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const { width: W, height: H } = r.info;
    const a = [];
    for (let y = Math.round(0.45 * H); y < Math.round(0.62 * H); y += 3) for (let x = Math.round(0.35 * W); x < Math.round(0.65 * W); x += 3) {
      const o = (y * W + x) * 3; a.push(0.299 * r.data[o] + 0.587 * r.data[o + 1] + 0.114 * r.data[o + 2]);
    }
    a.sort((x, y) => x - y);
    if ((a[Math.floor(a.length / 2)] < 80) === escura) return path.join(LIVE, c);
  }
  return path.join(LIVE, cands[0]);
};

const linhas = [];
for (const [id, vars] of porProduto) {
  if (vars.length < 2) continue;
  const [a, b] = vars;
  const ba = acharBlank(id, a.cor), bb = acharBlank(id, b.cor);
  if (!ba || !bb) { linhas.push({ id, cores: `${a.cor}/${b.cor}`, status: "blank faltando" }); continue; }
  const [fa, fb, ca, cb] = await Promise.all([amostra(ba, "fundo"), amostra(bb, "fundo"), amostra(ba, "cabeca"), amostra(bb, "cabeca")]);
  // o mesmo par nas capas PUBLICADAS, como referencia do que ja existia
  const [pa, pb] = await Promise.all([acharPublicada(id, a.cor), acharPublicada(id, b.cor)]);
  let pubFundo = null, pubCabeca = null;
  if (pa && pb && pa !== pb) {
    const [xa, xb, ya, yb] = await Promise.all([amostra(pa, "fundo"), amostra(pb, "fundo"), amostra(pa, "cabeca"), amostra(pb, "cabeca")]);
    pubFundo = +mad(xa, xb).toFixed(1); pubCabeca = +mad(ya, yb).toFixed(1);
  }
  linhas.push({
    id, cores: `${a.cor}/${b.cor}`, titulo: a.title,
    fundo: +mad(fa, fb).toFixed(1), cabeca: +mad(ca, cb).toFixed(1),
    pub_fundo: pubFundo, pub_cabeca: pubCabeca,
  });
}

linhas.sort((x, y) => (y.fundo ?? 0) + (y.cabeca ?? 0) - ((x.fundo ?? 0) + (x.cabeca ?? 0)));
console.log("produto     cores            NOSSAS: fundo  cabeca | PUBLICADAS: fundo  cabeca");
for (const l of linhas) {
  const marca = (l.fundo > 25 || l.cabeca > 30) ? "  <-- PAR NAO CASA" : "";
  console.log(`${l.id}  ${String(l.cores).padEnd(16)} ${String(l.fundo ?? "-").padStart(11)} ${String(l.cabeca ?? "-").padStart(7)} | ${String(l.pub_fundo ?? "-").padStart(15)} ${String(l.pub_cabeca ?? "-").padStart(7)}${marca}`);
}
const ruins = linhas.filter((l) => l.fundo > 25 || l.cabeca > 30);
console.log(`\npares ${linhas.length} | que NAO casam: ${ruins.length}`);
fs.writeFileSync("nuvemshop/producao/pares-fora.json", JSON.stringify(ruins, null, 1));
