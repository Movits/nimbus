// Reconstroi a RECEITA de cada capa ja produzida a partir dos diarios dos
// workflows. A partir de 26/07 o proprio `compor` grava .receita.json ao lado
// da capa; isto e so para as 37 que ficaram para tras.
//
// Fonte preferida: o campo "landmarks" que cada agente devolveu no schema.
// Fonte de reserva: os arquivos agent-*.jsonl, onde aparece a linha de
// comando `produce-cover.mjs compor ...` de fato executada — essa e melhor,
// porque e o que rodou, nao o que o agente disse que rodou.
import fs from "node:fs";
import path from "node:path";

const D = "C:/Users/rober/.claude/projects/C--Users-rober-Nimbus/7cf2df58-d367-4e6d-b3f7-e394ff7a025b/subagents/workflows";

// CUIDADO: Number(null) e 0, nao NaN. A versao anterior devolvia 0 para toda
// flag AUSENTE, e como 0 nao e nullish o `?? 0.93` a jusante nunca disparava:
// toda capa recomposta a partir de receita colhida saiu com opacidade 0, ou
// seja, SEM ESTAMPA. Ausente tem que virar null.
const num = (s) => { if (s == null || s === "") return null; const v = Number(s); return Number.isFinite(v) ? v : null; };

/** Extrai os parametros de uma linha de comando `compor`. */
function daLinha(cmd) {
  const g = (flag) => {
    const m = cmd.match(new RegExp(`${flag}\\s+"?([^"\\s]+)"?`));
    return m ? m[1] : null;
  };
  const out = g("--out");
  if (!out || !/compor/.test(cmd)) return null;
  return {
    produto: g("--produto"), foto: g("--foto"), arte: cmd.match(/--arte\s+"([^"]+)"/)?.[1] ?? g("--arte"),
    arte_cm: g("--arte-cm"), gola: num(g("--gola")), barra: num(g("--barra")), centro: num(g("--centro")),
    torso: num(g("--torso")), yaw: num(g("--yaw")) ?? 0, placement: num(g("--placement")),
    opacidade: num(g("--opacidade")) ?? 0.93,
    sombra_min: num(g("--sombra-min")) ?? 0.75, sombra_max: num(g("--sombra-max")) ?? 1.25,
    out,
  };
}

const receitas = new Map();
let linhasVistas = 0;
for (const wf of fs.readdirSync(D)) {
  const dir = path.join(D, wf);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir)) {
    if (!/\.jsonl$/.test(f)) continue;
    const texto = fs.readFileSync(path.join(dir, f), "utf8");
    for (const linha of texto.split("\n")) {
      if (!linha.includes("compor")) continue;
      linhasVistas += 1;
      // as linhas de comando aparecem escapadas dentro do JSON do evento
      for (const m of linha.matchAll(/produce-cover\.mjs compor[^"\\]*(?:\\.[^"\\]*)*/g)) {
        const cmd = m[0].replace(/\\"/g, '"').replace(/\\\\/g, "\\").replace(/\\n/g, " ");
        const r = daLinha(cmd);
        if (!r?.out || !r.gola || !r.barra) continue;
        const chave = path.basename(r.out);
        // a versao maior vence (v2 corrige v1)
        const ant = receitas.get(chave);
        if (!ant) receitas.set(chave, { ...r, wf });
      }
    }
  }
}

// so interessam as receitas cujo arquivo final existe
const D2 = "nuvemshop/assets/producao-capas";
const existentes = new Set();
for (const d of fs.readdirSync(D2)) {
  const p = path.join(D2, d);
  if (!/^\d+$/.test(d) || !fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p)) if (/\.png$/.test(f)) existentes.add(f);
}

const uteis = [...receitas.entries()].filter(([k]) => existentes.has(k));
console.log(`linhas com "compor": ${linhasVistas} | receitas extraidas: ${receitas.size} | com PNG existente: ${uteis.length}`);
const porProduto = {};
for (const [k, v] of uteis) (porProduto[v.produto] ||= []).push(k);
console.log(`produtos cobertos: ${Object.keys(porProduto).length}`);
fs.writeFileSync("nuvemshop/producao/receitas-colhidas.json", JSON.stringify(Object.fromEntries(uteis), null, 1));
for (const [k, v] of uteis.slice(0, 6)) console.log(`  ${k}  gola ${v.gola} barra ${v.barra} centro ${v.centro} torso ${v.torso} yaw ${v.yaw} placement ${v.placement}`);
