// Portão do tracking plan (P1-5 do conselho r4, 03/08/2026). O plano
// docs/fluxos/tracking-plan.md é a única fonte de verdade dos eventos GA4;
// este portão sai com código != 0 quando código e plano divergem, em
// QUALQUER direção:
//   - evento disparado no código sem linha no plano (evento clandestino);
//   - linha `ativo` do plano sem disparo no código (plano mentindo);
//   - linha `planejado` ou `fora` com disparo no código (decisão atropelada);
//   - `page_view` automático sem o gtag('config') nas páginas (medição caiu).
//
// O que ele lê como disparo: gtag('event', "nome"), ga4("nome") (helper do
// ui.js) e evento("nome") (helper do produto.js). Helper novo de disparo
// precisa entrar aqui no mesmo commit (regra 4 do próprio plano).
import fs from "node:fs";
import path from "node:path";

const RAIZ = path.resolve(import.meta.dirname, "..", "..");
const PLANO = path.join(RAIZ, "docs/fluxos/tracking-plan.md");
const erros = [];

/* --- lado do plano: linhas de tabela com evento em crase + status --------- */
const md = fs.readFileSync(PLANO, "utf-8");
const plano = new Map(); // nome -> status
for (const m of md.matchAll(/^\|\s*`([a-z0-9_]+)`\s*\|\s*(ativo|automatico|automático|planejado|fora)\s*\|/gim)) {
  const nome = m[1];
  const status = m[2].toLowerCase().replace("automático", "automatico");
  if (plano.has(nome) && plano.get(nome) !== status)
    erros.push(`plano: evento "${nome}" com dois status diferentes (${plano.get(nome)} e ${status})`);
  plano.set(nome, status);
}
if (![...plano.values()].includes("ativo"))
  erros.push("plano: nenhuma linha `ativo` encontrada; a tabela do tracking-plan.md mudou de formato ou foi esvaziada");

/* --- lado do código: onde a vitrine e a landing disparam evento ----------- */
const fontes = [];
function anda(dir, exts) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) anda(p, exts);
    else if (exts.test(e.name)) fontes.push(p);
  }
}
anda(path.join(RAIZ, "public/loja/js"), /\.js$/);
if (fs.existsSync(path.join(RAIZ, "src"))) anda(path.join(RAIZ, "src"), /\.(ts|tsx|js|jsx)$/);
for (const f of ["index.html", "public/sw.js", "scripts/vitrine/build-paginas.mjs"])
  if (fs.existsSync(path.join(RAIZ, f))) fontes.push(path.join(RAIZ, f));

const DISPAROS = [
  /gtag\(\s*["']event["']\s*,\s*["']([a-z0-9_]+)["']/gi,
  /\bga4\(\s*["']([a-z0-9_]+)["']/g,
  /\bevento\(\s*["']([a-z0-9_]+)["']/g,
];
const noCodigo = new Map(); // nome -> [arquivos]
for (const arq of fontes) {
  const corpo = fs.readFileSync(arq, "utf-8");
  for (const re of DISPAROS)
    for (const m of corpo.matchAll(re)) {
      const lista = noCodigo.get(m[1]) || [];
      lista.push(path.relative(RAIZ, arq).replace(/\\/g, "/"));
      noCodigo.set(m[1], lista);
    }
}

/* --- confronto ------------------------------------------------------------ */
for (const [nome, onde] of noCodigo) {
  const status = plano.get(nome);
  if (!status)
    erros.push(`código: evento "${nome}" disparado em ${[...new Set(onde)].join(", ")} SEM linha no tracking-plan.md (evento novo entra primeiro no plano, mesmo commit)`);
  else if (status === "planejado")
    erros.push(`código: evento "${nome}" já disparado em ${[...new Set(onde)].join(", ")} mas o plano ainda diz "planejado"; promova a linha para "ativo" no mesmo commit`);
  else if (status === "fora")
    erros.push(`código: evento "${nome}" disparado em ${[...new Set(onde)].join(", ")} mas o plano decidiu "fora"; ou o código sai, ou a decisão muda no plano primeiro`);
}
for (const [nome, status] of plano)
  if (status === "ativo" && !noCodigo.has(nome))
    erros.push(`plano: evento "${nome}" está "ativo" mas nenhum disparo foi encontrado no código; o plano não pode prometer medição que não existe`);

// page_view automático: o config tem que estar vivo na vitrine e na landing
const CONFIG = /gtag\(\s*["']config["']\s*,\s*["']G-E041S3ZHWB["']\s*\)/;
for (const [rotulo, arq] of [["vitrine (home)", "public/loja/index.html"], ["landing", "index.html"]]) {
  const p = path.join(RAIZ, arq);
  if (!fs.existsSync(p) || !CONFIG.test(fs.readFileSync(p, "utf-8")))
    erros.push(`config: gtag('config','G-E041S3ZHWB') ausente em ${arq} (${rotulo}); o page_view automático do plano caiu`);
}

if (erros.length) {
  console.error("LINT-TRACKING FALHOU:\n" + erros.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
const ativos = [...plano.entries()].filter(([, s]) => s === "ativo").map(([n]) => n);
console.log(`lint-tracking OK: ${ativos.length} eventos ativos (${ativos.join(", ")}) batem com o código, ${[...plano.values()].filter((s) => s === "planejado").length} planejado(s), ${[...plano.values()].filter((s) => s === "fora").length} fora por decisão; config vivo na vitrine e na landing`);
