// Monta a fila de recomposicao do catalogo com a receita fechada de 27/07.
import fs from "node:fs";
import path from "node:path";
import { lerNome, melhor } from "./scripts/producao/nomes-de-capa.mjs";

const D = "nuvemshop/assets/producao-capas";
const plano = JSON.parse(fs.readFileSync("nuvemshop/producao/plano.json", "utf8"));
const placem = JSON.parse(fs.readFileSync("nuvemshop/auditoria/2026-07-26-datum-mockups/placement-por-produto.json", "utf8")).itens;
const audit = JSON.parse(fs.readFileSync("nuvemshop/producao/auditoria-receitas.json", "utf8")).linhas;

// receitas: sidecar vence consolidado (mesma logica do auditar-receitas)
const receitas = new Map(Object.entries(JSON.parse(fs.readFileSync("nuvemshop/producao/receitas.json", "utf8"))));
for (const d of fs.readdirSync(D)) {
  const p = path.join(D, d);
  if (!/^\d+$/.test(d) || !fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p)) if (/\.receita\.json$/.test(f))
    receitas.set(f.replace(".receita.json", ".png"), JSON.parse(fs.readFileSync(path.join(p, f), "utf8")));
}
// melhor receita por variante
const porVar = new Map();
for (const [arq, r] of receitas) {
  const n = lerNome(arq);
  if (!n) continue;
  const k = `${n.id}|${n.cor}`;
  const atual = porVar.get(k);
  if (!atual || melhor(atual.n, n) === n) porVar.set(k, { n, r, arq });
}
const APROVADAS = new Set(["352725852|preta", "352728277|preta", "352718787|branca"]);
const FRONTAIS = new Set(["352702753", "352702796", "352720257"]);
const fila = [], fora = [];
for (const v of plano) {
  const cor = v.cor.toLowerCase().replace(/-/g, "");
  const k = `${v.product_id}|${cor}`;
  const pl = placem.find((x) => x.product_id === v.product_id);
  const ent = { id: v.product_id, cor, peca: v.garment ?? pl?.garment, arte_cm: `${v.art_cm.w}x${v.art_cm.h}` };
  if (APROVADAS.has(k)) { fora.push({ ...ent, motivo: "APROVADA" }); continue; }
  if (v.garment === "Ecobag" || pl?.garment === "Ecobag") { fora.push({ ...ent, motivo: "Ecobag: painel plano fora da pipeline" }); continue; }
  if (FRONTAIS.has(v.product_id)) { fora.push({ ...ent, motivo: "estampa frontal: placement de frente nunca medido" }); continue; }
  const melhorR = porVar.get(k);
  const blank = melhorR ? String(melhorR.r.foto ?? "").replace(/\\/g, "/") : path.join(D, v.product_id, `${v.product_id}-${cor}-blank.png`);
  const blankOk = blank && fs.existsSync(blank) ? blank : (fs.existsSync(path.join(D, v.product_id, `${v.product_id}-${cor}-blank.png`)) ? path.join(D, v.product_id, `${v.product_id}-${cor}-blank.png`) : null);
  if (!blankOk) { fora.push({ ...ent, motivo: "SEM BLANK (gerar com Gemini)" }); continue; }
  if (!melhorR) { fora.push({ ...ent, motivo: "SEM RECEITA (derivar landmarks do zero)" }); continue; }
  const au = audit.find((a) => a.id === v.product_id && a.cor === cor && a.final);
  const flags = (au?.suspeitas ?? []).map((s) => s.split(" ")[0]).join(",");
  fila.push({
    ...ent, blank: blankOk, arte: String(melhorR.r.arte).replace(/\\/g, "/"),
    gola: melhorR.r.gola, barra: melhorR.r.barra, centro: melhorR.r.centro ?? null, torso: melhorR.r.torso ?? null,
    placement: pl?.placement_cm ?? melhorR.r.placement, fonte_placement: pl ? "mockup-registrado" : "receita",
    oclusao: melhorR.r.oclusao ?? null,
    precisa_releitura: (au?.suspeitas?.length ?? 0) > 0 ? au.suspeitas : [],
    receita_base: melhorR.arq,
  });
}
fs.writeFileSync("nuvemshop/producao/fila-recomposicao.json", JSON.stringify({ gerado: "2026-07-27", fila, fora }, null, 1));
const blanks = new Set(fila.map((f) => f.blank));
console.log(JSON.stringify({
  na_fila: fila.length, blanks_unicos: blanks.size,
  precisam_releitura_torso_centro: fila.filter((f) => f.precisa_releitura.length).length,
  com_oclusao_guardada: fila.filter((f) => f.oclusao).length,
  fora: fora.map((f) => `${f.id} ${f.cor}: ${f.motivo}`),
}, null, 1));
