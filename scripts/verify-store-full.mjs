// Checkup completo da loja publica NIMBUS.
// Confere, produto a produto, contra o plano de publicacao de 17/07:
//  - capa (og:image) e a foto lifestyle esperada
//  - o par de cor esta na posicao 2 da galeria (hover troca de cor)
//  - nenhuma variante Azul Marinho / Rosa Bebe sobrou
//  - CSS de producao integro na home (zoom + classes anteriores)
// Le so paginas publicas: nao toca no admin, nao altera nada.
//
// Uso: node scripts/verify-store-full.mjs [--json saida.json]

import fs from "node:fs";

const L = "C:/Users/rober/Nimbus/nuvemshop/assets/product-lifestyle/2026-07-16";
const cat = JSON.parse(fs.readFileSync(`${L}/catalog/nuvemshop-products.json`, "utf8"));
const catArr = Array.isArray(cat) ? cat : cat.products || Object.values(cat);
const pub = JSON.parse(fs.readFileSync(`${L}/review/publicacao-final-2026-07-17.json`, "utf8"));

const jsonOut = (() => { const i = process.argv.indexOf("--json"); return i > 0 ? process.argv[i + 1] : null; })();

// expectativas por produto a partir do plano
const esperado = new Map();
for (const a of pub.publicar) {
  const capaNova = a.passos.some((p) => p.tipo === "substituir-capa" || p.tipo === "subir-capa-nova");
  const par = a.passos.find((p) => p.tipo === "subir-par-hover" || p.tipo === "mover-foto-atual-para-2");
  esperado.set(String(a.id), { capaNova, temPar: !!par || a.acaoOriginal === "reatribuir", remover: a.removerVariantes || [] });
}

const seguradas = new Set((pub.segurar || []).map((s) => String(s.id)));

async function fetchText(url) {
  const r = await fetch(url, { headers: { "cache-control": "no-cache" } });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.text();
}

const resultados = [];
let falhas = 0;

for (const c of catArr) {
  const id = String(c.productId);
  const exp = esperado.get(id) || { capaNova: false, temPar: false, remover: [] };
  const item = { id: c.productId, titulo: c.title, url: c.url, problemas: [], pendencias: [] };
  let html;
  try {
    html = await fetchText(`${c.url}?nc=${id}${Math.floor(Math.random() * 1e6)}`);
  } catch (e) {
    item.problemas.push(`pagina inacessivel (${e.message})`);
    resultados.push(item); falhas++; continue;
  }

  const og = (html.match(/og:image" content="([^"]+)/) || [])[1] || "";
  const galeria = [...new Set([...html.matchAll(/dcdn-us\.mitiendanube\.com\/stores\/[^"']+products\/([^"'?]+?)(?:-\d+-\d+)?\.(?:webp|jpg|png)/g)].map((m) => m[1]))];
  const minha = (s) => new RegExp(`^${id}-(preta|branca|off-white)`).test(s);
  const vitrineAntiga = (s) => s.startsWith(`${id}-vitrine-nimbus`);

  // 1. capa
  if (exp.capaNova) {
    if (!new RegExp(`${id}-(preta|branca|off-white)`).test(og)) {
      item.problemas.push(`capa nao e a lifestyle nova (og: ...${og.slice(-45)})`);
    }
  } else if (esperado.has(id)) {
    if (!og.includes("products/")) item.problemas.push("og:image ausente");
  }

  // 2. par na posicao 2 (galeria do produto = primeiras entradas da pagina)
  if (exp.temPar) {
    const g2 = galeria[1] || "";
    const parOk = minha(g2) || vitrineAntiga(g2);
    if (!parOk) item.problemas.push(`posicao 2 nao e o par (achei: ${g2.slice(0, 40)})`);
  }

  // 3. variantes proibidas
  const vm = html.match(/LS\.variants = (\[.*?\]);/s);
  if (vm) {
    try {
      const vs = JSON.parse(vm[1]);
      const ruins = [...new Set(vs.map((v) => v.option1).filter((x) => /azul marinho|rosa beb/i.test(x || "")))];
      if (ruins.length) item.problemas.push(`variantes proibidas ainda no ar: ${ruins.join(", ")}`);
    } catch {}
  }

  // 4. pendencias conhecidas (nao sao falha)
  if (galeria.slice(2, 8).some(vitrineAntiga) && exp.capaNova) {
    item.pendencias.push("foto antiga defeituosa ainda na galeria (limpeza pendente)");
  }
  if (seguradas.has(id)) item.pendencias.push("tem foto segurada aguardando refacao");

  if (item.problemas.length) falhas++;
  resultados.push(item);
  process.stdout.write(item.problemas.length ? "X" : ".");
}

console.log("\n");

// 5. CSS na home
const home = await fetchText(`https://loja.nimbuswear.com.br/?nc=${Date.now()}`);
const css = {
  zoom: (home.match(/scale\(1\.045\)/g) || []).length > 0,
  modais: (home.match(/nimbus-project-modal/g) || []).length >= 30,
  header: (home.match(/head-main/g) || []).length >= 40,
};
if (!css.zoom) { console.log("FALHA: regra do zoom sumiu do CSS"); falhas++; }
if (!css.modais || !css.header) { console.log("FALHA: CSS de producao incompleto na home"); falhas++; }

const comProblema = resultados.filter((r) => r.problemas.length);
const comPendencia = resultados.filter((r) => r.pendencias.length && !r.problemas.length);
console.log(`produtos conferidos: ${resultados.length}`);
console.log(`CSS na home: zoom=${css.zoom} modais=${css.modais} header=${css.header}`);
console.log(`com PROBLEMA: ${comProblema.length}`);
comProblema.forEach((r) => { console.log(`  ${r.id} ${r.titulo}`); r.problemas.forEach((p) => console.log(`     - ${p}`)); });
console.log(`so com pendencia conhecida: ${comPendencia.length}`);
comPendencia.forEach((r) => console.log(`  ${r.id} ${r.titulo}: ${r.pendencias.join("; ")}`));

if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ verificadoEm: new Date().toISOString(), css, resultados }, null, 1));
process.exit(comProblema.length ? 1 : 0);
