// Inventario do que ja esta produzido e do que falta.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { lerNome, melhor } from "./nomes-de-capa.mjs";

const D = "nuvemshop/assets/producao-capas";
const plano = JSON.parse(fs.readFileSync("nuvemshop/producao/plano.json", "utf8"));
const pl = JSON.parse(fs.readFileSync("nuvemshop/auditoria/2026-07-26-datum-mockups/placement-por-produto.json", "utf8")).itens;
const P = (id) => pl.find((t) => t.product_id === id)?.placement_cm ?? null;
const norm = (s) => s.toLowerCase().replace(/-/g, "");

const prontas = new Map();
for (const d of fs.readdirSync(D)) {
  const dir = path.join(D, d);
  if (!/^\d+$/.test(d) || !fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    const r = lerNome(f);
    if (!r) continue;
    const chave = `${r.id}|${r.cor}`;
    const atual = prontas.get(chave);
    const venc = melhor(atual?.r, r);
    if (venc === r) prontas.set(chave, { r, v: r.v, arquivo: path.join(dir, f) });
  }
}

const feito = [], falta = [];
for (const x of plano) {
  const chave = `${x.product_id}|${norm(x.cor)}`;
  (prontas.has(chave) ? feito : falta).push({ ...x, arquivo: prontas.get(chave)?.arquivo });
}

const costas = falta.filter((x) => x.vista === "costas" && x.garment !== "Blusão Moletom");
console.log(JSON.stringify({
  total: plano.length, prontas: feito.length, faltam: falta.length,
  falta_costas_com_tabela: costas.length,
  falta_blusao: falta.filter((x) => x.garment === "Blusão Moletom").length,
  falta_frente: falta.filter((x) => x.vista === "frente").length,
}, null, 1));

const bloco = costas.slice(0, 12).map((x) => ({
  id: x.product_id, cor: x.cor, peca: x.garment, colecao: x.collection,
  arte: x.arte, cena: x.cena, cm: `${x.art_cm.w}x${x.art_cm.h}`,
  titulo: x.title.slice(0, 40), placement: P(x.product_id),
}));
const blocoPath = path.join(os.tmpdir(), "nimbus-proximo-bloco.json");
fs.writeFileSync(blocoPath, JSON.stringify(bloco));
console.log("\nPROXIMO BLOCO:");
for (const b of bloco) console.log(`  ${b.id} ${b.cor.padEnd(10)} ${b.peca.slice(0, 26).padEnd(27)} placement ${b.placement}`);
console.log("\nARQUIVO escrito:", blocoPath);
