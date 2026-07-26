// Verificacao final dos pares de cor, para o hover.
//
// Dois criterios, porque um so nao cobre as duas falhas conhecidas:
//   qa-par-hover   -> cenario/modelo/pose iguais (pega cabeca trocada)
//   receita igual  -> estampa no mesmo lugar e tamanho (pixel nao serve:
//                     a caixa por limiar enxerga menos borda em peca clara)
import fs from "node:fs";
import path from "node:path";
import { qaParHover } from "../geometry/qa-par-hover.mjs";

const D = "nuvemshop/assets/producao-capas";
const plano = JSON.parse(fs.readFileSync("nuvemshop/producao/plano.json", "utf8"));
const slug = (c) => c.toLowerCase().replace(/-/g, "");
const CHAVES = ["gola", "barra", "centro", "torso", "yaw", "placement", "arte_cm"];

function versaoMaisAlta(dir, id, cor) {
  if (!fs.existsSync(dir)) return null;
  const prefixo = `${id}-${slug(cor)}-par-v`;
  let melhor = null;
  for (const f of fs.readdirSync(dir)) {
    if (!f.startsWith(prefixo) || !f.endsWith(".png")) continue;
    if (f.includes("REJEITADA") || f.includes("semcapuz")) continue;
    const v = Number(f.slice(prefixo.length).split(".")[0]);
    if (!Number.isFinite(v)) continue;
    if (!melhor || v > melhor.v) melhor = { v, f: path.join(dir, f) };
  }
  return melhor?.f ?? null;
}

const receita = (capa) => {
  for (const s of [".receita.json", "-semcapuz.receita.json"]) {
    const q = capa.replace(/\.png$/, s);
    if (fs.existsSync(q)) return JSON.parse(fs.readFileSync(q, "utf8"));
  }
  return null;
};

const ids = [...new Set(plano.map((p) => p.product_id))]
  .filter((id) => plano.filter((p) => p.product_id === id).length > 1);

let ok = 0, nao = 0, pendente = 0;
console.log("produto      cores            fora da roupa   receita   veredito");
for (const id of ids) {
  const vs = plano.filter((x) => x.product_id === id)
    .sort((a, b) => (a.cor === "Preta" ? 0 : 1) - (b.cor === "Preta" ? 0 : 1));
  const dir = path.join(D, id);
  const A = versaoMaisAlta(dir, id, vs[0].cor);
  const B = versaoMaisAlta(dir, id, vs[1].cor);
  if (!A || !B) { pendente += 1; continue; }
  const blA = path.join(dir, `${id}-${slug(vs[0].cor)}-par-blank.png`);
  let blB = path.join(dir, `${id}-${slug(vs[1].cor)}-par-blank-alinhado.png`);
  if (!fs.existsSync(blB)) blB = path.join(dir, `${id}-${slug(vs[1].cor)}-par-blank-alinhado2.png`);
  if (!fs.existsSync(blB)) blB = path.join(dir, `${id}-${slug(vs[1].cor)}-par-blank.png`);
  if (!fs.existsSync(blA) || !fs.existsSync(blB)) { pendente += 1; continue; }

  const r = await qaParHover({ a: A, blankA: blA, b: B, blankB: blB });
  const ra = receita(A), rb = receita(B);
  const igual = ra && rb ? CHAVES.every((k) => String(ra[k]) === String(rb[k])) : null;
  const v = r.veredito === "APROVADO" && igual !== false ? "APROVADO" : "REPROVADO";
  if (v === "APROVADO") ok += 1; else nao += 1;
  console.log(`${id}  ${(vs[0].cor + "/" + vs[1].cor).padEnd(16)} ${String(r.fora_da_roupa?.diferenca_media ?? "-").padStart(13)}   ${(igual === null ? "?" : igual ? "igual" : "DIFERE").padStart(7)}   ${v}${r.falhas.length ? " " + r.falhas.join(",") : ""}`);
}
console.log(`\npares verificados ${ok + nao} | aprovados ${ok} | reprovados ${nao} | ainda sem par refeito ${pendente}`);
